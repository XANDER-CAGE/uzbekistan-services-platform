import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ 
    description: 'Текущий пароль',
    example: 'oldpassword123' 
  })
  @IsString({ message: 'Текущий пароль должен быть строкой' })
  currentPassword: string;

  @ApiProperty({ 
    description: 'Новый пароль',
    example: 'newpassword123' 
  })
  @IsString({ message: 'Новый пароль должен быть строкой' })
  @MinLength(6, { message: 'Новый пароль должен содержать минимум 6 символов' })
  newPassword: string;
}