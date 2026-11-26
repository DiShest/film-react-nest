import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, Relation } from 'typeorm';
import { Film } from './film.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryColumn('uuid')
  id: string;

  @Column('varchar')
  daytime: string;

  @Column('integer')
  hall: number;

  @Column('integer')
  rows: number;

  @Column('integer')
  seats: number;

  @Column('double precision')
  price: number;

  // Оригинальная схема: пустая строка или места через запятую.
  @Column('text')
  taken: string;

  @Column('uuid', { name: 'filmId', nullable: true })
  filmId: string | null;

  @ManyToOne(() => Film, (film) => film.schedule, { nullable: true })
  @JoinColumn({ name: 'filmId' })
  film: Relation<Film>;
}
