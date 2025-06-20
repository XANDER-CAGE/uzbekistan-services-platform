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
  import { ExecutorProfile } from './executor-profile.entity';
  import { ServiceCategory } from '../../categories/entities/service-category.entity';
  
  export enum PriceType {
    FIXED = 'fixed',
    HOURLY = 'hourly', 
    NEGOTIABLE = 'negotiable'
  }
  
  @Entity('executor_services')
  export class ExecutorService {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ name: 'executor_id' })
    executorId: number;
  
    @ManyToOne(() => ExecutorProfile, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'executor_id' })
    executor: ExecutorProfile;
  
    // Добавляем связь с категорией
    @ApiProperty({ description: 'ID категории услуги', required: false })
    @Column({ name: 'category_id', nullable: true })
    categoryId?: number;
  
    @ManyToOne(() => ServiceCategory, { eager: true })
    @JoinColumn({ name: 'category_id' })
    category?: ServiceCategory;
  
    @ApiProperty({ description: 'Название услуги на узбекском' })
    @Column({ name: 'title_uz', length: 200 })
    titleUz: string;
  
    @ApiProperty({ description: 'Название услуги на русском' })
    @Column({ name: 'title_ru', length: 200 })
    titleRu: string;
  
    @ApiProperty({ description: 'Описание услуги на узбекском', required: false })
    @Column({ name: 'description_uz', type: 'text', nullable: true })
    descriptionUz?: string;
  
    @ApiProperty({ description: 'Описание услуги на русском', required: false })
    @Column({ name: 'description_ru', type: 'text', nullable: true })
    descriptionRu?: string;
  
    @ApiProperty({ description: 'Цена от (в сумах)', required: false })
    @Column({ name: 'price_from', type: 'decimal', precision: 10, scale: 2, nullable: true })
    priceFrom?: number;
  
    @ApiProperty({ description: 'Цена до (в сумах)', required: false })
    @Column({ name: 'price_to', type: 'decimal', precision: 10, scale: 2, nullable: true })
    priceTo?: number;
  
    @ApiProperty({ description: 'Тип ценообразования', enum: PriceType })
    @Column({ name: 'price_type', type: 'enum', enum: PriceType, default: PriceType.NEGOTIABLE })
    priceType: PriceType;
  
    @ApiProperty({ description: 'Единица измерения (за час, за м2, за шт и т.д.)', required: false })
    @Column({ nullable: true, length: 50 })
    unit?: string;
  
    @ApiProperty({ description: 'Активна ли услуга' })
    @Column({ name: 'is_active', default: true })
    isActive: boolean;
  
    @ApiProperty({ description: 'Порядок сортировки' })
    @Column({ name: 'sort_order', default: 0 })
    sortOrder: number;
  
    @ApiProperty()
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @ApiProperty()
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  
    // Методы для получения названия на нужном языке
    getTitle(language: 'uz' | 'ru'): string {
      return language === 'uz' ? this.titleUz : this.titleRu;
    }
  
    getDescription(language: 'uz' | 'ru'): string | undefined {
      return language === 'uz' ? this.descriptionUz : this.descriptionRu;
    }
  
    // Форматированная цена
    get formattedPrice(): string {
      if (this.priceType === PriceType.NEGOTIABLE) {
        return 'Договорная';
      }
  
      if (this.priceFrom && this.priceTo && this.priceFrom !== this.priceTo) {
        return `${this.priceFrom.toLocaleString()} - ${this.priceTo.toLocaleString()} сум${this.unit ? '/' + this.unit : ''}`;
      }
  
      if (this.priceFrom) {
        return `${this.priceFrom.toLocaleString()} сум${this.unit ? '/' + this.unit : ''}`;
      }
  
      return 'Цена не указана';
    }
  
    // Получение названия категории
    getCategoryName(language: 'uz' | 'ru' = 'ru'): string {
      return this.category ? this.category.getName(language) : 'Без категории';
    }
  }