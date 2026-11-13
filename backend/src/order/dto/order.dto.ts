export class OrderTicketDto {
  film: string;
  session: string;
  daytime?: string;
  row: number;
  seat: number;
  price?: number;
}

export class OrderDto {
  email: string;
  phone: string;
  tickets: OrderTicketDto[];
}

export class TicketResponseDto {
  id: string;
  film: string;
  session: string;
  daytime: string;
  row: number;
  seat: number;
  price: number;
}

export class OrderResponseDto {
  total: number;
  items: TicketResponseDto[];
}
