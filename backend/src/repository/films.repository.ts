import { FilmDto, SessionDto } from '../films/dto/films.dto';
import { OrderTicketDto } from '../order/dto/order.dto';

// Контракт, от которого по-прежнему зависят FilmsService и OrderService.
export abstract class FilmsRepository {
  abstract getFilms(): Promise<FilmDto[]>;
  abstract getSchedule(filmId: string): Promise<SessionDto[]>;
  abstract reserve(tickets: OrderTicketDto[]): Promise<SessionDto[]>;
}
