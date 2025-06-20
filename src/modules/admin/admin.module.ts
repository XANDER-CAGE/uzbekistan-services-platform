import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderApplication } from '../orders/entities/order-application.entity';
import { ExecutorProfile } from '../executors/entities/executor-profile.entity';
import { ServiceCategory } from '../categories/entities/service-category.entity';
import { AdminReport } from './entities/admin-report.entity';
import { UserComplaint } from './entities/user-complaint.entity';
import { SystemSettings } from './entities/system-settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Order,
      OrderApplication,
      ExecutorProfile,
      ServiceCategory,
      AdminReport,
      UserComplaint,
      SystemSettings,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService, TypeOrmModule],
})
export class AdminModule {}