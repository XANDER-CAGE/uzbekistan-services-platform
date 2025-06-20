import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../users/entities/user.entity';
import { getJwtConfig } from '../../config/jwt.config';

@Module({
  imports: [
    // Подключаем User entity для работы с базой данных
    TypeOrmModule.forFeature([User]),
    
    // Настраиваем Passport для JWT
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // Настраиваем JWT модуль
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtConfig, // Используем нашу конфигурацию
    }),
  ],
  controllers: [AuthController], // Регистрируем контроллер
  providers: [
    AuthService,  // Сервис с бизнес-логикой
    JwtStrategy,  // Стратегия для проверки JWT токенов
  ],
  exports: [
    AuthService,  // Экспортируем для использования в других модулях
    JwtStrategy,
  ],
})
export class AuthModule {}