import { Start, Update, Action } from 'nestjs-telegraf';
import { WinstonService } from 'code/logger/winston.service';

import {
  ACTIONS_KEYS,
  ACTIONS_TO_SUBSCRIPTION,
  PURCHASE_ACTIONS,
} from './common/telegram.actions';
import { TelegramService } from './services';
import { Context } from './common/telegram.types';
import { PaidSubscriptionPlan } from 'code/database/common/enums';

/**
 * Controller for handling events in the Telegram bot.
 *
 * @remarks Handles bot startup, page rendering, and the "Back" action.
 */
@Update()
export class TelegramBotController {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly logger: WinstonService,
  ) {}

  /**
   * Method called when the bot starts.
   * Sends a welcome message and displays the main menu.
   * @param context - Telegraf context
   */
  @Start()
  async start(context: Context): Promise<void> {
    await this.telegramService.startBot(context);
  }

  /**
   * Listens for callback requests with names ending in -Page.
   *
   * @param context - Context object containing callback request data.
   * @remarks - Logs an error and exits if the callback request or its data is missing.
   * @throws - Throws an error if the telegramService.renderPage method fails.
   */
  @Action(/^.*Page$/g)
  async renderPage(context: Context): Promise<void> {
    const page = context.callbackQuery.data;

    await this.telegramService.renderProtectedPage(context, page);
  }

  /**
   * Handler for the "Back" action.
   * Checks for data in callbackQuery and calls the method to display the previous page.
   *
   * @param context - Context containing callbackQuery.
   */
  @Action(ACTIONS_KEYS.GO_BACK)
  async goBack(context: Context) {
    await this.telegramService.goBackRender(context);
  }

  /**
   * Handles subscription purchases from Telegram buttons.
   *
   * @param context - Telegram context.
   */
  @Action(PURCHASE_ACTIONS)
  async handlePurchase(context: Context) {
    const { data: action } = context.callbackQuery;
    const { id: telegramId } = context.callbackQuery.from;
    const plan = ACTIONS_TO_SUBSCRIPTION[action] as PaidSubscriptionPlan;

    if (!plan) {
      this.logger.error(`Некорректный action: ${action}`, this);
      return;
    }

    await this.telegramService.initiateSubscriptionPayment({
      telegramId,
      plan,
      context,
    });
  }

  /**
   * Activates trial access for the user.
   *
   * @param context - Telegram context.
   */
  @Action(ACTIONS_KEYS.ACTIVATE_TRIAL)
  async getTrial(context: Context) {
    const { id: telegramId } = context.callbackQuery.from;

    await this.telegramService.activateTrialAccess({
      telegramId,
      context,
    });
  }

  /**
   * Checks payment status.
   *
   * @param context - Telegram context.
   */
  @Action(ACTIONS_KEYS.CHECK_PAYMENT)
  async checkPayment(context: Context) {
    await this.telegramService.handlePaymentCheck(context);
  }
}
