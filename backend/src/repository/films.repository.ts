import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { DATABASE_CONNECTION } from '../database/database.constants';
import { FilmDocument, filmSchema, SessionDocument } from './film.schema';
import { FilmDto, SessionDto } from '../films/dto/films.dto';
import { OrderTicketDto } from '../order/dto/order.dto';

interface BookingGroup {
  film: string;
  session: string;
  seats: string[];
}

@Injectable()
export class FilmsRepository {
  private readonly films: Model<FilmDocument>;

  constructor(@Inject(DATABASE_CONNECTION) connection: Connection) {
    this.films = connection.model<FilmDocument>('Film', filmSchema, 'films');
  }

  async getFilms(): Promise<FilmDto[]> {
    const films = await this.films.find().lean().exec();
    return films.map(({ id, rating, director, tags, image, cover, title, about, description }) => ({
      id, rating, director, tags, image, cover, title, about, description,
    }));
  }

  async getSchedule(filmId: string): Promise<SessionDto[]> {
    const film = await this.films.findOne({ id: filmId }).lean().exec();
    if (!film) {
      throw new NotFoundException({ error: 'Фильм не найден' });
    }
    return film.schedule.map((session) => this.toSessionDto(session));
  }

  private toSessionDto(session: SessionDocument): SessionDto {
    const { id, daytime, hall, rows, seats, price, taken } = session;
    return { id, daytime, hall, rows, seats, price, taken: [...(taken ?? [])] };
  }

  // Проверяем все билеты до изменения БД: ошибки в запросе не должны
  // приводить к частичному бронированию.
  async reserve(tickets: OrderTicketDto[]): Promise<SessionDto[]> {
    const groups = new Map<string, BookingGroup>();
    const sessions = new Map<string, SessionDto>();

    for (const ticket of tickets) {
      const groupKey = JSON.stringify([ticket.film, ticket.session]);
      const place = `${ticket.row}:${ticket.seat}`;
      let group = groups.get(groupKey);
      if (!group) {
        group = { film: ticket.film, session: ticket.session, seats: [] };
        groups.set(groupKey, group);
      }
      if (group.seats.includes(place)) {
        throw new BadRequestException({ error: 'Одно место указано несколько раз' });
      }
      group.seats.push(place);

      if (!sessions.has(groupKey)) {
        const film = await this.films.findOne({ id: ticket.film }).lean().exec();
        if (!film) {
          throw new BadRequestException({ error: 'Фильм не найден' });
        }
        const session = film.schedule.find(({ id }) => id === ticket.session);
        if (!session) {
          throw new BadRequestException({ error: 'Сеанс не найден' });
        }
        sessions.set(groupKey, this.toSessionDto(session));
      }
      const session = sessions.get(groupKey);
      if (!session) {
        throw new BadRequestException({ error: 'Сеанс не найден' });
      }
      if (ticket.row > session.rows || ticket.seat > session.seats) {
        throw new BadRequestException({ error: 'Место находится за пределами зала' });
      }
      if (session.taken.includes(place)) {
        throw new BadRequestException({ error: 'Место уже занято' });
      }
    }

    // Для каждого сеанса одна атомарная операция MongoDB. Два одновременных
    // запроса не могут занять одно и то же кресло.
    const completed: BookingGroup[] = [];
    try {
      for (const group of groups.values()) {
        const result = await this.films.updateOne(
          {
            id: group.film,
            schedule: {
              $elemMatch: { id: group.session, taken: { $nin: group.seats } },
            },
          },
          { $addToSet: { 'schedule.$.taken': { $each: group.seats } } },
        ).exec();
        if (result.modifiedCount !== 1) {
          throw new BadRequestException({ error: 'Одно из мест уже занято' });
        }
        completed.push(group);
      }
    } catch (error) {
      // Если поздний сеанс не удалось забронировать, возвращаем места,
      // забронированные этим же запросом на предыдущих сеансах.
      for (const group of completed.reverse()) {
        await this.films.updateOne(
          { id: group.film, 'schedule.id': group.session },
          { $pullAll: { 'schedule.$.taken': group.seats } },
        ).exec();
      }
      throw error;
    }

    return tickets.map((ticket) => {
      const key = JSON.stringify([ticket.film, ticket.session]);
      const session = sessions.get(key);
      if (!session) {
        throw new BadRequestException({ error: 'Сеанс не найден' });
      }
      return session;
    });
  }
}
