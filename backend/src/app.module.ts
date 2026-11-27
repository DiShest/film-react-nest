import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';

import { configProvider } from './app.config.provider';
import { DatabaseModule } from './database/database.module';
import { FilmsModule } from './films/films.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public', 'content'),
      serveRoot: '/content',
    }),
    DatabaseModule,
    FilmsModule,
    OrderModule,
  ],
  providers: [configProvider],
})
export class AppModule {}
