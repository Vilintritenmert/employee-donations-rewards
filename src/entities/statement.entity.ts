import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Employee } from './employee.entity';

@Entity()
export class Statement {
  @PrimaryColumn()
  id: number;

  @Column('decimal', { precision: 6, scale: 2 })
  amount: number;

  @Column({
    type: 'date',
  })
  date: Date;

  @ManyToOne(() => Employee, (employee) => employee.statements)
  employee: Employee;
  @Column({ type: 'integer', unsigned: true })
  employeeId: number;
}
