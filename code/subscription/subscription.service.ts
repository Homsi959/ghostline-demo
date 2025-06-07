import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  PaidSubscriptionPlan,
  SubscriptionPlan,
  SubscriptionStatus,
} from 'code/database/common/enums';
import { SubscriptionDao, VpnAccountsDao } from 'code/database/dao';
import { WinstonService } from 'code/logger/winston.service';
import { XrayClientService } from 'code/xray/xrayClient.service';
import { DateTime } from 'luxon';

@Injectable()
export class SubscriptionService implements OnModuleInit {
  constructor(
    private readonly subscriptionDao: SubscriptionDao,
    private readonly xrayClientService: XrayClientService,
    private readonly vpnAccountsDao: VpnAccountsDao,
    private readonly logger: WinstonService,
  ) {}

  /**
   * Performs a one-time check at application startup.
   */
  async onModuleInit() {
    await this.checkAndDeactivateExpired();
  }

  /**
   * Creates a subscription in the database using Moscow time.
   *
   * @param userId User ID
   * @param plan Subscription plan (paid or any)
   * @returns ID of the created subscription
   * @throws If date calculation or creation fails
   */
  async create({
    userId,
    plan,
  }: {
    userId: string;
    plan: SubscriptionPlan | PaidSubscriptionPlan;
  }): Promise<string> {
    const start = DateTime.now().setZone('Europe/Moscow');
    const end = this.calculateEndDate(start, plan);

    if (!end) {
      throw new Error(
        `Failed to calculate the subscription end date for plan "${plan}"`,
      );
    }

    const subscriptionId = await this.subscriptionDao.create({
      userId,
      plan,
      startDate: start.toJSDate(),
      endDate: end.toJSDate(),
    });

    if (!subscriptionId) {
      throw new Error(`Не удалось создать подписку для пользователя ${userId}`);
    }

    return subscriptionId;
  }

  /**
   * Calculates the subscription end date based on the plan type.
   */
  private calculateEndDate(
    startDate: DateTime,
    plan: SubscriptionPlan | PaidSubscriptionPlan,
  ): DateTime | null {
    switch (plan) {
      case SubscriptionPlan.TRIAL:
        return startDate.plus({ days: 7 });
      case SubscriptionPlan.ONE_MONTH:
        return startDate.plus({ months: 1 });
      case SubscriptionPlan.SIX_MONTHS:
        return startDate.plus({ months: 6 });
      default:
        this.logger.error(`Unknown subscription type: ${String(plan)}`);
        return null;
    }
  }

  /**
   * Checks subscriptions every minute and deactivates expired ones.
   */
  @Cron('*/1 * * * *')
  private async checkAndDeactivateExpired() {
    const subscriptions = await this.subscriptionDao.findAll();

    if (!subscriptions) return;

    for (const { userId, endDate, status } of subscriptions) {
      const nowUtc = DateTime.utc();
      const endDateUtc = DateTime.fromJSDate(new Date(endDate)).toUTC();
      const isExpired = nowUtc > endDateUtc;

      if (isExpired && status !== SubscriptionStatus.EXPIRED) {
        try {
          await this.subscriptionDao.markAsExpired(userId);
          await this.xrayClientService.removeClient(userId);
          await this.vpnAccountsDao.removeVpnAccount(userId);
          await this.vpnAccountsDao.toggleVpnAccountBlock(userId, true);

          this.logger.warn(
            `User ${userId}'s subscription deactivated: expired (${endDateUtc.toISO()})`,
            this,
          );
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';

          this.logger.error(
            `Error deactivating subscription userId=${userId}: ${errorMessage}`,
            this,
          );
        }
      }
    }
  }
}
