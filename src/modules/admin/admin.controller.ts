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
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    BadRequestException,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
    ApiParam,
  } from '@nestjs/swagger';
  import { AdminService } from './admin.service';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard, Roles } from '../auth/guards/roles.guard';
  import { CurrentUser } from '../../common/decorators/current-user.decorator';
  import { User, UserType } from '../users/entities/user.entity';
  import { 
    CreateComplaintDto,
    UpdateComplaintDto,
    CreateReportDto,
    UpdateSettingDto,
    CreateSettingDto,
    ComplaintsFilterDto,
    DashboardStatsDto
  } from './dto/admin-dashboard.dto';
  import { UserComplaint } from './entities/user-complaint.entity';
  import { AdminReport } from './entities/admin-report.entity';
  import { SystemSettings } from './entities/system-settings.entity';
  
  @ApiTags('Администрирование')
  @Controller('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([UserType.BOTH]) // Пока используем BOTH как админскую роль
  @ApiBearerAuth()
  export class AdminController {
    constructor(private readonly adminService: AdminService) {}
  
    // === ДАШБОРД И СТАТИСТИКА ===
  
    @Get('dashboard')
    @ApiOperation({ 
      summary: 'Получить статистику дашборда',
      description: 'Возвращает основную статистику для админ панели' 
    })
    @ApiResponse({ 
      status: 200, 
      description: 'Статистика получена',
      schema: {
        example: {
          users: {
            total: 1247,
            newToday: 15,
            newThisWeek: 89,
            newThisMonth: 324,
            verified: 1180,
            blocked: 12
          },
          orders: {
            total: 3856,
            active: 124,
            completed: 3421,
            cancelled: 311,
            newToday: 28,
            revenue: 45280000
          },
          executors: {
            total: 342,
            verified: 298,
            active: 267,
            newApplications: 18
          },
          complaints: {
            total: 89,
            pending: 12,
            inReview: 8,
            resolved: 69
          },
          revenue: {
            total: 45280000,
            thisMonth: 3850000,
            commission: 4528000,
            growth: 18.5
          }
        }
      }
    })
    async getDashboardStats(@Query() filterDto: DashboardStatsDto) {
      return this.adminService.getDashboardStats(filterDto);
    }
  
    @Get('analytics/chart-data')
    @ApiOperation({ 
      summary: 'Получить данные для графиков',
      description: 'Возвращает данные для построения графиков в админ панели' 
    })
    @ApiQuery({ name: 'type', enum: ['orders', 'users', 'revenue'], description: 'Тип графика' })
    @ApiQuery({ name: 'period', enum: ['week', 'month', 'year'], description: 'Период' })
    async getChartData(
      @Query('type') type: 'orders' | 'users' | 'revenue',
      @Query('period') period: 'week' | 'month' | 'year'
    ) {
      return this.adminService.getChartData(type, period);
    }
  
    // === УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ===
  
    @Get('users')
    @ApiOperation({ 
      summary: 'Получить список пользователей для администрирования',
      description: 'Расширенный список пользователей с административной информацией' 
    })
    async getUsers(@Query() filterDto: any) {
      return this.adminService.getUsers(filterDto);
    }
  
    @Patch('users/:id/verify')
    @ApiOperation({ 
      summary: 'Верифицировать пользователя',
      description: 'Подтверждает личность пользователя' 
    })
    @ApiParam({ name: 'id', description: 'ID пользователя' })
    async verifyUser(@Param('id', ParseIntPipe) id: number) {
      return this.adminService.verifyUser(id);
    }
  
    @Patch('users/:id/block')
    @ApiOperation({ 
      summary: 'Заблокировать пользователя',
      description: 'Блокирует пользователя с указанием причины' 
    })
    @ApiParam({ name: 'id', description: 'ID пользователя' })
    async blockUser(
      @Param('id', ParseIntPipe) id: number,
      @Body('reason') reason?: string
    ) {
      return this.adminService.blockUser(id, reason);
    }
  
    @Patch('users/:id/unblock')
    @ApiOperation({ 
      summary: 'Разблокировать пользователя',
      description: 'Снимает блокировку с пользователя' 
    })
    async unblockUser(@Param('id', ParseIntPipe) id: number) {
      return this.adminService.unblockUser(id);
    }
  
    // === УПРАВЛЕНИЕ ЖАЛОБАМИ ===
  
    @Get('complaints')
    @ApiOperation({ 
      summary: 'Получить список жалоб',
      description: 'Возвращает список жалоб с фильтрацией' 
    })
    @ApiResponse({ status: 200, description: 'Список жалоб', type: [UserComplaint] })
    async getComplaints(@Query() filterDto: ComplaintsFilterDto) {
      return this.adminService.getComplaints(filterDto);
    }
  
    @Get('complaints/:id')
    @ApiOperation({ 
      summary: 'Получить детали жалобы',
      description: 'Возвращает подробную информацию о жалобе' 
    })
    @ApiParam({ name: 'id', description: 'ID жалобы' })
    async getComplaint(@Param('id', ParseIntPipe) id: number) {
      return this.adminService.getComplaint(id);
    }
  
    @Patch('complaints/:id')
    @ApiOperation({ 
      summary: 'Обновить жалобу',
      description: 'Обновляет статус и информацию о жалобе' 
    })
    @ApiParam({ name: 'id', description: 'ID жалобы' })
    async updateComplaint(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateDto: UpdateComplaintDto,
      @CurrentUser() admin: User
    ) {
      return this.adminService.updateComplaint(id, updateDto, admin.id);
    }
  
    @Patch('complaints/:id/assign')
    @ApiOperation({ 
      summary: 'Назначить администратора на жалобу',
      description: 'Назначает ответственного администратора для рассмотрения жалобы' 
    })
    @ApiParam({ name: 'id', description: 'ID жалобы' })
    async assignComplaint(
      @Param('id', ParseIntPipe) id: number,
      @CurrentUser() admin: User,
      @Body('adminId') adminId?: number
    ) {
      return this.adminService.assignComplaint(id, adminId || admin.id);
    }
  
    // === УПРАВЛЕНИЕ ОТЧЕТАМИ ===
  
    @Get('reports')
    @ApiOperation({ 
      summary: 'Получить список отчетов',
      description: 'Возвращает список созданных отчетов' 
    })
    @ApiResponse({ status: 200, description: 'Список отчетов', type: [AdminReport] })
    async getReports(@Query() filterDto: any) {
      return this.adminService.getReports(filterDto);
    }
  
    @Post('reports')
    @ApiOperation({ 
      summary: 'Создать новый отчет',
      description: 'Создает новый отчет для генерации' 
    })
    @ApiResponse({ status: 201, description: 'Отчет создан', type: AdminReport })
    async createReport(
      @Body() createDto: CreateReportDto,
      @CurrentUser() admin: User
    ) {
      return this.adminService.createReport(createDto, admin.id);
    }
  
    @Get('reports/:id')
    @ApiOperation({ 
      summary: 'Получить отчет по ID',
      description: 'Возвращает информацию об отчете' 
    })
    @ApiParam({ name: 'id', description: 'ID отчета' })
    async getReport(@Param('id', ParseIntPipe) id: number) {
      return this.adminService.getReport(id);
    }
  
    @Get('reports/:id/download')
    @ApiOperation({ 
      summary: 'Скачать отчет',
      description: 'Скачивает готовый файл отчета' 
    })
    @ApiParam({ name: 'id', description: 'ID отчета' })
    async downloadReport(@Param('id', ParseIntPipe) id: number) {
      return this.adminService.downloadReport(id);
    }
  
    @Delete('reports/:id')
    @ApiOperation({ 
      summary: 'Удалить отчет',
      description: 'Удаляет отчет и связанные файлы' 
    })
    @HttpCode(HttpStatus.OK)
    async deleteReport(@Param('id', ParseIntPipe) id: number) {
      return this.adminService.deleteReport(id);
    }
  
    // === СИСТЕМНЫЕ НАСТРОЙКИ ===
  
    @Get('settings')
    @ApiOperation({ 
      summary: 'Получить системные настройки',
      description: 'Возвращает список всех системных настроек' 
    })
    @ApiQuery({ name: 'category', required: false, description: 'Фильтр по категории' })
    async getSettings(@Query('category') category?: string) {
      return this.adminService.getSettings(category);
    }
  
    @Get('settings/:key')
    @ApiOperation({ 
      summary: 'Получить настройку по ключу',
      description: 'Возвращает конкретную настройку' 
    })
    @ApiParam({ name: 'key', description: 'Ключ настройки' })
    async getSetting(@Param('key') key: string) {
      return this.adminService.getSetting(key);
    }
  
    @Patch('settings/:key')
    @ApiOperation({ 
      summary: 'Обновить настройку',
      description: 'Обновляет значение системной настройки' 
    })
    @ApiParam({ name: 'key', description: 'Ключ настройки' })
    async updateSetting(
      @Param('key') key: string,
      @Body() updateDto: UpdateSettingDto
    ) {
      return this.adminService.updateSetting(key, updateDto.value);
    }
  
    @Post('settings')
    @ApiOperation({ 
      summary: 'Создать новую настройку',
      description: 'Создает новую системную настройку' 
    })
    async createSetting(@Body() createDto: CreateSettingDto) {
      return this.adminService.createSetting(createDto);
    }
  
    // === УПРАВЛЕНИЕ ЗАКАЗАМИ ===
  
    @Get('orders')
    @ApiOperation({ 
      summary: 'Получить заказы для администрирования',
      description: 'Расширенный список заказов с административной информацией' 
    })
    async getOrders(@Query() filterDto: any) {
      return this.adminService.getOrders(filterDto);
    }
  
    @Patch('orders/:id/resolve-dispute')
    @ApiOperation({ 
      summary: 'Разрешить спор по заказу',
      description: 'Администратор принимает решение по спорному заказу' 
    })
    @ApiParam({ name: 'id', description: 'ID заказа' })
    async resolveDispute(
      @Param('id', ParseIntPipe) id: number,
      @Body() resolution: { decision: string; comment: string; refundAmount?: number },
      @CurrentUser() admin: User
    ) {
      return this.adminService.resolveOrderDispute(id, resolution, admin.id);
    }
  
    // === УПРАВЛЕНИЕ ИСПОЛНИТЕЛЯМИ ===
  
    @Get('executors/pending-verification')
    @ApiOperation({ 
      summary: 'Получить исполнителей, ожидающих верификации',
      description: 'Список исполнителей для проверки документов' 
    })
    async getPendingExecutors() {
      return this.adminService.getPendingExecutors();
    }
  
    @Patch('executors/:id/verify')
    @ApiOperation({ 
      summary: 'Верифицировать исполнителя',
      description: 'Подтверждает личность и документы исполнителя' 
    })
    @ApiParam({ name: 'id', description: 'ID профиля исполнителя' })
    async verifyExecutor(
      @Param('id', ParseIntPipe) id: number,
      @Body() verification: { approved: boolean; comment?: string }
    ) {
      return this.adminService.verifyExecutor(id, verification);
    }
  
    // === СИСТЕМНЫЕ ОПЕРАЦИИ ===
  
    @Post('system/backup')
    @ApiOperation({ 
      summary: 'Создать резервную копию',
      description: 'Создает резервную копию базы данных' 
    })
    async createBackup(@CurrentUser() admin: User) {
      return this.adminService.createSystemBackup(admin.id);
    }
  
    @Get('system/health')
    @ApiOperation({ 
      summary: 'Проверить состояние системы',
      description: 'Возвращает информацию о состоянии системы' 
    })
    async getSystemHealth() {
      return this.adminService.getSystemHealth();
    }
  
    @Get('logs')
    @ApiOperation({ 
      summary: 'Получить системные логи',
      description: 'Возвращает системные логи с фильтрацией' 
    })
    @ApiQuery({ name: 'level', required: false, enum: ['error', 'warn', 'info', 'debug'] })
    @ApiQuery({ name: 'limit', required: false, description: 'Количество записей' })
    async getLogs(
      @Query('level') level?: string,
      @Query('limit') limit?: number
    ) {
      return this.adminService.getSystemLogs(level, limit);
    }
  }