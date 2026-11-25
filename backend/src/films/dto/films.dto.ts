export class FilmDto {
  id: string;
  rating: number;
  director: string;
  tags: string[];
  image: string;
  cover: string;
  title: string;
  about: string;
  description: string;
}

export class SessionDto {
  id: string;
  daytime: string;
  hall: string | number;
  rows: number;
  seats: number;
  price: number;
  taken: string[];
}

export class FilmsResponseDto {
  total: number;
  items: FilmDto[];
}

export class ScheduleResponseDto {
  total: number;
  items: SessionDto[];
}
