import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import Header from '../components/layout/Header';
import ParticlesBackground from '../components/layout/ParticlesBackground';
import HumidityIcon from '../components/icons/HumidityIcon';
import WindIcon from '../components/icons/WindIcon';
import SunriseIcon from '../components/icons/SunriseIcon';
import SunsetIcon from '../components/icons/SunsetIcon';
import PressureIcon from '../components/icons/PressureIcon';
import ClockIcon from '../components/icons/ClockIcon';

interface WeatherData {
  city_name: string;
  temperature: number;
  description: string;
  icon: string;
  city_time: string;
  wind_speed: number;
  humidity: number;
  pressure: number;
  sunrise: string;
  sunset: string;
  hourly_forecast: {
    time: string;
    temperature: number;
    description: string;
    icon: string;
  }[];
  daily_forecast: {
    date: string;
    maxtemp: number;
    mintemp: number;
    condition: string;
    icon: string;
  }[];
}

interface SearchFormProps {
  city: string;
  onCityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: (e: React.FormEvent) => void;
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  isCentered?: boolean;
  isLoading?: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ 
  city, 
  onCityChange, 
  onSearch, 
  suggestions, 
  onSuggestionClick, 
  isCentered = false,
  isLoading = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const showSuggestions = isFocused && suggestions.length > 0 && city.length > 0;

  return (
    <div className={`w-full max-w-md ${isCentered ? 'mx-auto' : 'mr-auto ml-auto'}`}>
      {isCentered && (
        <>
          <div className="mb-8 text-center">
            <div className="inline-block mb-4">
              <svg className="w-24 h-24 text-white/80 animate-bounce-up" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-4 text-white">Check the Weather</h1>
            <p className="text-xl text-white/80">Enter a city name to see the weather forecast</p>
          </div>
        </>
      )}
      
      <form onSubmit={onSearch} className="relative">
        <div className="relative group">
          <input
            ref={inputRef}
            type="search"
            value={city}
            onChange={onCityChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setTimeout(() => setIsFocused(false), 150);
            }}
            placeholder="Search for a city..."
            disabled={isLoading}
            className="w-full p-4 pr-12 rounded-full bg-white/10 text-white placeholder-white/50 border-2 border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 backdrop-blur-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isLoading || !city.trim()}
            className="absolute top-1/2 right-4 -translate-y-1/2 text-white/50 hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>        
        {showSuggestions && (
          <div 
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 bg-gray-800/95 backdrop-blur-lg rounded-2xl mt-2 border border-white/20 shadow-2xl z-50 max-h-80 overflow-y-auto animate-fadeIn"
          >
            <div className="sticky top-0 bg-gray-900/90 backdrop-blur-sm p-3 border-b border-white/10 z-10">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase text-white/50 font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {suggestions.length} Cities Found
                </p>
                <button
                  onClick={() => setIsFocused(false)}
                  className="text-white/50 hover:text-white transition-colors"
                  aria-label="Close suggestions"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-1">
              {suggestions.slice(0, 10).map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 cursor-pointer hover:bg-white/10 text-white transition-all duration-200 flex items-center gap-3 group rounded-xl m-1"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onSuggestionClick(suggestion);
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/30 transition-colors">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="flex-1 group-hover:translate-x-1 transition-transform duration-200 font-medium">{suggestion}</span>
                  <svg className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
            {suggestions.length > 10 && (
              <div className="sticky bottom-0 bg-gray-900/90 backdrop-blur-sm p-2 text-center border-t border-white/10">
                <p className="text-xs text-white/50">Showing 10 of {suggestions.length} results</p>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

const WeatherPage: React.FC = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (city.length > 0) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        fetch(`/api/search_suggestions/?city_name=${encodeURIComponent(city)}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              setSuggestions(data.suggestions);
            } else {
              setSuggestions([]);
            }
          })
          .catch((err) => {
            console.error('Error fetching suggestions:', err);
            setSuggestions([]);
          });
      }, 200);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [city]);



  const fetchWeatherData = (cityName: string) => {
    setSuggestions([]);
    setIsLoading(true);
    setWeatherData(null);
    setError(null);

    fetch(`/api/get_weather_data/?city_name=${encodeURIComponent(cityName)}`)
      .then((response) => {
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('City not found. Please check the spelling and try again.');
          } else if (response.status === 500) {
            throw new Error('Server error. Please try again later.');
          } else {
            throw new Error('Something went wrong. Please try again.');
          }
        }
        return response.json();
      })
      .then((data) => {
        if (data.error_message) {
          throw new Error(data.error_message);
        }
        setWeatherData(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setWeatherData(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    fetchWeatherData(city);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCity(suggestion);
    fetchWeatherData(suggestion);
  };

  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const hasSuggestions = suggestions.length > 0 && city.length > 0;

  return (
    <ThemeProvider>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
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
      <div className="fullscreen-container flex flex-col overflow-hidden">
        <Header />
        <main className="flex-grow flex flex-col">
          <ParticlesBackground />
          {/* Main content */}
          <div className={`relative z-10 p-4 flex-grow flex flex-col justify-start pt-[10vh] transition-all duration-300 ${(!weatherData && !isLoading && !error && hasSuggestions) ? 'pb-96' : ''}`}>
            {(!weatherData && !isLoading && !error) ? (
              <div className="flex-shrink-0">
                <SearchForm
                  isCentered={true}
                  city={city}
                  onCityChange={(e) => setCity(e.target.value)}
                  onSearch={handleSearch}
                  suggestions={suggestions}
                  onSuggestionClick={handleSuggestionClick}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <div className="w-full max-w-7xl mx-auto h-full flex flex-col">
                <div className="mb-4 flex-shrink-0">
                  <SearchForm
                    city={city}
                    onCityChange={(e) => setCity(e.target.value)}
                    onSearch={handleSearch}
                    suggestions={suggestions}
                    onSuggestionClick={handleSuggestionClick}
                    isLoading={isLoading}
                  />
                </div>
                
                <div className="flex-grow overflow-y-auto">
                  {isLoading && (
                    <div className="flex-grow flex items-center justify-center">
                      <div className="text-center">
                        <div className="inline-block w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                        <p className="text-white text-xl">Fetching weather data...</p>
                      </div>
                    </div>
                  )}
                  
                  {error && (
                    <div className="flex-grow flex items-center justify-center">
                      <div className="bg-red-500/20 border border-red-500/50 backdrop-blur-lg text-white p-6 rounded-3xl max-w-md text-center shadow-xl">
                        <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 className="text-xl font-bold mb-2">Oops!</h3>
                        <p className="text-lg">{error}</p>
                        <button
                          onClick={() => setError(null)}
                          className="mt-4 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {weatherData && !error && (
                    <div className="pr-2" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Left Column */}
                        <div className="space-y-4">
                          {/* Main Weather Card */}
                          <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-6 shadow-2xl text-white hover:bg-white/25 transition-all duration-300">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <h1 className="text-3xl font-bold">{weatherData.city_name}</h1>
                                </div>
                                <p className="text-lg text-white/80 capitalize">{weatherData.description}</p>
                              </div>
                              <div className="text-right flex-shrink-0 ml-4">
                                <p className="text-5xl font-light">{Math.round(weatherData.temperature)}°C</p>
                                <div className="flex items-center gap-1 justify-end mt-1">
                                  <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <p className="text-sm text-white/70">{weatherData.city_time.split(' ')[1]}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                  
                          {/* Weather Stats Grid */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-5 shadow-2xl text-white hover:bg-white/25 transition-all duration-300">
                              <div className="flex items-center gap-2 mb-2">
                                <HumidityIcon className="w-5 h-5 text-blue-400" />
                                <h3 className="text-xs uppercase text-white/70">Humidity</h3>
                              </div>
                              <p className="text-4xl font-light">{weatherData.humidity}%</p>
                            </div>
                                              
                            <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-5 shadow-2xl text-white hover:bg-white/25 transition-all duration-300">
                              <div className="flex items-center gap-2 mb-2">
                                <WindIcon className="w-5 h-5 text-cyan-400" />
                                <h3 className="text-xs uppercase text-white/70">Wind Speed</h3>
                              </div>
                              <p className="text-4xl font-light">{weatherData.wind_speed} m/s</p>
                            </div>
                          </div>
                  
                          {/* Additional Details */}
                          <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-5 shadow-2xl text-white hover:bg-white/25 transition-all duration-300">
                            <h3 className="text-xs uppercase text-white/70 mb-4 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              More Details
                            </h3>
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1 mb-1">
                                  <SunriseIcon className="w-5 h-5 text-orange-400" />
                                  <p className="text-sm text-white/70">Sunrise</p>
                                </div>
                                <p className="text-lg font-bold">{weatherData.sunrise}</p>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1 mb-1">
                                  <SunsetIcon className="w-5 h-5 text-purple-400" />
                                  <p className="text-sm text-white/70">Sunset</p>
                                </div>
                                <p className="text-lg font-bold">{weatherData.sunset}</p>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1 mb-1">
                                  <PressureIcon className="w-5 h-5 text-green-400" />
                                  <p className="text-sm text-white/70">Pressure</p>
                                </div>
                                <p className="text-lg font-bold">{weatherData.pressure}</p>
                                <p className="text-xs text-white/60">hPa</p>
                              </div>
                            </div>
                          </div>
                        </div>
                  
                        {/* Right Column */}
                        <div className="space-y-4">
                          {/* Hourly Forecast */}
                          <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-5 shadow-2xl text-white hover:bg-white/25 transition-all duration-300">
                            <h3 className="text-xs uppercase text-white/70 mb-4 flex items-center gap-2">
                              <ClockIcon className="w-4 h-4" fill="currentColor"/>
                              Hourly Forecast
                            </h3>
                            <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                              {(() => {
                                const now = new Date();
                                const currentHour = now.getHours();
                                const startIndex = weatherData.hourly_forecast.findIndex(
                                  (hour) => parseInt(hour.time.split(':')[0]) >= currentHour
                                );
                                const relevantHourlyForecast = weatherData.hourly_forecast.slice(
                                  startIndex !== -1 ? startIndex : 0,
                                  (startIndex !== -1 ? startIndex : 0) + 24
                                );
                                return relevantHourlyForecast.map((hour, index) => (
                                  <div key={index} className="flex-shrink-0 w-20 text-center bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-all duration-300">
                                    <p className="text-xs font-medium mb-1">{hour.time}</p>
                                    <img src={hour.icon} alt={hour.description} className="mx-auto my-1 w-10 h-10" />
                                    <p className="font-bold text-lg">{Math.round(hour.temperature)}°</p>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                  
                          {/* 3-Day Forecast */}
                          <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-3xl p-5 shadow-2xl text-white hover:bg-white/25 transition-all duration-300">
                            <h3 className="text-xs uppercase text-white/70 mb-4 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 4h-2V2h-2v2H9V2H7v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM5 7V6h14v1H5z"/>
                              </svg>
                              3-Day Forecast
                            </h3>
                            <div className="space-y-3">
                              {weatherData.daily_forecast.map((day, index) => (
                                <div key={index} className="flex items-center justify-between bg-white/5 hover:bg-white/10 p-3 rounded-2xl transition-all duration-300">
                                  <p className="w-16 font-bold text-sm">{getDayOfWeek(day.date)}</p>
                                  <div className="w-12 flex justify-center">
                                    <img src={day.icon} alt={day.condition} className="w-10 h-10" />
                                  </div>
                                  <p className="flex-1 text-center text-white/80 text-xs truncate px-2" title={day.condition}>{day.condition}</p>
                                  <p className="w-20 text-right font-bold">
                                    <span className="text-red-400">{Math.round(day.maxtemp)}°</span>
                                    <span className="text-white/50 mx-1">/</span>
                                    <span className="text-blue-400">{Math.round(day.mintemp)}°</span>
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default WeatherPage;