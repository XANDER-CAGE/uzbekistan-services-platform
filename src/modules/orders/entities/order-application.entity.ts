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
  import { Order } from './order.entity';
  import { ExecutorProfile } from '../../executors/entities/executor-profile.entity';
  
  export enum ApplicationStatus {
    PENDING = 'pending',        // Ожидает рассмотрения
    ACCEPTED = 'accepted',      // Принята
    REJECTED = 'rejected',      // Отклонена
    WITHDRAWN = 'withdrawn'     // Отозвана исполнителем
  }
  
  @Entity('order_applications')
  export class OrderApplication {
    @ApiProperty({ description: 'ID заявки' })
    @PrimaryGeneratedColumn()
    id: number;
  
    // Связи
    @ApiProperty({ description: 'ID заказа' })
    @Column({ name: 'order_id' })
    orderId: number;
  
    @ManyToOne(() => Order, order => order.applications)
    @JoinColumn({ name: 'order_id' })
    order: Order;
  
    @ApiProperty({ description: 'ID исполнителя' })
    @Column({ name: 'executor_id' })
    executorId: number;
  
    @ManyToOne(() => ExecutorProfile, { eager: true })
    @JoinColumn({ name: 'executor_id' })
    executor: ExecutorProfile;
  
    // Предложение исполнителя
    @ApiProperty({ description: 'Предлагаемая цена (в сумах)', required: false })
    @Column({ name: 'proposed_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
    proposedPrice?: number;
  
    @ApiProperty({ description: 'Предлагаемый срок выполнения (в днях)', required: false })
    @Column({ name: 'proposed_duration_days', nullable: true })
    proposedDurationDays?: number;
  
    @ApiProperty({ description: 'Комментарий исполнителя к заявке' })
    @Column({ type: 'text' })
    message: string;
  
    @ApiProperty({ description: 'Статус заявки', enum: ApplicationStatus })
    @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.PENDING })
    status: ApplicationStatus;
  
    @ApiProperty({ description: 'Когда исполнитель готов начать работу', required: false })
    @Column({ name: 'available_from', nullable: true })
    availableFrom?: Date;
  
    // Метаданные
    @ApiProperty({ description: 'Причина отклонения/отзыва', required: false })
    @Column({ name: 'rejection_reason', type: 'text', nullable: true })
    rejectionReason?: string;
  
    @ApiProperty({ description: 'Просмотрена ли заявка заказчиком' })
    @Column({ name: 'is_viewed', default: false })
    isViewed: boolean;
  
    @ApiProperty()
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @ApiProperty()
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  
    // Виртуальные поля
    get isPending(): boolean {
      return this.status === ApplicationStatus.PENDING;
    }
  
    get isAccepted(): boolean {
      return this.status === ApplicationStatus.ACCEPTED;
    }
  
    get formattedPrice(): string {
      if (!this.proposedPrice) {
        return 'Договорная';
      }
      return `${this.proposedPrice.toLocaleString()} сум`;
    }
  
    get formattedDuration(): string {
      if (!this.proposedDurationDays) {
        return 'Не указан';
      }
      
      if (this.proposedDurationDays === 1) {
        return '1 день';
      } else if (this.proposedDurationDays < 5) {
        return `${this.proposedDurationDays} дня`;
      } else {
        return `${this.proposedDurationDays} дней`;
      }
    }
  }