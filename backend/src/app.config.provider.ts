import { ConfigService } from '@nestjs/config';

export interface AppConfigDatabase {
  driver: string;
  url: string;
  username: string;
  password: string;
}

export interface AppConfig {
  port: number;
  database: AppConfigDatabase;
}

export const configProvider = {
  provide: 'CONFIG',
  inject: [ConfigService],
  useFactory: (config: ConfigService): AppConfig => ({
    port: Number(config.getOrThrow<string>('PORT')),
    database: {
      driver: config.getOrThrow<string>('DATABASE_DRIVER'),
      url: config.getOrThrow<string>('DATABASE_URL'),
      username: config.getOrThrow<string>('DATABASE_USERNAME'),
      password: config.getOrThrow<string>('DATABASE_PASSWORD'),
    },
  }),
};
