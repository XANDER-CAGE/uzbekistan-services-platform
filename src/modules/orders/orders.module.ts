import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderApplication } from './entities/order-application.entity';
import { User } from '../users/entities/user.entity';
import { ExecutorProfile } from '../executors/entities/executor-profile.entity';
import { ServiceCategory } from '../categories/entities/service-category.entity';

@Module({
  imports: [
    // Подключаем entities к TypeORM
    TypeOrmModule.forFeature([
      Order,
      OrderApplication,
      User,
      ExecutorProfile,
      ServiceCategory
    ]),
    
    // Настраиваем Multer для загрузки файлов
    MulterModule.register({
      dest: './uploads/attachments',
    }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [
    OrdersService,
    TypeOrmModule,
  ],
})
export class OrdersModule {}