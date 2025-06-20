import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn
  } from 'typeorm';
  import { ApiProperty } from '@nestjs/swagger';
  import { User } from '../../users/entities/user.entity';
  import { ExecutorProfile } from '../../executors/entities/executor-profile.entity';
  import { ServiceCategory } from '../../categories/entities/service-category.entity';
  import { OrderApplication } from './order-application.entity'; // Добавляем импорт
  
  export enum OrderStatus {
    DRAFT = 'draft',                    // Черновик (создается, но не опубликован)
    OPEN = 'open',                      // Открыт для заявок
    IN_PROGRESS = 'in_progress',        // Исполнитель выбран, работа в процессе
    WAITING_CONFIRMATION = 'waiting_confirmation', // Работа завершена, ждет подтверждения
    COMPLETED = 'completed',            // Заказ завершен успешно
    CANCELLED = 'cancelled',            // Отменен
    DISPUTED = 'disputed'               // Спорный (требует вмешательства поддержки)
  }
  
  export enum OrderPriceType {
    FIXED = 'fixed',                    // Фиксированная цена
    HOURLY = 'hourly',                  // Почасовая оплата
    NEGOTIABLE = 'negotiable'           // Договорная цена
  }
  
  export enum OrderUrgency {
    LOW = 'low',                        // Не срочно
    MEDIUM = 'medium',                  // Обычная срочность
    HIGH = 'high',                      // Срочно
    URGENT = 'urgent'                   // Очень срочно
  }
  
  @Entity('orders')
  export class Order {
    @ApiProperty({ description: 'ID заказа' })
    @PrimaryGeneratedColumn()
    id: number;
  
    // Связи с пользователями
    @ApiProperty({ description: 'ID заказчика' })
    @Column({ name: 'customer_id' })
    customerId: number;
  
    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'customer_id' })
    customer: User;
  
    @ApiProperty({ description: 'ID выбранного исполнителя', required: false })
    @Column({ name: 'executor_id', nullable: true })
    executorId?: number;
  
    @ManyToOne(() => ExecutorProfile, { eager: true })
    @JoinColumn({ name: 'executor_id' })
    executor?: ExecutorProfile;
  
    // Связь с категорией
    @ApiProperty({ description: 'ID категории услуги' })
    @Column({ name: 'category_id' })
    categoryId: number;
  
    @ManyToOne(() => ServiceCategory, { eager: true })
    @JoinColumn({ name: 'category_id' })
    category: ServiceCategory;
  
    // Основная информация о заказе
    @ApiProperty({ description: 'Заголовок заказа' })
    @Column({ length: 200 })
    title: string;
  
    @ApiProperty({ description: 'Подробное описание заказа' })
    @Column({ type: 'text' })
    description: string;
  
    // Ценовая информация
    @ApiProperty({ description: 'Тип ценообразования', enum: OrderPriceType })
    @Column({ name: 'price_type', type: 'enum', enum: OrderPriceType })
    priceType: OrderPriceType;
  
    @ApiProperty({ description: 'Бюджет от (в сумах)', required: false })
    @Column({ name: 'budget_from', type: 'decimal', precision: 10, scale: 2, nullable: true })
    budgetFrom?: number;
  
    @ApiProperty({ description: 'Бюджет до (в сумах)', required: false })
    @Column({ name: 'budget_to', type: 'decimal', precision: 10, scale: 2, nullable: true })
    budgetTo?: number;
  
    @ApiProperty({ description: 'Согласованная цена (в сумах)', required: false })
    @Column({ name: 'agreed_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
    agreedPrice?: number;
  
    // Временные рамки
    @ApiProperty({ description: 'Желаемая дата начала работ', required: false })
    @Column({ name: 'preferred_start_date', nullable: true })
    preferredStartDate?: Date;
  
    @ApiProperty({ description: 'Крайний срок выполнения', required: false })
    @Column({ name: 'deadline', nullable: true })
    deadline?: Date;
  
    @ApiProperty({ description: 'Срочность заказа', enum: OrderUrgency })
    @Column({ type: 'enum', enum: OrderUrgency, default: OrderUrgency.MEDIUM })
    urgency: OrderUrgency;
  
    // Локация
    @ApiProperty({ description: 'Адрес выполнения работ' })
    @Column({ length: 500 })
    address: string;
  
    @ApiProperty({ description: 'Широта', required: false })
    @Column({ name: 'location_lat', type: 'decimal', precision: 10, scale: 8, nullable: true })
    locationLat?: number;
  
    @ApiProperty({ description: 'Долгота', required: false })
    @Column({ name: 'location_lng', type: 'decimal', precision: 11, scale: 8, nullable: true })
    locationLng?: number;
  
    // Дополнительные файлы
    @ApiProperty({ description: 'Фотографии и файлы к заказу', type: [String] })
    @Column({ type: 'text', array: true, default: '{}' })
    attachments: string[];
  
    // Статус и метаданные
    @ApiProperty({ description: 'Статус заказа', enum: OrderStatus })
    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.DRAFT })
    status: OrderStatus;
  
    @ApiProperty({ description: 'Опубликован ли заказ' })
    @Column({ name: 'is_published', default: false })
    isPublished: boolean;
  
    @ApiProperty({ description: 'Количество откликов' })
    @Column({ name: 'applications_count', default: 0 })
    applicationsCount: number;
  
    @ApiProperty({ description: 'Количество просмотров' })
    @Column({ name: 'views_count', default: 0 })
    viewsCount: number;
  
    // Временные метки работы
    @ApiProperty({ description: 'Фактическая дата начала работ', required: false })
    @Column({ name: 'actual_start_date', nullable: true })
    actualStartDate?: Date;
  
    @ApiProperty({ description: 'Фактическая дата завершения', required: false })
    @Column({ name: 'actual_end_date', nullable: true })
    actualEndDate?: Date;
  
    // Отзывы и рейтинги
    @ApiProperty({ description: 'Оценка заказчика исполнителю (1-5)', required: false })
    @Column({ name: 'customer_rating', type: 'decimal', precision: 2, scale: 1, nullable: true })
    customerRating?: number;
  
    @ApiProperty({ description: 'Отзыв заказчика', required: false })
    @Column({ name: 'customer_review', type: 'text', nullable: true })
    customerReview?: string;
  
    @ApiProperty({ description: 'Оценка исполнителя заказчику (1-5)', required: false })
    @Column({ name: 'executor_rating', type: 'decimal', precision: 2, scale: 1, nullable: true })
    executorRating?: number;
  
    @ApiProperty({ description: 'Отзыв исполнителя', required: false })
    @Column({ name: 'executor_review', type: 'text', nullable: true })
    executorReview?: string;
  
    // Связи
    @OneToMany(() => OrderApplication, application => application.order)
    applications: OrderApplication[];
  
    @ApiProperty()
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @ApiProperty()
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  
    // Виртуальные поля и методы
    get isActive(): boolean {
      return [OrderStatus.OPEN, OrderStatus.IN_PROGRESS].includes(this.status);
    }
  
    get isCompleted(): boolean {
      return this.status === OrderStatus.COMPLETED;
    }
  
    get canReceiveApplications(): boolean {
      return this.status === OrderStatus.OPEN && this.isPublished;
    }
  
    get formattedBudget(): string {
      if (this.priceType === OrderPriceType.NEGOTIABLE) {
        return 'Договорная';
      }
  
      if (this.budgetFrom && this.budgetTo && this.budgetFrom !== this.budgetTo) {
        return `${this.budgetFrom.toLocaleString()} - ${this.budgetTo.toLocaleString()} сум`;
      }
  
      if (this.budgetFrom) {
        return `${this.budgetFrom.toLocaleString()} сум`;
      }
  
      return 'Не указан';
    }
  
    get urgencyLabel(): string {
      const labels = {
        [OrderUrgency.LOW]: 'Не срочно',
        [OrderUrgency.MEDIUM]: 'Обычная',
        [OrderUrgency.HIGH]: 'Срочно',
        [OrderUrgency.URGENT]: 'Очень срочно'
      };
      return labels[this.urgency];
    }
  }