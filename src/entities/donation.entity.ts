import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity()
export class Donation {
  @PrimaryColumn()
  id: number;

  @Column({
    type: 'date',
  })
  date: Date;

  @Column({ type: 'float', default: 0 })
  amountInCurrency: number;

  @Column()
  currency: string;

  @Column({ type: 'float', default: null })
  amountUSD: number;

  @ManyToOne(() => Employee, (employee) => employee.donations)
  employee: Employee;
  @Column()
  employeeId: number;
}
