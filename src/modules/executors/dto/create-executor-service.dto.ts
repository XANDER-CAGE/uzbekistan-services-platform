import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsNumber,
  IsEnum,
  Min,
  MaxLength
} from 'class-validator';
import { Type } from 'class-transformer';
import { PriceType } from '../entities/executor-service.entity';

export class CreateExecutorServiceDto {
  @ApiProperty({ 
    description: 'ID категории услуги',
    example: 5,
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID категории должен быть числом' })
  @Type(() => Number)
  categoryId?: number;

  @ApiProperty({ 
    description: 'Название услуги на узбекском',
    example: 'Konditsioner ta\'mirlash' 
  })
  @IsString()
  @MaxLength(200, { message: 'Название не должно превышать 200 символов' })
  titleUz: string;

  @ApiProperty({ 
    description: 'Название услуги на русском',
    example: 'Ремонт кондиционеров' 
  })
  @IsString()
  @MaxLength(200, { message: 'Название не должно превышать 200 символов' })
  titleRu: string;

  @ApiProperty({ 
    description: 'Описание услуги на узбекском',
    example: 'Barcha turdagi konditsionerlarni ta\'mirlash',
    required: false 
  })
  @IsOptional()
  @IsString()
  descriptionUz?: string;

  @ApiProperty({ 
    description: 'Описание услуги на русском',
    example: 'Ремонт кондиционеров всех типов',
    required: false 
  })
  @IsOptional()
  @IsString()
  descriptionRu?: string;

  @ApiProperty({ 
    description: 'Цена от (в сумах)',
    example: 100000,
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  priceFrom?: number;

  @ApiProperty({ 
    description: 'Цена до (в сумах)',
    example: 500000,
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  priceTo?: number;

  @ApiProperty({ 
    description: 'Тип ценообразования',
    enum: PriceType,
    example: PriceType.FIXED 
  })
  @IsEnum(PriceType, { message: 'Неверный тип ценообразования' })
  priceType: PriceType;

  @ApiProperty({ 
    description: 'Единица измерения',
    example: 'за единицу',
    required: false 
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Единица измерения не должна превышать 50 символов' })
  unit?: string;
}