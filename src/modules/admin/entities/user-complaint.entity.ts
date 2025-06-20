import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn
  } from 'typeorm';
  import { ApiProperty } from '@nestjs/swagger';
  import { User } from '../../users/entities/user.entity';
  import { Order } from '../../orders/entities/order.entity';
  
  export enum ComplaintStatus {
    PENDING = 'pending',        // Ожидает рассмотрения
    IN_REVIEW = 'in_review',    // Рассматривается
    RESOLVED = 'resolved',      // Решена
    REJECTED = 'rejected',      // Отклонена
    CLOSED = 'closed'           // Закрыта
  }
  
  export enum ComplaintType {
    USER_BEHAVIOR = 'user_behavior',           // Поведение пользователя
    QUALITY_ISSUE = 'quality_issue',           // Проблемы с качеством работы
    PAYMENT_ISSUE = 'payment_issue',           // Проблемы с оплатой
    FRAUD = 'fraud',                           // Мошенничество
    INAPPROPRIATE_CONTENT = 'inappropriate_content', // Неподходящий контент
    TECHNICAL_ISSUE = 'technical_issue',       // Технические проблемы
    OTHER = 'other'                           // Другое
  }
  
  export enum ComplaintPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent'
  }
  
  @Entity('user_complaints')
  export class UserComplaint {
    @ApiProperty({ description: 'ID жалобы' })
    @PrimaryGeneratedColumn()
    id: number;
  
    // Кто подал жалобу
    @ApiProperty({ description: 'ID пользователя, подавшего жалобу' })
    @Column({ name: 'reporter_id' })
    reporterId: number;
  
    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'reporter_id' })
    reporter: User;
  
    // На кого жалоба
    @ApiProperty({ description: 'ID пользователя, на которого жалоба' })
    @Column({ name: 'reported_user_id' })
    reportedUserId: number;
  
    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'reported_user_id' })
    reportedUser: User;
  
    // Связанный заказ (если есть)
    @ApiProperty({ description: 'ID связанного заказа', required: false })
    @Column({ name: 'order_id', nullable: true })
    orderId?: number;
  
    @ManyToOne(() => Order, { eager: true })
    @JoinColumn({ name: 'order_id' })
    order?: Order;
  
    @ApiProperty({ description: 'Тип жалобы', enum: ComplaintType })
    @Column({ type: 'enum', enum: ComplaintType })
    type: ComplaintType;
  
    @ApiProperty({ description: 'Приоритет жалобы', enum: ComplaintPriority })
    @Column({ type: 'enum', enum: ComplaintPriority, default: ComplaintPriority.MEDIUM })
    priority: ComplaintPriority;
  
    @ApiProperty({ description: 'Статус жалобы', enum: ComplaintStatus })
    @Column({ type: 'enum', enum: ComplaintStatus, default: ComplaintStatus.PENDING })
    status: ComplaintStatus;
  
    @ApiProperty({ description: 'Заголовок жалобы' })
    @Column({ length: 200 })
    title: string;
  
    @ApiProperty({ description: 'Описание жалобы' })
    @Column({ type: 'text' })
    description: string;
  
    @ApiProperty({ description: 'Прикрепленные файлы (скриншоты, документы)', type: [String] })
    @Column({ type: 'text', array: true, default: '{}' })
    attachments: string[];
  
    // Админские поля
    @ApiProperty({ description: 'ID администратора, рассматривающего жалобу', required: false })
    @Column({ name: 'assigned_admin_id', nullable: true })
    assignedAdminId?: number;
  
    @ManyToOne(() => User)
    @JoinColumn({ name: 'assigned_admin_id' })
    assignedAdmin?: User;
  
    @ApiProperty({ description: 'Комментарий администратора', required: false })
    @Column({ name: 'admin_comment', type: 'text', nullable: true })
    adminComment?: string;
  
    @ApiProperty({ description: 'Решение по жалобе', required: false })
    @Column({ type: 'text', nullable: true })
    resolution?: string;
  
    @ApiProperty({ description: 'Дата назначения администратора', required: false })
    @Column({ name: 'assigned_at', nullable: true })
    assignedAt?: Date;
  
    @ApiProperty({ description: 'Дата решения', required: false })
    @Column({ name: 'resolved_at', nullable: true })
    resolvedAt?: Date;
  
    @ApiProperty()
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @ApiProperty()
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  
    // Методы
    get isActive(): boolean {
      return [ComplaintStatus.PENDING, ComplaintStatus.IN_REVIEW].includes(this.status);
    }
  
    get isResolved(): boolean {
      return [ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED].includes(this.status);
    }
  
    get priorityLabel(): string {
      const labels = {
        [ComplaintPriority.LOW]: 'Низкий',
        [ComplaintPriority.MEDIUM]: 'Средний',
        [ComplaintPriority.HIGH]: 'Высокий',
        [ComplaintPriority.URGENT]: 'Срочный'
      };
      return labels[this.priority];
    }
  
    get statusLabel(): string {
      const labels = {
        [ComplaintStatus.PENDING]: 'Ожидает рассмотрения',
        [ComplaintStatus.IN_REVIEW]: 'Рассматривается',
        [ComplaintStatus.RESOLVED]: 'Решена',
        [ComplaintStatus.REJECTED]: 'Отклонена',
        [ComplaintStatus.CLOSED]: 'Закрыта'
      };
      return labels[this.status];
    }
  
    get typeLabel(): string {
      const labels = {
        [ComplaintType.USER_BEHAVIOR]: 'Поведение пользователя',
        [ComplaintType.QUALITY_ISSUE]: 'Проблемы с качеством',
        [ComplaintType.PAYMENT_ISSUE]: 'Проблемы с оплатой',
        [ComplaintType.FRAUD]: 'Мошенничество',
        [ComplaintType.INAPPROPRIATE_CONTENT]: 'Неподходящий контент',
        [ComplaintType.TECHNICAL_ISSUE]: 'Технические проблемы',
        [ComplaintType.OTHER]: 'Другое'
      };
      return labels[this.type];
    }
  }