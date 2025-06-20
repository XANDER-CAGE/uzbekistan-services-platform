import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    BadRequestException,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiConsumes,
    ApiBody,
    ApiQuery,
  } from '@nestjs/swagger';
  import { UsersService } from './users.service';
  import { UpdateUserDto } from './dto/update-user.dto';
  import { ChangePasswordDto } from './dto/change-password.dto';
  import { UsersFilterDto } from './dto/users-filter.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard, Roles } from '../auth/guards/roles.guard';
  import { CurrentUser } from '../../common/decorators/current-user.decorator';
  import { User, UserType } from './entities/user.entity';
  import { multerAvatarConfig } from '../../common/utils/file-upload.utils';
  
  @ApiTags('Пользователи')
  @Controller('users')
  export class UsersController {
    constructor(private readonly usersService: UsersService) {}
  
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.BOTH]) // Только админы (пока нет отдельной роли админа)
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Получить список всех пользователей',
      description: 'Возвращает пагинированный список пользователей с возможностью фильтрации' 
    })
    @ApiQuery({ name: 'page', required: false, description: 'Номер страницы' })
    @ApiQuery({ name: 'limit', required: false, description: 'Количество элементов на странице' })
    @ApiQuery({ name: 'search', required: false, description: 'Поиск по имени или телефону' })
    @ApiQuery({ name: 'userType', required: false, enum: UserType, description: 'Фильтр по типу пользователя' })
    @ApiResponse({ 
      status: 200, 
      description: 'Список пользователей получен',
      schema: {
        example: {
          users: [
            {
              id: 1,
              phone: "+998901234567",
              firstName: "Алишер",
              lastName: "Каримов",
              userType: "customer",
              isVerified: true,
              createdAt: "2024-01-15T10:30:00.000Z"
            }
          ],
          total: 25,
          page: 1,
          limit: 10,
          totalPages: 3
        }
      }
    })
    async findAll(@Query() filterDto: UsersFilterDto) {
      return this.usersService.findAll(filterDto);
    }
  
    @Get('stats')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.BOTH]) // Только админы
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Получить статистику пользователей',
      description: 'Возвращает общую статистику по пользователям' 
    })
    @ApiResponse({ 
      status: 200, 
      description: 'Статистика получена',
      schema: {
        example: {
          total: 150,
          customers: 120,
          executors: 25,
          verified: 140,
          blocked: 5
        }
      }
    })
    async getStats() {
      return this.usersService.getStats();
    }
  
    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Получить свой профиль',
      description: 'Возвращает профиль текущего авторизованного пользователя' 
    })
    @ApiResponse({ status: 200, description: 'Профиль получен', type: User })
    async getMyProfile(@CurrentUser() user: User) {
      return this.usersService.findOne(user.id);
    }
  
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Получить пользователя по ID',
      description: 'Возвращает информацию о пользователе по его ID' 
    })
    @ApiResponse({ status: 200, description: 'Пользователь найден', type: User })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
      return this.usersService.findOne(id);
    }
  
    @Patch('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Обновить свой профиль',
      description: 'Обновляет профиль текущего пользователя' 
    })
    @ApiResponse({ status: 200, description: 'Профиль обновлен', type: User })
    @ApiResponse({ status: 409, description: 'Email уже используется' })
    async updateMyProfile(
      @CurrentUser() user: User,
      @Body() updateUserDto: UpdateUserDto,
    ) {
      return this.usersService.updateProfile(user.id, updateUserDto);
    }
  
    @Patch('me/password')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
      summary: 'Изменить пароль',
      description: 'Изменяет пароль текущего пользователя' 
    })
    @ApiResponse({ 
      status: 200, 
      description: 'Пароль изменен',
      schema: {
        example: { message: 'Пароль успешно изменен' }
      }
    })
    @ApiResponse({ status: 401, description: 'Неверный текущий пароль' })
    async changePassword(
      @CurrentUser() user: User,
      @Body() changePasswordDto: ChangePasswordDto,
    ) {
      return this.usersService.changePassword(user.id, changePasswordDto);
    }
  
    @Post('me/avatar')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('avatar', multerAvatarConfig))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ 
      summary: 'Загрузить аватар',
      description: 'Загружает аватар для текущего пользователя' 
    })
    @ApiBody({
      description: 'Файл аватара',
      schema: {
        type: 'object',
        properties: {
          avatar: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })
    @ApiResponse({ 
      status: 201, 
      description: 'Аватар загружен',
      schema: {
        example: {
          id: 1,
          firstName: "Алишер",
          avatarUrl: "http://localhost:3000/uploads/avatars/avatar-123.jpg",
          message: "Аватар успешно загружен"
        }
      }
    })
    @ApiResponse({ status: 400, description: 'Неверный формат файла' })
    async uploadAvatar(
      @CurrentUser() user: User,
      @UploadedFile() file: Express.Multer.File,
    ) {
      if (!file) {
        throw new BadRequestException('Файл не загружен');
      }
  
      // Создаем URL для файла
      const avatarUrl = `/uploads/avatars/${file.filename}`;
      
      const updatedUser = await this.usersService.updateAvatar(user.id, avatarUrl);
      
      return {
        ...updatedUser,
        message: 'Аватар успешно загружен',
      };
    }
  
    @Patch(':id/block')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.BOTH]) // Только админы
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Заблокировать пользователя',
      description: 'Блокирует пользователя (только для админов)' 
    })
    @ApiResponse({ 
      status: 200, 
      description: 'Пользователь заблокирован',
      schema: {
        example: { message: 'Пользователь заблокирован' }
      }
    })
    async blockUser(@Param('id', ParseIntPipe) id: number) {
      return this.usersService.remove(id);
    }
  
    @Patch(':id/unblock')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.BOTH]) // Только админы
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Разблокировать пользователя',
      description: 'Разблокирует пользователя (только для админов)' 
    })
    @ApiResponse({ status: 200, description: 'Пользователь разблокирован', type: User })
    async unblockUser(@Param('id', ParseIntPipe) id: number) {
      return this.usersService.unblock(id);
    }
  }