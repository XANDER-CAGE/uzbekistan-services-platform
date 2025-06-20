import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Регистрация нового пользователя
   */
  async register(registerDto: RegisterDto): Promise<{ 
    user: User; 
    access_token: string 
  }> {
    // Проверяем, не зарегистрирован ли уже пользователь по телефону
    const existingUserByPhone = await this.userRepository.findOne({
      where: { phone: registerDto.phone }
    });

    if (existingUserByPhone) {
      throw new BadRequestException('Пользователь с таким номером телефона уже существует');
    }

    // Проверяем по email, если он указан
    if (registerDto.email) {
      const existingUserByEmail = await this.userRepository.findOne({
        where: { email: registerDto.email }
      });

      if (existingUserByEmail) {
        throw new BadRequestException('Пользователь с таким email уже существует');
      }
    }

    // Хешируем пароль
    const passwordHash = await this.hashPassword(registerDto.password);

    // Создаем пользователя
    const user = this.userRepository.create({
      phone: registerDto.phone,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      userType: registerDto.userType,
      language: registerDto.language,
      passwordHash,
      isVerified: true, // Сразу верифицируем без SMS
    });

    const savedUser = await this.userRepository.save(user);

    // Генерируем JWT токен
    const accessToken = this.generateJwtToken(savedUser);

    // Удаляем пароль из ответа
    delete savedUser.passwordHash;

    return {
      user: savedUser,
      access_token: accessToken
    };
  }

  /**
   * Вход в систему
   */
  async login(loginDto: LoginDto): Promise<{ 
    user: User; 
    access_token: string 
  }> {
    // Ищем пользователя по телефону или email
    const user = await this.findUserByLogin(loginDto.login);

    if (!user) {
      throw new UnauthorizedException('Неверные данные для входа');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Аккаунт заблокирован');
    }

    // Проверяем есть ли пароль у пользователя
    if (!user.passwordHash) {
      throw new UnauthorizedException('Пароль не установлен');
    }

    // Проверяем пароль
    const isPasswordValid = await this.validatePassword(loginDto.password, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверные данные для входа');
    }

    // Загружаем полную информацию о пользователе
    const fullUser = await this.userRepository.findOne({
      where: { id: user.id }
    });

    if (!fullUser) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    // Генерируем JWT токен
    const accessToken = this.generateJwtToken(fullUser);

    // Удаляем пароль из ответа
    delete fullUser.passwordHash;

    return {
      user: fullUser,
      access_token: accessToken
    };
  }

  /**
   * Получение информации о текущем пользователе
   */
  async getCurrentUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    // Удаляем пароль из ответа
    delete user.passwordHash;

    return user;
  }

  /**
   * Поиск пользователя по логину (телефон или email)
   */
  private async findUserByLogin(login: string): Promise<User | null> {
    // Определяем, является ли логин email или телефоном
    const isEmail = login.includes('@');
    
    if (isEmail) {
      return this.userRepository.findOne({ where: { email: login } });
    } else {
      return this.userRepository.findOne({ where: { phone: login } });
    }
  }

  /**
   * Хеширование пароля
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12; // Количество раундов для bcrypt
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Проверка пароля
   */
  private async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Генерация JWT токена
   */
  private generateJwtToken(user: User): string {
    const payload = { 
      sub: user.id, 
      phone: user.phone,
      email: user.email,
      userType: user.userType 
    };
    
    return this.jwtService.sign(payload);
  }
}