import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToOne,
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { ExecutorProfile } from '../../executors/entities/executor-profile.entity';

// Обновленные типы пользователей
export enum UserType {
  CUSTOMER = 'customer',   // Заказчик
  EXECUTOR = 'executor',   // Исполнитель
  BOTH = 'both',          // И заказчик, и исполнитель
  ADMIN = 'admin',         // Администратор
  SUPER_ADMIN = 'super_admin' // Супер администратор

}

// Роли в системе
export enum UserRole {
  USER = 'user',           // Обычный пользователь
  MODERATOR = 'moderator', // Модератор
  ADMIN = 'admin',         // Администратор
  SUPER_ADMIN = 'super_admin' // Супер администратор
}

// Языки интерфейса
export enum Language {
  UZ = 'uz',  // Узбекский
  RU = 'ru'   // Русский
}

@Entity('users')
export class User {
  @ApiProperty({ description: 'Уникальный ID пользователя' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Номер телефона (уникальный)', example: '+998901234567' })
  @Column({ unique: true, length: 20 })
  phone: string;

  @ApiProperty({ description: 'Email адрес', required: false })
  @Column({ nullable: true, unique: true })
  email?: string;

  @ApiProperty({ description: 'Имя пользователя' })
  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @ApiProperty({ description: 'Фамилия пользователя' })
  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @ApiProperty({ description: 'URL аватара', required: false })
  @Column({ name: 'avatar_url', nullable: true, length: 500 })
  avatarUrl?: string;

  @ApiProperty({ description: 'Тип пользователя', enum: UserType })
  @Column({ 
    name: 'user_type', 
    type: 'enum', 
    enum: UserType, 
    default: UserType.CUSTOMER 
  })
  userType: UserType;

  @ApiProperty({ description: 'Роль пользователя', enum: UserRole })
  @Column({ 
    type: 'enum', 
    enum: UserRole, 
    default: UserRole.USER 
  })
  role: UserRole;

  @ApiProperty({ description: 'Язык интерфейса', enum: Language })
  @Column({ type: 'enum', enum: Language, default: Language.UZ })
  language: Language;

  @ApiProperty({ description: 'Подтвержден ли телефон' })
  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @ApiProperty({ description: 'Заблокирован ли пользователь' })
  @Column({ name: 'is_blocked', default: false })
  isBlocked: boolean;

  // Скрываем пароль из API ответов
  @Exclude()
  @Column({ name: 'password_hash', nullable: true })
  passwordHash?: string;

  @Column({ name: 'telegram_id', nullable: true, length: 50 })
  telegramId?: string;

  @Column({ name: 'google_id', nullable: true, length: 100 })
  googleId?: string;

  // Метаданные для администраторов
  @ApiProperty({ description: 'Последний вход', required: false })
  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt?: Date;

  @ApiProperty({ description: 'IP последнего входа', required: false })
  @Column({ name: 'last_login_ip', nullable: true, length: 45 })
  lastLoginIp?: string;

  // Связь с профилем исполнителя
  @OneToOne(() => ExecutorProfile, profile => profile.user)
  executorProfile?: ExecutorProfile;

  @ApiProperty({ description: 'Дата создания' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Виртуальное поле для полного имени
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Методы для проверки ролей
  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN || this.role === UserRole.SUPER_ADMIN;
  }

  get isModerator(): boolean {
    return this.role === UserRole.MODERATOR || this.isAdmin;
  }

  get isSuperAdmin(): boolean {
    return this.role === UserRole.SUPER_ADMIN;
  }

  // Проверка прав доступа
  hasRole(role: UserRole): boolean {
    if (this.role === UserRole.SUPER_ADMIN) return true;
    if (this.role === UserRole.ADMIN && role !== UserRole.SUPER_ADMIN) return true;
    if (this.role === UserRole.MODERATOR && role === UserRole.USER) return true;
    return this.role === role;
  }

  canAccess(requiredRoles: UserRole[]): boolean {
    return requiredRoles.some(role => this.hasRole(role));
  }
}