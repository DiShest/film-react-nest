import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection, createConnection } from 'mongoose';
import { DatabaseShutdownService } from './database-shutdown.service';
import { DATABASE_CONNECTION } from './database.constants';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      inject: [ConfigService],
      useFactory: async (config: ConfigService): Promise<Connection> => {
        const driver = config.get<string>('DATABASE_DRIVER') ?? 'mongodb';
        if (driver !== 'mongodb') {
          throw new Error(`Неподдерживаемый драйвер базы данных: ${driver}`);
        }
        const uri = config.get<string>('DATABASE_URL') ?? 'mongodb://localhost:27017/prac';
        return createConnection(uri).asPromise();
      },
    },
    DatabaseShutdownService,
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
