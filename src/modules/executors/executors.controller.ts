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
    UploadedFiles,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    BadRequestException,
  } from '@nestjs/common';
  import { FilesInterceptor } from '@nestjs/platform-express';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiConsumes,
    ApiBody,
    ApiQuery,
  } from '@nestjs/swagger';
  import { ExecutorsService } from './executors.service';
  import { CreateExecutorProfileDto } from './dto/create-executor-profile.dto';
  import { UpdateExecutorProfileDto } from './dto/update-executor-profile.dto';
  import { CreateExecutorServiceDto } from './dto/create-executor-service.dto';
  import { UpdateExecutorServiceDto } from './dto/update-executor-service.dto';
  import { ExecutorsFilterDto } from './dto/executors-filter.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard, Roles } from '../auth/guards/roles.guard';
  import { CurrentUser } from '../../common/decorators/current-user.decorator';
  import { User, UserType } from '../users/entities/user.entity';
  import { ExecutorProfile } from './entities/executor-profile.entity';
  import { ExecutorService } from './entities/executor-service.entity';
  import { multerPortfolioConfig } from '../../common/utils/file-upload.utils';
  
  @ApiTags('Исполнители')
  @Controller('executors')
  export class ExecutorsController {
    constructor(private readonly executorsService: ExecutorsService) {}
  
    @Post('profile')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.EXECUTOR, UserType.BOTH])
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Создать профиль исполнителя',
      description: 'Создает профиль исполнителя для текущего пользователя' 
    })
    @ApiResponse({ 
      status: 201, 
      description: 'Профиль создан',
      type: ExecutorProfile
    })
    @ApiResponse({ status: 409, description: 'Профиль уже существует' })
    @ApiResponse({ status: 403, description: 'Недостаточно прав' })
    async createProfile(
      @CurrentUser() user: User,
      @Body() createDto: CreateExecutorProfileDto,
    ) {
      return this.executorsService.createProfile(user.id, createDto);
    }
  
    @Get()
    @ApiOperation({ 
      summary: 'Получить список исполнителей',
      description: 'Возвращает список исполнителей с возможностью фильтрации и поиска' 
    })
    @ApiQuery({ name: 'page', required: false, description: 'Номер страницы' })
    @ApiQuery({ name: 'limit', required: false, description: 'Количество элементов на странице' })
    @ApiQuery({ name: 'search', required: false, description: 'Поиск по имени или описанию' })
    @ApiQuery({ name: 'lat', required: false, description: 'Широта для поиска рядом' })
    @ApiQuery({ name: 'lng', required: false, description: 'Долгота для поиска рядом' })
    @ApiQuery({ name: 'radius', required: false, description: 'Радиус поиска в км' })
    @ApiQuery({ name: 'minRating', required: false, description: 'Минимальный рейтинг' })
    @ApiQuery({ name: 'onlyVerified', required: false, description: 'Только верифицированные' })
    @ApiQuery({ name: 'onlyAvailable', required: false, description: 'Только доступные' })
    @ApiResponse({ 
      status: 200, 
      description: 'Список исполнителей получен',
      schema: {
        example: {
          executors: [
            {
              id: 1,
              userId: 1,
              bio: "Профессиональный электрик",
              experienceYears: 5,
              rating: 4.8,
              reviewsCount: 25,
              isAvailable: true,
              user: {
                firstName: "Алишер",
                lastName: "Каримов",
                phone: "+998901234567"
              }
            }
          ],
          total: 50,
          page: 1,
          limit: 10,
          totalPages: 5
        }
      }
    })
    async findAll(@Query() filterDto: ExecutorsFilterDto) {
      return this.executorsService.findAll(filterDto);
    }
  
    @Get('nearby')
    @ApiOperation({ 
      summary: 'Найти исполнителей рядом',
      description: 'Возвращает список исполнителей в указанном радиусе' 
    })
    @ApiQuery({ name: 'lat', required: true, description: 'Широта' })
    @ApiQuery({ name: 'lng', required: true, description: 'Долгота' })
    @ApiQuery({ name: 'radius', required: false, description: 'Радиус поиска в км (по умолчанию 10)' })
    @ApiResponse({ 
      status: 200, 
      description: 'Исполнители рядом найдены',
      type: [ExecutorProfile]
    })
    async findNearby(
      @Query('lat', ParseIntPipe) lat: number,
      @Query('lng', ParseIntPipe) lng: number,
      @Query('radius') radius?: number,
    ) {
      return this.executorsService.findNearby(lat, lng, radius);
    }
  
    @Get('profile/me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Получить свой профиль исполнителя',
      description: 'Возвращает профиль исполнителя текущего пользователя' 
    })
    @ApiResponse({ status: 200, description: 'Профиль получен', type: ExecutorProfile })
    @ApiResponse({ status: 404, description: 'Профиль не найден' })
    async getMyProfile(@CurrentUser() user: User) {
      return this.executorsService.findByUserId(user.id);
    }
  
    @Get(':id')
    @ApiOperation({ 
      summary: 'Получить профиль исполнителя по ID',
      description: 'Возвращает публичную информацию о профиле исполнителя' 
    })
    @ApiResponse({ status: 200, description: 'Профиль найден', type: ExecutorProfile })
    @ApiResponse({ status: 404, description: 'Профиль не найден' })
    async findOne(@Param('id', ParseIntPipe) id: number) {
      return this.executorsService.findOne(id);
    }
  
    @Patch('profile/me')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.EXECUTOR, UserType.BOTH])
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Обновить свой профиль исполнителя',
      description: 'Обновляет профиль исполнителя текущего пользователя' 
    })
    @ApiResponse({ status: 200, description: 'Профиль обновлен', type: ExecutorProfile })
    @ApiResponse({ status: 404, description: 'Профиль не найден' })
    async updateMyProfile(
      @CurrentUser() user: User,
      @Body() updateDto: UpdateExecutorProfileDto,
    ) {
      return this.executorsService.updateProfile(user.id, updateDto);
    }
  
    @Post('profile/me/portfolio')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.EXECUTOR, UserType.BOTH])
    @ApiBearerAuth()
    @UseInterceptors(FilesInterceptor('portfolio', 10, multerPortfolioConfig))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ 
      summary: 'Загрузить фотографии портфолио',
      description: 'Загружает до 10 фотографий работ в портфолио' 
    })
    @ApiBody({
      description: 'Фотографии портфолио',
      schema: {
        type: 'object',
        properties: {
          portfolio: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
    })
    @ApiResponse({ 
      status: 201, 
      description: 'Фотографии загружены',
      schema: {
        example: {
          id: 1,
          portfolioImages: [
            "/uploads/portfolio/photo1.jpg",
            "/uploads/portfolio/photo2.jpg"
          ],
          message: "Фотографии успешно загружены"
        }
      }
    })
    async uploadPortfolio(
      @CurrentUser() user: User,
      @UploadedFiles() files: Express.Multer.File[],
    ) {
      if (!files || files.length === 0) {
        throw new BadRequestException('Файлы не загружены');
      }
  
      // Создаем URLs для файлов
      const imageUrls = files.map(file => `/uploads/portfolio/${file.filename}`);
      
      const updatedProfile = await this.executorsService.updatePortfolio(user.id, imageUrls);
      
      return {
        ...updatedProfile,
        message: `Загружено ${files.length} фотографий`,
      };
    }
  
    @Delete('profile/me/portfolio/:imageUrl')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.EXECUTOR, UserType.BOTH])
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Удалить фотографию из портфолио',
      description: 'Удаляет указанную фотографию из портфолио' 
    })
    @ApiResponse({ 
      status: 200, 
      description: 'Фотография удалена',
      type: ExecutorProfile
    })
    async removePortfolioImage(
      @CurrentUser() user: User,
      @Param('imageUrl') imageUrl: string,
    ) {
      // Декодируем URL если он был закодирован
      const decodedUrl = decodeURIComponent(imageUrl);
      return this.executorsService.removePortfolioImage(user.id, decodedUrl);
    }
  
    // === УПРАВЛЕНИЕ УСЛУГАМИ ===
  
    @Post('services')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.EXECUTOR, UserType.BOTH])
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Создать услугу',
      description: 'Создает новую услугу для исполнителя' 
    })
    @ApiResponse({ 
      status: 201, 
      description: 'Услуга создана',
      type: ExecutorService
    })
    async createService(
      @CurrentUser() user: User,
      @Body() createDto: CreateExecutorServiceDto,
    ) {
      return this.executorsService.createService(user.id, createDto);
    }
  
    @Get(':executorId/services')
    @ApiOperation({ 
      summary: 'Получить услуги исполнителя',
      description: 'Возвращает список активных услуг исполнителя' 
    })
    @ApiResponse({ 
      status: 200, 
      description: 'Услуги получены',
      type: [ExecutorService]
    })
    async getExecutorServices(@Param('executorId', ParseIntPipe) executorId: number) {
      return this.executorsService.getServices(executorId);
    }
  
    @Get('services/me')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.EXECUTOR, UserType.BOTH])
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Получить свои услуги',
      description: 'Возвращает список услуг текущего исполнителя' 
    })
    @ApiResponse({ 
      status: 200, 
      description: 'Услуги получены',
      type: [ExecutorService]
    })
    async getMyServices(@CurrentUser() user: User) {
      const profile = await this.executorsService.findByUserId(user.id);
      return this.executorsService.getServices(profile.id);
    }
  
    @Patch('services/:serviceId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.EXECUTOR, UserType.BOTH])
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Обновить услугу',
      description: 'Обновляет информацию об услуге' 
    })
    @ApiResponse({ 
      status: 200, 
      description: 'Услуга обновлена',
      type: ExecutorService
    })
    @ApiResponse({ status: 404, description: 'Услуга не найдена' })
    async updateService(
      @CurrentUser() user: User,
      @Param('serviceId', ParseIntPipe) serviceId: number,
      @Body() updateDto: UpdateExecutorServiceDto,
    ) {
      return this.executorsService.updateService(user.id, serviceId, updateDto);
    }
  
    @Delete('services/:serviceId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.EXECUTOR, UserType.BOTH])
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
      summary: 'Удалить услугу',
      description: 'Удаляет услугу исполнителя' 
    })
    @ApiResponse({ 
      status: 200, 
      description: 'Услуга удалена',
      schema: {
        example: { message: 'Услуга удалена' }
      }
    })
    async removeService(
      @CurrentUser() user: User,
      @Param('serviceId', ParseIntPipe) serviceId: number,
    ) {
      return this.executorsService.removeService(user.id, serviceId);
    }
  }