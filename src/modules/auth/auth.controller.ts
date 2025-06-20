import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  Req,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth 
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

interface AuthResponse {
  user: User;
  access_token: string;
}

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Регистрация нового пользователя',
    description: 'Создает нового пользователя и возвращает JWT токен'
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Вход в систему',
    description: 'Аутентифицирует пользователя по телефону/email и паролю'
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
  ): Promise<AuthResponse> {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return this.authService.login(loginDto, ip);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Получить информацию о текущем пользователе',
    description: 'Возвращает данные авторизованного пользователя'
  })
  async getCurrentUser(@CurrentUser() user: User): Promise<User> {
    return this.authService.getCurrentUser(user.id);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Выйти из системы',
    description: 'В текущей реализации просто возвращает успешный ответ (JWT токены stateless)'
  })
  async logout() {
    return { message: 'Вы успешно вышли из системы' };
  }
}
