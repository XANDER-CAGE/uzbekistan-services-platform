import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsEnum, IsNumber } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Language } from '../../users/entities/user.entity';

export class CategoriesFilterDto {
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
    example: 20,
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiProperty({ 
    description: 'Поиск по названию',
    example: 'ремонт',
    required: false 
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    description: 'ID родительской категории (null для корневых)',
    example: 1,
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  parentId?: number;

  @ApiProperty({ 
    description: 'Только активные категории',
    example: true,
    required: false 
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  onlyActive?: boolean;

  @ApiProperty({ 
    description: 'Только популярные категории',
    example: false,
    required: false 
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  onlyPopular?: boolean;

  @ApiProperty({ 
    description: 'Только корневые категории (без родителей)',
    example: false,
    required: false 
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  onlyRoot?: boolean;

  @ApiProperty({ 
    description: 'Язык для поиска',
    enum: Language,
    required: false 
  })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiProperty({ 
    description: 'Включить дочерние категории в ответ',
    example: true,
    required: false 
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeChildren?: boolean;
}