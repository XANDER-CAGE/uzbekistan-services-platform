import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Утилита для объединения классов CSS с правильным мерджингом Tailwind классов
 * Комбинирует clsx для условных классов и tailwind-merge для разрешения конфликтов Tailwind
 */
export function cn(...inputs) {
    return inputs
      .flat()
      .filter(Boolean)
      .join(' ');
  }

/**
 * Альтернативная утилита без tailwind-merge (если пакет не установлен)
 * Используйте эту версию, если у вас нет tailwind-merge
 */
export function cnSimple(...inputs) {
  return clsx(inputs);
}

/**
 * Утилита для создания вариантов компонентов
 * Помогает создавать системы вариантов как в shadcn/ui
 */
export function createVariants(baseClasses, variants) {
  return function(variant, size, className) {
    const variantClasses = variants[variant] || '';
    const sizeClasses = variants[size] || '';
    
    return cn(baseClasses, variantClasses, sizeClasses, className);
  };
}

/**
 * Утилита для условного применения классов
 */
export function conditionalClass(condition, trueClass, falseClass = '') {
  return condition ? trueClass : falseClass;
}

/**
 * Утилита для создания объекта классов на основе состояния
 */
export function createStateClasses(states, activeState) {
  const result = {};
  
  Object.keys(states).forEach(state => {
    result[state] = cn(
      states[state].base || '',
      activeState === state ? states[state].active || '' : states[state].inactive || ''
    );
  });
  
  return result;
}