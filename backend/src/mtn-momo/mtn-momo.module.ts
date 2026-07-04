import { Module } from '@nestjs/common';
import { MtnMomoProvider } from '../payments/providers/mtn-momo.provider';

@Module({
  providers: [MtnMomoProvider],
  exports: [MtnMomoProvider]
})
export class MtnMomoModule {}
