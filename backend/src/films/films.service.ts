import { Injectable } from '@nestjs/common';
import { FilmsRepository } from '../repository/films.repository';
import { FilmsResponseDto, ScheduleResponseDto } from './dto/films.dto';

@Injectable()
export class FilmsService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async findAll(): Promise<FilmsResponseDto> {
    const items = await this.filmsRepository.getFilms();
    return { total: items.length, items };
  }

  async getSchedule(filmId: string): Promise<ScheduleResponseDto> {
    const items = await this.filmsRepository.getSchedule(filmId);
    return { total: items.length, items };
  }
}
