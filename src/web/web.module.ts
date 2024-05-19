import { Module } from '@nestjs/common';
import { WebController } from './web.controller';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database.module';
import { DonationService } from './donation.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
  ],
  controllers: [WebController],
  providers: [DonationService],
})
export class WebModule {}
