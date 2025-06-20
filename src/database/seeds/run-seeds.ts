import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { seedCategories } from './categories.seed';

async function runSeeds() {
  console.log('🌱 Запуск инициализации данных...');
  
  const configService = new ConfigService();
  
  // Создаем конфигурацию DataSource явно
  const dataSource = new DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST') || 'localhost',
    port: parseInt(configService.get('DB_PORT') || '5432'),
    username: configService.get('DB_USERNAME') || 'postgres',
    password: configService.get('DB_PASSWORD') || '',
    database: configService.get('DB_DATABASE') || 'uzbekistan_services',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('📊 Подключение к базе данных установлено');

    // Запускаем seeds
    await seedCategories(dataSource);

    console.log('🎉 Инициализация данных завершена успешно!');
  } catch (error) {
    console.error('❌ Ошибка при инициализации данных:', error);
  } finally {
    await dataSource.destroy();
  }
}

// Запускаем если файл вызван напрямую
if (require.main === module) {
  runSeeds();
}