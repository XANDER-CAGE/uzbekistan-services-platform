import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsNumber,
  IsBoolean,
  IsUrl,
  IsHexColor,
  MinLength,
  MaxLength,
  Matches
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({ 
    description: 'Название на узбекском языке',
    example: 'Ta\'mirlash xizmatlari' 
  })
  @IsString({ message: 'Название на узбекском должно быть строкой' })
  @MinLength(2, { message: 'Название должно содержать минимум 2 символа' })
  @MaxLength(100, { message: 'Название не должно превышать 100 символов' })
  nameUz: string;

  @ApiProperty({ 
    description: 'Название на русском языке',
    example: 'Ремонтные услуги' 
  })
  @IsString({ message: 'Название на русском должно быть строкой' })
  @MinLength(2, { message: 'Название должно содержать минимум 2 символа' })
  @MaxLength(100, { message: 'Название не должно превышать 100 символов' })
  nameRu: string;

  @ApiProperty({ 
    description: 'Описание на узбекском языке',
    example: 'Barcha turdagi ta\'mirlash ishlari',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Описание не должно превышать 1000 символов' })
  descriptionUz?: string;

  @ApiProperty({ 
    description: 'Описание на русском языке',
    example: 'Все виды ремонтных работ',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Описание не должно превышать 1000 символов' })
  descriptionRu?: string;

  @ApiProperty({ 
    description: 'URL иконки категории',
    example: 'https://example.com/icon.svg',
    required: false 
  })
  @IsOptional()
  @IsUrl({}, { message: 'Неверный формат URL иконки' })
  iconUrl?: string;

  @ApiProperty({ 
    description: 'Цвет категории в hex формате',
    example: '#FF5722',
    required: false 
  })
  @IsOptional()
  @IsHexColor({ message: 'Неверный формат цвета' })
  color?: string;

  @ApiProperty({ 
    description: 'ID родительской категории',
    example: 1,
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID родительской категории должен быть числом' })
  @Type(() => Number)
  parentId?: number;

  @ApiProperty({ 
    description: 'Порядок сортировки',
    example: 1,
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'Порядок сортировки должен быть числом' })
  @Type(() => Number)
  sortOrder?: number;

  @ApiProperty({ 
    description: 'Популярная категория',
    example: false,
    required: false 
  })
  @IsOptional()
  @IsBoolean({ message: 'Популярность должна быть булевым значением' })
  isPopular?: boolean;

  @ApiProperty({ 
    description: 'SEO slug для URL',
    example: 'repair-services',
    required: false 
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug может содержать только строчные буквы, цифры и дефисы' })
  @MaxLength(200, { message: 'Slug не должен превышать 200 символов' })
  slug?: string;

  @ApiProperty({ 
    description: 'Meta title для SEO',
    example: 'Ремонтные услуги в Ташкенте',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Meta title не должен превышать 200 символов' })
  metaTitle?: string;

  @ApiProperty({ 
    description: 'Meta description для SEO',
    example: 'Найдите лучших мастеров по ремонту в Ташкенте',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Meta description не должно превышать 500 символов' })
  metaDescription?: string;
}