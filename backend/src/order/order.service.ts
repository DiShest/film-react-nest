import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { FilmsRepository } from '../repository/films.repository';
import { OrderDto, OrderResponseDto, OrderTicketDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async create(order: OrderDto): Promise<OrderResponseDto> {
    this.validate(order);
    const sessions = await this.filmsRepository.reserve(order.tickets);
    const items = order.tickets.map((ticket, index) => ({
      id: randomUUID(),
      film: ticket.film,
      session: ticket.session,
      daytime: sessions[index].daytime,
      row: ticket.row,
      seat: ticket.seat,
      price: sessions[index].price,
    }));
    return { total: items.length, items };
  }

  private validate(order: OrderDto): void {
    if (
      !order ||
      typeof order.email !== 'string' ||
      !order.email.trim() ||
      typeof order.phone !== 'string' ||
      !order.phone.trim() ||
      !Array.isArray(order.tickets) ||
      order.tickets.length === 0
    ) {
      throw new BadRequestException({ error: 'Некорректные данные заказа' });
    }
    for (const ticket of order.tickets) {
      if (!this.isValidTicket(ticket)) {
        throw new BadRequestException({ error: 'Некорректные данные билета' });
      }
    }
  }

  private isValidTicket(ticket: OrderTicketDto): boolean {
    return Boolean(
      ticket &&
      typeof ticket.film === 'string' &&
      ticket.film.length > 0 &&
      typeof ticket.session === 'string' &&
      ticket.session.length > 0 &&
      Number.isInteger(ticket.row) &&
      ticket.row > 0 &&
      Number.isInteger(ticket.seat) &&
      ticket.seat > 0,
    );
  }
}
