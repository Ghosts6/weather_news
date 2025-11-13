import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { ThemeProvider } from '../../context/ThemeContext';
import ParticlesBackground from './ParticlesBackground';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <ParticlesBackground />
      <div className="w-full h-full">
        <Header />
        <main className="w-full h-full">
          <ParticlesBackground />
          {children}
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default Layout;

