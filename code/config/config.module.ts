import { Global, Module } from '@nestjs/common';
import { CONFIG_PROVIDERS } from './config.providers';

/**
 * Global module that reads the application's configuration
 * from the KV storage in Consul.
 */
@Global()
@Module({
  providers: CONFIG_PROVIDERS,
  exports: CONFIG_PROVIDERS,
})
export class ConfigModule {}
