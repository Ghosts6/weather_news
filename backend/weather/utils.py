import os
import requests
import logging
import gzip
import json
from datetime import datetime, timedelta
from django.conf import settings
from functools import wraps
from django.core.cache import cache
import hashlib

logger = logging.getLogger(__name__)

API_KEY = os.getenv('API_KEY')
NEWS_API_KEY = os.getenv('NEWS_API_KEY')
TIMEZONE_API_URL = 'https://geocode.xyz/{city_name}?json=1&timezone=1'
MAX_RETRIES = 3
TIMEOUT = 10

def redis_cache(timeout):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            key_parts = [func.__name__] + list(args) + sorted(kwargs.items())
            key = hashlib.md5(json.dumps(key_parts).encode('utf-8')).hexdigest()
            
            # Check if the result is in the cache
            result = cache.get(key)
            if result is not None:
                return result
            
            # If not, call the function and store the result in the cache
            result = func(*args, **kwargs)
            cache.set(key, result, timeout)
            return result
        return wrapper
    return decorator

def kelvin_to_celsius(kelvin):
    """Convert temperature from Kelvin to Celsius."""
    return kelvin - 273.15

@redis_cache(timeout=14400)
def get_news(query, count=5):
    news_url = f"https://newsapi.org/v2/everything?q={query}&apiKey={NEWS_API_KEY}&pageSize={count}"
    try:
        response = requests.get(news_url)
        
        if response.status_code == 200:
            news_data = response.json()
            articles = news_data.get('articles', [])
            
            news_list = [
                {
                    'title': article.get('title', 'N/A'),
                    'description': article.get('description', 'N/A'),
                    'url': article.get('url', '#')
                }
                for article in articles
            ]
            return news_list
        
        elif response.status_code == 401:
            logger.warning("Invalid API Key for News API.")
        else:
            logger.error(f"Error fetching news: {response.status_code} - {response.text}")
    except Exception as e:
        logger.error(f"Error fetching news: {e}")
    
    return []

@redis_cache(timeout=86400)
def fetch_user_ip():
    try:
        response = requests.get('https://httpbin.org/ip')
        if response.status_code == 200:
            return response.json().get('origin', '')
    except Exception as e:
        logger.error(f"Error fetching IP: {e}")
    return None

@redis_cache(timeout=86400)
def get_location_from_ip(user_ip):
    try:
        ip_api_url = f"https://ipapi.co/{user_ip}/json/"
        response = requests.get(ip_api_url)
        
        if response.status_code == 200:
            data = response.json()
            return f"{data.get('city', 'Unknown City')}, {data.get('region', 'Unknown Region')}, {data.get('country_name', 'Unknown Country')}"
        elif response.status_code == 429:
            logger.warning("Rate limit exceeded. Falling back to default location.")
            return "Toronto, Ontario, Canada"
        else:
            logger.error(f"Failed IP location fetch. Status Code: {response.status_code}")
    except Exception as e:
        logger.error(f"Error during IP geolocation: {e}")
    return "Location Unavailable"

@redis_cache(timeout=604800)
def get_timezone_data(city_name):
    try:
        response = requests.get(TIMEZONE_API_URL.format(city_name=city_name))
        response_data = response.json()

        if response_data.get('timezone'):
            return response_data['timezone']
        else:
            return None
    except Exception as e:
        return None

@redis_cache(timeout=600)
def fetch_weather_by_coordinates(lat, lon):
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}"
        response = requests.get(url)
        
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 401:
            logger.warning("Invalid API Key for OpenWeather API.")
        else:
            logger.error(f"Error fetching weather: {response.status_code} - {response.text}")
    except Exception as e:
        logger.error(f"Error fetching weather by coordinates: {e}")
    return None

def format_weather_data(weather_data):
    try:
        city_name = weather_data['name']
        description = weather_data['weather'][0]['description']
        temperature = kelvin_to_celsius(weather_data['main']['temp'])
        feels_like = kelvin_to_celsius(weather_data['main']['feels_like'])
        humidity = weather_data['main']['humidity']
        wind_speed = weather_data['wind']['speed']

        return {
            "city_name": city_name,
            "description": description,
            "temperature": temperature,
            "feels_like": feels_like,
            "humidity": humidity,
            "wind_speed": wind_speed,
        }
    except KeyError as e:
        logger.error(f"Error formatting weather data: {e}")
        return {"error": "Incomplete weather data."}

@redis_cache(timeout=600)
def get_weather_data_for_city(city_name):
    if not API_KEY:
        logger.error("API_KEY for OpenWeather is not set.")
        return None
    weather_url = f'http://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={API_KEY}'
    try:
        response = requests.get(weather_url)
        if response.status_code == 200:
            return format_weather_data(response.json())
        else:
            logger.error(f"Error fetching weather data for {city_name}: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        logger.error(f"Error fetching weather data for {city_name}: {e}")
    return None


_session = None

def get_session():
    """Get or create a requests session for connection pooling."""
    global _session
    if _session is None:
        _session = requests.Session()
        # Configure connection pooling
        adapter = requests.adapters.HTTPAdapter(
            pool_connections=10,
            pool_maxsize=20,
            max_retries=3
        )
        _session.mount('https://', adapter)
    return _session


def get_city_list():
    """
    Loads the city list from cache. If not available, it fetches from the remote URL and caches it.
    """
    cities = cache.get('city_list')
    if cities is not None:
        return cities

    # If not in cache, fetch and cache it
    url = "https://bulk.openweathermap.org/sample/city.list.json.gz"
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        decompressed_content = gzip.decompress(response.content)
        cities = json.loads(decompressed_content.decode('utf-8'))

        cache.set('city_list', cities, timeout=None) # Cache forever
        logger.info("City list fetched and cached successfully.")
    except (requests.RequestException, json.JSONDecodeError, gzip.BadGzipFile) as e:
        logger.error(f"Failed to fetch or process new city list: {e}")
        cities = [] # Fallback to empty list
            
    return cities
