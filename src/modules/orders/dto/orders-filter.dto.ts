import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { OrderStatus, OrderUrgency, OrderPriceType } from '../entities/order.entity';

export class OrdersFilterDto {
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
    description: 'Поиск по заголовку или описанию',
    example: 'ремонт кондиционера',
    required: false 
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    description: 'Фильтр по категории',
    example: 5,
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  categoryId?: number;

  @ApiProperty({ 
    description: 'Фильтр по статусу',
    enum: OrderStatus,
    required: false 
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ 
    description: 'Фильтр по срочности',
    enum: OrderUrgency,
    required: false 
  })
  @IsOptional()
  @IsEnum(OrderUrgency)
  urgency?: OrderUrgency;

  @ApiProperty({ 
    description: 'Фильтр по типу ценообразования',
    enum: OrderPriceType,
    required: false 
  })
  @IsOptional()
  @IsEnum(OrderPriceType)
  priceType?: OrderPriceType;

  @ApiProperty({ 
    description: 'Минимальный бюджет',
    example: 100000,
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  minBudget?: number;

  @ApiProperty({ 
    description: 'Максимальный бюджет',
    example: 1000000,
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  maxBudget?: number;

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
    example: 10,
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  radius?: number = 10;

  @ApiProperty({ 
    description: 'ID заказчика (для фильтрации своих заказов)',
    required: false 
  })
  @IsOptional()
  @Type(() => Number)
  customerId?: number;
}