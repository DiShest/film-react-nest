import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AppRepository } from '../repository/app.repository';
import { FilmsRepository } from '../repository/films.repository';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';

@Module({
  imports: [DatabaseModule],
  controllers: [FilmsController],
  providers: [
    FilmsService,
    { provide: FilmsRepository, useClass: AppRepository },
  ],
  exports: [FilmsRepository],
})
export class FilmsModule {}
