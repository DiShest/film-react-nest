import { ConfigService } from '@nestjs/config';

export interface AppConfigDatabase {
  driver: string;
  url: string;
}

export interface AppConfig {
  database: AppConfigDatabase;
}

export const configProvider = {
  provide: 'CONFIG',
  inject: [ConfigService],
  useFactory: (config: ConfigService): AppConfig => ({
    database: {
      driver: config.get<string>('DATABASE_DRIVER') ?? 'mongodb',
      url: config.get<string>('DATABASE_URL') ?? 'mongodb://localhost:27017/prac',
    },
  }),
};
