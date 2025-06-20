import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { ServiceCategory } from './entities/service-category.entity';

@Module({
  imports: [
    // Подключаем ServiceCategory entity к TypeORM
    TypeOrmModule.forFeature([ServiceCategory]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [
    CategoriesService, // Экспортируем для использования в других модулях
    TypeOrmModule, // Экспортируем для использования ServiceCategory в других модулях
  ],
})
export class CategoriesModule {}