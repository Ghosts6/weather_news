import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const Header: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleHomeClick = () => {
    if (location.pathname === '/') {
      const homeSection = document.getElementById('home');
      if (homeSection) {
        homeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate('/');
    }
    setIsMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 w-full z-10 transition-all duration-300 ${isScrolled ? 'bg-gray-900 bg-opacity-50 backdrop-blur-md shadow-lg border-b border-gray-800' : 'bg-transparent'} text-white`}>
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link to="/" className="text-2xl font-bold">
          Weather News
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={handleHomeClick} 
            className="relative text-lg w-fit block after:block after:content-[''] after:absolute after:h-[3px] after:bg-white after:w-full after:scale-x-0 after:hover:scale-x-100 after:transition after:duration-300 after:origin-center"
          >
            Home
          </button>
          <Link to="/weather" className="relative text-lg w-fit block after:block after:content-[''] after:absolute after:h-[3px] after:bg-white after:w-full after:scale-x-0 after:hover:scale-x-100 after:transition after:duration-300 after:origin-center">
            Weather
          </Link>
          
          {/* GitHub Button with Hover Effect */}
          <a 
            href="https://github.com/Ghosts6" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="icon-btn"
          >
            <span className="icon-container">
              <i className="fa-brands fa-github text-xl"></i>
            </span>
            <span className="icon-bg"></span>
          </a>
          
          {/* Theme Toggle Button with Hover Effect */}
          <button 
            onClick={toggleDarkMode} 
            className="icon-btn"
          >
            <span className="icon-container">
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
            </span>
            <span className="icon-bg"></span>
          </button>
        </nav>
        
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="icon-btn"
          >
            <span className="icon-container">
              <i className="fas fa-bars text-xl"></i>
            </span>
            <span className="icon-bg"></span>
          </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 bg-opacity-50 backdrop-blur-md">
          <nav className="flex flex-col items-center gap-4 p-4">
            <button onClick={handleHomeClick} className="hover:text-gray-300">Home</button>
            <Link to="/weather" className="hover:text-gray-300">Weather</Link>
            
            <a 
              href="https://github.com/Ghosts6" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="icon-btn"
            >
              <span className="icon-container">
                <i className="fa-brands fa-github text-xl"></i>
              </span>
              <span className="icon-bg"></span>
            </a>
            
            <button 
              onClick={toggleDarkMode} 
              className="icon-btn"
            >
              <span className="icon-container">
                <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-xl`}></i>
              </span>
              <span className="icon-bg"></span>
            </button>
          </nav>
        </div>
      )}
      
      <style>{`
        .icon-btn {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background-color: transparent;
          position: relative;
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .icon-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: transparent;
          backdrop-filter: blur(0px);
          letter-spacing: 0.8px;
          border-radius: 10px;
          transition: all 0.3s;
          border: 1px solid rgba(156, 156, 156, 0.466);
          position: relative;
          z-index: 1;
        }

        .icon-bg {
          position: absolute;
          content: "";
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #BF66FF 0%, #6248FF 51%, #00DDEB 100%);
          z-index: 0;
          border-radius: 10px;
          pointer-events: none;
          transition: all 0.3s;
          opacity: 0;
        }

        .icon-btn:hover .icon-bg {
          transform: rotate(35deg);
          transform-origin: bottom;
          opacity: 1;
        }

        .icon-btn:hover .icon-container {
          background-color: rgba(156, 156, 156, 0.466);
          backdrop-filter: blur(4px);
        }

        .icon-btn:active .icon-bg {
          transform: rotate(35deg) scale(0.95);
        }

        .icon-btn:active .icon-container {
          transform: scale(0.95);
        }
      `}</style>
    </header>
  );
};


export default Header;
