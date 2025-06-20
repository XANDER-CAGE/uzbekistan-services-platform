import { PartialType } from '@nestjs/swagger';
import { CreateExecutorServiceDto } from './create-executor-service.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class UpdateExecutorServiceDto extends PartialType(CreateExecutorServiceDto) {
  @ApiProperty({ 
    description: 'Активна ли услуга',
    example: true,
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ 
    description: 'Порядок сортировки',
    example: 1,
    required: false 
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}