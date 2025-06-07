import { Global, Module } from '@nestjs/common';
import { WinstonService } from './winston.service';

/**
 * Global module that reads the application's configuration
 * from ENV files.
 */
@Global()
@Module({
  providers: [WinstonService],
  exports: [WinstonService],
})
export class WinstonModule {}
