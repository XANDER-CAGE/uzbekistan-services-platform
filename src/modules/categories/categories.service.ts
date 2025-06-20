import { 
    Injectable, 
    NotFoundException, 
    BadRequestException,
    ConflictException 
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, IsNull } from 'typeorm';
  import { ServiceCategory } from './entities/service-category.entity';
  import { CreateCategoryDto } from './dto/create-category.dto';
  import { UpdateCategoryDto } from './dto/update-category.dto';
  import { CategoriesFilterDto } from './dto/categories-filter.dto';
  
  export interface PaginatedCategories {
    categories: ServiceCategory[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  // Исправляем интерфейс CategoryTreeNode
  export interface CategoryTreeNode {
    id: number;
    nameUz: string;
    nameRu: string;
    descriptionUz?: string;
    descriptionRu?: string;
    iconUrl?: string;
    color?: string;
    parentId?: number;
    isActive: boolean;
    isPopular: boolean;
    sortOrder: number;
    servicesCount: number;
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
    createdAt: Date;
    updatedAt: Date;
    children: CategoryTreeNode[];
    
    // Добавляем методы как опциональные
    getName?: (language: 'uz' | 'ru') => string;
    getDescription?: (language: 'uz' | 'ru') => string | undefined;
    isRoot?: boolean;
    hasChildren?: boolean;
    getFullPath?: (language: 'uz' | 'ru') => string;
  }
  
  @Injectable()
  export class CategoriesService {
    constructor(
      @InjectRepository(ServiceCategory)
      private readonly categoryRepository: Repository<ServiceCategory>,
    ) {}
  
    /**
     * Создать новую категорию
     */
    async create(createDto: CreateCategoryDto): Promise<ServiceCategory> {
      // Проверяем уникальность slug если указан
      if (createDto.slug) {
        const existingBySlug = await this.categoryRepository.findOne({
          where: { slug: createDto.slug }
        });
        if (existingBySlug) {
          throw new ConflictException('Категория с таким slug уже существует');
        }
      } else {
        // Генерируем slug автоматически из русского названия
        createDto.slug = this.generateSlug(createDto.nameRu);
      }
  
      // Проверяем что родительская категория существует
      if (createDto.parentId) {
        const parentCategory = await this.categoryRepository.findOne({
          where: { id: createDto.parentId }
        });
        if (!parentCategory) {
          throw new NotFoundException('Родительская категория не найдена');
        }
      }
  
      const category = this.categoryRepository.create(createDto);
      return this.categoryRepository.save(category);
    }
  
    /**
     * Получить все категории с фильтрацией
     */
    async findAll(filterDto: CategoriesFilterDto): Promise<PaginatedCategories> {
      const { 
        page = 1, 
        limit = 20, 
        search, 
        parentId,
        onlyActive,
        onlyPopular,
        onlyRoot,
        language = 'ru',
        includeChildren = false
      } = filterDto;
  
      const skip = (page - 1) * limit;
      const queryBuilder = this.categoryRepository.createQueryBuilder('category');
  
      // Включаем дочерние категории если нужно
      if (includeChildren) {
        queryBuilder.leftJoinAndSelect('category.children', 'children');
      }
  
      // Фильтр по родительской категории
      if (onlyRoot) {
        queryBuilder.where('category.parentId IS NULL');
      } else if (parentId !== undefined) {
        if (parentId === null) {
          queryBuilder.where('category.parentId IS NULL');
        } else {
          queryBuilder.where('category.parentId = :parentId', { parentId });
        }
      }
  
      // Поиск по названию
      if (search) {
        if (language === 'uz') {
          queryBuilder.andWhere('category.nameUz ILIKE :search', { search: `%${search}%` });
        } else {
          queryBuilder.andWhere('category.nameRu ILIKE :search', { search: `%${search}%` });
        }
      }
  
      // Фильтр по активности
      if (onlyActive) {
        queryBuilder.andWhere('category.isActive = :active', { active: true });
      }
  
      // Фильтр по популярности
      if (onlyPopular) {
        queryBuilder.andWhere('category.isPopular = :popular', { popular: true });
      }
  
      // Сортировка
      queryBuilder
        .orderBy('category.sortOrder', 'ASC')
        .addOrderBy('category.nameRu', 'ASC')
        .skip(skip)
        .take(limit);
  
      const [categories, total] = await queryBuilder.getManyAndCount();
  
      return {
        categories,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
  
    /**
     * Получить дерево категорий
     */
    async getCategoriesTree(onlyActive: boolean = true): Promise<CategoryTreeNode[]> {
      const categories = await this.categoryRepository.find({
        where: onlyActive ? { isActive: true } : {},
        order: { sortOrder: 'ASC', nameRu: 'ASC' },
      });
  
      return this.buildTree(categories);
    }
  
    /**
     * Получить популярные категории
     */
    async getPopularCategories(limit: number = 8): Promise<ServiceCategory[]> {
      return this.categoryRepository.find({
        where: { 
          isPopular: true, 
          isActive: true 
        },
        order: { sortOrder: 'ASC', servicesCount: 'DESC' },
        take: limit,
      });
    }
  
    /**
     * Получить корневые категории
     */
    async getRootCategories(): Promise<ServiceCategory[]> {
      return this.categoryRepository.find({
        where: { 
          parentId: IsNull(),
          isActive: true 
        },
        relations: ['children'],
        order: { sortOrder: 'ASC', nameRu: 'ASC' },
      });
    }
  
    /**
     * Получить категорию по ID
     */
    async findOne(id: number, includeChildren: boolean = false): Promise<ServiceCategory> {
      const relations = includeChildren ? ['children', 'parent'] : ['parent'];
      
      const category = await this.categoryRepository.findOne({
        where: { id },
        relations,
      });
  
      if (!category) {
        throw new NotFoundException('Категория не найдена');
      }
  
      return category;
    }
  
    /**
     * Получить категорию по slug
     */
    async findBySlug(slug: string, includeChildren: boolean = false): Promise<ServiceCategory> {
      const relations = includeChildren ? ['children', 'parent'] : ['parent'];
      
      const category = await this.categoryRepository.findOne({
        where: { slug },
        relations,
      });
  
      if (!category) {
        throw new NotFoundException('Категория не найдена');
      }
  
      return category;
    }
  
    /**
     * Обновить категорию
     */
    async update(id: number, updateDto: UpdateCategoryDto): Promise<ServiceCategory> {
      const category = await this.findOne(id);
  
      // Проверяем уникальность slug если он изменяется
      if (updateDto.slug && updateDto.slug !== category.slug) {
        const existingBySlug = await this.categoryRepository.findOne({
          where: { slug: updateDto.slug }
        });
        if (existingBySlug) {
          throw new ConflictException('Категория с таким slug уже существует');
        }
      }
  
      // Проверяем что новая родительская категория существует
      if (updateDto.parentId && updateDto.parentId !== category.parentId) {
        if (updateDto.parentId === id) {
          throw new BadRequestException('Категория не может быть родительской для самой себя');
        }
  
        const parentCategory = await this.categoryRepository.findOne({
          where: { id: updateDto.parentId }
        });
        if (!parentCategory) {
          throw new NotFoundException('Родительская категория не найдена');
        }
  
        // Проверяем что не создается циклическая зависимость
        if (await this.wouldCreateCycle(id, updateDto.parentId)) {
          throw new BadRequestException('Нельзя создать циклическую зависимость категорий');
        }
      }
  
      Object.assign(category, updateDto);
      return this.categoryRepository.save(category);
    }
  
    /**
     * Удалить категорию
     */
    async remove(id: number): Promise<{ message: string }> {
      const category = await this.findOne(id, true);
  
      // Проверяем что нет дочерних категорий
      if (category.children && category.children.length > 0) {
        throw new BadRequestException('Нельзя удалить категорию, у которой есть дочерние категории');
      }
  
      await this.categoryRepository.remove(category);
      return { message: 'Категория удалена' };
    }
  
    /**
     * Обновить количество услуг в категории
     */
    async updateServicesCount(categoryId: number, count: number): Promise<void> {
      await this.categoryRepository.update(categoryId, { servicesCount: count });
    }
  
    /**
     * Получить хлебные крошки для категории
     */
    async getBreadcrumbs(id: number, language: 'uz' | 'ru' = 'ru'): Promise<Array<{id: number, name: string, slug?: string}>> {
      const category = await this.findOne(id);
      const breadcrumbs: Array<{id: number, name: string, slug?: string}> = [];
      
      let current: ServiceCategory | null = category;
      while (current) {
        breadcrumbs.unshift({
          id: current.id,
          name: current.getName(language),
          slug: current.slug,
        });
        
        if (current.parentId) {
          // Исправляем: findOne может вернуть null
          current = await this.categoryRepository.findOne({ where: { id: current.parentId } }) || null;
        } else {
          current = null;
        }
      }
      
      return breadcrumbs;
    }
  
    /**
     * Построение дерева категорий
     */
    private buildTree(categories: ServiceCategory[], parentId?: number): CategoryTreeNode[] {
      const tree: CategoryTreeNode[] = [];
      
      const children = categories.filter(cat => cat.parentId === (parentId || null));
      
      for (const child of children) {
        // Исправляем: создаем объект с правильной структурой
        const node: CategoryTreeNode = {
          id: child.id,
          nameUz: child.nameUz,
          nameRu: child.nameRu,
          descriptionUz: child.descriptionUz,
          descriptionRu: child.descriptionRu,
          iconUrl: child.iconUrl,
          color: child.color,
          parentId: child.parentId,
          isActive: child.isActive,
          isPopular: child.isPopular,
          sortOrder: child.sortOrder,
          servicesCount: child.servicesCount,
          slug: child.slug,
          metaTitle: child.metaTitle,
          metaDescription: child.metaDescription,
          createdAt: child.createdAt,
          updatedAt: child.updatedAt,
          children: this.buildTree(categories, child.id),
          // Добавляем методы
          getName: child.getName.bind(child),
          getDescription: child.getDescription.bind(child),
          isRoot: child.isRoot,
          hasChildren: child.hasChildren,
          getFullPath: child.getFullPath.bind(child),
        };
        tree.push(node);
      }
      
      return tree;
    }
  
    /**
     * Генерация slug из названия
     */
    private generateSlug(name: string): string {
      return name
        .toLowerCase()
        .replace(/[^a-zA-Zа-яё0-9\s-]/g, '') // Удаляем спецсимволы
        .replace(/\s+/g, '-') // Заменяем пробелы на дефисы
        .replace(/-+/g, '-') // Убираем повторяющиеся дефисы
        .trim()
        .substring(0, 200);
    }
  
    /**
     * Проверка на циклическую зависимость
     */
    private async wouldCreateCycle(categoryId: number, newParentId: number): Promise<boolean> {
      let currentId: number | null = newParentId;
      
      while (currentId) {
        if (currentId === categoryId) {
          return true;
        }
        
        const parent = await this.categoryRepository.findOne({ 
          where: { id: currentId }, 
          select: ['parentId'] 
        });
        
        // Исправляем: parentId может быть null
        currentId = parent?.parentId || null;
      }
      
      return false;
    }
  }