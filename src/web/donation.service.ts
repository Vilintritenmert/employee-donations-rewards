import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DonationService {
  public constructor(private readonly dataSource: DataSource) {}

  async calculateDonationCashback() {
    return this.dataSource.createEntityManager().query(`
    SELECT id, donated, CAST(((donated / totalDonated) * 10000) AS NUMERIC(10, 2)) as cashback FROM (
      SELECT e.id, SUM(d."amountUSD") as donated, SUM(SUM(d."amountUSD")) OVER () totalDonated
      FROM employee e
      INNER JOIN donation d ON d."employeeId" = e.id
      GROUP BY e.id
      ) AS dg
      WHERE dg.donated > 100
      ;
      `);
  }
}
