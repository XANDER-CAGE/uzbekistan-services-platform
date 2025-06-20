import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiQuery,
    ApiParam,
  } from '@nestjs/swagger';
  import { CategoriesService } from './categories.service';
  import { CreateCategoryDto } from './dto/create-category.dto';
  import { UpdateCategoryDto } from './dto/update-category.dto';
  import { CategoriesFilterDto } from './dto/categories-filter.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard, Roles } from '../auth/guards/roles.guard';
  import { ServiceCategory } from './entities/service-category.entity';
  import { UserType } from '../users/entities/user.entity';
  
  @ApiTags('Категории услуг')
  @Controller('categories')
  export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}
  
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.BOTH]) // Только админы
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Создать категорию',
      description: 'Создает новую категорию услуг (только для администраторов)' 
    })
    @ApiResponse({ 
      status: 201, 
      description: 'Категория создана',
      type: ServiceCategory
    })
    @ApiResponse({ status: 409, description: 'Категория с таким slug уже существует' })
    @ApiResponse({ status: 404, description: 'Родительская категория не найдена' })
    async create(@Body() createDto: CreateCategoryDto) {
      return this.categoriesService.create(createDto);
    }
  
    @Get()
    @ApiOperation({ 
      summary: 'Получить список категорий',
      description: 'Возвращает список категорий с возможностью фильтрации' 
    })
    @ApiQuery({ name: 'page', required: false, description: 'Номер страницы' })
    @ApiQuery({ name: 'limit', required: false, description: 'Количество элементов на странице' })
    @ApiQuery({ name: 'search', required: false, description: 'Поиск по названию' })
    @ApiQuery({ name: 'parentId', required: false, description: 'ID родительской категории' })
    @ApiQuery({ name: 'onlyActive', required: false, description: 'Только активные категории' })
    @ApiQuery({ name: 'onlyPopular', required: false, description: 'Только популярные категории' })
    @ApiQuery({ name: 'onlyRoot', required: false, description: 'Только корневые категории' })
    @ApiQuery({ name: 'includeChildren', required: false, description: 'Включить дочерние категории' })
    @ApiResponse({ 
      status: 200, 
      description: 'Список категорий получен',
      schema: {
        example: {
          categories: [
            {
              id: 1,
              nameUz: "Ta'mirlash xizmatlari",
              nameRu: "Ремонтные услуги",
              descriptionRu: "Все виды ремонтных работ",
              iconUrl: "https://example.com/icon.svg",
              color: "#FF5722",
              isActive: true,
              isPopular: true,
              sortOrder: 1,
              servicesCount: 25,
              slug: "repair-services",
              children: []
            }
          ],
          total: 50,
          page: 1,
          limit: 20,
          totalPages: 3
        }
      }
    })
    async findAll(@Query() filterDto: CategoriesFilterDto) {
      return this.categoriesService.findAll(filterDto);
    }
  
    @Get('tree')
    @ApiOperation({ 
      summary: 'Получить дерево категорий',
      description: 'Возвращает иерархическое дерево всех категорий' 
    })
    @ApiQuery({ name: 'onlyActive', required: false, description: 'Только активные категории' })
    @ApiResponse({ 
      status: 200, 
      description: 'Дерево категорий получено',
      schema: {
        example: [
          {
            id: 1,
            nameRu: "Ремонт и строительство",
            nameUz: "Ta'mirlash va qurilish",
            iconUrl: "https://example.com/repair-icon.svg",
            color: "#FF5722",
            isActive: true,
            children: [
              {
                id: 2,
                nameRu: "Электрика",
                nameUz: "Elektr ishlari",
                parentId: 1,
                children: []
              },
              {
                id: 3,
                nameRu: "Сантехника",
                nameUz: "Santexnika",
                parentId: 1,
                children: []
              }
            ]
          }
        ]
      }
    })
    async getCategoriesTree(@Query('onlyActive') onlyActive?: string) {
      const isOnlyActive = onlyActive === 'true';
      return this.categoriesService.getCategoriesTree(isOnlyActive);
    }
  
    @Get('popular')
    @ApiOperation({ 
      summary: 'Получить популярные категории',
      description: 'Возвращает список популярных категорий для главной страницы' 
    })
    @ApiQuery({ name: 'limit', required: false, description: 'Максимальное количество категорий' })
    @ApiResponse({ 
      status: 200, 
      description: 'Популярные категории получены',
      type: [ServiceCategory]
    })
    async getPopularCategories(@Query('limit', ParseIntPipe) limit?: number) {
      return this.categoriesService.getPopularCategories(limit);
    }
  
    @Get('root')
    @ApiOperation({ 
      summary: 'Получить корневые категории',
      description: 'Возвращает список корневых категорий (без родительских)' 
    })
    @ApiResponse({ 
      status: 200, 
      description: 'Корневые категории получены',
      type: [ServiceCategory]
    })
    async getRootCategories() {
      return this.categoriesService.getRootCategories();
    }
  
    @Get('slug/:slug')
    @ApiOperation({ 
      summary: 'Получить категорию по slug',
      description: 'Возвращает категорию по SEO-дружественному URL' 
    })
    @ApiParam({ name: 'slug', description: 'SEO slug категории' })
    @ApiQuery({ name: 'includeChildren', required: false, description: 'Включить дочерние категории' })
    @ApiResponse({ status: 200, description: 'Категория найдена', type: ServiceCategory })
    @ApiResponse({ status: 404, description: 'Категория не найдена' })
    async findBySlug(
      @Param('slug') slug: string,
      @Query('includeChildren') includeChildren?: string,
    ) {
      const shouldIncludeChildren = includeChildren === 'true';
      return this.categoriesService.findBySlug(slug, shouldIncludeChildren);
    }
  
    @Get(':id')
    @ApiOperation({ 
      summary: 'Получить категорию по ID',
      description: 'Возвращает информацию о категории по ее ID' 
    })
    @ApiParam({ name: 'id', description: 'ID категории' })
    @ApiQuery({ name: 'includeChildren', required: false, description: 'Включить дочерние категории' })
    @ApiResponse({ status: 200, description: 'Категория найдена', type: ServiceCategory })
    @ApiResponse({ status: 404, description: 'Категория не найдена' })
    async findOne(
      @Param('id', ParseIntPipe) id: number,
      @Query('includeChildren') includeChildren?: string,
    ) {
      const shouldIncludeChildren = includeChildren === 'true';
      return this.categoriesService.findOne(id, shouldIncludeChildren);
    }
  
    @Get(':id/breadcrumbs')
    @ApiOperation({ 
      summary: 'Получить хлебные крошки для категории',
      description: 'Возвращает путь от корневой категории до указанной' 
    })
    @ApiParam({ name: 'id', description: 'ID категории' })
    @ApiQuery({ name: 'language', required: false, description: 'Язык (uz или ru)' })
    @ApiResponse({ 
      status: 200, 
      description: 'Хлебные крошки получены',
      schema: {
        example: [
          { id: 1, name: "Ремонт и строительство", slug: "repair-construction" },
          { id: 5, name: "Электрика", slug: "electrical-work" },
          { id: 12, name: "Установка розеток", slug: "socket-installation" }
        ]
      }
    })
    async getBreadcrumbs(
      @Param('id', ParseIntPipe) id: number,
      @Query('language') language?: 'uz' | 'ru',
    ) {
      return this.categoriesService.getBreadcrumbs(id, language || 'ru');
    }
  
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.BOTH]) // Только админы
    @ApiBearerAuth()
    @ApiOperation({ 
      summary: 'Обновить категорию',
      description: 'Обновляет информацию о категории (только для администраторов)' 
    })
    @ApiParam({ name: 'id', description: 'ID категории' })
    @ApiResponse({ status: 200, description: 'Категория обновлена', type: ServiceCategory })
    @ApiResponse({ status: 404, description: 'Категория не найдена' })
    @ApiResponse({ status: 409, description: 'Категория с таким slug уже существует' })
    @ApiResponse({ status: 400, description: 'Некорректные данные или циклическая зависимость' })
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() updateDto: UpdateCategoryDto,
    ) {
      return this.categoriesService.update(id, updateDto);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles([UserType.BOTH]) // Только админы
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ 
      summary: 'Удалить категорию',
      description: 'Удаляет категорию (только для администраторов). Нельзя удалить категорию с дочерними элементами.' 
    })
    @ApiParam({ name: 'id', description: 'ID категории' })
    @ApiResponse({ 
      status: 200, 
      description: 'Категория удалена',
      schema: {
        example: { message: 'Категория удалена' }
      }
    })
    @ApiResponse({ status: 404, description: 'Категория не найдена' })
    @ApiResponse({ status: 400, description: 'Нельзя удалить категорию с дочерними элементами' })
    async remove(@Param('id', ParseIntPipe) id: number) {
      return this.categoriesService.remove(id);
    }
  }