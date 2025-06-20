import { 
    Injectable, 
    NotFoundException, 
    BadRequestException,
    UnauthorizedException,
    ConflictException,
    ForbiddenException
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, Like, FindManyOptions } from 'typeorm';
  import * as bcrypt from 'bcrypt';
  import { User, UserType, UserRole } from './entities/user.entity';
  import { UpdateUserDto } from './dto/update-user.dto';
  import { ChangePasswordDto } from './dto/change-password.dto';
  import { UsersFilterDto } from './dto/users-filter.dto';
  
  export interface PaginatedUsers {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  export interface UserStats {
    total: number;
    customers: number;
    executors: number;
    admins: number;
    verified: number;
    blocked: number;
    byRole: {
      user: number;
      moderator: number;
      admin: number;
      super_admin: number;
    };
    byType: {
      customer: number;
      executor: number;
      both: number;
      admin: number;
    };
    recentRegistrations: number; // За последние 30 дней
  }
  
  @Injectable()
  export class UsersService {
    constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
    ) {}
  
    /**
     * Получить всех пользователей с пагинацией и фильтрами
     */
    async findAll(filterDto: UsersFilterDto): Promise<PaginatedUsers> {
      const { page = 1, limit = 10, search, userType, language, isVerified, isBlocked } = filterDto;
      const skip = (page - 1) * limit;
  
      // Строим условия для фильтрации
      const where: any = {};
  
      if (userType) {
        where.userType = userType;
      }
  
      if (language) {
        where.language = language;
      }
  
      if (isVerified !== undefined) {
        where.isVerified = isVerified;
      }
  
      if (isBlocked !== undefined) {
        where.isBlocked = isBlocked;
      }
  
      // Поиск по имени или телефону
      let users: User[];
      let total: number;
  
      if (search) {
        // Используем Query Builder для сложного поиска
        const queryBuilder = this.userRepository.createQueryBuilder('user');
        
        queryBuilder.where(
          '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.phone ILIKE :search OR user.email ILIKE :search)',
          { search: `%${search}%` }
        );
  
        // Добавляем остальные фильтры
        Object.keys(where).forEach(key => {
          queryBuilder.andWhere(`user.${key} = :${key}`, { [key]: where[key] });
        });
  
        queryBuilder
          .skip(skip)
          .take(limit)
          .orderBy('user.createdAt', 'DESC');
  
        [users, total] = await queryBuilder.getManyAndCount();
      } else {
        // Простой поиск без текстового поиска
        const options: FindManyOptions<User> = {
          where,
          skip,
          take: limit,
          order: { createdAt: 'DESC' },
        };
  
        [users, total] = await this.userRepository.findAndCount(options);
      }
  
      // Убираем пароли из результата
      users.forEach(user => delete user.passwordHash);
  
      return {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
  
    /**
     * Получить пользователя по ID
     */
    async findOne(id: number): Promise<User> {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['executorProfile']
      });
  
      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }
  
      // Убираем пароль из результата
      delete user.passwordHash;
  
      return user;
    }
  
    /**
     * Обновить профиль пользователя
     */
    async updateProfile(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });
  
      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }
  
      // Проверяем уникальность email если он изменяется
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: updateUserDto.email }
        });
  
        if (existingUser) {
          throw new ConflictException('Пользователь с таким email уже существует');
        }
      }
  
      // Обновляем только переданные поля
      Object.assign(user, updateUserDto);
      
      const updatedUser = await this.userRepository.save(user);
      
      // Убираем пароль из результата
      delete updatedUser.passwordHash;
  
      return updatedUser;
    }
  
    /**
     * Смена пароля
     */
    async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });
  
      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }
  
      if (!user.passwordHash) {
        throw new BadRequestException('У пользователя не установлен пароль');
      }
  
      // Проверяем текущий пароль
      const isCurrentPasswordValid = await bcrypt.compare(
        changePasswordDto.currentPassword, 
        user.passwordHash
      );
  
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Неверный текущий пароль');
      }
  
      // Хешируем новый пароль
      const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, 12);
      
      // Обновляем пароль
      await this.userRepository.update(userId, {
        passwordHash: newPasswordHash
      });
  
      return { message: 'Пароль успешно изменен' };
    }
  
    /**
     * Обновить аватар пользователя
     */
    async updateAvatar(userId: number, avatarUrl: string): Promise<User> {
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });
  
      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }
  
      user.avatarUrl = avatarUrl;
      const updatedUser = await this.userRepository.save(user);
      
      // Убираем пароль из результата
      delete updatedUser.passwordHash;
  
      return updatedUser;
    }
  
    /**
     * Удалить пользователя (мягкое удаление - блокировка)
     */
    async remove(id: number): Promise<{ message: string }> {
      const user = await this.userRepository.findOne({
        where: { id }
      });
  
      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }
  
      // Нельзя блокировать супер администраторов
      if (user.role === UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('Нельзя заблокировать супер администратора');
      }
  
      // Блокируем пользователя вместо удаления
      await this.userRepository.update(id, {
        isBlocked: true
      });
  
      return { message: 'Пользователь заблокирован' };
    }
  
    /**
     * Разблокировать пользователя
     */
    async unblock(id: number): Promise<User> {
      const user = await this.userRepository.findOne({
        where: { id }
      });
  
      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }
  
      user.isBlocked = false;
      const updatedUser = await this.userRepository.save(user);
      
      // Убираем пароль из результата
      delete updatedUser.passwordHash;
  
      return updatedUser;
    }
  
    /**
     * Изменить роль пользователя
     */
    async changeRole(userId: number, newRole: UserRole): Promise<User> {
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });
  
      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }
  
      // Проверяем, что не пытаемся понизить последнего супер админа
      if (user.role === UserRole.SUPER_ADMIN && newRole !== UserRole.SUPER_ADMIN) {
        const superAdminCount = await this.userRepository.count({
          where: { role: UserRole.SUPER_ADMIN }
        });
  
        if (superAdminCount <= 1) {
          throw new BadRequestException('Нельзя понизить последнего супер администратора');
        }
      }
  
      user.role = newRole;
      
      // Если назначаем админскую роль, меняем тип пользователя на ADMIN
      if (newRole === UserRole.ADMIN || newRole === UserRole.SUPER_ADMIN) {
        user.userType = UserType.ADMIN;
      }
  
      const updatedUser = await this.userRepository.save(user);
      
      // Убираем пароль из результата
      delete updatedUser.passwordHash;
  
      return updatedUser;
    }
  
    /**
     * Обновить время последнего входа
     */
    async updateLastLogin(userId: number, ip?: string): Promise<void> {
      await this.userRepository.update(userId, {
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      });
    }
  
    /**
     * Получить расширенную статистику пользователей
     */
    async getStats(): Promise<UserStats> {
      const total = await this.userRepository.count();
      
      // Статистика по типам пользователей
      const customers = await this.userRepository.count({ where: { userType: UserType.CUSTOMER } });
      const executors = await this.userRepository.count({ where: { userType: UserType.EXECUTOR } });
      const both = await this.userRepository.count({ where: { userType: UserType.BOTH } });
      const admins = await this.userRepository.count({ where: { userType: UserType.ADMIN } });
      
      // Статистика по ролям
      const users = await this.userRepository.count({ where: { role: UserRole.USER } });
      const moderators = await this.userRepository.count({ where: { role: UserRole.MODERATOR } });
      const adminRole = await this.userRepository.count({ where: { role: UserRole.ADMIN } });
      const superAdmins = await this.userRepository.count({ where: { role: UserRole.SUPER_ADMIN } });
      
      // Другая статистика
      const verified = await this.userRepository.count({ where: { isVerified: true } });
      const blocked = await this.userRepository.count({ where: { isBlocked: true } });
      
      // Регистрации за последние 30 дней
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentRegistrations = await this.userRepository.count({
        where: {
          createdAt: { $gte: thirtyDaysAgo } as any
        }
      });
  
      return {
        total,
        customers,
        executors,
        admins,
        verified,
        blocked,
        byRole: {
          user: users,
          moderator: moderators,
          admin: adminRole,
          super_admin: superAdmins,
        },
        byType: {
          customer: customers,
          executor: executors,
          both,
          admin: admins,
        },
        recentRegistrations,
      };
    }
  
    /**
     * Поиск пользователей для админки
     */
    async searchUsers(query: string, limit: number = 10): Promise<User[]> {
      const users = await this.userRepository
        .createQueryBuilder('user')
        .where(
          '(user.firstName ILIKE :query OR user.lastName ILIKE :query OR user.email ILIKE :query OR user.phone ILIKE :query)',
          { query: `%${query}%` }
        )
        .take(limit)
        .getMany();
  
      // Убираем пароли
      users.forEach(user => delete user.passwordHash);
  
      return users;
    }
  
    /**
     * Получить администраторов
     */
    async getAdmins(): Promise<User[]> {
      const admins = await this.userRepository.find({
        where: [
          { role: UserRole.ADMIN },
          { role: UserRole.SUPER_ADMIN },
          { role: UserRole.MODERATOR }
        ],
        order: { role: 'DESC', createdAt: 'ASC' }
      });
  
      // Убираем пароли
      admins.forEach(user => delete user.passwordHash);
  
      return admins;
    }
  }