import { DataSource } from 'typeorm';
import { User, UserType, UserRole, Language } from '../../modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export async function seedTestUsers(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  
  // Проверяем, есть ли уже тестовые пользователи
  const existingTestUser = await userRepository.findOne({
    where: { email: 'customer@test.uz' }
  });

  if (existingTestUser) {
    console.log('Тестовые пользователи уже существуют');
    return;
  }

  console.log('Создаем тестовых пользователей...');

  const passwordHash = await bcrypt.hash('test123', 12);

  const testUsers = [
    {
      phone: '+998901111111',
      email: 'customer@test.uz',
      firstName: 'Тест',
      lastName: 'Заказчик',
      userType: UserType.CUSTOMER,
      role: UserRole.USER,
      language: Language.RU,
      isVerified: true,
      passwordHash,
    },
    {
      phone: '+998901111112',
      email: 'executor@test.uz',
      firstName: 'Тест',
      lastName: 'Исполнитель',
      userType: UserType.EXECUTOR,
      role: UserRole.USER,
      language: Language.UZ,
      isVerified: true,
      passwordHash,
    },
    {
      phone: '+998901111113',
      email: 'both@test.uz',
      firstName: 'Тест',
      lastName: 'Универсал',
      userType: UserType.BOTH,
      role: UserRole.USER,
      language: Language.RU,
      isVerified: true,
      passwordHash,
    },
  ];

  const savedUsers = await userRepository.save(testUsers);

  console.log('✅ Тестовые пользователи созданы:');
  savedUsers.forEach(user => {
    console.log(`${user.userType}: ${user.email} / ${user.phone} (пароль: test123)`);
  });
}