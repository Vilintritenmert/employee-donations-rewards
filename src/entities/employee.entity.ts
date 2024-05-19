import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { Department } from './department.entity';
import { Statement } from './statement.entity';
import { Donation } from './donation.entity';

@Unique(['id', 'departmentId'])
@Entity()
export class Employee {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  surname: string;

  @ManyToOne(() => Department, (department) => department.employees)
  department: Department;
  @Column({ type: 'integer', unsigned: true })
  departmentId: number;

  @OneToMany(() => Statement, (statement) => statement.employee)
  statements: Statement[];

  @OneToMany(() => Donation, (donation) => donation.employee)
  donations: Donation[];
}
