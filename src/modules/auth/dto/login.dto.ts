import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsPhoneNumber, MinLength, IsOptional, IsEmail } from 'class-validator';

export class LoginDto {
  @ApiProperty({ 
    description: 'Номер телефона или email',
    example: '+998901234567'
  })
  @IsString()
  login: string; // Может быть телефон или email

  @ApiProperty({ 
    description: 'Пароль',
    example: 'mypassword123' 
  })
  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;
}