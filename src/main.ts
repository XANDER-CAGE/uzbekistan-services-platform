import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  // Создаем приложение с Express адаптером для статических файлов
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Включаем CORS для фронтенда
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // URL вашего фронтенда
    credentials: true,
  });

  // Настройка статических файлов (для аватаров и других загружаемых файлов)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // URL будет /uploads/filename.jpg
  });

  // Глобальная валидация данных
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Удаляет поля, которых нет в DTO
    forbidNonWhitelisted: true, // Выдает ошибку если есть лишние поля
    transform: true, // Автоматически преобразует типы
  }));

  // Настройка Swagger документации
  const config = new DocumentBuilder()
    .setTitle('Uzbekistan Services Platform API')
    .setDescription('API для платформы бытовых услуг в Узбекистане')
    .setVersion('1.0')
    .addBearerAuth() // Добавляет поддержку JWT токенов
    .addTag('Аутентификация', 'Регистрация, вход, управление токенами')
    .addTag('Пользователи', 'Управление профилями пользователей')
    .addTag('Исполнители', 'Управление профилями исполнителей')
    .addTag('Категории услуг', 'Управление категориями услуг')
    .addTag('Заказы', 'Создание и управление заказами')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Запуск сервера на порту 3000
  await app.listen(3000);
  console.log('🚀 Сервер запущен на http://localhost:3000');
  console.log('📚 API документация: http://localhost:3000/api/docs');
  console.log('📁 Статические файлы: http://localhost:3000/uploads/');
}

bootstrap();