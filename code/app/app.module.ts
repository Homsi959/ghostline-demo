import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { WinstonModule } from 'code/logger/winston.module';
import { DatabaseModule } from 'code/database/database.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { CONFIG_PROVIDER_TOKEN } from 'code/common/constants';
import { session } from 'telegraf';
import { TelegramModule } from 'code/telegram/telegram.module';
import { HttpModule } from '@nestjs/axios';
import { initializeTelegramSession } from 'code/telegram/common/telegram-session.middleware';
import { ScheduleModule } from '@nestjs/schedule';
import { SubscriptionModule } from 'code/subscription/subscription.module';
import { PaymentsModule } from 'code/payments/payments.module';
import { ConfigModule } from 'code/config/config.module';
import { AppConfig } from 'code/config/types';

/**
 * Main application module.
 *
 * Includes all necessary modules, such as:
 * - DatabaseModule: For working with the database.
 * - WinstonModule: For logging using Winston.
 * - TelegramModule: For working with the Telegram bot.
 * - ConfigModule: For working with configuration variables.
 * - TelegrafModule: For working with the Telegram API using Telegraf.
 * - HttpModule: For working with Axios.
 *
 * @module AppModule
 */
@Module({
  imports: [
    DatabaseModule,
    WinstonModule,
    TelegramModule,
    HttpModule,
    ConfigModule,
    ScheduleModule.forRoot(),
    SubscriptionModule,
    PaymentsModule,
    // Load configuration from environment variables
    NestConfigModule.forRoot({
      envFilePath: `settings/envs/.env.${process.env.NODE_ENV}`,
    }),
    TelegrafModule.forRootAsync({
      inject: [CONFIG_PROVIDER_TOKEN],
      useFactory: (config: AppConfig) => ({
        token: config.telegram.token,
        middlewares: [session(), initializeTelegramSession],
      }),
    }),
  ],
})
export class AppModule {}
