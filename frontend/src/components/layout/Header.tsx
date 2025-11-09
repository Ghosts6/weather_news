import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }

    const handleScroll = () => {
      // Since we are scrolling horizontally, we need to check the scrollLeft property
      // of the container. However, the header is not aware of the scroll container.
      // A better approach would be to pass the scroll position as a prop to the header.
      // For now, let's assume the header should be styled as if it's scrolled.
      setIsScrolled(true);
    };

    // We will not listen to the window scroll event anymore.
    // Instead, we will rely on a prop to be passed to the header.
    // For now, we will just set it to true.
    handleScroll();

  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-10 transition-all duration-300 ${isScrolled ? 'bg-gray-900 bg-opacity-50 backdrop-blur-md shadow-lg border-b border-gray-800' : 'bg-transparent'} text-white`}>
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link to="/" className="text-2xl font-bold">
          Weather News
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="relative text-lg w-fit block after:block after:content-[''] after:absolute after:h-[3px] after:bg-white after:w-full after:scale-x-0 after:hover:scale-x-100 after:transition after:duration-300 after:origin-center">Home</Link>
          <Link to="/weather" className="relative text-lg w-fit block after:block after:content-[''] after:absolute after:h-[3px] after:bg-white after:w-full after:scale-x-0 after:hover:scale-x-100 after:transition after:duration-300 after:origin-center">Weather</Link>
          <a href="https://github.com/Ghosts6" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
            <i className="fa-brands fa-github text-2xl"></i>
          </a>
          <button onClick={toggleDarkMode} className="focus:outline-none">
            <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-2xl`}></i>
          </button>
        </nav>
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="focus:outline-none">
            <i className="fas fa-bars text-2xl"></i>
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 bg-opacity-50 backdrop-blur-md">
          <nav className="flex flex-col items-center gap-4 p-4">
            <Link to="/" className="hover:text-gray-300">Home</Link>
            <Link to="/weather" className="hover:text-gray-300">Weather</Link>
            <a href="https://github.com/Ghosts6" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
              <i className="fa-brands fa-github text-2xl"></i>
            </a>
            <button onClick={toggleDarkMode} className="focus:outline-none">
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-2xl`}></i>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

