import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer'; // Transform импортируем отсюда
import { UserType, Language } from '../entities/user.entity';

export class UsersFilterDto {
  @ApiProperty({ 
    description: 'Страница (начиная с 1)',
    example: 1,
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ 
    description: 'Количество элементов на странице',
    example: 10,
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ 
    description: 'Поиск по имени или телефону',
    example: 'Алишер',
    required: false 
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    description: 'Фильтр по типу пользователя',
    enum: UserType,
    required: false 
  })
  @IsOptional()
  @IsEnum(UserType)
  userType?: UserType;

  @ApiProperty({ 
    description: 'Фильтр по языку',
    enum: Language,
    required: false 
  })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiProperty({ 
    description: 'Показать только верифицированных',
    example: true,
    required: false 
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isVerified?: boolean;

  @ApiProperty({ 
    description: 'Показать только заблокированных',
    example: false,
    required: false 
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isBlocked?: boolean;
}