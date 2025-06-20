import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Language } from '../../users/entities/user.entity';

export class ExecutorsFilterDto {
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
    description: 'Поиск по имени или описанию',
    example: 'электрик',
    required: false 
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    description: 'Широта для поиска рядом',
    example: 41.2995,
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  lat?: number;

  @ApiProperty({ 
    description: 'Долгота для поиска рядом',
    example: 69.2401,
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  lng?: number;

  @ApiProperty({ 
    description: 'Радиус поиска в км',
    example: 5,
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  radius?: number = 10;

  @ApiProperty({ 
    description: 'Минимальный рейтинг',
    example: 4.0,
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  minRating?: number;

  @ApiProperty({ 
    description: 'Только верифицированные',
    example: true,
    required: false 
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  onlyVerified?: boolean;

  @ApiProperty({ 
    description: 'Только доступные сейчас',
    example: true,
    required: false 
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  onlyAvailable?: boolean;

  @ApiProperty({ 
    description: 'Только премиум аккаунты',
    example: false,
    required: false 
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  onlyPremium?: boolean;

  @ApiProperty({ 
    description: 'Язык для поиска',
    enum: Language,
    required: false 
  })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;
}