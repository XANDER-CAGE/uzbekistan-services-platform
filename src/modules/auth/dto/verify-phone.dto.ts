import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsPhoneNumber, Length, IsNumberString } from 'class-validator';

export class VerifyPhoneDto {
  @ApiProperty({ 
    description: 'Номер телефона',
    example: '+998901234567' 
  })
  @IsString()
  @IsPhoneNumber('UZ')
  phone: string;

  @ApiProperty({ 
    description: 'SMS код из 6 цифр',
    example: '123456' 
  })
  @IsNumberString({}, { message: 'Код должен содержать только цифры' })
  @Length(6, 6, { message: 'Код должен содержать 6 цифр' })
  code: string;
}