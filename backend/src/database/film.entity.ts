import { Column, Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm';
import { Schedule } from './schedule.entity';

@Entity('films')
export class Film {
  @PrimaryColumn('uuid')
  id: string;

  @Column('double precision')
  rating: number;

  @Column('varchar')
  director: string;

  // В PostgreSQL остаётся колонка text, в TypeORM используется массив строк.
  @Column('simple-array')
  tags: string[];

  @Column('varchar')
  image: string;

  @Column('varchar')
  cover: string;

  @Column('varchar')
  title: string;

  @Column('varchar')
  about: string;

  @Column('varchar')
  description: string;

  @OneToMany(() => Schedule, (schedule) => schedule.film)
  schedule: Relation<Schedule[]>;
}
