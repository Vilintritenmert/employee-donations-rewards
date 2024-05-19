import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Unique(['date', 'sign'])
@Entity()
export class Rate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'date',
  })
  date: Date;

  @Column()
  sign: string;

  @Column({ type: 'float', default: 0 })
  value: number;
}
