import { 
    Injectable, 
    NotFoundException, 
    BadRequestException,
    UnauthorizedException,
    ConflictException 
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, Like, FindManyOptions } from 'typeorm';
  import * as bcrypt from 'bcrypt';
  import { User, UserType } from './entities/user.entity'; // Импортируем UserType
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
          '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.phone ILIKE :search)',
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
        where: { id }
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
     * Получить статистику пользователей
     */
    async getStats(): Promise<{
      total: number;
      customers: number;
      executors: number;
      verified: number;
      blocked: number;
    }> {
      const total = await this.userRepository.count();
      // Исправляем: используем enum значения вместо строк
      const customers = await this.userRepository.count({ where: { userType: UserType.CUSTOMER } });
      const executors = await this.userRepository.count({ where: { userType: UserType.EXECUTOR } });
      const verified = await this.userRepository.count({ where: { isVerified: true } });
      const blocked = await this.userRepository.count({ where: { isBlocked: true } });
  
      return {
        total,
        customers,
        executors,
        verified,
        blocked,
      };
    }
  }