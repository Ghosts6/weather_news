import React, { useState, useEffect } from 'react';
import { Weather } from '../../interfaces/Weather';
import WeatherIcon from './WeatherIcon';

const CITIES = ['Toronto', 'Ottawa', 'Paris', 'London', 'New York', 'Tokyo'];

const MostViewed: React.FC = () => {
  const [weatherData, setWeatherData] = useState<Weather[]>([]);
  const [selectedCity, setSelectedCity] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const data = await Promise.all(
          CITIES.map(async (city) => {
            const response = await fetch(`/api/get_weather_data/?city_name=${city}`);
            if (!response.ok) {
              throw new Error(`Failed to fetch weather for ${city}`);
            }
            return response.json();
          })
        );
        setWeatherData(data);
        setSelectedCity(data[0]);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  const handleCityClick = (city: Weather) => {
    setSelectedCity(city);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-white text-2xl">Loading popular locations...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-4 h-[80vh] flex flex-col">
      <div className="text-center mb-8">
        <div className="inline-block relative">
          <h2 className="text-5xl font-light text-white mb-2">Popular Locations</h2>
          <div className="h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start flex-grow overflow-y-auto scrollbar-thin lg:overflow-y-visible">
        {/* City List */}
        <div className="lg:col-span-1 bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 flex flex-col h-full">
          <h3 className="text-white text-xl font-medium mb-4">Locations</h3>
          <ul className="space-y-2">
            {weatherData.map((weather) => (
              <li
                key={weather.city_name}
                onClick={() => handleCityClick(weather)}
                className={`cursor-pointer p-3 rounded-xl transition-all flex justify-between items-center ${
                  selectedCity?.city_name === weather.city_name
                    ? 'bg-blue-500/40 shadow-md'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <div>
                  <p className="text-white text-md font-semibold">{weather.city_name}</p>
                  <p className="text-white/70 text-xs">{weather.description}</p>
                </div>
                <p className="text-white text-2xl font-light">{Math.round(weather.temperature)}°</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Selected City Weather Details */}
        <div className="lg:col-span-2 flex flex-col h-full">
          {selectedCity && (
            <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl overflow-hidden flex-grow flex flex-col">
              {/* Main Weather Info */}
              <div className="p-6 md:p-8 text-center relative flex-shrink-0">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                  <img src={`/img/weather-search.jpg`} alt="background" className="w-full h-full object-cover"/>
                </div>
                <div className="relative z-10">
                  <h3 className="text-4xl md:text-5xl font-bold text-white mb-2 break-words">{selectedCity.city_name}</h3>
                  <p className="text-7xl md:text-8xl font-light text-white mb-3">{Math.round(selectedCity.temperature)}°C</p>
                  <div className="flex items-center justify-center gap-3">
                    <WeatherIcon iconCode={selectedCity.icon} className="w-12 h-12 text-white" />
                    <p className="text-xl text-white/80 capitalize">{selectedCity.description}</p>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-black/20 p-4 grid grid-cols-2 gap-4 border-t border-white/20 flex-shrink-0">
                <div className="text-center">
                  <p className="text-white/70 text-xs uppercase tracking-wider">Humidity</p>
                  <p className="text-white text-2xl font-semibold">{selectedCity.humidity}%</p>
                </div>
                <div className="text-center">
                  <p className="text-white/70 text-xs uppercase tracking-wider">Wind Speed</p>
                  <p className="text-white text-2xl font-semibold">{selectedCity.wind_speed.toFixed(1)} m/s</p>
                </div>
              </div>

              {/* Hourly Forecast */}
              <div className="p-4 flex-grow overflow-y-auto custom-scrollbar">
                <h4 className="text-white text-md font-medium mb-3 px-2">Hourly Forecast</h4>
                <div className="flex overflow-x-auto space-x-3 pb-2">
                  {selectedCity.hourly_forecast.map((hour, index) => (
                    <div key={index} className="flex-shrink-0 bg-white/10 rounded-xl p-3 text-center w-24">
                      <p className="text-white/80 text-xs">{hour.time}</p>
                      <img src={hour.icon} alt="hourly icon" className="w-10 h-10 mx-auto" />
                      <p className="text-white text-lg font-bold">{Math.round(hour.temperature)}°C</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MostViewed;
