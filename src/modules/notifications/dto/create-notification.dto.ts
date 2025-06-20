import { ApiProperty } from '@nestjs/swagger';
import { 
  IsEnum, 
  IsString, 
  IsOptional, 
  IsNumber,
  IsObject,
  IsDateString,
  MinLength,
  MaxLength
} from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType, NotificationChannel, NotificationPriority } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ 
    description: 'ID пользователя-получателя',
    example: 1 
  })
  @IsNumber({}, { message: 'ID пользователя должен быть числом' })
  @Type(() => Number)
  userId: number;

  @ApiProperty({ 
    description: 'Тип уведомления',
    enum: NotificationType,
    example: NotificationType.NEW_ORDER_IN_AREA 
  })
  @IsEnum(NotificationType, { message: 'Неверный тип уведомления' })
  type: NotificationType;

  @ApiProperty({ 
    description: 'Канал доставки',
    enum: NotificationChannel,
    example: NotificationChannel.IN_APP 
  })
  @IsEnum(NotificationChannel, { message: 'Неверный канал уведомления' })
  channel: NotificationChannel;

  @ApiProperty({ 
    description: 'Заголовок уведомления',
    example: 'Новый заказ рядом с вами!' 
  })
  @IsString({ message: 'Заголовок должен быть строкой' })
  @MinLength(5, { message: 'Заголовок должен содержать минимум 5 символов' })
  @MaxLength(255, { message: 'Заголовок не должен превышать 255 символов' })
  title: string;

  @ApiProperty({ 
    description: 'Текст уведомления',
    example: 'Ремонт кондиционера в Юнусабадском районе. Бюджет: 200-500 тыс. сум' 
  })
  @IsString({ message: 'Сообщение должно быть строкой' })
  @MinLength(10, { message: 'Сообщение должно содержать минимум 10 символов' })
  message: string;

  @ApiProperty({ 
    description: 'Приоритет уведомления',
    enum: NotificationPriority,
    example: NotificationPriority.NORMAL,
    required: false 
  })
  @IsOptional()
  @IsEnum(NotificationPriority, { message: 'Неверный приоритет' })
  priority?: NotificationPriority = NotificationPriority.NORMAL;

  @ApiProperty({ 
    description: 'Дополнительные данные (JSON)',
    example: { orderId: 123, categoryId: 5 },
    required: false 
  })
  @IsOptional()
  @IsObject({ message: 'Данные должны быть объектом' })
  data?: any;

  @ApiProperty({ 
    description: 'Время отправки (если нужна отложенная отправка)',
    example: '2024-02-01T10:00:00.000Z',
    required: false 
  })
  @IsOptional()
  @IsDateString({}, { message: 'Неверный формат даты' })
  scheduledAt?: string;
}