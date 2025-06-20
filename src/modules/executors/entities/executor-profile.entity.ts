import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    OneToOne, 
    JoinColumn, 
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn
  } from 'typeorm';
  import { ApiProperty } from '@nestjs/swagger';
  import { User } from '../../users/entities/user.entity';
  
  @Entity('executor_profiles')
  export class ExecutorProfile {
    @ApiProperty({ description: 'ID профиля исполнителя' })
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ name: 'user_id' })
    userId: number;
  
    // Связь один к одному с пользователем
    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @ApiProperty({ description: 'Краткое описание об исполнителе', required: false })
    @Column({ type: 'text', nullable: true })
    bio?: string;
  
    @ApiProperty({ description: 'Опыт работы в годах', required: false })
    @Column({ name: 'experience_years', nullable: true })
    experienceYears?: number;
  
    @ApiProperty({ description: 'Почасовая ставка в сумах', required: false })
    @Column({ name: 'hourly_rate', type: 'decimal', precision: 10, scale: 2, nullable: true })
    hourlyRate?: number;
  
    // Приватные данные для верификации
    @Column({ name: 'passport_number', nullable: true, length: 20 })
    passportNumber?: string;
  
    @Column({ nullable: true, length: 20 })
    inn?: string;
  
    @ApiProperty({ description: 'Подтверждена ли личность' })
    @Column({ name: 'is_identity_verified', default: false })
    isIdentityVerified: boolean;
  
    @ApiProperty({ description: 'Фотографии работ', type: [String] })
    @Column({ name: 'portfolio_images', type: 'text', array: true, default: '{}' })
    portfolioImages: string[];
  
    @ApiProperty({ description: 'Рейтинг от 0 до 5' })
    @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
    rating: number;
  
    @ApiProperty({ description: 'Количество отзывов' })
    @Column({ name: 'reviews_count', default: 0 })
    reviewsCount: number;
  
    @ApiProperty({ description: 'Количество выполненных заказов' })
    @Column({ name: 'completed_orders', default: 0 })
    completedOrders: number;
  
    @ApiProperty({ description: 'Время ответа в минутах', required: false })
    @Column({ name: 'response_time_minutes', nullable: true })
    responseTimeMinutes?: number;
  
    @ApiProperty({ description: 'Премиум аккаунт' })
    @Column({ name: 'is_premium', default: false })
    isPremium: boolean;
  
    @ApiProperty({ description: 'До какой даты действует премиум', required: false })
    @Column({ name: 'premium_until', nullable: true })
    premiumUntil?: Date;
  
    // Геолокация
    @ApiProperty({ description: 'Широта', required: false })
    @Column({ name: 'location_lat', type: 'decimal', precision: 10, scale: 8, nullable: true })
    locationLat?: number;
  
    @ApiProperty({ description: 'Долгота', required: false })
    @Column({ name: 'location_lng', type: 'decimal', precision: 11, scale: 8, nullable: true })
    locationLng?: number;
  
    @ApiProperty({ description: 'Адрес', required: false })
    @Column({ nullable: true, length: 500 })
    address?: string;
  
    @ApiProperty({ description: 'Радиус работы в км' })
    @Column({ name: 'work_radius_km', default: 10 })
    workRadiusKm: number;
  
    @ApiProperty({ description: 'Доступен ли для заказов' })
    @Column({ name: 'is_available', default: true })
    isAvailable: boolean;
  
    // Социальные сети
    @ApiProperty({ description: 'Telegram никнейм', required: false })
    @Column({ name: 'telegram_username', nullable: true, length: 100 })
    telegramUsername?: string;
  
    @ApiProperty({ description: 'Instagram никнейм', required: false })
    @Column({ name: 'instagram_username', nullable: true, length: 100 })
    instagramUsername?: string;
  
    // Рабочее время
    @ApiProperty({ description: 'Рабочие дни (JSON)', required: false })
    @Column({ name: 'working_days', type: 'json', nullable: true })
    workingDays?: {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    };
  
    @ApiProperty({ description: 'Время начала работы', required: false })
    @Column({ name: 'work_start_time', nullable: true })
    workStartTime?: string; // Формат "09:00"
  
    @ApiProperty({ description: 'Время окончания работы', required: false })
    @Column({ name: 'work_end_time', nullable: true })
    workEndTime?: string; // Формат "18:00"
  
    @ApiProperty()
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @ApiProperty()
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  
    // Виртуальные поля
    get fullName(): string {
      return this.user ? `${this.user.firstName} ${this.user.lastName}` : '';
    }
  
    get isOnline(): boolean {
      if (!this.workingDays || !this.workStartTime || !this.workEndTime) {
        return this.isAvailable;
      }
  
      const now = new Date();
      const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
      const isDayWorking = this.workingDays[currentDay as keyof typeof this.workingDays];
      const isTimeWorking = currentTime >= this.workStartTime && currentTime <= this.workEndTime;
  
      return this.isAvailable && isDayWorking && isTimeWorking;
    }
  }