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

@Entity('service_categories')
export class ServiceCategory {
  @ApiProperty({ description: 'ID категории' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Название на узбекском языке' })
  @Column({ name: 'name_uz', length: 100 })
  nameUz: string;

  @ApiProperty({ description: 'Название на русском языке' })
  @Column({ name: 'name_ru', length: 100 })
  nameRu: string;

  @ApiProperty({ description: 'Описание на узбекском', required: false })
  @Column({ name: 'description_uz', type: 'text', nullable: true })
  descriptionUz?: string;

  @ApiProperty({ description: 'Описание на русском', required: false })
  @Column({ name: 'description_ru', type: 'text', nullable: true })
  descriptionRu?: string;

  @ApiProperty({ description: 'URL иконки категории', required: false })
  @Column({ name: 'icon_url', nullable: true, length: 500 })
  iconUrl?: string;

  @ApiProperty({ description: 'Цвет категории в hex формате', required: false })
  @Column({ nullable: true, length: 7 })
  color?: string;

  // Поддержка иерархии категорий
  @ApiProperty({ description: 'ID родительской категории', required: false })
  @Column({ name: 'parent_id', nullable: true })
  parentId?: number;

  @ManyToOne(() => ServiceCategory, category => category.children)
  @JoinColumn({ name: 'parent_id' })
  parent?: ServiceCategory;

  @OneToMany(() => ServiceCategory, category => category.parent)
  children: ServiceCategory[];

  @ApiProperty({ description: 'Активна ли категория' })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Популярная категория (показывать на главной)' })
  @Column({ name: 'is_popular', default: false })
  isPopular: boolean;

  @ApiProperty({ description: 'Порядок сортировки' })
  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @ApiProperty({ description: 'Количество услуг в категории', required: false })
  @Column({ name: 'services_count', default: 0 })
  servicesCount: number;

  @ApiProperty({ description: 'SEO slug для URL', required: false })
  @Column({ nullable: true, length: 200 })
  slug?: string;

  @ApiProperty({ description: 'Meta title для SEO', required: false })
  @Column({ name: 'meta_title', nullable: true, length: 200 })
  metaTitle?: string;

  @ApiProperty({ description: 'Meta description для SEO', required: false })
  @Column({ name: 'meta_description', nullable: true, length: 500 })
  metaDescription?: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Методы для получения названия и описания на нужном языке
  getName(language: 'uz' | 'ru' = 'ru'): string {
    return language === 'uz' ? this.nameUz : this.nameRu;
  }

  getDescription(language: 'uz' | 'ru' = 'ru'): string | undefined {
    return language === 'uz' ? this.descriptionUz : this.descriptionRu;
  }

  // Проверка, является ли категория корневой
  get isRoot(): boolean {
    return !this.parentId;
  }

  // Проверка, есть ли дочерние категории
  get hasChildren(): boolean {
    return this.children && this.children.length > 0;
  }

  // Получение полного пути категории
  getFullPath(language: 'uz' | 'ru' = 'ru'): string {
    if (!this.parent) {
      return this.getName(language);
    }
    return `${this.parent.getFullPath(language)} > ${this.getName(language)}`;
  }
}