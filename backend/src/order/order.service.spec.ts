import { BadRequestException } from '@nestjs/common';
import { FilmsRepository } from '../repository/films.repository';
import { OrderService } from './order.service';

const validOrder = {
  email: 'hello@example.com',
  phone: '+7 999 123-45-67',
  tickets: [{ film: 'film-1', session: 'session-1', row: 1, seat: 3 }],
};

describe('OrderService', () => {
  const reserve = jest.fn();
  const repository = { reserve } as unknown as FilmsRepository;
  const service = new OrderService(repository);

  beforeEach(() => {
    reserve.mockReset();
  });

  it('возвращает билет с id и данными сеанса', async () => {
    reserve.mockResolvedValue([{
      id: 'session-1', daytime: '2024-06-28T10:00:53+03:00',
      hall: 1, rows: 5, seats: 10, price: 350, taken: [],
    }]);
    const response = await service.create(validOrder);
    expect(response.total).toBe(1);
    expect(response.items[0]).toMatchObject({
      film: 'film-1', session: 'session-1', row: 1, seat: 3,
      price: 350, daytime: '2024-06-28T10:00:53+03:00',
    });
    expect(response.items[0].id).toEqual(expect.any(String));
  });

  it('отвергает пустой заказ без вызова репозитория', async () => {
    await expect(service.create({ email: '', phone: '', tickets: [] }))
      .rejects.toBeInstanceOf(BadRequestException);
    expect(reserve).not.toHaveBeenCalled();
  });

  it('отвергает неправильный номер места', async () => {
    await expect(service.create({
      ...validOrder,
      tickets: [{ ...validOrder.tickets[0], seat: 0 }],
    })).rejects.toBeInstanceOf(BadRequestException);
  });
});
