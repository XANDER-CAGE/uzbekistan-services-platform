import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
  Min,
  Max,
  MaxLength
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExecutorProfileDto {
  @ApiProperty({ 
    description: 'Краткое описание об исполнителе',
    example: 'Профессиональный мастер по ремонту бытовой техники с опытом 5 лет',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Описание не должно превышать 1000 символов' })
  bio?: string;

  @ApiProperty({ 
    description: 'Опыт работы в годах',
    example: 5,
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'Опыт должен быть числом' })
  @Min(0, { message: 'Опыт не может быть отрицательным' })
  @Max(50, { message: 'Опыт не может превышать 50 лет' })
  experienceYears?: number;

  @ApiProperty({ 
    description: 'Почасовая ставка в сумах',
    example: 50000,
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'Ставка должна быть числом' })
  @Min(0, { message: 'Ставка не может быть отрицательной' })
  hourlyRate?: number;

  @ApiProperty({ 
    description: 'Широта местоположения',
    example: 41.2995,
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'Широта должна быть числом' })
  @Min(-90, { message: 'Широта должна быть от -90 до 90' })
  @Max(90, { message: 'Широта должна быть от -90 до 90' })
  locationLat?: number;

  @ApiProperty({ 
    description: 'Долгота местоположения',
    example: 69.2401,
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'Долгота должна быть числом' })
  @Min(-180, { message: 'Долгота должна быть от -180 до 180' })
  @Max(180, { message: 'Долгота должна быть от -180 до 180' })
  locationLng?: number;

  @ApiProperty({ 
    description: 'Адрес',
    example: 'г. Ташкент, Юнусабадский район',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Адрес не должен превышать 500 символов' })
  address?: string;

  @ApiProperty({ 
    description: 'Радиус работы в километрах',
    example: 15,
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'Радиус должен быть числом' })
  @Min(1, { message: 'Радиус должен быть от 1 км' })
  @Max(100, { message: 'Радиус не может превышать 100 км' })
  workRadiusKm?: number;

  @ApiProperty({ 
    description: 'Telegram никнейм',
    example: '@username',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  telegramUsername?: string;

  @ApiProperty({ 
    description: 'Instagram никнейм',
    example: '@username',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  instagramUsername?: string;

  @ApiProperty({ 
    description: 'Рабочие дни',
    example: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false
    },
    required: false 
  })
  @IsOptional()
  workingDays?: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };

  @ApiProperty({ 
    description: 'Время начала работы (формат HH:MM)',
    example: '09:00',
    required: false 
  })
  @IsOptional()
  @IsString()
  workStartTime?: string;

  @ApiProperty({ 
    description: 'Время окончания работы (формат HH:MM)',
    example: '18:00',
    required: false 
  })
  @IsOptional()
  @IsString()
  workEndTime?: string;
}