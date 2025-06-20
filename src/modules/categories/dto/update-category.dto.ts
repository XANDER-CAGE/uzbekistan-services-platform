import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiProperty({ 
    description: 'Активна ли категория',
    example: true,
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}