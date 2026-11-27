
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { Film } from './film.entity';
import { Schedule } from './schedule.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        const url = new URL(
          config.getOrThrow<string>('DATABASE_URL'),
        );
        const driver = config.getOrThrow<string>('DATABASE_DRIVER');
        if (driver !== 'postgres') {
          throw new Error(`Unsupported database driver: ${driver}`);
        }

        return {
          type: driver,
          host: url.hostname,
          port: Number(url.port || 5432),
          database: url.pathname.slice(1),
          username: config.getOrThrow<string>('DATABASE_USERNAME'),
          password: config.getOrThrow<string>('DATABASE_PASSWORD'),
          entities: [Film, Schedule],
          synchronize: false,
        };
      },
    }),
    TypeOrmModule.forFeature([Film, Schedule]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

