import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Connection } from 'mongoose';
import { DATABASE_CONNECTION } from './database.constants';

@Injectable()
export class DatabaseShutdownService implements OnApplicationShutdown {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly connection: Connection,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    await this.connection.close();
  }
}
