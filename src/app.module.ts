import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ExecutorsModule } from './modules/executors/executors.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    // Глобальная конфигурация из .env файла
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Подключение к базе данных PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),

    // Настройка статических файлов
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Подключаем модули
    AuthModule,
    UsersModule,
    ExecutorsModule,
    CategoriesModule,
    OrdersModule,
    AdminModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}