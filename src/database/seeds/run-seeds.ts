import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { seedCategories } from './categories.seed';
import { seedAdmin } from './admin.seed';
import { seedTestUsers } from './test-users.seed';
import { seedOrders } from './orders.seed';

async function runSeeds() {
  console.log('🌱 Запуск инициализации данных...');
  
  // Загружаем переменные окружения из .env файла в корне проекта
  const envConfigPath = path.resolve(__dirname, '../../../.env');
  console.log(`- Загрузка .env файла из: ${envConfigPath}`);
  dotenv.config({ path: envConfigPath });

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'uzbekistan_services',
  };

  console.log('- Используется следующая конфигурация БД:');
  console.log(`  - Хост: ${dbConfig.host}`);
  console.log(`  - Порт: ${dbConfig.port}`);
  console.log(`  - Имя пользователя: ${dbConfig.username}`);
  console.log(`  - Тип пароля: ${typeof dbConfig.password}`);
  console.log(`  - Пароль предоставлен: ${dbConfig.password !== ''}`);
  console.log(`  - База данных: ${dbConfig.database}`);

  const dataSource = new DataSource({
    type: 'postgres',
    ...dbConfig,
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('📊 Подключение к базе данных установлено');

    // Запускаем seeds в правильном порядке
    await seedAdmin(dataSource);           // Сначала администраторы
    await seedTestUsers(dataSource);       // Затем тестовые пользователи
    await seedCategories(dataSource);      // Категории
    await seedOrders(dataSource);          // Заказы

    console.log('🎉 Инициализация данных завершена успешно!');
    console.log('');
    console.log('📋 Данные для входа:');
    console.log('Супер Админ: admin@uzbekservices.uz / admin123456');
    console.log('Админ: admin2@uzbekservices.uz / admin123');
    console.log('Модератор: moderator@uzbekservices.uz / moderator123');
    console.log('Заказчик: customer@test.uz / test123');
    console.log('Исполнитель: executor@test.uz / test123');
    console.log('Универсал: both@test.uz / test123');

  } catch (error) {
    console.error('❌ Ошибка при инициализации данных:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Запускаем если файл вызван напрямую
if (require.main === module) {
  runSeeds();
}

export { runSeeds };