import { 
    Injectable, 
    NotFoundException, 
    BadRequestException,
    ForbiddenException,
    ConflictException
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, DataSource } from 'typeorm';
  import { Order, OrderStatus } from './entities/order.entity';
  import { OrderApplication, ApplicationStatus } from './entities/order-application.entity';
  import { User, UserType } from '../users/entities/user.entity';
  import { ExecutorProfile } from '../executors/entities/executor-profile.entity';
  import { ServiceCategory } from '../categories/entities/service-category.entity';
  import { CreateOrderDto } from './dto/create-order.dto';
  import { CreateApplicationDto } from './dto/create-application.dto';
  import { OrdersFilterDto } from './dto/orders-filter.dto';
  import { UpdateOrderStatusDto, CompleteOrderDto } from './dto/update-order-status.dto';
  
  export interface PaginatedOrders {
    orders: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  export interface PaginatedApplications {
    applications: OrderApplication[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  @Injectable()
  export class OrdersService {
    constructor(
      @InjectRepository(Order)
      private readonly orderRepository: Repository<Order>,
      @InjectRepository(OrderApplication)
      private readonly applicationRepository: Repository<OrderApplication>,
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      @InjectRepository(ExecutorProfile)
      private readonly executorRepository: Repository<ExecutorProfile>,
      @InjectRepository(ServiceCategory)
      private readonly categoryRepository: Repository<ServiceCategory>,
      private readonly dataSource: DataSource,
    ) {}
  
    /**
     * Создать новый заказ
     */
    async createOrder(customerId: number, createDto: CreateOrderDto): Promise<Order> {
        console.log('OrdersService.createOrder called:', { customerId, createDto });
      
        // Проверяем что заказчик существует
        const customer = await this.userRepository.findOne({ where: { id: customerId } });
        if (!customer) {
          console.error('Customer not found:', customerId);
          throw new NotFoundException('Заказчик не найден');
        }
      
        console.log('Customer found:', {
          id: customer.id,
          userType: customer.userType,
          name: `${customer.firstName} ${customer.lastName}`
        });
      
        // Проверяем что категория существует
        const category = await this.categoryRepository.findOne({ 
          where: { id: createDto.categoryId, isActive: true } 
        });
        if (!category) {
          console.error('Category not found or inactive:', createDto.categoryId);
          throw new NotFoundException('Категория не найдена или неактивна');
        }
      
        console.log('Category found:', {
          id: category.id,
          nameRu: category.nameRu,
          isActive: category.isActive
        });
      
        // Валидируем бюджет
        if (createDto.budgetFrom && createDto.budgetTo && createDto.budgetFrom > createDto.budgetTo) {
          throw new BadRequestException('Минимальный бюджет не может быть больше максимального');
        }
      
        // Валидируем даты
        const now = new Date();
        if (createDto.preferredStartDate && new Date(createDto.preferredStartDate) < now) {
          throw new BadRequestException('Дата начала работ не может быть в прошлом');
        }
      
        if (createDto.deadline && new Date(createDto.deadline) < now) {
          throw new BadRequestException('Крайний срок не может быть в прошлом');
        }
      
        // Создаем заказ
        const orderData = {
          customerId,
          ...createDto,
          preferredStartDate: createDto.preferredStartDate ? new Date(createDto.preferredStartDate) : undefined,
          deadline: createDto.deadline ? new Date(createDto.deadline) : undefined,
          status: createDto.publish ? OrderStatus.OPEN : OrderStatus.DRAFT,
          isPublished: createDto.publish || false,
        };
      
        console.log('Creating order with data:', orderData);
      
        const order = this.orderRepository.create(orderData);
        const savedOrder = await this.orderRepository.save(order);
      
        console.log('Order saved to database:', { id: savedOrder.id, status: savedOrder.status });
      
        // Если заказ опубликован, увеличиваем счетчик услуг в категории
        if (createDto.publish) {
          await this.categoryRepository.increment({ id: createDto.categoryId }, 'servicesCount', 1);
          console.log('Updated category services count');
        }
      
        // Загружаем полную информацию о заказе
        const foundOrder = await this.orderRepository.findOne({
          where: { id: savedOrder.id },
          relations: ['customer', 'category'],
        });
      
        if (!foundOrder) {
          console.error('Failed to load created order:', savedOrder.id);
          throw new NotFoundException('Ошибка при создании заказа');
        }
      
        console.log('Order created successfully:', {
          id: foundOrder.id,
          title: foundOrder.title,
          status: foundOrder.status,
          categoryName: foundOrder.category?.nameRu
        });
      
        return foundOrder;
      }
    
      /**
       * Подать заявку на заказ - ИСПРАВЛЕННАЯ ВЕРСИЯ
       */
      async createApplication(
        executorUserId: number, 
        orderId: number, 
        createDto: CreateApplicationDto
      ): Promise<OrderApplication> {
        // Проверяем что заказ существует и доступен для заявок
        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order) {
          throw new NotFoundException('Заказ не найден');
        }
    
        if (!order.canReceiveApplications) {
          throw new BadRequestException('Заказ не принимает заявки');
        }
    
        // Проверяем что исполнитель существует
        const executor = await this.executorRepository.findOne({ 
          where: { userId: executorUserId } 
        });
        if (!executor) {
          throw new NotFoundException('Профиль исполнителя не найден');
        }
    
        // Проверяем что исполнитель не владелец заказа
        if (order.customerId === executorUserId) {
          throw new BadRequestException('Нельзя подавать заявку на собственный заказ');
        }
    
        // Проверяем что заявка еще не подана
        const existingApplication = await this.applicationRepository.findOne({
          where: { orderId, executorId: executor.id }
        });
        if (existingApplication) {
          throw new ConflictException('Заявка уже подана на этот заказ');
        }
    
        // Создаем заявку
        const application = this.applicationRepository.create({
          orderId,
          executorId: executor.id,
          ...createDto,
          availableFrom: createDto.availableFrom ? new Date(createDto.availableFrom) : undefined,
        });
    
        const savedApplication = await this.applicationRepository.save(application);
    
        // Увеличиваем счетчик заявок
        await this.orderRepository.increment({ id: orderId }, 'applicationsCount', 1);
    
        // ИСПРАВЛЕНИЕ: Добавляем проверку на null
        const foundApplication = await this.applicationRepository.findOne({
          where: { id: savedApplication.id },
          relations: ['executor', 'executor.user', 'order'],
        });
    
        if (!foundApplication) {
          throw new NotFoundException('Ошибка при создании заявки');
        }
    
        return foundApplication;
      }
  
    /**
     * Найти заказы с фильтрацией
     */
    async findOrders(filterDto: OrdersFilterDto): Promise<PaginatedOrders> {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        categoryId,
        status,
        urgency,
        priceType,
        minBudget,
        maxBudget,
        lat,
        lng,
        radius = 10,
        customerId
      } = filterDto;
  
      const skip = (page - 1) * limit;
      const queryBuilder = this.orderRepository.createQueryBuilder('order')
        .leftJoinAndSelect('order.customer', 'customer')
        .leftJoinAndSelect('order.category', 'category')
        .leftJoinAndSelect('order.executor', 'executor')
        .leftJoinAndSelect('executor.user', 'executorUser');
  
      // Базовые фильтры
      if (customerId) {
        queryBuilder.andWhere('order.customerId = :customerId', { customerId });
      } else {
        // Для публичного поиска показываем только опубликованные заказы
        queryBuilder.andWhere('order.isPublished = :published', { published: true });
      }
  
      // Поиск по тексту
      if (search) {
        queryBuilder.andWhere(
          '(order.title ILIKE :search OR order.description ILIKE :search)',
          { search: `%${search}%` }
        );
      }
  
      // Фильтр по категории
      if (categoryId) {
        queryBuilder.andWhere('order.categoryId = :categoryId', { categoryId });
      }
  
      // Фильтр по статусу
      if (status) {
        queryBuilder.andWhere('order.status = :status', { status });
      }
  
      // Фильтр по срочности
      if (urgency) {
        queryBuilder.andWhere('order.urgency = :urgency', { urgency });
      }
  
      // Фильтр по типу ценообразования
      if (priceType) {
        queryBuilder.andWhere('order.priceType = :priceType', { priceType });
      }
  
      // Фильтр по бюджету
      if (minBudget) {
        queryBuilder.andWhere('(order.budgetFrom >= :minBudget OR order.budgetTo >= :minBudget)', { minBudget });
      }
  
      if (maxBudget) {
        queryBuilder.andWhere('(order.budgetFrom <= :maxBudget OR order.budgetTo <= :maxBudget)', { maxBudget });
      }
  
      // Геолокационный поиск
      if (lat && lng) {
        queryBuilder.andWhere(
          `(
            6371 * acos(
              cos(radians(:lat)) * cos(radians(order.locationLat)) *
              cos(radians(order.locationLng) - radians(:lng)) +
              sin(radians(:lat)) * sin(radians(order.locationLat))
            )
          ) <= :radius`,
          { lat, lng, radius }
        );
      }
  
      // Сортировка: сначала срочные, потом по дате создания
      queryBuilder
        .orderBy('order.urgency', 'DESC')
        .addOrderBy('order.createdAt', 'DESC')
        .skip(skip)
        .take(limit);
  
      const [orders, total] = await queryBuilder.getManyAndCount();
  
      return {
        orders,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
  
    /**
     * Получить заказ по ID
     */
    async findOne(id: number, userId?: number): Promise<Order> {
      const order = await this.orderRepository.findOne({
        where: { id },
        relations: ['customer', 'category', 'executor', 'executor.user', 'applications', 'applications.executor'],
      });
  
      if (!order) {
        throw new NotFoundException('Заказ не найден');
      }
  
      // Увеличиваем счетчик просмотров, если это не владелец заказа
      if (userId && userId !== order.customerId) {
        await this.orderRepository.increment({ id }, 'viewsCount', 1);
      }
  
      return order;
    }
  
    /**
     * Принять заявку исполнителя - ИСПРАВЛЕННАЯ ВЕРСИЯ
     */
    async acceptApplication(customerId: number, applicationId: number): Promise<Order> {
      const application = await this.applicationRepository.findOne({
        where: { id: applicationId },
        relations: ['order', 'executor'],
      });
  
      if (!application) {
        throw new NotFoundException('Заявка не найдена');
      }
  
      // Проверяем права доступа
      if (application.order.customerId !== customerId) {
        throw new ForbiddenException('Нет прав для принятия этой заявки');
      }
  
      // Проверяем статус заказа
      if (application.order.status !== OrderStatus.OPEN) {
        throw new BadRequestException('Заказ не принимает заявки');
      }
  
      // Проверяем статус заявки
      if (application.status !== ApplicationStatus.PENDING) {
        throw new BadRequestException('Заявка уже обработана');
      }
  
      await this.dataSource.transaction(async manager => {
        // Принимаем заявку
        await manager.update(OrderApplication, { id: applicationId }, {
          status: ApplicationStatus.ACCEPTED
        });
  
        // Отклоняем все остальные заявки
        await manager.createQueryBuilder()
          .update(OrderApplication)
          .set({ 
            status: ApplicationStatus.REJECTED, 
            rejectionReason: 'Выбран другой исполнитель' 
          })
          .where('orderId = :orderId', { orderId: application.orderId })
          .andWhere('id != :applicationId', { applicationId })
          .execute();
  
        // Обновляем заказ
        await manager.update(Order, { id: application.orderId }, {
          executorId: application.executorId,
          status: OrderStatus.IN_PROGRESS,
          actualStartDate: new Date(),
          agreedPrice: application.proposedPrice,
        });
      });
  
      return this.findOne(application.orderId);
    }
  
    /**
     * Отклонить заявку
     */
    async rejectApplication(
      customerId: number, 
      applicationId: number, 
      reason?: string
    ): Promise<OrderApplication> {
      const application = await this.applicationRepository.findOne({
        where: { id: applicationId },
        relations: ['order'],
      });
  
      if (!application) {
        throw new NotFoundException('Заявка не найдена');
      }
  
      // Проверяем права доступа
      if (application.order.customerId !== customerId) {
        throw new ForbiddenException('Нет прав для отклонения этой заявки');
      }
  
      // Проверяем статус заявки
      if (application.status !== ApplicationStatus.PENDING) {
        throw new BadRequestException('Заявка уже обработана');
      }
  
      application.status = ApplicationStatus.REJECTED;
      application.rejectionReason = reason;
  
      return this.applicationRepository.save(application);
    }
  
    /**
     * Завершить заказ с оценкой
     */
    async completeOrder(
      customerId: number, 
      orderId: number, 
      completeDto: CompleteOrderDto
    ): Promise<Order> {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['executor'],
      });
  
      if (!order) {
        throw new NotFoundException('Заказ не найден');
      }
  
      // Проверяем права доступа
      if (order.customerId !== customerId) {
        throw new ForbiddenException('Нет прав для завершения этого заказа');
      }
  
      // Проверяем статус заказа
      if (order.status !== OrderStatus.IN_PROGRESS && order.status !== OrderStatus.WAITING_CONFIRMATION) {
        throw new BadRequestException('Заказ нельзя завершить в текущем статусе');
      }
  
      await this.dataSource.transaction(async manager => {
        // Обновляем заказ
        await manager.update(Order, { id: orderId }, {
          status: OrderStatus.COMPLETED,
          actualEndDate: new Date(),
          customerRating: completeDto.rating,
          customerReview: completeDto.review,
        });
  
        // Обновляем статистику исполнителя
        if (order.executor) {
          const executor = order.executor;
          const newCompletedOrders = executor.completedOrders + 1;
          const newRating = (executor.rating * executor.reviewsCount + completeDto.rating) / (executor.reviewsCount + 1);
  
          await manager.update(ExecutorProfile, { id: executor.id }, {
            completedOrders: newCompletedOrders,
            rating: newRating,
            reviewsCount: executor.reviewsCount + 1,
          });
        }
      });
  
      return this.findOne(orderId);
    }
  
    /**
     * Получить заявки на заказ
     */
    async getOrderApplications(orderId: number, customerId?: number): Promise<OrderApplication[]> {
      // Если указан customerId, проверяем права доступа
      if (customerId) {
        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order || order.customerId !== customerId) {
          throw new ForbiddenException('Нет прав для просмотра заявок этого заказа');
        }
      }
  
      return this.applicationRepository.find({
        where: { orderId },
        relations: ['executor', 'executor.user'],
        order: { createdAt: 'DESC' },
      });
    }
  
    /**
     * Получить мои заявки (для исполнителя)
     */
    async getMyApplications(executorUserId: number): Promise<OrderApplication[]> {
      const executor = await this.executorRepository.findOne({ 
        where: { userId: executorUserId } 
      });
      
      if (!executor) {
        throw new NotFoundException('Профиль исполнителя не найден');
      }
  
      return this.applicationRepository.find({
        where: { executorId: executor.id },
        relations: ['order', 'order.customer', 'order.category'],
        order: { createdAt: 'DESC' },
      });
    }
  
    /**
     * Отозвать заявку
     */
    async withdrawApplication(executorUserId: number, applicationId: number): Promise<OrderApplication> {
      const executor = await this.executorRepository.findOne({ 
        where: { userId: executorUserId } 
      });
      
      if (!executor) {
        throw new NotFoundException('Профиль исполнителя не найден');
      }
  
      const application = await this.applicationRepository.findOne({
        where: { id: applicationId, executorId: executor.id },
      });
  
      if (!application) {
        throw new NotFoundException('Заявка не найдена');
      }
  
      if (application.status !== ApplicationStatus.PENDING) {
        throw new BadRequestException('Можно отозвать только ожидающие заявки');
      }
  
      application.status = ApplicationStatus.WITHDRAWN;
      return this.applicationRepository.save(application);
    }
  
    /**
     * Обновить статус заказа
     */
    async updateOrderStatus(
      userId: number, 
      orderId: number, 
      updateDto: UpdateOrderStatusDto
    ): Promise<Order> {
      const order = await this.orderRepository.findOne({ where: { id: orderId } });
  
      if (!order) {
        throw new NotFoundException('Заказ не найден');
      }
  
      // Проверяем права доступа (заказчик или исполнитель)
      const hasAccess = order.customerId === userId || order.executorId === userId;
      if (!hasAccess) {
        throw new ForbiddenException('Нет прав для изменения статуса этого заказа');
      }
  
      // Валидируем переход статуса
      this.validateStatusTransition(order.status, updateDto.status, userId, order);
  
      order.status = updateDto.status;
  
      // Обновляем дополнительные поля в зависимости от статуса
      if (updateDto.status === OrderStatus.WAITING_CONFIRMATION) {
        order.actualEndDate = new Date();
      }
  
      return this.orderRepository.save(order);
    }
  
    /**
     * Валидация перехода статусов
     */
    private validateStatusTransition(
      currentStatus: OrderStatus, 
      newStatus: OrderStatus, 
      userId: number, 
      order: Order
    ): void {
      const isCustomer = order.customerId === userId;
      const isExecutor = order.executorId === userId;
  
      // Логика валидации переходов статусов
      const allowedTransitions: Record<OrderStatus, { next: OrderStatus[], roles: string[] }[]> = {
        [OrderStatus.DRAFT]: [
          { next: [OrderStatus.OPEN], roles: ['customer'] }
        ],
        [OrderStatus.OPEN]: [
          { next: [OrderStatus.CANCELLED], roles: ['customer'] }
        ],
        [OrderStatus.IN_PROGRESS]: [
          { next: [OrderStatus.WAITING_CONFIRMATION], roles: ['executor'] },
          { next: [OrderStatus.CANCELLED], roles: ['customer', 'executor'] }
        ],
        [OrderStatus.WAITING_CONFIRMATION]: [
          { next: [OrderStatus.COMPLETED], roles: ['customer'] },
          { next: [OrderStatus.IN_PROGRESS], roles: ['customer'] },
          { next: [OrderStatus.DISPUTED], roles: ['customer', 'executor'] }
        ],
        [OrderStatus.COMPLETED]: [],
        [OrderStatus.CANCELLED]: [],
        [OrderStatus.DISPUTED]: []
      };
  
      const currentTransitions = allowedTransitions[currentStatus] || [];
      const validTransition = currentTransitions.find(t => 
        t.next.includes(newStatus) && 
        ((isCustomer && t.roles.includes('customer')) || (isExecutor && t.roles.includes('executor')))
      );
  
      if (!validTransition) {
        throw new BadRequestException(`Недопустимый переход статуса из ${currentStatus} в ${newStatus}`);
      }
    }
  }