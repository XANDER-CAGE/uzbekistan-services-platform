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
  import { User } from '../../users/entities/user.entity';
  
  export enum ReportType {
    USER_STATISTICS = 'user_statistics',           // Статистика пользователей
    ORDER_STATISTICS = 'order_statistics',         // Статистика заказов
    FINANCIAL_REPORT = 'financial_report',         // Финансовый отчет
    EXECUTOR_PERFORMANCE = 'executor_performance', // Производительность исполнителей
    CATEGORY_ANALYSIS = 'category_analysis',       // Анализ категорий
    COMPLAINT_SUMMARY = 'complaint_summary',       // Сводка жалоб
    SYSTEM_HEALTH = 'system_health',               // Состояние системы
    CUSTOM = 'custom'                              // Пользовательский отчет
  }
  
  export enum ReportStatus {
    PENDING = 'pending',     // Ожидает генерации
    GENERATING = 'generating', // Генерируется
    COMPLETED = 'completed', // Завершен
    FAILED = 'failed',       // Ошибка
    EXPIRED = 'expired'      // Истек
  }
  
  export enum ReportFormat {
    JSON = 'json',
    CSV = 'csv',
    XLSX = 'xlsx',
    PDF = 'pdf'
  }
  
  @Entity('admin_reports')
  export class AdminReport {
    @ApiProperty({ description: 'ID отчета' })
    @PrimaryGeneratedColumn()
    id: number;
  
    @ApiProperty({ description: 'Название отчета' })
    @Column({ length: 200 })
    name: string;
  
    @ApiProperty({ description: 'Описание отчета' })
    @Column({ type: 'text' })
    description: string;
  
    @ApiProperty({ description: 'Тип отчета', enum: ReportType })
    @Column({ type: 'enum', enum: ReportType })
    type: ReportType;
  
    @ApiProperty({ description: 'Статус отчета', enum: ReportStatus })
    @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
    status: ReportStatus;
  
    @ApiProperty({ description: 'Формат отчета', enum: ReportFormat })
    @Column({ type: 'enum', enum: ReportFormat, default: ReportFormat.JSON })
    format: ReportFormat;
  
    // Кто создал отчет
    @ApiProperty({ description: 'ID администратора, создавшего отчет' })
    @Column({ name: 'created_by' })
    createdBy: number;
  
    @ManyToOne(() => User, { eager: true })
    @JoinColumn({ name: 'created_by' })
    creator: User;
  
    // Параметры отчета
    @ApiProperty({ description: 'Дата начала периода', required: false })
    @Column({ name: 'date_from', nullable: true })
    dateFrom?: Date;
  
    @ApiProperty({ description: 'Дата окончания периода', required: false })
    @Column({ name: 'date_to', nullable: true })
    dateTo?: Date;
  
    @ApiProperty({ description: 'Дополнительные фильтры (JSON)', required: false })
    @Column({ type: 'json', nullable: true })
    filters?: Record<string, any>;
  
    @ApiProperty({ description: 'Параметры генерации (JSON)', required: false })
    @Column({ type: 'json', nullable: true })
    parameters?: Record<string, any>;
  
    // Результаты
    @ApiProperty({ description: 'Данные отчета (JSON)', required: false })
    @Column({ type: 'json', nullable: true })
    data?: Record<string, any>;
  
    @ApiProperty({ description: 'Путь к файлу отчета', required: false })
    @Column({ name: 'file_path', nullable: true, length: 500 })
    filePath?: string;
  
    @ApiProperty({ description: 'Размер файла в байтах', required: false })
    @Column({ name: 'file_size', nullable: true })
    fileSize?: number;
  
    @ApiProperty({ description: 'Количество записей в отчете', required: false })
    @Column({ name: 'records_count', nullable: true })
    recordsCount?: number;
  
    // Метаданные
    @ApiProperty({ description: 'Время начала генерации', required: false })
    @Column({ name: 'started_at', nullable: true })
    startedAt?: Date;
  
    @ApiProperty({ description: 'Время завершения генерации', required: false })
    @Column({ name: 'completed_at', nullable: true })
    completedAt?: Date;
  
    @ApiProperty({ description: 'Время истечения отчета', required: false })
    @Column({ name: 'expires_at', nullable: true })
    expiresAt?: Date;
  
    @ApiProperty({ description: 'Сообщение об ошибке', required: false })
    @Column({ name: 'error_message', type: 'text', nullable: true })
    errorMessage?: string;
  
    @ApiProperty({ description: 'Процент выполнения (0-100)', required: false })
    @Column({ name: 'progress_percent', default: 0 })
    progressPercent: number;
  
    @ApiProperty({ description: 'Количество скачиваний' })
    @Column({ name: 'download_count', default: 0 })
    downloadCount: number;
  
    @ApiProperty({ description: 'Дата последнего скачивания', required: false })
    @Column({ name: 'last_downloaded_at', nullable: true })
    lastDownloadedAt?: Date;
  
    @ApiProperty()
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @ApiProperty()
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  
    // Методы
    get isCompleted(): boolean {
      return this.status === ReportStatus.COMPLETED;
    }
  
    get isFailed(): boolean {
      return this.status === ReportStatus.FAILED;
    }
  
    get isExpired(): boolean {
      return this.status === ReportStatus.EXPIRED || 
             (!!this.expiresAt && this.expiresAt < new Date());
    }
  
    get isDownloadable(): boolean {
      return this.isCompleted && !this.isExpired && !!this.filePath;
    }
  
    get generationDuration(): number | null {
      if (!this.startedAt || !this.completedAt) return null;
      return this.completedAt.getTime() - this.startedAt.getTime();
    }
  
    get formattedFileSize(): string {
      if (!this.fileSize) return 'N/A';
      
      const units = ['B', 'KB', 'MB', 'GB'];
      let size = this.fileSize;
      let unitIndex = 0;
      
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      
      return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
  
    get typeLabel(): string {
      const labels = {
        [ReportType.USER_STATISTICS]: 'Статистика пользователей',
        [ReportType.ORDER_STATISTICS]: 'Статистика заказов',
        [ReportType.FINANCIAL_REPORT]: 'Финансовый отчет',
        [ReportType.EXECUTOR_PERFORMANCE]: 'Производительность исполнителей',
        [ReportType.CATEGORY_ANALYSIS]: 'Анализ категорий',
        [ReportType.COMPLAINT_SUMMARY]: 'Сводка жалоб',
        [ReportType.SYSTEM_HEALTH]: 'Состояние системы',
        [ReportType.CUSTOM]: 'Пользовательский отчет'
      };
      return labels[this.type];
    }
  
    get statusLabel(): string {
      const labels = {
        [ReportStatus.PENDING]: 'Ожидает',
        [ReportStatus.GENERATING]: 'Генерируется',
        [ReportStatus.COMPLETED]: 'Готов',
        [ReportStatus.FAILED]: 'Ошибка',
        [ReportStatus.EXPIRED]: 'Истек'
      };
      return labels[this.status];
    }
  }