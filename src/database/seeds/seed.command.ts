import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { runSeeds } from './run-seeds';

async function bootstrap() {
  console.log('🌱 Запуск seeds через NestJS приложение...');
  
  const app = await NestFactory.create(AppModule);
  
  try {
    await runSeeds();
    console.log('✅ Seeds выполнены успешно!');
  } catch (error) {
    console.error('❌ Ошибка при выполнении seeds:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();