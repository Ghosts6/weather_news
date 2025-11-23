import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import HorizontalScroll from '../components/layout/HorizontalScroll';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { ThemeProvider } from '../context/ThemeContext';
import ParticlesBackground from '../components/layout/ParticlesBackground';
import MostViewed from '../components/layout/MostViewed';
import WeatherMap from '../components/layout/WeatherMap';

interface News {
  title: string;
  description: string;
  url: string;
}

import { Weather } from '../interfaces/Weather';

const SECTIONS = ['Home', 'Most Viewed', 'Weather Map', 'Tornado News', 'Storm News', 'Flood News'];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [tornadoNews, setTornadoNews] = useState<News[]>([]);
  const [stormNews, setStormNews] = useState<News[]>([]);
  const [floodNews, setFloodNews] = useState<News[]>([]);
  const [userLocationWeather, setUserLocationWeather] = useState<Weather | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [isProgrammaticScroll, setIsProgrammaticScroll] = useState(false);

  useEffect(() => {
    fetch('/api/get_news/?query=tornado')
      .then((response) => response.json())
      .then((data) => setTornadoNews(data.news));

    fetch('/api/get_news/?query=storm')
      .then((response) => response.json())
      .then((data) => setStormNews(data.news));

    fetch('/api/get_news/?query=flood')
      .then((response) => response.json())
      .then((data) => setFloodNews(data.news));

    fetch('/api/get_user_location/')
      .then((response) => response.json())
      .then((data) => setUserLocationWeather(data));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sectionRefs.current.indexOf(entry.target as HTMLElement);
            if (index !== -1) {
              setCurrentSection(index);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.7,
      }
    );

    sectionRefs.current.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      sectionRefs.current.forEach((section) => {
        if (section) {
          observer.unobserve(section);
        }
      });
    };
  }, [isProgrammaticScroll, sectionRefs]);

  const handleSearchClick = () => {
    navigate('/weather');
  };

  const handleNavigate = (index: number) => {
    setIsProgrammaticScroll(true);
    const sectionId = SECTIONS[index].toLowerCase().replace(/ /g, '-');
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
    setCurrentSection(index);
    setTimeout(() => {
      setIsProgrammaticScroll(false);
    }, 1000); // Duration of smooth scroll
  };

  const handleScroll = (scrollLeft: number) => {
    if (isProgrammaticScroll) return;
    const sectionWidth = window.innerWidth;
    const index = Math.round(scrollLeft / sectionWidth);
    setCurrentSection(index);
  };

  const handleSectionChange = (index: number) => {
    handleNavigate(index);
  };

  return (
    <ThemeProvider>
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
      <div className="fullscreen-container">
        <Header />
        <main>
          <ParticlesBackground />
          <HorizontalScroll 
            onScroll={handleScroll}
            currentSection={currentSection}
            onSectionChange={handleSectionChange}
          >
            {SECTIONS.map((section, index) => (
              <section
                key={index}
                id={section.toLowerCase().replace(/ /g, '-')}
                ref={(el) => (sectionRefs.current[index] = el)}
                className="section"
              >
                {index === 0 && (
                  <div className="w-full max-w-md mx-auto px-4 py-8">
                    {/* Location Header */}
                    <div className="text-center mb-8">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        <span className="text-white text-sm font-medium">HOME</span>
                      </div>
                      <h1 className="text-6xl font-light text-white mb-2">
                        {userLocationWeather?.city_name || 'Loading...'}
                      </h1>
                      <p className="text-4xl font-light text-white">
                        {userLocationWeather?.temperature ? `${Math.round(userLocationWeather.temperature)}°` : '--°'}
                        <span className="text-2xl ml-2">
                          | Feels Like: {userLocationWeather?.temperature ? `${Math.round(userLocationWeather.temperature)}°` : '--°'}
                        </span>
                      </p>
                    </div>

                    {/* Weather Info Widget with Background */}
                    <div className="relative bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 mb-4 shadow-xl overflow-hidden">
                      <div className="absolute inset-0 opacity-20">
                        <img src="/img/weather.avif" alt="Weather" className="w-full h-full object-cover" />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                          <svg className="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                          <span className="text-white/90 text-sm uppercase tracking-wide font-medium">Current Weather</span>
                        </div>
                        <p className="text-white text-2xl font-light mb-2">
                          {userLocationWeather?.description || 'Loading weather...'}
                        </p>
                      </div>
                    </div>

                    {/* Humidity and Pressure Widgets */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {/* Humidity Widget */}
                      <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-xl">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                          <span className="text-white/70 text-xs uppercase tracking-wide">Humidity</span>
                        </div>
                        <p className="text-white text-5xl font-light mb-2">79%</p>
                        <p className="text-white/80 text-sm">Comfortable humidity level</p>
                      </div>

                      {/* Wind Widget */}
                      <div className="relative bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-xl overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                          <img src="/img/wind.png" alt="Wind" className="w-full h-full object-cover" />
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            <span className="text-white/70 text-xs uppercase tracking-wide">Wind</span>
                          </div>
                          <p className="text-white text-4xl font-light mb-1">12</p>
                          <p className="text-white/80 text-sm">km/h NW</p>
                        </div>
                      </div>
                    </div>

                    {/* Search Widget */}
                    <div 
                      onClick={handleSearchClick}
                      className="relative bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-xl overflow-hidden cursor-pointer hover:bg-white/30 transition-all group"
                    >
                      <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                        <img src="/img/weather-search.jpg" alt="Search" className="w-full h-full object-cover" />
                      </div>
                      <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-white text-lg font-medium mb-1">Search Cities</h3>
                          <p className="text-white/70 text-sm">Find weather for any location</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {index === 1 && (
                  <MostViewed />
                )}

                {index === 2 && (
                  <WeatherMap isActive={currentSection === 2} />
                )}

                {index === 3 && (
                  <div className="w-full max-w-6xl mx-auto px-4 py-8 overflow-x-auto scrollbar-thin pb-4">
                    <div className="text-center mb-8">
                      <div className="inline-block relative">
                        <h2 className="text-5xl font-light text-white mb-2">Tornado News</h2>
                        <div className="h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent rounded-full"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tornadoNews.map((news, idx) => (
                        <div 
                          key={idx} 
                          className="relative bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-xl hover:bg-white/30 transition-all overflow-hidden group"
                        >
                          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                            <img src="/img/tornado.jpg" alt="Tornado" className="w-full h-full object-cover" />
                          </div>
                          <div className="relative z-10">
                            <h3 className="text-xl font-medium text-white mb-3 break-words">{news.title}</h3>
                            <p className="text-white/80 text-sm mb-4 line-clamp-3 break-words">{news.description}</p>
                            <a 
                              href={news.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm font-medium"
                            >
                              Read more 
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {index === 4 && (
                  <div className="w-full max-w-6xl mx-auto px-4 py-8 overflow-x-auto scrollbar-thin pb-4">
                    <div className="text-center mb-8">
                      <div className="inline-block relative">
                        <h2 className="text-5xl font-light text-white mb-2">Storm News</h2>
                        <div className="h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {stormNews.map((news, idx) => (
                        <div 
                          key={idx} 
                          className="relative bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-xl hover:bg-white/30 transition-all overflow-hidden group"
                        >
                          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                            <img src="/img/storm.jpg" alt="Storm" className="w-full h-full object-cover" />
                          </div>
                          <div className="relative z-10">
                            <h3 className="text-xl font-medium text-white mb-3 break-words">{news.title}</h3>
                            <p className="text-white/80 text-sm mb-4 line-clamp-3 break-words">{news.description}</p>
                            <a 
                              href={news.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm font-medium"
                            >
                              Read more 
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {index === 5 && (
                  <div className="w-full max-w-6xl mx-auto px-4 py-8 overflow-x-auto scrollbar-thin pb-4">
                    <div className="text-center mb-8">
                      <div className="inline-block relative">
                        <h2 className="text-5xl font-light text-white mb-2">Flood News</h2>
                        <div className="h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent rounded-full"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {floodNews.map((news, idx) => (
                        <div 
                          key={idx} 
                          className="relative bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-xl hover:bg-white/30 transition-all overflow-hidden group"
                        >
                          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                            <img src="/img/flood.jpg" alt="Flood" className="w-full h-full object-cover" />
                          </div>
                          <div className="relative z-10">
                            <h3 className="text-xl font-medium text-white mb-3 break-words">{news.title}</h3>
                            <p className="text-white/80 text-sm mb-4 line-clamp-3 break-words">{news.description}</p>
                            <a 
                              href={news.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm font-medium"
                            >
                              Read more 
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}
          </HorizontalScroll>
        </main>
        <Footer navigation={<Navigation sections={SECTIONS} currentSection={currentSection} onNavigate={handleNavigate} />} />
      </div>
    </ThemeProvider>
  );
};

export default HomePage;