import React from 'react';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

const Breadcrumbs = ({ items = [], showHome = true, onItemClick }) => {
  const handleClick = (item, index) => {
    if (onItemClick) {
      onItemClick(item, index);
    }
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      {showHome && (
        <>
          <button
            onClick={() => handleClick({ name: 'Главная', path: '/' }, -1)}
            className="flex items-center hover:text-primary-600 transition-colors"
          >
            <HomeIcon className="w-4 h-4" />
          </button>
          {items.length > 0 && (
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          )}
        </>
      )}

      {items.map((item, index) => (
        <React.Fragment key={item.id || index}>
          {index === items.length - 1 ? (
            <span className="font-medium text-gray-900">
              {item.name}
            </span>
          ) : (
            <>
              <button
                onClick={() => handleClick(item, index)}
                className="hover:text-primary-600 transition-colors"
              >
                {item.name}
              </button>
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            </>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;