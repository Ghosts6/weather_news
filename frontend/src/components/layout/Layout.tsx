import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="w-full h-full">
      <Header />
      <main className="w-full h-full">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
