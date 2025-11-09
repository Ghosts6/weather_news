import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';

interface WeatherData {
  city_name: string;
  temperature: number;
  description: string;
  icon: string;
  city_time: string;
  wind_speed: number;
  humidity: number;
  hourly_forecast: {
    time: string;
    temperature: number;
    description: string;
    icon: string;
  }[];
}

const WeatherPage: React.FC = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (city.length > 2) {
      fetch(`/api/search_suggestions/?city_name=${city}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setSuggestions(data.suggestions);
          }
        });
    } else {
      setSuggestions([]);
    }
  }, [city]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSuggestions([]);
    fetch(`/api/get_weather_data/?city_name=${city}`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('City not found');
      })
      .then((data) => {
        setWeatherData(data);
        setShowResult(true);
        setShowError(false);
      })
      .catch(() => {
        setShowError(true);
        setShowResult(false);
      });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCity(suggestion);
    setSuggestions([]);
  };

  const handleTryAgain = () => {
    setShowResult(false);
    setShowError(false);
    setCity('');
    setWeatherData(null);
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        {!showResult && !showError && (
          <div className="flex flex-col items-center justify-center text-white text-center p-8">
            <h1 className="text-5xl font-bold mb-4">Check the Weather</h1>
            <p className="text-xl mb-8">Enter a city name to see the weather forecast.</p>
            <form onSubmit={handleSearch} className="w-full max-w-md">
              <div className="relative">
                <input
                  type="search"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Search for a city"
                  className="w-full p-4 rounded-full bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-gray-800 rounded-lg mt-2">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-4 cursor-pointer hover:bg-gray-700"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
                Search
              </button>
            </form>
          </div>
        )}

        {showResult && weatherData && (
          <div>
            <div className="text-center text-white mb-8">
              <h2 className="text-4xl font-bold">{weatherData.city_name}</h2>
              <p className="text-2xl">{weatherData.description}</p>
              <p className="text-6xl font-bold">{weatherData.temperature.toFixed(1)}°C</p>
              <p>Local Time: {weatherData.city_time}</p>
            </div>

            <div>
              <h3 className="text-2xl text-white font-bold mb-4">Hourly Forecast</h3>
              <div className="flex overflow-x-auto space-x-4 p-4">
                {weatherData.hourly_forecast.map((hour, index) => (
                  <div key={index} className="flex-shrink-0 w-32 text-center bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                    <p>{hour.time}</p>
                    <img src={hour.icon} alt={hour.description} className="mx-auto" />
                    <p>{hour.temperature.toFixed(1)}°C</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center mt-8">
              <button onClick={handleTryAgain} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
                Search another city
              </button>
            </div>
          </div>
        )}

        {showError && (
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">City Not Found</h2>
            <p className="text-xl mb-8">Sorry, we couldn't find the weather for that city. Please try again.</p>
            <button onClick={handleTryAgain} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">
              Try Again
            </button>
          </div>
        )}
        <div className="text-center mt-8">
          <button onClick={handleHomeClick} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full">
            Home
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default WeatherPage;
