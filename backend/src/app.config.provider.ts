import { ConfigService } from '@nestjs/config';

export interface AppConfigDatabase {
  driver: string;
  url: string;
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
      driver: config.get<string>('DATABASE_DRIVER') ?? 'mongodb',
      url: config.get<string>('DATABASE_URL') ?? 'mongodb://localhost:27017/prac',
    },
  }),
};
