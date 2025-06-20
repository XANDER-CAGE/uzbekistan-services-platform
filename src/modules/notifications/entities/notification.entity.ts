// src/modules/notifications/entities/notification.entity.ts
import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index
  } from 'typeorm';
  import { ApiProperty } from '@nestjs/swagger';
  import { User } from '../../users/entities/user.entity';
  
  export enum NotificationType {
    // Заказы
    NEW_ORDER_IN_AREA = 'new_order_in_area',           // Новый заказ в области исполнителя
    NEW_APPLICATION = 'new_application',               // Новая заявка на заказ
    APPLICATION_ACCEPTED = 'application_accepted',     // Заявка принята
    APPLICATION_REJECTED = 'application_rejected',     // Заявка отклонена
    ORDER_STATUS_CHANGED = 'order_status_changed',     // Изменился статус заказа
    ORDER_COMPLETED = 'order_completed',               // Заказ завершен
    
    // Отзывы и рейтинги
    NEW_REVIEW = 'new_review',                         // Новый отзыв
    
    // Сообщения
    NEW_MESSAGE = 'new_message',                       // Новое сообщение в чате
    
    // Система
    ACCOUNT_VERIFIED = 'account_verified',             // Аккаунт верифицирован
    ACCOUNT_BLOCKED = 'account_blocked',               // Аккаунт заблокирован
    PREMIUM_EXPIRED = 'premium_expired',               // Премиум подписка истекла
    
    // Напоминания
    REMINDER_DEADLINE = 'reminder_deadline',           // Напоминание о дедлайне
    REMINDER_PAYMENT = 'reminder_payment',             // Напоминание об оплате
  }
  
  export enum NotificationChannel {
    IN_APP = 'in_app',       // В приложении
    EMAIL = 'email',         // Email
    SMS = 'sms',             // SMS
    TELEGRAM = 'telegram',   // Telegram
    PUSH = 'push'            // Push уведомления
  }
  
  export enum NotificationStatus {
    PENDING = 'pending',     // Ожидает отправки
    SENT = 'sent',          // Отправлено
    DELIVERED = 'delivered', // Доставлено
    READ = 'read',          // Прочитано
    FAILED = 'failed'       // Ошибка отправки
  }
  
  export enum NotificationPriority {
    LOW = 'low',            // Низкий приоритет
    NORMAL = 'normal',      // Обычный
    HIGH = 'high',          // Высокий
    URGENT = 'urgent'       // Критически важно
  }
  
  @Entity('notifications')
  @Index(['userId', 'isRead'])
  @Index(['type', 'createdAt'])
  @Index(['status', 'scheduledAt'])
  export class Notification {
    @ApiProperty({ description: 'ID уведомления' })
    @PrimaryGeneratedColumn()
    id: number;
  
    // Получатель
    @ApiProperty({ description: 'ID пользователя' })
    @Column({ name: 'user_id' })
    userId: number;
  
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    // Основная информация
    @ApiProperty({ description: 'Тип уведомления', enum: NotificationType })
    @Column({ type: 'enum', enum: NotificationType })
    type: NotificationType;
  
    @ApiProperty({ description: 'Канал доставки', enum: NotificationChannel })
    @Column({ type: 'enum', enum: NotificationChannel })
    channel: NotificationChannel;
  
    @ApiProperty({ description: 'Приоритет уведомления', enum: NotificationPriority })
    @Column({ type: 'enum', enum: NotificationPriority, default: NotificationPriority.NORMAL })
    priority: NotificationPriority;
  
    // Контент
    @ApiProperty({ description: 'Заголовок уведомления' })
    @Column({ length: 255 })
    title: string;
  
    @ApiProperty({ description: 'Текст уведомления' })
    @Column({ type: 'text' })
    message: string;
  
    @ApiProperty({ description: 'Дополнительные данные (JSON)', required: false })
    @Column({ type: 'json', nullable: true })
    data?: any;
  
    // Статус
    @ApiProperty({ description: 'Статус уведомления', enum: NotificationStatus })
    @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.PENDING })
    status: NotificationStatus;
  
    @ApiProperty({ description: 'Прочитано ли уведомление' })
    @Column({ name: 'is_read', default: false })
    isRead: boolean;
  
    // Планирование
    @ApiProperty({ description: 'Когда запланирована отправка', required: false })
    @Column({ name: 'scheduled_at', nullable: true })
    scheduledAt?: Date;
  
    @ApiProperty({ description: 'Когда было отправлено', required: false })
    @Column({ name: 'sent_at', nullable: true })
    sentAt?: Date;
  
    @ApiProperty({ description: 'Когда было доставлено', required: false })
    @Column({ name: 'delivered_at', nullable: true })
    deliveredAt?: Date;
  
    @ApiProperty({ description: 'Когда было прочитано', required: false })
    @Column({ name: 'read_at', nullable: true })
    readAt?: Date;
  
    // Метаданные
    @ApiProperty({ description: 'Внешний ID (для SMS/Email провайдера)', required: false })
    @Column({ name: 'external_id', nullable: true })
    externalId?: string;
  
    @ApiProperty({ description: 'Ошибка отправки', required: false })
    @Column({ name: 'error_message', type: 'text', nullable: true })
    errorMessage?: string;
  
    @ApiProperty({ description: 'Количество попыток отправки' })
    @Column({ name: 'retry_count', default: 0 })
    retryCount: number;
  
    @ApiProperty()
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @ApiProperty()
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  
    // Методы
    markAsRead(): void {
      this.isRead = true;
      this.readAt = new Date();
      this.status = NotificationStatus.READ;
    }
  
    markAsSent(): void {
      this.status = NotificationStatus.SENT;
      this.sentAt = new Date();
    }
  
    markAsDelivered(): void {
      this.status = NotificationStatus.DELIVERED;
      this.deliveredAt = new Date();
    }
  
    markAsFailed(error: string): void {
      this.status = NotificationStatus.FAILED;
      this.errorMessage = error;
      this.retryCount++;
    }
  
    canRetry(): boolean {
      return this.status === NotificationStatus.FAILED && this.retryCount < 3;
    }
  
    get isUrgent(): boolean {
      return this.priority === NotificationPriority.URGENT || this.priority === NotificationPriority.HIGH;
    }
  }
  
  // src/modules/notifications/entities/notification-settings.entity.ts
  @Entity('notification_settings')
  export class NotificationSettings {
    @ApiProperty({ description: 'ID настроек' })
    @PrimaryGeneratedColumn()
    id: number;
  
    @ApiProperty({ description: 'ID пользователя' })
    @Column({ name: 'user_id', unique: true })
    userId: number;
  
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    // Настройки каналов
    @ApiProperty({ description: 'Включены ли Email уведомления' })
    @Column({ name: 'email_enabled', default: true })
    emailEnabled: boolean;
  
    @ApiProperty({ description: 'Включены ли SMS уведомления' })
    @Column({ name: 'sms_enabled', default: true })
    smsEnabled: boolean;
  
    @ApiProperty({ description: 'Включены ли Telegram уведомления' })
    @Column({ name: 'telegram_enabled', default: false })
    telegramEnabled: boolean;
  
    @ApiProperty({ description: 'Включены ли Push уведомления' })
    @Column({ name: 'push_enabled', default: true })
    pushEnabled: boolean;
  
    // Настройки типов уведомлений
    @ApiProperty({ description: 'Уведомления о новых заказах' })
    @Column({ name: 'new_orders', default: true })
    newOrders: boolean;
  
    @ApiProperty({ description: 'Уведомления о заявках' })
    @Column({ name: 'applications', default: true })
    applications: boolean;
  
    @ApiProperty({ description: 'Уведомления о сообщениях' })
    @Column({ name: 'messages', default: true })
    messages: boolean;
  
    @ApiProperty({ description: 'Уведомления об отзывах' })
    @Column({ name: 'reviews', default: true })
    reviews: boolean;
  
    @ApiProperty({ description: 'Системные уведомления' })
    @Column({ name: 'system', default: true })
    system: boolean;
  
    @ApiProperty({ description: 'Маркетинговые уведомления' })
    @Column({ name: 'marketing', default: false })
    marketing: boolean;
  
    // Режим "Не беспокоить"
    @ApiProperty({ description: 'Время начала "Не беспокоить"', required: false })
    @Column({ name: 'do_not_disturb_start', nullable: true })
    doNotDisturbStart?: string; // Формат "22:00"
  
    @ApiProperty({ description: 'Время окончания "Не беспокоить"', required: false })
    @Column({ name: 'do_not_disturb_end', nullable: true })
    doNotDisturbEnd?: string; // Формат "08:00"
  
    @ApiProperty()
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @ApiProperty()
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  
    // Методы
    isChannelEnabled(channel: NotificationChannel): boolean {
      switch (channel) {
        case NotificationChannel.EMAIL:
          return this.emailEnabled;
        case NotificationChannel.SMS:
          return this.smsEnabled;
        case NotificationChannel.TELEGRAM:
          return this.telegramEnabled;
        case NotificationChannel.PUSH:
          return this.pushEnabled;
        case NotificationChannel.IN_APP:
          return true; // Всегда включены
        default:
          return false;
      }
    }
  
    isTypeEnabled(type: NotificationType): boolean {
      switch (type) {
        case NotificationType.NEW_ORDER_IN_AREA:
          return this.newOrders;
        case NotificationType.NEW_APPLICATION:
        case NotificationType.APPLICATION_ACCEPTED:
        case NotificationType.APPLICATION_REJECTED:
          return this.applications;
        case NotificationType.NEW_MESSAGE:
          return this.messages;
        case NotificationType.NEW_REVIEW:
          return this.reviews;
        case NotificationType.ACCOUNT_VERIFIED:
        case NotificationType.ACCOUNT_BLOCKED:
        case NotificationType.PREMIUM_EXPIRED:
          return this.system;
        default:
          return true;
      }
    }
  
    isInDoNotDisturbTime(): boolean {
      if (!this.doNotDisturbStart || !this.doNotDisturbEnd) {
        return false;
      }
  
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      return currentTime >= this.doNotDisturbStart && currentTime <= this.doNotDisturbEnd;
    }
  }