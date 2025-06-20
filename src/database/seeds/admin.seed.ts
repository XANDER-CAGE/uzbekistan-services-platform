import { DataSource } from 'typeorm';
import { User, UserType, UserRole, Language } from '../../modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export async function seedAdmin(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  
  // Проверяем, есть ли уже администратор
  const existingAdmin = await userRepository.findOne({
    where: { role: UserRole.SUPER_ADMIN }
  });

  if (existingAdmin) {
    console.log('Супер администратор уже существует:', existingAdmin.email || existingAdmin.phone);
    return;
  }

  console.log('Создаем супер администратора...');

  // Хешируем пароль
  const passwordHash = await bcrypt.hash('admin123456', 12);

  // Создаем супер администратора
  const admin = userRepository.create({
    phone: '+998900000000',
    email: 'admin@uzbekservices.uz',
    firstName: 'Супер',
    lastName: 'Администратор',
    userType: UserType.ADMIN,
    role: UserRole.SUPER_ADMIN,
    language: Language.RU,
    isVerified: true,
    isBlocked: false,
    passwordHash,
  });

  const savedAdmin = await userRepository.save(admin);

  // Создаем обычного администратора
  const adminPassword = await bcrypt.hash('admin123', 12);
  const regularAdmin = userRepository.create({
    phone: '+998900000001',
    email: 'admin2@uzbekservices.uz',
    firstName: 'Администратор',
    lastName: 'Платформы',
    userType: UserType.ADMIN,
    role: UserRole.ADMIN,
    language: Language.RU,
    isVerified: true,
    isBlocked: false,
    passwordHash: adminPassword,
  });

  const savedRegularAdmin = await userRepository.save(regularAdmin);

  // Создаем модератора
  const moderatorPassword = await bcrypt.hash('moderator123', 12);
  const moderator = userRepository.create({
    phone: '+998900000002',
    email: 'moderator@uzbekservices.uz',
    firstName: 'Модератор',
    lastName: 'Контента',
    userType: UserType.BOTH,
    role: UserRole.MODERATOR,
    language: Language.RU,
    isVerified: true,
    isBlocked: false,
    passwordHash: moderatorPassword,
  });

  const savedModerator = await userRepository.save(moderator);

  console.log('✅ Администраторы созданы:');
  console.log(`Супер Админ: ${savedAdmin.email} / ${savedAdmin.phone} (пароль: admin123456)`);
  console.log(`Админ: ${savedRegularAdmin.email} / ${savedRegularAdmin.phone} (пароль: admin123)`);
  console.log(`Модератор: ${savedModerator.email} / ${savedModerator.phone} (пароль: moderator123)`);
}
