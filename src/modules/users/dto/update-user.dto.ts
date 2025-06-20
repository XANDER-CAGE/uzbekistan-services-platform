import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsEmail,
  IsEnum,
  MinLength,
  MaxLength 
} from 'class-validator';
import { UserType, Language } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiProperty({ 
    description: 'Имя пользователя',
    example: 'Алишер',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  @MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
  @MaxLength(50, { message: 'Имя не должно превышать 50 символов' })
  firstName?: string;

  @ApiProperty({ 
    description: 'Фамилия пользователя',
    example: 'Каримов',
    required: false 
  })
  @IsOptional()
  @IsString({ message: 'Фамилия должна быть строкой' })
  @MinLength(2, { message: 'Фамилия должна содержать минимум 2 символа' })
  @MaxLength(50, { message: 'Фамилия не должна превышать 50 символов' })
  lastName?: string;

  @ApiProperty({ 
    description: 'Email адрес',
    example: 'newemail@example.com',
    required: false 
  })
  @IsOptional()
  @IsEmail({}, { message: 'Неверный формат email' })
  email?: string;

  @ApiProperty({ 
    description: 'Тип пользователя',
    enum: UserType,
    required: false 
  })
  @IsOptional()
  @IsEnum(UserType, { message: 'Неверный тип пользователя' })
  userType?: UserType;

  @ApiProperty({ 
    description: 'Язык интерфейса',
    enum: Language,
    required: false 
  })
  @IsOptional()
  @IsEnum(Language, { message: 'Неверный язык' })
  language?: Language;
}