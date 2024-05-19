import { Controller, Get } from '@nestjs/common';
import { DonationService } from './donation.service';

@Controller()
export class WebController {
  constructor(private readonly donationService: DonationService) {}

  @Get()
  getCashBack(): Promise<any[]> {
    return this.donationService.calculateDonationCashback();
  }
}
