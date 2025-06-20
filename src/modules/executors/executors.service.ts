import { 
    Injectable, 
    NotFoundException, 
    BadRequestException,
    ConflictException,
    ForbiddenException
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, DataSource } from 'typeorm'; // Добавляем DataSource
  import { ExecutorProfile } from './entities/executor-profile.entity';
  import { ExecutorService } from './entities/executor-service.entity';
  import { User, UserType } from '../users/entities/user.entity';
  import { ServiceCategory } from '../categories/entities/service-category.entity'; // Добавляем импорт
  import { CreateExecutorProfileDto } from './dto/create-executor-profile.dto';
  import { UpdateExecutorProfileDto } from './dto/update-executor-profile.dto';
  import { CreateExecutorServiceDto } from './dto/create-executor-service.dto';
  import { UpdateExecutorServiceDto } from './dto/update-executor-service.dto';
  import { ExecutorsFilterDto } from './dto/executors-filter.dto';
  
  export interface PaginatedExecutors {
    executors: ExecutorProfile[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  @Injectable()
  export class ExecutorsService {
    constructor(
      @InjectRepository(ExecutorProfile)
      private readonly executorRepository: Repository<ExecutorProfile>,
      @InjectRepository(ExecutorService)
      private readonly serviceRepository: Repository<ExecutorService>,
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      @InjectRepository(ServiceCategory) // Добавляем репозиторий категорий
      private readonly categoryRepository: Repository<ServiceCategory>,
      private readonly dataSource: DataSource, // Добавляем DataSource
    ) {}
  
    /**
     * Создать профиль исполнителя
     */
    async createProfile(userId: number, createDto: CreateExecutorProfileDto): Promise<ExecutorProfile> {
      // Проверяем что пользователь существует
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Пользователь не найден');
      }
  
      // Проверяем что пользователь может быть исполнителем
      if (user.userType === UserType.CUSTOMER) {
        throw new ForbiddenException('Только исполнители и пользователи типа "both" могут создавать профиль');
      }
  
      // Проверяем что профиль еще не создан
      const existingProfile = await this.executorRepository.findOne({ where: { userId } });
      if (existingProfile) {
        throw new ConflictException('Профиль исполнителя уже существует');
      }
  
      // Создаем профиль
      const profile = this.executorRepository.create({
        userId,
        ...createDto,
      });
  
      return this.executorRepository.save(profile);
    }
  
    /**
     * Получить все профили с фильтрацией
     */
    async findAll(filterDto: ExecutorsFilterDto): Promise<PaginatedExecutors> {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        lat, 
        lng, 
        radius = 10,
        minRating,
        onlyVerified,
        onlyAvailable,
        onlyPremium,
        language = 'ru'
      } = filterDto;
  
      const skip = (page - 1) * limit;
      const queryBuilder = this.executorRepository.createQueryBuilder('executor')
        .leftJoinAndSelect('executor.user', 'user')
        .where('1=1'); // Базовое условие
  
      // Поиск по тексту
      if (search) {
        queryBuilder.andWhere(
          '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR executor.bio ILIKE :search)',
          { search: `%${search}%` }
        );
      }
  
      // Фильтр по рейтингу
      if (minRating) {
        queryBuilder.andWhere('executor.rating >= :minRating', { minRating });
      }
  
      // Фильтр по верификации
      if (onlyVerified) {
        queryBuilder.andWhere('executor.isIdentityVerified = :verified', { verified: true });
      }
  
      // Фильтр по доступности
      if (onlyAvailable) {
        queryBuilder.andWhere('executor.isAvailable = :available', { available: true });
      }
  
      // Фильтр по премиум
      if (onlyPremium) {
        queryBuilder.andWhere('executor.isPremium = :premium', { premium: true });
      }
  
      // Геолокационный поиск
      if (lat && lng) {
        queryBuilder.andWhere(
          `(
            6371 * acos(
              cos(radians(:lat)) * cos(radians(executor.locationLat)) *
              cos(radians(executor.locationLng) - radians(:lng)) +
              sin(radians(:lat)) * sin(radians(executor.locationLat))
            )
          ) <= :radius`,
          { lat, lng, radius }
        );
      }
  
      // Сортировка: сначала премиум, потом по рейтингу, потом по дате
      queryBuilder
        .orderBy('executor.isPremium', 'DESC')
        .addOrderBy('executor.rating', 'DESC')
        .addOrderBy('executor.createdAt', 'DESC')
        .skip(skip)
        .take(limit);
  
      const [executors, total] = await queryBuilder.getManyAndCount();
  
      return {
        executors,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
  
    /**
     * Получить профиль исполнителя по ID
     */
    async findOne(id: number): Promise<ExecutorProfile> {
      const executor = await this.executorRepository.findOne({
        where: { id },
        relations: ['user'],
      });
  
      if (!executor) {
        throw new NotFoundException('Профиль исполнителя не найден');
      }
  
      return executor;
    }
  
    /**
     * Получить профиль исполнителя по ID пользователя
     */
    async findByUserId(userId: number): Promise<ExecutorProfile> {
      const executor = await this.executorRepository.findOne({
        where: { userId },
        relations: ['user'],
      });
  
      if (!executor) {
        throw new NotFoundException('Профиль исполнителя не найден');
      }
  
      return executor;
    }
  
    /**
     * Обновить профиль исполнителя
     */
    async updateProfile(userId: number, updateDto: UpdateExecutorProfileDto): Promise<ExecutorProfile> {
      const executor = await this.executorRepository.findOne({ where: { userId } });
      
      if (!executor) {
        throw new NotFoundException('Профиль исполнителя не найден');
      }
  
      Object.assign(executor, updateDto);
      
      return this.executorRepository.save(executor);
    }
  
    /**
     * Обновить портфолио (добавить фотографии)
     */
    async updatePortfolio(userId: number, imageUrls: string[]): Promise<ExecutorProfile> {
      const executor = await this.executorRepository.findOne({ 
        where: { userId },
        relations: ['user'] 
      });
      
      if (!executor) {
        throw new NotFoundException('Профиль исполнителя не найден');
      }
  
      // Добавляем новые фотографии к существующим
      executor.portfolioImages = [...executor.portfolioImages, ...imageUrls];
      
      return this.executorRepository.save(executor);
    }
  
    /**
     * Удалить фотографию из портфолио
     */
    async removePortfolioImage(userId: number, imageUrl: string): Promise<ExecutorProfile> {
      const executor = await this.executorRepository.findOne({ 
        where: { userId },
        relations: ['user'] 
      });
      
      if (!executor) {
        throw new NotFoundException('Профиль исполнителя не найден');
      }
  
      executor.portfolioImages = executor.portfolioImages.filter(url => url !== imageUrl);
      
      return this.executorRepository.save(executor);
    }
  
    /**
     * Создать услугу
     */
    async createService(userId: number, createDto: CreateExecutorServiceDto): Promise<ExecutorService> {
      const executor = await this.executorRepository.findOne({ where: { userId } });
      
      if (!executor) {
        throw new NotFoundException('Профиль исполнителя не найден');
      }
  
      // Проверяем что категория существует, если указана
      if (createDto.categoryId) {
        const category = await this.categoryRepository.findOne({
          where: { id: createDto.categoryId, isActive: true }
        });
        if (!category) {
          throw new NotFoundException('Категория не найдена или неактивна');
        }
      }
  
      const service = this.serviceRepository.create({
        executorId: executor.id,
        ...createDto,
      });
  
      return this.serviceRepository.save(service);
    }
  
    /**
     * Получить услуги исполнителя
     */
    async getServices(executorId: number): Promise<ExecutorService[]> {
      return this.serviceRepository.find({
        where: { executorId, isActive: true },
        relations: ['category'],
        order: { sortOrder: 'ASC', createdAt: 'DESC' },
      });
    }
  
    /**
     * Обновить услугу
     */
    async updateService(
      userId: number, 
      serviceId: number, 
      updateDto: UpdateExecutorServiceDto
    ): Promise<ExecutorService> {
      const executor = await this.executorRepository.findOne({ where: { userId } });
      
      if (!executor) {
        throw new NotFoundException('Профиль исполнителя не найден');
      }
  
      const service = await this.serviceRepository.findOne({
        where: { id: serviceId, executorId: executor.id },
      });
  
      if (!service) {
        throw new NotFoundException('Услуга не найдена');
      }
  
      // Проверяем категорию если она изменяется
      if (updateDto.categoryId && updateDto.categoryId !== service.categoryId) {
        const category = await this.categoryRepository.findOne({
          where: { id: updateDto.categoryId, isActive: true }
        });
        if (!category) {
          throw new NotFoundException('Категория не найдена или неактивна');
        }
      }
  
      Object.assign(service, updateDto);
      
      return this.serviceRepository.save(service);
    }
  
    /**
     * Удалить услугу
     */
    async removeService(userId: number, serviceId: number): Promise<{ message: string }> {
      const executor = await this.executorRepository.findOne({ where: { userId } });
      
      if (!executor) {
        throw new NotFoundException('Профиль исполнителя не найден');
      }
  
      const result = await this.serviceRepository.delete({
        id: serviceId,
        executorId: executor.id,
      });
  
      if (result.affected === 0) {
        throw new NotFoundException('Услуга не найдена');
      }
  
      return { message: 'Услуга удалена' };
    }
  
    /**
     * Поиск исполнителей рядом
     */
    async findNearby(lat: number, lng: number, radius: number = 10): Promise<ExecutorProfile[]> {
      const queryBuilder = this.executorRepository.createQueryBuilder('executor')
        .leftJoinAndSelect('executor.user', 'user')
        .where('executor.isAvailable = :available', { available: true })
        .andWhere('executor.locationLat IS NOT NULL')
        .andWhere('executor.locationLng IS NOT NULL')
        .andWhere(
          `(
            6371 * acos(
              cos(radians(:lat)) * cos(radians(executor.locationLat)) *
              cos(radians(executor.locationLng) - radians(:lng)) +
              sin(radians(:lat)) * sin(radians(executor.locationLat))
            )
          ) <= :radius`,
          { lat, lng, radius }
        )
        .orderBy('executor.isPremium', 'DESC')
        .addOrderBy('executor.rating', 'DESC');
  
      return queryBuilder.getMany();
    }
  }