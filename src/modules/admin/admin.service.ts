import { 
    Injectable, 
    NotFoundException, 
    BadRequestException,
    ConflictException 
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, DataSource, Between, MoreThan, FindOptionsWhere } from 'typeorm';
  import { User, UserType } from '../users/entities/user.entity';
  import { Order, OrderStatus } from '../orders/entities/order.entity';
  import { OrderApplication } from '../orders/entities/order-application.entity';
  import { ExecutorProfile } from '../executors/entities/executor-profile.entity';
  import { ServiceCategory } from '../categories/entities/service-category.entity';
  import { UserComplaint, ComplaintStatus } from './entities/user-complaint.entity';
  import { AdminReport, ReportStatus } from './entities/admin-report.entity';
  import { SystemSettings } from './entities/system-settings.entity';
  import { 
    CreateComplaintDto,
    UpdateComplaintDto,
    CreateReportDto,
    CreateSettingDto,
    ComplaintsFilterDto,
    DashboardStatsDto
  } from './dto/admin-dashboard.dto';
  
  export interface DashboardStats {
    users: {
      total: number;
      newToday: number;
      newThisWeek: number;
      newThisMonth: number;
      verified: number;
      blocked: number;
    };
    orders: {
      total: number;
      active: number;
      completed: number;
      cancelled: number;
      newToday: number;
      revenue: number;
    };
    executors: {
      total: number;
      verified: number;
      active: number;
      newApplications: number;
    };
    complaints: {
      total: number;
      pending: number;
      inReview: number;
      resolved: number;
    };
    revenue: {
      total: number;
      thisMonth: number;
      commission: number;
      growth: number;
    };
  }
  
  @Injectable()
  export class AdminService {
    constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      @InjectRepository(Order)
      private readonly orderRepository: Repository<Order>,
      @InjectRepository(OrderApplication)
      private readonly applicationRepository: Repository<OrderApplication>,
      @InjectRepository(ExecutorProfile)
      private readonly executorRepository: Repository<ExecutorProfile>,
      @InjectRepository(ServiceCategory)
      private readonly categoryRepository: Repository<ServiceCategory>,
      @InjectRepository(UserComplaint)
      private readonly complaintRepository: Repository<UserComplaint>,
      @InjectRepository(AdminReport)
      private readonly reportRepository: Repository<AdminReport>,
      @InjectRepository(SystemSettings)
      private readonly settingsRepository: Repository<SystemSettings>,
      private readonly dataSource: DataSource,
    ) {}
  
    // === ДАШБОРД И СТАТИСТИКА ===
  
    async getDashboardStats(filterDto: DashboardStatsDto): Promise<DashboardStats> {
      const { days = 30 } = filterDto;
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  
      // Пользователи
      const totalUsers = await this.userRepository.count();
      const newUsersToday = await this.userRepository.count({
        where: { createdAt: MoreThan(today) }
      });
      const newUsersThisWeek = await this.userRepository.count({
        where: { createdAt: MoreThan(thisWeek) }
      });
      const newUsersThisMonth = await this.userRepository.count({
        where: { createdAt: MoreThan(thisMonth) }
      });
      const verifiedUsers = await this.userRepository.count({
        where: { isVerified: true }
      });
      const blockedUsers = await this.userRepository.count({
        where: { isBlocked: true }
      });
  
      // Заказы
      const totalOrders = await this.orderRepository.count();
      const activeOrders = await this.orderRepository.count({
        where: { status: OrderStatus.IN_PROGRESS }
      });
      const completedOrders = await this.orderRepository.count({
        where: { status: OrderStatus.COMPLETED }
      });
      const cancelledOrders = await this.orderRepository.count({
        where: { status: OrderStatus.CANCELLED }
      });
      const newOrdersToday = await this.orderRepository.count({
        where: { createdAt: MoreThan(today) }
      });
  
      // Доходы (примерная калькуляция)
      const completedOrdersWithRevenue = await this.orderRepository.find({
        where: { 
          status: OrderStatus.COMPLETED,
          agreedPrice: MoreThan(0)
        },
        select: ['agreedPrice']
      });
      const totalRevenue = completedOrdersWithRevenue.reduce(
        (sum, order) => sum + (order.agreedPrice || 0), 0
      );
  
      const thisMonthOrders = await this.orderRepository.find({
        where: { 
          status: OrderStatus.COMPLETED,
          createdAt: MoreThan(thisMonth),
          agreedPrice: MoreThan(0)
        },
        select: ['agreedPrice']
      });
      const thisMonthRevenue = thisMonthOrders.reduce(
        (sum, order) => sum + (order.agreedPrice || 0), 0
      );
  
      const lastMonthOrders = await this.orderRepository.find({
        where: { 
          status: OrderStatus.COMPLETED,
          createdAt: Between(previousMonth, thisMonth),
          agreedPrice: MoreThan(0)
        },
        select: ['agreedPrice']
      });
      const lastMonthRevenue = lastMonthOrders.reduce(
        (sum, order) => sum + (order.agreedPrice || 0), 0
      );
  
      // Исполнители
      const totalExecutors = await this.executorRepository.count();
      const verifiedExecutors = await this.executorRepository.count({
        where: { isIdentityVerified: true }
      });
      const activeExecutors = await this.executorRepository.count({
        where: { isAvailable: true }
      });
      const newExecutorApplications = await this.executorRepository.count({
        where: { 
          isIdentityVerified: false,
          createdAt: MoreThan(thisWeek)
        }
      });
  
      // Жалобы
      const totalComplaints = await this.complaintRepository.count();
      const pendingComplaints = await this.complaintRepository.count({
        where: { status: ComplaintStatus.PENDING }
      });
      const inReviewComplaints = await this.complaintRepository.count({
        where: { status: ComplaintStatus.IN_REVIEW }
      });
      const resolvedComplaints = await this.complaintRepository.count({
        where: { status: ComplaintStatus.RESOLVED }
      });
  
      // Рост доходов
      const revenueGrowth = lastMonthRevenue > 0 
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;
  
      // Комиссия (примерно 10% от оборота)
      const commissionRate = 0.10;
      const totalCommission = totalRevenue * commissionRate;
  
      return {
        users: {
          total: totalUsers,
          newToday: newUsersToday,
          newThisWeek: newUsersThisWeek,
          newThisMonth: newUsersThisMonth,
          verified: verifiedUsers,
          blocked: blockedUsers,
        },
        orders: {
          total: totalOrders,
          active: activeOrders,
          completed: completedOrders,
          cancelled: cancelledOrders,
          newToday: newOrdersToday,
          revenue: totalRevenue,
        },
        executors: {
          total: totalExecutors,
          verified: verifiedExecutors,
          active: activeExecutors,
          newApplications: newExecutorApplications,
        },
        complaints: {
          total: totalComplaints,
          pending: pendingComplaints,
          inReview: inReviewComplaints,
          resolved: resolvedComplaints,
        },
        revenue: {
          total: totalRevenue,
          thisMonth: thisMonthRevenue,
          commission: totalCommission,
          growth: revenueGrowth,
        },
      };
    }
  
    async getChartData(type: 'orders' | 'users' | 'revenue', period: 'week' | 'month' | 'year') {
      const now = new Date();
      let dateFrom: Date;
      let groupBy: string;
  
      switch (period) {
        case 'week':
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          groupBy = 'day';
          break;
        case 'month':
          dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
          groupBy = 'day';
          break;
        case 'year':
          dateFrom = new Date(now.getFullYear(), 0, 1);
          groupBy = 'month';
          break;
        default:
          throw new BadRequestException('Invalid period');
      }
  
      // Здесь должна быть реализация группировки данных по датам
      // Это упрощенный пример
      const data: { date: string; value: number }[] = [];
      const daysDiff = Math.ceil((now.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i < daysDiff; i++) {
        const date = new Date(dateFrom.getTime() + i * 24 * 60 * 60 * 1000);
        const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
        
        let value = 0;
        
        if (type === 'orders') {
          value = await this.orderRepository.count({
            where: { createdAt: Between(date, nextDate) }
          });
        } else if (type === 'users') {
          value = await this.userRepository.count({
            where: { createdAt: Between(date, nextDate) }
          });
        } else if (type === 'revenue') {
          const orders = await this.orderRepository.find({
            where: { 
              status: OrderStatus.COMPLETED,
              createdAt: Between(date, nextDate) 
            },
            select: ['agreedPrice']
          });
          value = orders.reduce((sum, order) => sum + (order.agreedPrice || 0), 0);
        }
  
        data.push({
          date: date.toISOString().split('T')[0],
          value,
        });
      }
  
      return data;
    }
  
    // === УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ===
  
    async getUsers(filterDto: any) {
      // Расширенная информация о пользователях для админки
      const queryBuilder = this.userRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.executorProfile', 'executor')
        .select([
          'user.id',
          'user.phone',
          'user.email',
          'user.firstName',
          'user.lastName',
          'user.userType',
          'user.isVerified',
          'user.isBlocked',
          'user.createdAt',
          'user.updatedAt',
          'executor.id',
          'executor.isIdentityVerified',
          'executor.rating',
          'executor.completedOrders'
        ]);
  
      if (filterDto.search) {
        queryBuilder.andWhere(
          '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.phone ILIKE :search)',
          { search: `%${filterDto.search}%` }
        );
      }
  
      if (filterDto.userType) {
        queryBuilder.andWhere('user.userType = :userType', { userType: filterDto.userType });
      }
  
      if (filterDto.isVerified !== undefined) {
        queryBuilder.andWhere('user.isVerified = :isVerified', { isVerified: filterDto.isVerified });
      }
  
      if (filterDto.isBlocked !== undefined) {
        queryBuilder.andWhere('user.isBlocked = :isBlocked', { isBlocked: filterDto.isBlocked });
      }
  
      const page = filterDto.page || 1;
      const limit = filterDto.limit || 20;
      const skip = (page - 1) * limit;
  
      queryBuilder
        .orderBy('user.createdAt', 'DESC')
        .skip(skip)
        .take(limit);
  
      const [users, total] = await queryBuilder.getManyAndCount();
  
      return {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
  
    async verifyUser(id: number): Promise<User> {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }
  
      user.isVerified = true;
      return this.userRepository.save(user);
    }
  
    async blockUser(id: number, reason?: string): Promise<{ message: string }> {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }
  
      user.isBlocked = true;
      await this.userRepository.save(user);
  
      // Здесь можно добавить логирование причины блокировки
      return { message: `Пользователь заблокирован${reason ? `. Причина: ${reason}` : ''}` };
    }
  
    async unblockUser(id: number): Promise<User> {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }
  
      user.isBlocked = false;
      return this.userRepository.save(user);
    }
  
    // === УПРАВЛЕНИЕ ЖАЛОБАМИ ===
  
    async getComplaints(filterDto: ComplaintsFilterDto) {
      const { page = 1, limit = 20 } = filterDto;
      const skip = (page - 1) * limit;
  
      const queryBuilder = this.complaintRepository.createQueryBuilder('complaint')
        .leftJoinAndSelect('complaint.reporter', 'reporter')
        .leftJoinAndSelect('complaint.reportedUser', 'reportedUser')
        .leftJoinAndSelect('complaint.order', 'order')
        .leftJoinAndSelect('complaint.assignedAdmin', 'admin');
  
      if (filterDto.status) {
        queryBuilder.andWhere('complaint.status = :status', { status: filterDto.status });
      }
  
      if (filterDto.type) {
        queryBuilder.andWhere('complaint.type = :type', { type: filterDto.type });
      }
  
      if (filterDto.priority) {
        queryBuilder.andWhere('complaint.priority = :priority', { priority: filterDto.priority });
      }
  
      if (filterDto.assignedAdminId) {
        queryBuilder.andWhere('complaint.assignedAdminId = :adminId', { 
          adminId: filterDto.assignedAdminId 
        });
      }
  
      if (filterDto.dateFrom) {
        queryBuilder.andWhere('complaint.createdAt >= :dateFrom', { 
          dateFrom: new Date(filterDto.dateFrom) 
        });
      }
  
      if (filterDto.dateTo) {
        queryBuilder.andWhere('complaint.createdAt <= :dateTo', { 
          dateTo: new Date(filterDto.dateTo) 
        });
      }
  
      queryBuilder
        .orderBy('complaint.priority', 'DESC')
        .addOrderBy('complaint.createdAt', 'DESC')
        .skip(skip)
        .take(limit);
  
      const [complaints, total] = await queryBuilder.getManyAndCount();
  
      return {
        complaints,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
  
    async getComplaint(id: number): Promise<UserComplaint> {
      const complaint = await this.complaintRepository.findOne({
        where: { id },
        relations: ['reporter', 'reportedUser', 'order', 'assignedAdmin'],
      });
  
      if (!complaint) {
        throw new NotFoundException('Жалоба не найдена');
      }
  
      return complaint;
    }
  
    async updateComplaint(
      id: number, 
      updateDto: UpdateComplaintDto, 
      adminId: number
    ): Promise<UserComplaint> {
      const complaint = await this.getComplaint(id);
  
      // Автоматически назначаем админа, если он еще не назначен
      if (!complaint.assignedAdminId) {
        complaint.assignedAdminId = adminId;
        complaint.assignedAt = new Date();
      }
  
      if (updateDto.status && updateDto.status === ComplaintStatus.RESOLVED) {
        complaint.resolvedAt = new Date();
      }
  
      Object.assign(complaint, updateDto);
      
      return this.complaintRepository.save(complaint);
    }
  
    async assignComplaint(id: number, adminId: number): Promise<UserComplaint> {
      const complaint = await this.getComplaint(id);
  
      complaint.assignedAdminId = adminId;
      complaint.assignedAt = new Date();
      complaint.status = ComplaintStatus.IN_REVIEW;
  
      return this.complaintRepository.save(complaint);
    }
  
    // === УПРАВЛЕНИЕ ОТЧЕТАМИ ===
  
    async getReports(filterDto: any) {
      const page = filterDto.page || 1;
      const limit = filterDto.limit || 20;
      const skip = (page - 1) * limit;
  
      const queryBuilder = this.reportRepository.createQueryBuilder('report')
        .leftJoinAndSelect('report.creator', 'creator');
  
      if (filterDto.type) {
        queryBuilder.andWhere('report.type = :type', { type: filterDto.type });
      }
  
      if (filterDto.status) {
        queryBuilder.andWhere('report.status = :status', { status: filterDto.status });
      }
  
      queryBuilder
        .orderBy('report.createdAt', 'DESC')
        .skip(skip)
        .take(limit);
  
      const [reports, total] = await queryBuilder.getManyAndCount();
  
      return {
        reports,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
  
    async createReport(createDto: CreateReportDto, createdBy: number): Promise<AdminReport> {
      const report = this.reportRepository.create({
        ...createDto,
        createdBy,
        dateFrom: createDto.dateFrom ? new Date(createDto.dateFrom) : undefined,
        dateTo: createDto.dateTo ? new Date(createDto.dateTo) : undefined,
      });
  
      const savedReport = await this.reportRepository.save(report);
  
      // Запускаем генерацию отчета в фоне
      this.generateReportAsync(savedReport.id);
  
      return savedReport;
    }
  
    async getReport(id: number): Promise<AdminReport> {
      const report = await this.reportRepository.findOne({
        where: { id },
        relations: ['creator'],
      });
  
      if (!report) {
        throw new NotFoundException('Отчет не найден');
      }
  
      return report;
    }
  
    async downloadReport(id: number): Promise<any> {
      const report = await this.getReport(id);
  
      if (!report.isDownloadable) {
        throw new BadRequestException('Отчет недоступен для скачивания');
      }
  
      // Увеличиваем счетчик скачиваний
      report.downloadCount += 1;
      report.lastDownloadedAt = new Date();
      await this.reportRepository.save(report);
  
      // Возвращаем путь к файлу для скачивания
      return {
        filePath: report.filePath,
        fileName: `${report.name}.${report.format}`,
        fileSize: report.fileSize,
      };
    }
  
    async deleteReport(id: number): Promise<{ message: string }> {
      const report = await this.getReport(id);
      
      // Удаляем файл с диска (если есть)
      if (report.filePath) {
        // Здесь должна быть логика удаления файла
      }
  
      await this.reportRepository.remove(report);
      
      return { message: 'Отчет удален' };
    }
  
    // === СИСТЕМНЫЕ НАСТРОЙКИ ===
  
    async getSettings(category?: string): Promise<SystemSettings[]> {
      const where: FindOptionsWhere<SystemSettings> = {};
      if (category) {
        where.category = category as any; // Используем as any для обхода строгой проверки типов
      }
      
      return this.settingsRepository.find({
        where,
        order: { category: 'ASC', sortOrder: 'ASC', name: 'ASC' },
      });
    }
  
    async getSetting(key: string): Promise<SystemSettings> {
      const setting = await this.settingsRepository.findOne({ where: { key } });
      
      if (!setting) {
        throw new NotFoundException(`Настройка с ключом ${key} не найдена`);
      }
  
      return setting;
    }
  
    async updateSetting(key: string, value: string): Promise<SystemSettings> {
      const setting = await this.getSetting(key);
  
      if (!setting.isEditable) {
        throw new BadRequestException('Эта настройка недоступна для редактирования');
      }
  
      if (!setting.validate(value)) {
        throw new BadRequestException('Значение не соответствует правилам валидации');
      }
  
      setting.value = value;
      
      return this.settingsRepository.save(setting);
    }
  
    async createSetting(createDto: CreateSettingDto): Promise<SystemSettings> {
      const existingSetting = await this.settingsRepository.findOne({ 
        where: { key: createDto.key } 
      });
  
      if (existingSetting) {
        throw new ConflictException(`Настройка с ключом ${createDto.key} уже существует`);
      }
  
      const setting = this.settingsRepository.create(createDto);
      
      return this.settingsRepository.save(setting);
    }
  
    // === ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ ===
  
    private async generateReportAsync(reportId: number): Promise<void> {
      // Эмуляция асинхронной генерации отчета
      setTimeout(async () => {
        try {
          const report = await this.reportRepository.findOne({ where: { id: reportId } });
          if (!report) return;
  
          report.status = ReportStatus.GENERATING;
          report.startedAt = new Date();
          await this.reportRepository.save(report);
  
          // Здесь должна быть логика генерации отчета
          // ...
  
          report.status = ReportStatus.COMPLETED;
          report.completedAt = new Date();
          report.progressPercent = 100;
          report.filePath = `/reports/report-${reportId}.${report.format}`;
          report.fileSize = 1024 * 100; // Примерный размер
          
          await this.reportRepository.save(report);
        } catch (error) {
          const report = await this.reportRepository.findOne({ where: { id: reportId } });
          if (report) {
            report.status = ReportStatus.FAILED;
            report.errorMessage = error.message;
            await this.reportRepository.save(report);
          }
        }
      }, 5000); // 5 секунд для демонстрации
    }
  
    async getOrders(filterDto: any) {
      // Реализация получения заказов для админки
      return { message: 'Заказы (в разработке)' };
    }
  
    async resolveOrderDispute(id: number, resolution: any, adminId: number) {
      // Реализация разрешения споров
      return { message: 'Спор разрешен (в разработке)' };
    }
  
    async getPendingExecutors() {
      return this.executorRepository.find({
        where: { isIdentityVerified: false },
        relations: ['user'],
        order: { createdAt: 'ASC' },
      });
    }
  
    async verifyExecutor(id: number, verification: any) {
      const executor = await this.executorRepository.findOne({ where: { id } });
      if (!executor) {
        throw new NotFoundException('Исполнитель не найден');
      }
  
      executor.isIdentityVerified = verification.approved;
      
      return this.executorRepository.save(executor);
    }
  
    async createSystemBackup(adminId: number) {
      // Реализация создания резервной копии
      return { message: 'Резервная копия создана (в разработке)' };
    }
  
    async getSystemHealth() {
      // Проверка состояния системы
      return {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      };
    }
  
    async getSystemLogs(level?: string, limit: number = 100) {
      // Получение системных логов
      return {
        logs: [],
        message: 'Логи (в разработке)',
      };
    }
  }