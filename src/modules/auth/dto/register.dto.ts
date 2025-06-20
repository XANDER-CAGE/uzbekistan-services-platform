import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsPhoneNumber, 
  MinLength, 
  MaxLength, 
  IsOptional, 
  IsEmail,
  IsEnum 
} from 'class-validator';
import { UserType, Language } from '../../users/entities/user.entity';

export class RegisterDto {
  @ApiProperty({ 
    description: 'Номер телефона в международном формате',
    example: '+998901234567' 
  })
  @IsString({ message: 'Номер телефона должен быть строкой' })
  @IsPhoneNumber('UZ', { message: 'Неверный формат номера телефона' })
  phone: string;

  @ApiProperty({ 
    description: 'Имя пользователя',
    example: 'Алишер' 
  })
  @IsString({ message: 'Имя должно быть строкой' })
  @MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
  @MaxLength(50, { message: 'Имя не должно превышать 50 символов' })
  firstName: string;

  @ApiProperty({ 
    description: 'Фамилия пользователя',
    example: 'Каримов' 
  })
  @IsString({ message: 'Фамилия должна быть строкой' })
  @MinLength(2, { message: 'Фамилия должна содержать минимум 2 символа' })
  @MaxLength(50, { message: 'Фамилия не должна превышать 50 символов' })
  lastName: string;

  @ApiProperty({ 
    description: 'Email адрес (необязательно)',
    example: 'alisher@example.com',
    required: false 
  })
  @IsOptional()
  @IsEmail({}, { message: 'Неверный формат email' })
  email?: string;

  @ApiProperty({ 
    description: 'Пароль',
    example: 'mypassword123',
    minLength: 6 
  })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;

  @ApiProperty({ 
    description: 'Тип пользователя',
    enum: UserType,
    example: UserType.CUSTOMER 
  })
  @IsEnum(UserType, { message: 'Неверный тип пользователя' })
  userType: UserType;

  @ApiProperty({ 
    description: 'Язык интерфейса',
    enum: Language,
    example: Language.UZ 
  })
  @IsEnum(Language, { message: 'Неверный язык' })
  language: Language;
}