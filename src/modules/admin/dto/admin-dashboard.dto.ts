import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsEnum,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';
import { 
  ComplaintType, 
  ComplaintPriority, 
  ComplaintStatus 
} from '../entities/user-complaint.entity';
import { 
  ReportType, 
  ReportFormat 
} from '../entities/admin-report.entity';
import { 
  SettingCategory, 
  SettingType 
} from '../entities/system-settings.entity';

// DTO для создания жалобы
export class CreateComplaintDto {
  @ApiProperty({ 
    description: 'ID пользователя, на которого жалоба',
    example: 123 
  })
  @IsNumber({}, { message: 'ID должен быть числом' })
  @Type(() => Number)
  reportedUserId: number;

  @ApiProperty({ 
    description: 'ID связанного заказа',
    example: 456,
    required: false 
  })
  @IsOptional()
  @IsNumber({}, { message: 'ID должен быть числом' })
  @Type(() => Number)
  orderId?: number;

  @ApiProperty({ 
    description: 'Тип жалобы',
    enum: ComplaintType 
  })
  @IsEnum(ComplaintType, { message: 'Неверный тип жалобы' })
  type: ComplaintType;

  @ApiProperty({ 
    description: 'Приоритет жалобы',
    enum: ComplaintPriority,
    required: false 
  })
  @IsOptional()
  @IsEnum(ComplaintPriority)
  priority?: ComplaintPriority;

  @ApiProperty({ 
    description: 'Заголовок жалобы',
    example: 'Исполнитель не выполнил работу качественно' 
  })
  @IsString({ message: 'Заголовок должен быть строкой' })
  title: string;

  @ApiProperty({ 
    description: 'Подробное описание жалобы',
    example: 'Исполнитель выполнил работу некачественно, не соответствует договоренностям...' 
  })
  @IsString({ message: 'Описание должно быть строкой' })
  description: string;

  @ApiProperty({ 
    description: 'Прикрепленные файлы',
    type: [String],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

// DTO для обновления жалобы администратором
export class UpdateComplaintDto {
  @ApiProperty({ 
    description: 'Статус жалобы',
    enum: ComplaintStatus,
    required: false 
  })
  @IsOptional()
  @IsEnum(ComplaintStatus)
  status?: ComplaintStatus;

  @ApiProperty({ 
    description: 'Приоритет жалобы',
    enum: ComplaintPriority,
    required: false 
  })
  @IsOptional()
  @IsEnum(ComplaintPriority)
  priority?: ComplaintPriority;

  @ApiProperty({ 
    description: 'Комментарий администратора',
    required: false 
  })
  @IsOptional()
  @IsString()
  adminComment?: string;

  @ApiProperty({ 
    description: 'Решение по жалобе',
    required: false 
  })
  @IsOptional()
  @IsString()
  resolution?: string;

  @ApiProperty({ 
    description: 'ID назначенного администратора',
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  assignedAdminId?: number;
}

// DTO для создания отчета
export class CreateReportDto {
  @ApiProperty({ 
    description: 'Название отчета',
    example: 'Статистика заказов за январь 2024' 
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Описание отчета',
    example: 'Подробная статистика по заказам за январь 2024 года',
    required: false 
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Тип отчета',
    enum: ReportType 
  })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({ 
    description: 'Формат отчета',
    enum: ReportFormat,
    required: false 
  })
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @ApiProperty({ 
    description: 'Дата начала периода',
    required: false 
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ 
    description: 'Дата окончания периода',
    required: false 
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiProperty({ 
    description: 'Дополнительные фильтры',
    required: false 
  })
  @IsOptional()
  filters?: Record<string, any>;

  @ApiProperty({ 
    description: 'Параметры генерации',
    required: false 
  })
  @IsOptional()
  parameters?: Record<string, any>;
}

// DTO для обновления системных настроек
export class UpdateSettingDto {
  @ApiProperty({ 
    description: 'Новое значение настройки' 
  })
  @IsString()
  value: string;
}

// DTO для создания системной настройки
export class CreateSettingDto {
  @ApiProperty({ 
    description: 'Ключ настройки',
    example: 'commission_rate' 
  })
  @IsString()
  key: string;

  @ApiProperty({ 
    description: 'Название настройки',
    example: 'Ставка комиссии' 
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Описание настройки',
    example: 'Процент комиссии, взимаемый с исполнителей' 
  })
  @IsString()
  description: string;

  @ApiProperty({ 
    description: 'Значение настройки',
    example: '10' 
  })
  @IsString()
  value: string;

  @ApiProperty({ 
    description: 'Значение по умолчанию',
    example: '10' 
  })
  @IsString()
  defaultValue: string;

  @ApiProperty({ 
    description: 'Тип данных',
    enum: SettingType 
  })
  @IsEnum(SettingType)
  type: SettingType;

  @ApiProperty({ 
    description: 'Категория настройки',
    enum: SettingCategory 
  })
  @IsEnum(SettingCategory)
  category: SettingCategory;

  @ApiProperty({ 
    description: 'Возможные значения',
    required: false 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  possibleValues?: string[];

  @ApiProperty({ 
    description: 'Правила валидации',
    required: false 
  })
  @IsOptional()
  @IsString()
  validation?: string;

  @ApiProperty({ 
    description: 'Требует ли перезапуска',
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  requiresRestart?: boolean;

  @ApiProperty({ 
    description: 'Доступна ли для редактирования',
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  isEditable?: boolean;

  @ApiProperty({ 
    description: 'Публичная ли настройка',
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

// DTO для фильтрации жалоб
export class ComplaintsFilterDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiProperty({ enum: ComplaintStatus, required: false })
  @IsOptional()
  @IsEnum(ComplaintStatus)
  status?: ComplaintStatus;

  @ApiProperty({ enum: ComplaintType, required: false })
  @IsOptional()
  @IsEnum(ComplaintType)
  type?: ComplaintType;

  @ApiProperty({ enum: ComplaintPriority, required: false })
  @IsOptional()
  @IsEnum(ComplaintPriority)
  priority?: ComplaintPriority;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  reporterId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  reportedUserId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  assignedAdminId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

// DTO для статистики дашборда
export class DashboardStatsDto {
  @ApiProperty({ description: 'Период для статистики (в днях)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  @Type(() => Number)
  days?: number = 30;

  @ApiProperty({ description: 'Включить детальную аналитику', required: false })
  @IsOptional()
  @IsBoolean()
  detailed?: boolean = false;
}