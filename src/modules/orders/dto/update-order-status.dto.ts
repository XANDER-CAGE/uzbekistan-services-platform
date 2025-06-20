import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderStatusDto {
  @ApiProperty({ 
    description: 'Новый статус заказа',
    enum: OrderStatus 
  })
  @IsEnum(OrderStatus, { message: 'Неверный статус заказа' })
  status: OrderStatus;

  @ApiProperty({ 
    description: 'Комментарий к изменению статуса',
    required: false 
  })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class CompleteOrderDto {
  @ApiProperty({ 
    description: 'Оценка исполнителю (1-5)',
    example: 5 
  })
  @IsNumber({}, { message: 'Рейтинг должен быть числом' })
  @Min(1, { message: 'Минимальная оценка 1' })
  @Max(5, { message: 'Максимальная оценка 5' })
  @Type(() => Number)
  rating: number;

  @ApiProperty({ 
    description: 'Отзыв об исполнителе',
    example: 'Отличная работа, всё сделано качественно и в срок!' 
  })
  @IsString({ message: 'Отзыв должен быть строкой' })
  review: string;
}