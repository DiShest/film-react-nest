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

  // В оригинальной схеме Практикума tags хранится как text, а не text[].
  @Column('text')
  tags: string;

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
