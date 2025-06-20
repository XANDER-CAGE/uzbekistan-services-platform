import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ExecutorsService } from './executors.service';
import { ExecutorsController } from './executors.controller';
import { ExecutorProfile } from './entities/executor-profile.entity';
import { ExecutorService } from './entities/executor-service.entity';
import { User } from '../users/entities/user.entity';
import { ServiceCategory } from '../categories/entities/service-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExecutorProfile, 
      ExecutorService, 
      User,
      ServiceCategory // Добавили для валидации категорий
    ]),
    MulterModule.register({
      dest: './uploads/portfolio',
    }),
  ],
  controllers: [ExecutorsController],
  providers: [ExecutorsService],
  exports: [ExecutorsService, TypeOrmModule],
})
export class ExecutorsModule {}