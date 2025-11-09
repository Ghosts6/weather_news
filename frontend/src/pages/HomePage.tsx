import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Navigation from '../components/layout/Navigation';

interface News {
  title: string;
  description: string;
  url: string;
}

interface Weather {
  city_name: string;
  description: string;
  temperature: string;
}

const SECTIONS = ['Home', 'Most Viewed', 'Current Location', 'Tornado News', 'Storm News', 'Flood News'];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [tornadoNews, setTornadoNews] = useState<News[]>([]);
  const [stormNews, setStormNews] = useState<News[]>([]);
  const [floodNews, setFloodNews] = useState<News[]>([]);
  const [userLocationWeather, setUserLocationWeather] = useState<Weather | null>(null);
  const [parisWeather, setParisWeather] = useState<Weather | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

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

    fetch('/api/get_weather_data/?city_name=Paris')
      .then((response) => response.json())
      .then((data) => setParisWeather(data));
  }, []);

  const handleSearchClick = () => {
    navigate('/weather');
  };

  const handleNavigate = (index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: index * containerRef.current.offsetWidth,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = () => {
    if (containerRef.current) {
      const index = Math.round(containerRef.current.scrollLeft / containerRef.current.offsetWidth);
      setCurrentSection(index);
    }
  };

  return (
    <Layout>
      <div
        ref={containerRef}
        className="horizontal-scroll-container"
        onScroll={handleScroll}
      >
        <section id="home" className="section bg-cover bg-center" style={{ backgroundImage: "url('/img/weather-search.jpg')" }}>
          <h1 className="text-5xl font-bold mb-4">Weather News</h1>
          <p className="text-xl mb-8">Your source for the latest weather updates.</p>
          <button onClick={handleSearchClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Search Cities
          </button>
        </section>

        <section id="most-viewed" className="section">
          <h2 className="text-4xl font-bold mb-4">Most Viewed Location</h2>
          <div className="bg-gray-800 bg-opacity-50 p-8 rounded-lg">
            <p className="text-2xl">
              {parisWeather
                ? `${parisWeather.city_name}: ${parisWeather.temperature}°C, ${parisWeather.description}`
                : 'Loading...'}
            </p>
          </div>
        </section>

        <section id="current-location" className="section">
          <h2 className="text-4xl font-bold mb-4">Current Location</h2>
          <div className="bg-gray-800 bg-opacity-50 p-8 rounded-lg">
            <p className="text-2xl">
              {userLocationWeather
                ? `${userLocationWeather.city_name}: ${userLocationWeather.temperature}°C, ${userLocationWeather.description}`
                : 'Loading...'}
            </p>
          </div>
        </section>

        <section id="tornado-news" className="section">
          <h2 className="text-4xl font-bold mb-4 text-center">Tornado News</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tornadoNews.map((news, index) => (
              <div key={index} className="bg-gray-800 bg-opacity-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">{news.title}</h3>
                <p className="mb-4">{news.description}</p>
                <a href={news.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Read more</a>
              </div>
            ))}
          </div>
        </section>

        <section id="storm-news" className="section">
          <h2 className="text-4xl font-bold mb-4 text-center">Storm News</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stormNews.map((news, index) => (
              <div key={index} className="bg-gray-800 bg-opacity-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">{news.title}</h3>
                <p className="mb-4">{news.description}</p>
                <a href={news.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Read more</a>
              </div>
            ))}
          </div>
        </section>

        <section id="flood-news" className="section">
          <h2 className="text-4xl font-bold mb-4 text-center">Flood News</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {floodNews.map((news, index) => (
              <div key={index} className="bg-gray-800 bg-opacity-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-2">{news.title}</h3>
                <p className="mb-4">{news.description}</p>
                <a href={news.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Read more</a>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Navigation sections={SECTIONS} currentSection={currentSection} onNavigate={handleNavigate} />
    </Layout>
  );
};

export default HomePage;
