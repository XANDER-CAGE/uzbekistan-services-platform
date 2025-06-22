import React, { useState, useRef, useEffect } from 'react';
import { 
  CloudArrowUpIcon,
  XMarkIcon,
  DocumentIcon,
  PhotoIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Button from './Button';
import { 
  validateFiles, 
  createFilePreview, 
  cleanupPreviews,
  formatFileSize,
  isImageFile 
} from '../../common/utils/file-upload.utils';

const FileUpload = ({
  config,
  multiple = false,
  accept,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024,
  allowedTypes = ['image/*'],
  onFilesChange,
  onError,
  disabled = false,
  label = 'Загрузить файлы',
  description = 'Перетащите файлы сюда или нажмите для выбора',
  className = ''
}) => {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const uploadConfig = config || {
    maxSize,
    allowedTypes,
    maxFiles: multiple ? maxFiles : 1
  };

  useEffect(() => {
    // Очистка URL объектов при размонтировании
    return () => {
      cleanupPreviews(previews);
    };
  }, [previews]);

  const handleFiles = async (fileList) => {
    const fileArray = Array.from(fileList);
    
    // Проверяем общее количество файлов
    const totalFiles = files.length + fileArray.length;
    if (totalFiles > uploadConfig.maxFiles) {
      onError?.(new Error(`Максимальное количество файлов: ${uploadConfig.maxFiles}`));
      return;
    }

    const { validFiles, errors } = await validateFiles(fileArray, uploadConfig);
    
    if (errors.length > 0) {
      onError?.(new Error(errors.join('\n')));
    }

    if (validFiles.length > 0) {
      const newFiles = multiple ? [...files, ...validFiles] : validFiles;
      const newPreviews = validFiles.map(createFilePreview);
      
      setFiles(newFiles);
      setPreviews(prev => multiple ? [...prev, ...newPreviews] : newPreviews);
      onFilesChange?.(newFiles);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles) {
      handleFiles(droppedFiles);
    }
  };

  const handleInputChange = (e) => {
    if (disabled) return;
    
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      handleFiles(selectedFiles);
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    
    // Очищаем URL удаляемого превью
    if (previews[index]?.preview) {
      URL.revokeObjectURL(previews[index].preview);
    }
    
    setFiles(newFiles);
    setPreviews(newPreviews);
    onFilesChange?.(newFiles);
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getAcceptString = () => {
    if (accept) return accept;
    if (uploadConfig.allowedTypes) {
      return uploadConfig.allowedTypes.join(',');
    }
    return 'image/*';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-primary-400 bg-primary-50'
            : disabled
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={getAcceptString()}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="text-center">
          <CloudArrowUpIcon className={`mx-auto h-12 w-12 ${
            disabled ? 'text-gray-300' : 'text-gray-400'
          }`} />
          
          <div className="mt-4">
            <Button
              type="button"
              variant="primary"
              onClick={openFileDialog}
              disabled={disabled || (files.length >= uploadConfig.maxFiles)}
            >
              Выбрать файлы
            </Button>
          </div>
          
          <p className={`mt-2 text-sm ${
            disabled ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {description}
          </p>
          
          <p className="mt-1 text-xs text-gray-500">
            Максимум {uploadConfig.maxFiles} файлов, до {formatFileSize(uploadConfig.maxSize)} каждый
          </p>
        </div>
      </div>

      {/* File Previews */}
      {previews.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Выбранные файлы ({previews.length})
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div
                key={preview.id}
                className="relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Remove button */}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>

                {/* Preview */}
                <div className="mb-3">
                  {preview.isImage ? (
                    <div className="relative">
                      <img
                        src={preview.preview}
                        alt={preview.name}
                        className="w-full h-32 object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded flex items-center justify-center">
                        <EyeIcon className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                      <DocumentIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* File info */}
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate" title={preview.name}>
                    {preview.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {preview.formattedSize}
                  </p>
                  {preview.extension && (
                    <p className="text-xs text-gray-400 uppercase">
                      {preview.extension}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-blue-700">Загрузка файлов...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;