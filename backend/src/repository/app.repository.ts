import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Film } from '../database/film.entity';
import { Schedule } from '../database/schedule.entity';
import { FilmDto, SessionDto } from '../films/dto/films.dto';
import { OrderTicketDto } from '../order/dto/order.dto';
import { FilmsRepository } from './films.repository';

interface BookingGroup {
  film: string;
  session: string;
  seats: string[];
}

@Injectable()
export class AppRepository implements FilmsRepository {
  constructor(
    @InjectRepository(Film) private readonly films: Repository<Film>,
    @InjectRepository(Schedule) private readonly schedules: Repository<Schedule>,
    private readonly dataSource: DataSource,
  ) {}

  async getFilms(): Promise<FilmDto[]> {
    const films = await this.films.find();
    return films.map(({ id, rating, director, tags, image, cover, title, about, description }) => ({
      id,
      rating,
      director,
      tags: tags ?? [],
      image,
      cover,
      title,
      about,
      description,
    }));
  }

  async getSchedule(filmId: string): Promise<SessionDto[]> {
    const film = await this.films.findOneBy({ id: filmId });
    if (!film) {
      throw new NotFoundException({ error: 'Фильм не найден' });
    }
    const schedules = await this.schedules.find({
      where: { filmId },
      order: { daytime: 'ASC' },
    });
    return schedules.map((schedule) => this.toSessionDto(schedule));
  }

  // Транзакция и блокировка строк защищают от одновременного бронирования
  // одного места и частичного сохранения заказа из нескольких билетов.
  async reserve(tickets: OrderTicketDto[]): Promise<SessionDto[]> {
    const groups = new Map<string, BookingGroup>();
    for (const ticket of tickets) {
      const key = JSON.stringify([ticket.film, ticket.session]);
      const seat = `${ticket.row}:${ticket.seat}`;
      let group = groups.get(key);
      if (!group) {
        group = { film: ticket.film, session: ticket.session, seats: [] };
        groups.set(key, group);
      }
      if (group.seats.includes(seat)) {
        throw new BadRequestException({ error: 'Одно место указано несколько раз' });
      }
      group.seats.push(seat);
    }

    return this.dataSource.transaction(async (manager) => {
      const filmRepo = manager.getRepository(Film);
      const scheduleRepo = manager.getRepository(Schedule);
      const sessions = new Map<string, SessionDto>();
      const sortedGroups = Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));

      for (const [key, group] of sortedGroups) {
        const schedule = await scheduleRepo.findOne({
          where: { id: group.session, filmId: group.film },
          lock: { mode: 'pessimistic_write' },
        });
        if (!schedule) {
          const film = await filmRepo.findOneBy({ id: group.film });
          if (!film) {
            throw new BadRequestException({ error: 'Фильм не найден' });
          }
          throw new BadRequestException({ error: 'Сеанс не найден' });
        }

        const booked = schedule.taken ?? [];
        for (const place of group.seats) {
          const [row, seat] = place.split(':').map(Number);
          if (
            !Number.isInteger(row) ||
            !Number.isInteger(seat) ||
            row < 1 ||
            seat < 1 ||
            row > schedule.rows ||
            seat > schedule.seats
          ) {
            throw new BadRequestException({ error: 'Место находится за пределами зала' });
          }
          if (booked.includes(place)) {
            throw new BadRequestException({ error: 'Место уже занято' });
          }
        }

        sessions.set(key, this.toSessionDto(schedule));
        schedule.taken = [...booked, ...group.seats];
        await scheduleRepo.save(schedule);
      }

      return tickets.map((ticket) => {
        const key = JSON.stringify([ticket.film, ticket.session]);
        const session = sessions.get(key);
        if (!session) {
          throw new BadRequestException({ error: 'Сеанс не найден' });
        }
        return session;
      });
    });
  }

  private toSessionDto(session: Schedule): SessionDto {
    const { id, daytime, hall, rows, seats, price, taken } = session;
    return { id, daytime, hall, rows, seats, price, taken: taken ?? [] };
  }
}
