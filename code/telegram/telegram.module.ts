import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TelegramBotController } from './telegram.controller';
import { TelegramHistoryService, TelegramService } from './services';
import { DatabaseModule } from 'code/database/database.module';
import { XrayModule } from 'code/xray/xray.module';
import { PaymentsModule } from 'code/payments/payments.module';
import { SubscriptionModule } from 'code/subscription/subscription.module';

/**
 * Module for working with the Telegram bot.
 *
 * @remarks This module encapsulates all logic related to processing user requests via the Telegram bot.
 * It includes a controller and services for handling requests and interacting with the Telegram API.
 */
@Module({
  imports: [
    HttpModule,
    DatabaseModule,
    XrayModule,
    PaymentsModule,
    SubscriptionModule,
  ],
  providers: [TelegramBotController, TelegramService, TelegramHistoryService],
})
export class TelegramModule {}
