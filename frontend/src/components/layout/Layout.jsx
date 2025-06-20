import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;