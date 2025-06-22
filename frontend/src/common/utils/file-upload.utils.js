// Утилиты для работы с загрузкой файлов

/**
 * Валидация изображений
 */
export const validateImage = (file, options = {}) => {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB по умолчанию
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      maxWidth = 2048,
      maxHeight = 2048
    } = options;
  
    return new Promise((resolve, reject) => {
      // Проверка размера файла
      if (file.size > maxSize) {
        reject(new Error(`Файл слишком большой. Максимальный размер: ${(maxSize / 1024 / 1024).toFixed(1)}MB`));
        return;
      }
  
      // Проверка типа файла
      if (!allowedTypes.includes(file.type)) {
        reject(new Error(`Неподдерживаемый тип файла. Разрешены: ${allowedTypes.join(', ')}`));
        return;
      }
  
      // Проверка размеров изображения
      const img = new Image();
      img.onload = () => {
        if (img.width > maxWidth || img.height > maxHeight) {
          reject(new Error(`Изображение слишком большое. Максимальный размер: ${maxWidth}x${maxHeight}px`));
          return;
        }
        resolve(true);
      };
      img.onerror = () => {
        reject(new Error('Поврежденный файл изображения'));
      };
      img.src = URL.createObjectURL(file);
    });
  };
  
  /**
   * Изменение размера изображения
   */
  export const resizeImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
  
      img.onload = () => {
        // Вычисляем новые размеры с сохранением пропорций
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
  
        canvas.width = width;
        canvas.height = height;
  
        // Рисуем изображение на canvas
        ctx.drawImage(img, 0, 0, width, height);
  
        // Конвертируем в blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              }));
            } else {
              reject(new Error('Ошибка при изменении размера изображения'));
            }
          },
          file.type,
          quality
        );
      };
  
      img.onerror = () => {
        reject(new Error('Ошибка загрузки изображения'));
      };
  
      img.src = URL.createObjectURL(file);
    });
  };
  
  /**
   * Предварительный просмотр изображения
   */
  export const getImagePreview = (file) => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Файл не является изображением'));
        return;
      }
  
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.readAsDataURL(file);
    });
  };
  
  /**
   * Конфигурации для multer (используются в компонентах)
   */
  export const fileUploadConfigs = {
    avatar: {
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
      maxWidth: 512,
      maxHeight: 512
    },
    portfolio: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      maxWidth: 2048,
      maxHeight: 2048,
      maxFiles: 10
    },
    documents: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      maxFiles: 5
    }
  };
  
  /**
   * Форматирование размера файла
   */
  export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  /**
   * Получение расширения файла
   */
  export const getFileExtension = (fileName) => {
    return fileName.slice((fileName.lastIndexOf('.') - 1 >>> 0) + 2);
  };
  
  /**
   * Проверка, является ли файл изображением
   */
  export const isImageFile = (file) => {
    return file.type.startsWith('image/');
  };
  
  /**
   * Создание превью для загруженных файлов
   */
  export const createFilePreview = (file) => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      extension: getFileExtension(file.name),
      isImage: isImageFile(file),
      preview: isImageFile(file) ? URL.createObjectURL(file) : null,
      formattedSize: formatFileSize(file.size)
    };
  };
  
  /**
   * Очистка URL объектов (для предотвращения утечек памяти)
   */
  export const cleanupPreviews = (previews) => {
    previews.forEach(preview => {
      if (preview.preview) {
        URL.revokeObjectURL(preview.preview);
      }
    });
  };
  
  /**
   * Валидация нескольких файлов
   */
  export const validateFiles = async (files, config) => {
    const errors = [];
    const validFiles = [];
  
    // Проверка количества файлов
    if (config.maxFiles && files.length > config.maxFiles) {
      errors.push(`Максимальное количество файлов: ${config.maxFiles}`);
      return { validFiles: [], errors };
    }
  
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        if (isImageFile(file)) {
          await validateImage(file, config);
        } else {
          // Валидация неизображений
          if (file.size > config.maxSize) {
            throw new Error(`Файл "${file.name}" слишком большой`);
          }
          
          if (config.allowedTypes && !config.allowedTypes.includes(file.type)) {
            throw new Error(`Неподдерживаемый тип файла "${file.name}"`);
          }
        }
        
        validFiles.push(file);
      } catch (error) {
        errors.push(error.message);
      }
    }
  
    return { validFiles, errors };
  };