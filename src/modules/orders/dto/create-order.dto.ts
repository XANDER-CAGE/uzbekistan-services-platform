import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsNumber,
  IsEnum,
  IsDateString,
  IsArray,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsDecimal
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderPriceType, OrderUrgency } from '../entities/order.entity';

export class CreateOrderDto {
  @ApiProperty({ 
    description: 'ID категории услуги',
    example: 5 
  })
  @IsNumber({}, { message: 'ID категории должен быть числом' })
  @Type(() => Number)
  categoryId: number;

  @ApiProperty({ 
    description: 'Заголовок заказа',
    example: 'Ремонт кондиционера Samsung' 
  })
  @IsString({ message: 'Заголовок должен быть строкой' })
  @MinLength(10, { message: 'Заголовок должен содержать минимум 10 символов' })
  @MaxLength(200, { message: 'Заголовок не должен превышать 200 символов' })
  title: string;

  @ApiProperty({ 
    description: 'Подробное описание заказа',
    example: 'Кондиционер не охлаждает, странно шумит. Нужна диагностика и ремонт.' 
  })
  @IsString({ message: 'Описание должно быть строкой' })
  @MinLength(20, { message: 'Описание должно содержать минимум 20 символов' })
  @MaxLength(2000, { message: 'Описание не должно превышать 2000 символов' })
  description: string;

  @ApiProperty({ 
    description: 'Тип ценообразования',
    enum: OrderPriceType,
    example: OrderPriceType.FIXED 
  })
  @IsEnum(OrderPriceType, { message: 'Неверный тип ценообразования' })
  priceType: OrderPriceType;

  @ApiProperty({ 
    description: 'Бюджет от (в сумах)',
    example: 200000,
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'Бюджет должен быть числом' })
  @Min(1000, { message: 'Минимальный бюджет 1000 сум' })
  @Type(() => Number)
  budgetFrom?: number;

  @ApiProperty({ 
    description: 'Бюджет до (в сумах)',
    example: 500000,
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'Бюджет должен быть числом' })
  @Min(1000, { message: 'Минимальный бюджет 1000 сум' })
  @Type(() => Number)
  budgetTo?: number;

  @ApiProperty({ 
    description: 'Желаемая дата начала работ',
    example: '2024-02-01T09:00:00.000Z',
    required: false 
  })
  @IsOptional()
  @IsDateString({}, { message: 'Неверный формат даты' })
  preferredStartDate?: string;

  @ApiProperty({ 
    description: 'Крайний срок выполнения',
    example: '2024-02-05T18:00:00.000Z',
    required: false 
  })
  @IsOptional()
  @IsDateString({}, { message: 'Неверный формат даты' })
  deadline?: string;

  @ApiProperty({ 
    description: 'Срочность заказа',
    enum: OrderUrgency,
    example: OrderUrgency.MEDIUM 
  })
  @IsEnum(OrderUrgency, { message: 'Неверная срочность' })
  urgency: OrderUrgency;

  @ApiProperty({ 
    description: 'Адрес выполнения работ',
    example: 'г. Ташкент, Юнусабадский район, ул. Амира Темура 15' 
  })
  @IsString({ message: 'Адрес должен быть строкой' })
  @MinLength(10, { message: 'Адрес должен содержать минимум 10 символов' })
  @MaxLength(500, { message: 'Адрес не должен превышать 500 символов' })
  address: string;

  @ApiProperty({ 
    description: 'Широта местоположения',
    example: 41.2995,
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'Широта должна быть числом' })
  @Min(-90, { message: 'Широта должна быть от -90 до 90' })
  @Max(90, { message: 'Широта должна быть от -90 до 90' })
  @Type(() => Number)
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
  @Type(() => Number)
  locationLng?: number;

  @ApiProperty({ 
    description: 'Опубликовать заказ сразу',
    example: true,
    required: false 
  })
  @IsOptional()
  publish?: boolean = true;
}