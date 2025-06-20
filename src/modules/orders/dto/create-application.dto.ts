import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsNumber,
  IsDateString,
  Min,
  MinLength,
  MaxLength
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateApplicationDto {
  @ApiProperty({ 
    description: 'Предлагаемая цена (в сумах)',
    example: 350000,
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(1000, { message: 'Минимальная цена 1000 сум' })
  @Type(() => Number)
  proposedPrice?: number;

  @ApiProperty({ 
    description: 'Предлагаемый срок выполнения (в днях)',
    example: 3,
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'Срок должен быть числом' })
  @Min(1, { message: 'Минимальный срок 1 день' })
  @Type(() => Number)
  proposedDurationDays?: number;

  @ApiProperty({ 
    description: 'Комментарий к заявке',
    example: 'Готов выполнить работу качественно и в срок. Опыт работы 5 лет.' 
  })
  @IsString({ message: 'Комментарий должен быть строкой' })
  @MinLength(20, { message: 'Комментарий должен содержать минимум 20 символов' })
  @MaxLength(1000, { message: 'Комментарий не должен превышать 1000 символов' })
  message: string;

  @ApiProperty({ 
    description: 'Когда готов начать работу',
    example: '2024-02-01T09:00:00.000Z',
    required: false 
  })
  @IsOptional()
  @IsDateString({}, { message: 'Неверный формат даты' })
  availableFrom?: string;
}