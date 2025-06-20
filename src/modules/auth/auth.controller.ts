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
  import { AuthService } from './auth.service';
  import { RegisterDto } from './dto/register.dto';
  import { LoginDto } from './dto/login.dto';
  import { JwtAuthGuard } from './guards/jwt-auth.guard';
  import { CurrentUser } from '../../common/decorators/current-user.decorator';
  import { User } from '../users/entities/user.entity';
  
  // Интерфейс для ответа с токеном
  interface AuthResponse {
    user: User;
    access_token: string;
  }
  
  @ApiTags('Аутентификация') // Группировка в Swagger
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ 
      summary: 'Регистрация нового пользователя',
      description: 'Создает нового пользователя и возвращает JWT токен'
    })
    @ApiResponse({ 
      status: 201, 
      description: 'Пользователь успешно зарегистрирован',
      schema: {
        example: {
          user: {
            id: 1,
            phone: "+998901234567",
            firstName: "Алишер",
            lastName: "Каримов",
            email: "alisher@example.com",
            userType: "customer",
            language: "uz",
            isVerified: true,
            isBlocked: false,
            createdAt: "2024-01-15T10:30:00.000Z"
          },
          access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
      }
    })
    @ApiResponse({ 
      status: 400, 
      description: 'Пользователь уже существует или неверные данные',
      schema: {
        example: {
          message: "Пользователь с таким номером телефона уже существует",
          error: "Bad Request",
          statusCode: 400
        }
      }
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
    @ApiResponse({ 
      status: 200, 
      description: 'Успешный вход в систему',
      schema: {
        example: {
          user: {
            id: 1,
            phone: "+998901234567",
            firstName: "Алишер",
            lastName: "Каримов",
            userType: "customer",
            executorProfile: null
          },
          access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
      }
    })
    @ApiResponse({ 
      status: 401, 
      description: 'Неверные данные для входа',
      schema: {
        example: {
          message: "Неверные данные для входа",
          error: "Unauthorized",
          statusCode: 401
        }
      }
    })
    async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
      return this.authService.login(loginDto);
    }
  
    @Get('me')
    @UseGuards(JwtAuthGuard) // Защищаем route JWT токеном
    @ApiBearerAuth() // Указываем, что нужен Bearer токен
    @ApiOperation({ 
      summary: 'Получить информацию о текущем пользователе',
      description: 'Возвращает данные авторизованного пользователя'
    })
    @ApiResponse({ 
      status: 200, 
      description: 'Информация о пользователе',
      type: User
    })
    @ApiResponse({ status: 401, description: 'Не авторизован' })
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
    @ApiResponse({ 
      status: 200, 
      description: 'Успешный выход из системы',
      schema: {
        example: { message: 'Вы успешно вышли из системы' }
      }
    })
    async logout() {
      // В JWT аутентификации logout обычно происходит на клиенте
      // (удаление токена из localStorage/cookies)
      // Для полноценного logout можно реализовать blacklist токенов в Redis
      return { message: 'Вы успешно вышли из системы' };
    }
  }