-- Создание базы данных (если не существует)
-- Основная база уже создается через POSTGRES_DB

-- Создание пользователя для приложения (опционально)
DO $$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'app_user') THEN
      
      CREATE USER app_user WITH PASSWORD 'app_password123';
   END IF;
END
$$;

-- Даем права пользователю на базу данных
GRANT ALL PRIVILEGES ON DATABASE uzbekistan_services TO app_user;

-- Устанавливаем временную зону
SET TIMEZONE='Asia/Tashkent';

-- Создаем расширения (если нужны)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Выводим информацию
SELECT 'Database initialized successfully!' as status;