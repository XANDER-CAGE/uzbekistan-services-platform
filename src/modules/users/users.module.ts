import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [
    // Подключаем User entity к TypeORM
    TypeOrmModule.forFeature([User]),
    
    // Настраиваем Multer для загрузки файлов
    MulterModule.register({
      dest: './uploads', // Базовая папка для загрузок
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [
    UsersService, // Экспортируем сервис для использования в других модулях
    TypeOrmModule, // Экспортируем для использования User entity в других модулях
  ],
})
export class UsersModule {}