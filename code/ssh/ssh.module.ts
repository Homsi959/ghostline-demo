import { Module } from '@nestjs/common';
import { SshService } from './ssh.service';

/**
 * This module is only needed for working with and testing Xray,
 * which is deployed on VPS TimeWeb (serves as the Dev environment).
 */
@Module({
  providers: [SshService],
  exports: [SshService],
})
export class SshModule {}
