import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn,
    UpdateDateColumn
  } from 'typeorm';
  import { ApiProperty } from '@nestjs/swagger';
  
  export enum SettingType {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    JSON = 'json'
  }
  
  export enum SettingCategory {
    GENERAL = 'general',           // Общие настройки
    PAYMENT = 'payment',           // Настройки платежей
    COMMISSION = 'commission',     // Настройки комиссий
    NOTIFICATION = 'notification', // Настройки уведомлений
    MODERATION = 'moderation',     // Настройки модерации
    SECURITY = 'security',         // Настройки безопасности
    FEATURES = 'features'          // Настройки функций
  }
  
  @Entity('system_settings')
  export class SystemSettings {
    @ApiProperty({ description: 'ID настройки' })
    @PrimaryGeneratedColumn()
    id: number;
  
    @ApiProperty({ description: 'Ключ настройки (уникальный)' })
    @Column({ unique: true, length: 100 })
    key: string;
  
    @ApiProperty({ description: 'Название настройки' })
    @Column({ length: 200 })
    name: string;
  
    @ApiProperty({ description: 'Описание настройки' })
    @Column({ type: 'text' })
    description: string;
  
    @ApiProperty({ description: 'Значение настройки' })
    @Column({ type: 'text' })
    value: string;
  
    @ApiProperty({ description: 'Значение по умолчанию' })
    @Column({ name: 'default_value', type: 'text' })
    defaultValue: string;
  
    @ApiProperty({ description: 'Тип данных настройки', enum: SettingType })
    @Column({ type: 'enum', enum: SettingType, default: SettingType.STRING })
    type: SettingType;
  
    @ApiProperty({ description: 'Категория настройки', enum: SettingCategory })
    @Column({ type: 'enum', enum: SettingCategory })
    category: SettingCategory;
  
    @ApiProperty({ description: 'Возможные значения (для select)', required: false })
    @Column({ name: 'possible_values', type: 'json', nullable: true })
    possibleValues?: string[];
  
    @ApiProperty({ description: 'Валидация (regex или правила)', required: false })
    @Column({ type: 'text', nullable: true })
    validation?: string;
  
    @ApiProperty({ description: 'Требует ли перезапуска системы' })
    @Column({ name: 'requires_restart', default: false })
    requiresRestart: boolean;
  
    @ApiProperty({ description: 'Доступна ли для редактирования' })
    @Column({ name: 'is_editable', default: true })
    isEditable: boolean;
  
    @ApiProperty({ description: 'Публичная ли настройка (доступна клиентам)' })
    @Column({ name: 'is_public', default: false })
    isPublic: boolean;
  
    @ApiProperty({ description: 'Порядок сортировки' })
    @Column({ name: 'sort_order', default: 0 })
    sortOrder: number;
  
    @ApiProperty()
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @ApiProperty()
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  
    // Методы для получения типизированных значений
    getBooleanValue(): boolean {
      if (this.type !== SettingType.BOOLEAN) {
        throw new Error(`Setting ${this.key} is not boolean type`);
      }
      return this.value === 'true';
    }
  
    getNumberValue(): number {
      if (this.type !== SettingType.NUMBER) {
        throw new Error(`Setting ${this.key} is not number type`);
      }
      return parseFloat(this.value);
    }
  
    getJSONValue(): any {
      if (this.type !== SettingType.JSON) {
        throw new Error(`Setting ${this.key} is not JSON type`);
      }
      return JSON.parse(this.value);
    }
  
    getStringValue(): string {
      return this.value;
    }
  
    // Установка типизированных значений
    setBooleanValue(value: boolean): void {
      if (this.type !== SettingType.BOOLEAN) {
        throw new Error(`Setting ${this.key} is not boolean type`);
      }
      this.value = value.toString();
    }
  
    setNumberValue(value: number): void {
      if (this.type !== SettingType.NUMBER) {
        throw new Error(`Setting ${this.key} is not number type`);
      }
      this.value = value.toString();
    }
  
    setJSONValue(value: any): void {
      if (this.type !== SettingType.JSON) {
        throw new Error(`Setting ${this.key} is not JSON type`);
      }
      this.value = JSON.stringify(value);
    }
  
    setStringValue(value: string): void {
      this.value = value;
    }
  
    // Валидация значения
    validate(value: string): boolean {
      if (!this.validation) return true;
  
      try {
        const regex = new RegExp(this.validation);
        return regex.test(value);
      } catch (error) {
        console.error(`Invalid regex in setting ${this.key}:`, error);
        return true;
      }
    }
  
    get categoryLabel(): string {
      const labels = {
        [SettingCategory.GENERAL]: 'Общие',
        [SettingCategory.PAYMENT]: 'Платежи',
        [SettingCategory.COMMISSION]: 'Комиссии',
        [SettingCategory.NOTIFICATION]: 'Уведомления',
        [SettingCategory.MODERATION]: 'Модерация',
        [SettingCategory.SECURITY]: 'Безопасность',
        [SettingCategory.FEATURES]: 'Функции'
      };
      return labels[this.category];
    }
  }