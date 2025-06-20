import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const footerLinks = {
    'Для заказчиков': [
      { name: 'Как заказать услугу', href: '/help/how-to-order' },
      { name: 'Безопасность', href: '/safety' },
      { name: 'Гарантии', href: '/guarantees' },
    ],
    'Для исполнителей': [
      { name: 'Стать исполнителем', href: '/become-executor' },
      { name: 'Правила работы', href: '/executor-rules' },
      { name: 'Как получать заказы', href: '/help/get-orders' },
    ],
    'Поддержка': [
      { name: 'Помощь', href: '/help' },
      { name: 'Контакты', href: '/contacts' },
      { name: 'Блог', href: '/blog' },
    ],
    'Компания': [
      { name: 'О нас', href: '/about' },
      { name: 'Вакансии', href: '/careers' },
      { name: 'Партнерам', href: '/partners' },
    ],
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">У</span>
              </div>
              <span className="text-xl font-bold text-gray-900">УслугиУз</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Платформа для поиска и заказа бытовых услуг в Узбекистане. 
              Надежные исполнители, прозрачные цены, гарантия качества.
            </p>
          </div>

          {/* Footer links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-gray-900 mb-3">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-600 hover:text-primary-600 text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-6 text-sm text-gray-600">
              <Link to="/privacy" className="hover:text-primary-600 transition-colors">
                Политика конфиденциальности
              </Link>
              <Link to="/terms" className="hover:text-primary-600 transition-colors">
                Пользовательское соглашение
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                © 2024 УслугиУз. Все права защищены.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;