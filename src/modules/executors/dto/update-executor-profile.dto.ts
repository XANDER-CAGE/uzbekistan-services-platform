import { PartialType } from '@nestjs/swagger';
import { CreateExecutorProfileDto } from './create-executor-profile.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateExecutorProfileDto extends PartialType(CreateExecutorProfileDto) {
  @ApiProperty({ 
    description: 'Доступен ли для заказов',
    example: true,
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}