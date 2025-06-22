import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

const CategoryCard = ({ 
  category, 
  size = 'normal', 
  showDescription = true,
  showServicesCount = true,
  onClick
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(category);
    }
  };

  const sizeClasses = {
    small: 'p-4',
    normal: 'p-6',
    large: 'p-8'
  };

  const iconSizes = {
    small: 'w-10 h-10 text-2xl',
    normal: 'w-12 h-12 text-3xl',
    large: 'w-16 h-16 text-4xl'
  };

  return (
    <div
      onClick={handleClick}
      className={`
        bg-white rounded-xl border border-gray-200 cursor-pointer 
        transition-all duration-200 hover:shadow-lg hover:border-primary-300
        group ${sizeClasses[size]}
      `}
    >
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Иконка категории */}
        <div 
          className={`
            ${iconSizes[size]} rounded-2xl flex items-center justify-center
            group-hover:scale-110 transition-transform duration-200
          `}
          style={{ backgroundColor: category.color || '#3B82F6' }}
        >
          {category.iconUrl ? (
            category.iconUrl.startsWith('http') ? (
              <img 
                src={category.iconUrl} 
                alt={category.nameRu} 
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-white text-inherit">
                {category.iconUrl}
              </span>
            )
          ) : (
            <span className="text-white font-bold">
              {category.nameRu?.charAt(0) || '?'}
            </span>
          )}
        </div>

        {/* Название категории */}
        <div>
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base group-hover:text-primary-600 transition-colors">
            {category.nameRu}
          </h3>
          {category.nameUz && (
            <p className="text-xs text-gray-500 mt-1">
              {category.nameUz}
            </p>
          )}
        </div>

        {/* Описание */}
        {showDescription && category.descriptionRu && (
          <p className="text-xs text-gray-600 line-clamp-2 max-w-full">
            {category.descriptionRu}
          </p>
        )}

        {/* Количество услуг */}
        {showServicesCount && (
          <div className="flex items-center space-x-1 text-primary-600">
            <span className="text-xs font-medium">
              {category.servicesCount || 0} услуг
            </span>
            <ChevronRightIcon className="w-3 h-3" />
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;