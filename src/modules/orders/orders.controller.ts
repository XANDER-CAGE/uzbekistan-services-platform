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
    ApiParam,
  } from '@nestjs/swagger';
  import { OrdersService } from './orders.service';
  import { CreateOrderDto } from './dto/create-order.dto';
  import { CreateApplicationDto } from './dto/create-application.dto';
  import { OrdersFilterDto } from './dto/orders-filter.dto';
  import { UpdateOrderStatusDto, CompleteOrderDto } from './dto/update-order-status.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard, Roles } from '../auth/guards/roles.guard';
  import { CurrentUser } from '../../common/decorators/current-user.decorator';
  import { User, UserType } from '../users/entities/user.entity';
  import { Order, OrderStatus } from './entities/order.entity';
  import { OrderApplication } from './entities/order-application.entity';
  import { multerPortfolioConfig } from '../../common/utils/file-upload.utils';
  
  @ApiTags('Заказы')
  @Controller('orders')
  export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}
  
    // === УПРАВЛЕНИЕ ЗАКАЗАМИ ===
  
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.CUSTOMER, UserType.BOTH])
    @ApiBearerAuth()
    @ApiOperation({ 
    summary: 'Создать заказ',
    description: 'Создает новый заказ от имени заказчика' 
    })
    @ApiResponse({ 
    status: 201, 
    description: 'Заказ создан',
    type: Order
    })
    @ApiResponse({ status: 404, description: 'Категория не найдена' })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    async createOrder(
    @CurrentUser() user: User,
    @Body() createDto: CreateOrderDto,
    ) {
    console.log('Creating order:', {
        userId: user.id,
        userType: user.userType,
        createDto
    });

    try {
        const result = await this.ordersService.createOrder(user.id, createDto);
        console.log('Order created successfully:', { orderId: result.id });
        return result;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
    }
  
    @Get()
    @ApiOperation({ 
      summary: 'Поиск заказов',
      description: 'Возвращает список заказов с возможностью фильтрации' 
    })
    @ApiQuery({ name: 'page', required: false, description: 'Номер страницы' })
    @ApiQuery({ name: 'limit', required: false, description: 'Количество элементов на странице' })
    @ApiQuery({ name: 'search', required: false, description: 'Поиск по заголовку или описанию' })
    @ApiQuery({ name: 'categoryId', required: false, description: 'Фильтр по категории' })
    @ApiQuery({ name: 'status', required: false, enum: OrderStatus, description: 'Фильтр по статусу' })
    @ApiQuery({ name: 'lat', required: false, description: 'Широта для поиска рядом' })
    @ApiQuery({ name: 'lng', required: false, description: 'Долгота для поиска рядом' })
    @ApiQuery({ name: 'radius', required: false, description: 'Радиус поиска в км' })
    @ApiResponse({ 
      status: 200, 
      description: 'Список заказов получен',
      schema: {
        example: {
          orders: [
            {
              id: 1,
              title: "Ремонт кондиционера Samsung",
              description: "Кондиционер не охлаждает, странно шумит",
              budgetFrom: 200000,
              budgetTo: 500000,
              status: "open",
              urgency: "medium",
              address: "г. Ташкент, Юнусабадский район",
              customer: {
                firstName: "Алишер",
                lastName: "Каримов"
              },
              category: {
                nameRu: "Кондиционеры"
              },
              applicationsCount: 5,
              viewsCount: 25,
              createdAt: "2024-01-15T10:30:00.000Z"
            }
          ],
          total: 100,
          page: 1,
          limit: 10,
          totalPages: 10
        }
      }
    })
    async findOrders(@Query() filterDto: OrdersFilterDto) {
      return this.ordersService.findOrders(filterDto);
    }
  
    @Get('my')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Получить мои заказы',
      description: 'Возвращает заказы текущего пользователя' 
    })
    @ApiQuery({ name: 'status', required: false, enum: OrderStatus, description: 'Фильтр по статусу' })
    @ApiResponse({ 
      status: 200, 
      description: 'Мои заказы получены',
      type: [Order]
    })
    async getMyOrders(
      @CurrentUser() user: User,
      @Query() filterDto: OrdersFilterDto,
    ) {
      // Добавляем фильтр по текущему пользователю
      filterDto.customerId = user.id;
      return this.ordersService.findOrders(filterDto);
    }
  
    @Get(':id')
    @ApiOperation({ 
      summary: 'Получить заказ по ID',
      description: 'Возвращает детальную информацию о заказе' 
    })
    @ApiParam({ name: 'id', description: 'ID заказа' })
    @ApiResponse({ status: 200, description: 'Заказ найден', type: Order })
    @ApiResponse({ status: 404, description: 'Заказ не найден' })
    async findOne(
      @Param('id', ParseIntPipe) id: number,
      @CurrentUser() user?: User,
    ) {
      return this.ordersService.findOne(id, user?.id);
    }
  
    @Patch(':id/status')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Обновить статус заказа',
      description: 'Обновляет статус заказа (доступно заказчику и исполнителю)' 
    })
    @ApiParam({ name: 'id', description: 'ID заказа' })
    @ApiResponse({ status: 200, description: 'Статус обновлен', type: Order })
    @ApiResponse({ status: 403, description: 'Нет прав для изменения статуса' })
    @ApiResponse({ status: 400, description: 'Недопустимый переход статуса' })
    async updateOrderStatus(
      @CurrentUser() user: User,
      @Param('id', ParseIntPipe) id: number,
      @Body() updateDto: UpdateOrderStatusDto,
    ) {
      return this.ordersService.updateOrderStatus(user.id, id, updateDto);
    }
  
    @Post(':id/complete')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.CUSTOMER, UserType.BOTH])
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Завершить заказ с оценкой',
      description: 'Завершает заказ и оставляет отзыв об исполнителе' 
    })
    @ApiParam({ name: 'id', description: 'ID заказа' })
    @ApiResponse({ status: 200, description: 'Заказ завершен', type: Order })
    @ApiResponse({ status: 403, description: 'Нет прав для завершения заказа' })
    @ApiResponse({ status: 400, description: 'Заказ нельзя завершить в текущем статусе' })
    async completeOrder(
      @CurrentUser() user: User,
      @Param('id', ParseIntPipe) id: number,
      @Body() completeDto: CompleteOrderDto,
    ) {
      return this.ordersService.completeOrder(user.id, id, completeDto);
    }
  
    @Post(':id/attachments')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(FilesInterceptor('attachments', 5, multerPortfolioConfig))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ 
      summary: 'Загрузить файлы к заказу',
      description: 'Загружает до 5 файлов (фотографии, документы) к заказу' 
    })
    @ApiParam({ name: 'id', description: 'ID заказа' })
    @ApiBody({
      description: 'Файлы к заказу',
      schema: {
        type: 'object',
        properties: {
          attachments: {
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
      description: 'Файлы загружены',
      schema: {
        example: {
          message: "Загружено 3 файла",
          attachments: [
            "/uploads/portfolio/file1.jpg",
            "/uploads/portfolio/file2.pdf",
            "/uploads/portfolio/file3.jpg"
          ]
        }
      }
    })
    async uploadAttachments(
      @CurrentUser() user: User,
      @Param('id', ParseIntPipe) id: number,
      @UploadedFiles() files: Express.Multer.File[],
    ) {
      if (!files || files.length === 0) {
        throw new BadRequestException('Файлы не загружены');
      }
  
      // TODO: Реализовать добавление файлов к заказу
      const attachmentUrls = files.map(file => `/uploads/portfolio/${file.filename}`);
      
      return {
        message: `Загружено ${files.length} файлов`,
        attachments: attachmentUrls,
      };
    }
  
    // === УПРАВЛЕНИЕ ЗАЯВКАМИ ===
  
    @Post(':id/applications')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.EXECUTOR, UserType.BOTH])
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Подать заявку на заказ',
      description: 'Создает заявку исполнителя на выполнение заказа' 
    })
    @ApiParam({ name: 'id', description: 'ID заказа' })
    @ApiResponse({ 
      status: 201, 
      description: 'Заявка подана',
      type: OrderApplication
    })
    @ApiResponse({ status: 404, description: 'Заказ не найден' })
    @ApiResponse({ status: 400, description: 'Заказ не принимает заявки' })
    @ApiResponse({ status: 409, description: 'Заявка уже подана' })
    async createApplication(
      @CurrentUser() user: User,
      @Param('id', ParseIntPipe) orderId: number,
      @Body() createDto: CreateApplicationDto,
    ) {
      return this.ordersService.createApplication(user.id, orderId, createDto);
    }
  
    @Get(':id/applications')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Получить заявки на заказ',
      description: 'Возвращает список заявок на заказ (только для владельца заказа)' 
    })
    @ApiParam({ name: 'id', description: 'ID заказа' })
    @ApiResponse({ 
      status: 200, 
      description: 'Заявки получены',
      type: [OrderApplication]
    })
    @ApiResponse({ status: 403, description: 'Нет прав для просмотра заявок' })
    async getOrderApplications(
      @CurrentUser() user: User,
      @Param('id', ParseIntPipe) orderId: number,
    ) {
      return this.ordersService.getOrderApplications(orderId, user.id);
    }
  
    @Post('applications/:applicationId/accept')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.CUSTOMER, UserType.BOTH])
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
      summary: 'Принять заявку исполнителя',
      description: 'Принимает заявку исполнителя и переводит заказ в работу' 
    })
    @ApiParam({ name: 'applicationId', description: 'ID заявки' })
    @ApiResponse({ 
      status: 200, 
      description: 'Заявка принята',
      type: Order
    })
    @ApiResponse({ status: 404, description: 'Заявка не найдена' })
    @ApiResponse({ status: 403, description: 'Нет прав для принятия заявки' })
    @ApiResponse({ status: 400, description: 'Заявка уже обработана' })
    async acceptApplication(
      @CurrentUser() user: User,
      @Param('applicationId', ParseIntPipe) applicationId: number,
    ) {
      return this.ordersService.acceptApplication(user.id, applicationId);
    }
  
    @Post('applications/:applicationId/reject')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.CUSTOMER, UserType.BOTH])
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
      summary: 'Отклонить заявку исполнителя',
      description: 'Отклоняет заявку исполнителя с указанием причины' 
    })
    @ApiParam({ name: 'applicationId', description: 'ID заявки' })
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            description: 'Причина отклонения',
            example: 'Выбран исполнитель с лучшим предложением'
          }
        }
      }
    })
    @ApiResponse({ 
      status: 200, 
      description: 'Заявка отклонена',
      type: OrderApplication
    })
    async rejectApplication(
      @CurrentUser() user: User,
      @Param('applicationId', ParseIntPipe) applicationId: number,
      @Body('reason') reason?: string,
    ) {
      return this.ordersService.rejectApplication(user.id, applicationId, reason);
    }
  
    @Get('applications/my')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.EXECUTOR, UserType.BOTH])
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Получить мои заявки',
      description: 'Возвращает заявки текущего исполнителя на заказы' 
    })
    @ApiResponse({ 
      status: 200, 
      description: 'Мои заявки получены',
      type: [OrderApplication]
    })
    async getMyApplications(@CurrentUser() user: User) {
      return this.ordersService.getMyApplications(user.id);
    }
  
    @Post('applications/:applicationId/withdraw')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.EXECUTOR, UserType.BOTH])
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
      summary: 'Отозвать заявку',
      description: 'Отзывает поданную заявку (только для ожидающих заявок)' 
    })
    @ApiParam({ name: 'applicationId', description: 'ID заявки' })
    @ApiResponse({ 
      status: 200, 
      description: 'Заявка отозвана',
      type: OrderApplication
    })
    @ApiResponse({ status: 404, description: 'Заявка не найдена' })
    @ApiResponse({ status: 400, description: 'Можно отозвать только ожидающие заявки' })
    async withdrawApplication(
      @CurrentUser() user: User,
      @Param('applicationId', ParseIntPipe) applicationId: number,
    ) {
      return this.ordersService.withdrawApplication(user.id, applicationId);
    }
  
    // === СТАТИСТИКА И АНАЛИТИКА ===
  
    @Get('stats/dashboard')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Получить статистику дашборда',
      description: 'Возвращает статистику заказов для текущего пользователя' 
    })
    @ApiResponse({ 
      status: 200, 
      description: 'Статистика получена',
      schema: {
        example: {
          customer: {
            totalOrders: 15,
            activeOrders: 3,
            completedOrders: 10,
            cancelledOrders: 2,
            totalSpent: 2500000,
            averageRating: 4.7
          },
          executor: {
            totalApplications: 45,
            acceptedApplications: 12,
            completedOrders: 10,
            totalEarned: 1800000,
            averageRating: 4.8
          }
        }
      }
    })
    async getDashboardStats(@CurrentUser() user: User) {
      // TODO: Реализовать получение статистики
      return {
        message: 'Статистика дашборда (в разработке)',
        user: {
          id: user.id,
          type: user.userType
        }
      };
    }
  
    @Get('feed/recommended')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.EXECUTOR, UserType.BOTH])
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Получить рекомендованные заказы',
      description: 'Возвращает заказы, подходящие для текущего исполнителя' 
    })
    @ApiQuery({ name: 'limit', required: false, description: 'Количество заказов (по умолчанию 10)' })
    @ApiResponse({ 
      status: 200, 
      description: 'Рекомендованные заказы получены',
      type: [Order]
    })
    async getRecommendedOrders(
      @CurrentUser() user: User,
      @Query('limit') limit: number = 10,
    ) {
      // TODO: Реализовать алгоритм рекомендаций на основе:
      // - Местоположения исполнителя
      // - Его специализации
      // - Истории заказов
      // - Рейтинга исполнителя
      
      const filterDto: OrdersFilterDto = {
        page: 1,
        limit,
        status: OrderStatus.OPEN,
      };
      
      return this.ordersService.findOrders(filterDto);
    }
  }