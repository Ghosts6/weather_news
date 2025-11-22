from django.views.decorators.cache import cache_page
from django.views.decorators.http import require_http_methods
from datetime import datetime, timedelta
from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderUnavailable
from functools import lru_cache
import json
import pytz
import requests
import time
import os
import gzip
from django.conf import settings

import logging
logger = logging.getLogger(__name__)

# Load environment variables
API_KEY = os.getenv('API_KEY')
NEWS_API_KEY = os.getenv('NEWS_API_KEY')
WEATHER_API_KEY = os.getenv('WEATHER_API_KEY')
WEATHER_API_KEY_2 = os.getenv('WEATHER_API_KEY_2')

# variables
MAX_RETRIES = 3
TIMEOUT = 10 

# Pre define url
TIMEZONE_API_URL = 'https://geocode.xyz/{city_name}?json=1&timezone=1'

### HELPER FUNCTIONS ###

def kelvin_to_celsius(kelvin):
    """Convert temperature from Kelvin to Celsius."""
    return kelvin - 273.15

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
            print("Invalid API Key for News API.")
        else:
            print(f"Error fetching news: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error fetching news: {e}")
    
    return []

def fetch_user_ip():
    try:
        response = requests.get('https://httpbin.org/ip')
        if response.status_code == 200:
            return response.json().get('origin', '')
    except Exception as e:
        print(f"Error fetching IP: {e}")
    return None

def get_user_location(request, latitude, longitude):
    return JsonResponse({"status": "success", "message": "Location received successfully."})

def get_location_from_ip(user_ip):
    try:
        ip_api_url = f"https://ipapi.co/{user_ip}/json/"
        response = requests.get(ip_api_url)
        
        if response.status_code == 200:
            data = response.json()
            return f"{data.get('city', 'Unknown City')}, {data.get('region', 'Unknown Region')}, {data.get('country_name', 'Unknown Country')}"
        elif response.status_code == 429:
            print("Rate limit exceeded. Falling back to default location.")
            return "Toronto, Ontario, Canada"
        else:
            print(f"Failed IP location fetch. Status Code: {response.status_code}")
    except Exception as e:
        print(f"Error during IP geolocation: {e}")
    return "Location Unavailable"

def get_weather_data(request):
    city_name = request.GET.get('city_name', '').strip()

    if city_name:
        weather_url = f'http://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={API_KEY}'
        weatherapi_url = f'https://api.weatherapi.com/v1/forecast.json?key={WEATHER_API_KEY_2}&q={city_name}&days=3'

        def fetch_with_retry(url, retries=MAX_RETRIES):
            for attempt in range(retries):
                try:
                    response = requests.get(url, timeout=TIMEOUT)
                    response.raise_for_status()  
                    return response
                except requests.RequestException as e:
                    if attempt < retries - 1:  
                        time.sleep(2 ** attempt)  
                    else:
                        raise e  

        try:
            weather_response = fetch_with_retry(weather_url)
            weather_data = weather_response.json()

            if weather_data.get('cod') != 200:
                return JsonResponse({'error_message': 'City Not Found'}, status=404)

            temperature = kelvin_to_celsius(weather_data.get('main', {}).get('temp', 0))
            description = weather_data.get('weather', [{}])[0].get('description', '')
            icon = weather_data.get('weather', [{}])[0].get('icon', '')
            wind_speed = weather_data.get('wind', {}).get('speed', 0)
            humidity = weather_data.get('main', {}).get('humidity', 0)
            pressure = weather_data.get('main', {}).get('pressure', 0)

            city_timezone = weather_data.get('timezone')
            utc_time = datetime.utcnow() + timedelta(seconds=city_timezone)
            city_time = utc_time.strftime('%Y-%m-%d %H:%M:%S')
            
            sunrise_ts = weather_data.get('sys', {}).get('sunrise')
            sunset_ts = weather_data.get('sys', {}).get('sunset')

            sunrise = 'N/A'
            sunset = 'N/A'
            if sunrise_ts and city_timezone is not None:
                sunrise = (datetime.utcfromtimestamp(sunrise_ts) + timedelta(seconds=city_timezone)).strftime('%H:%M')
            if sunset_ts and city_timezone is not None:
                sunset = (datetime.utcfromtimestamp(sunset_ts) + timedelta(seconds=city_timezone)).strftime('%H:%M')

            weatherapi_response = fetch_with_retry(weatherapi_url)
            weatherapi_data = weatherapi_response.json()

            hourly_forecast = []
            if 'forecast' in weatherapi_data and 'forecastday' in weatherapi_data['forecast'] and weatherapi_data['forecast']['forecastday']:
                for hour in weatherapi_data['forecast']['forecastday'][0]['hour']:
                    hour_data = {
                        'time': hour['time'].split(' ')[1],
                        'temperature': hour['temp_c'],
                        'description': hour['condition']['text'],
                        'icon': hour['condition']['icon'],
                    }
                    hourly_forecast.append(hour_data)

            daily_forecast = []
            if 'forecast' in weatherapi_data and 'forecastday' in weatherapi_data['forecast']:
                for day in weatherapi_data['forecast']['forecastday']:
                    day_data = {
                        'date': day['date'],
                        'maxtemp': day['day']['maxtemp_c'],
                        'mintemp': day['day']['mintemp_c'],
                        'condition': day['day']['condition']['text'],
                        'icon': day['day']['condition']['icon'],
                    }
                    daily_forecast.append(day_data)

            response_data = {
                'city_name': city_name,
                'temperature': temperature,
                'description': description,
                'icon': icon,
                'city_time': city_time,
                'wind_speed': wind_speed,
                'humidity': humidity,
                'timezone': city_timezone,
                'hourly_forecast': hourly_forecast,
                'daily_forecast': daily_forecast,
                'pressure': pressure,
                'sunrise': sunrise,
                'sunset': sunset,
            }
            return JsonResponse(response_data)

        except Exception as e:
            return JsonResponse({'error_message': f'Error fetching data: {str(e)}'}, status=500)

    return JsonResponse({'error_message': 'City name is required'}, status=400)

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

def get_time_zone(request):
    city_name = request.GET.get('city_name', '').strip()

    if city_name:
        timezone = get_timezone_data(city_name)

        if timezone:
            return JsonResponse({'city_name': city_name, 'timezone': timezone})
        else:
            return JsonResponse({'error_message': 'Could not fetch timezone data'}, status=404)

    return JsonResponse({'error_message': 'City name is required'}, status=400)

def fetch_weather_by_coordinates(lat, lon):
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}"
        response = requests.get(url)
        
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 401:
            print("Invalid API Key for OpenWeather API.")
        else:
            print(f"Error fetching weather: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Error fetching weather by coordinates: {e}")
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
        print(f"Error formatting weather data: {e}")
        return {"error": "Incomplete weather data."}

def get_news_view(request):
    query = request.GET.get('query', '')
    if not query:
        return JsonResponse({'error_message': 'Query is required'}, status=400)

    if query.lower() in ['tornado', 'storm', 'flood']:
        query = f'{query} AND (weather OR disaster OR warning OR damage OR alert)'
    
    news = get_news(query)
    return JsonResponse({'news': news})

def get_user_location_view(request):
    user_ip = fetch_user_ip()
    if user_ip:
        location_string = get_location_from_ip(user_ip)
        if location_string and location_string != "Location Unavailable" and "Unknown" not in location_string:
            try:
                city_name = location_string.split(',')[0]
                weather_data = get_weather_data_for_city(city_name)
                if weather_data and "error" not in weather_data:
                    return JsonResponse(weather_data)
            except Exception as e:
                print(f"Error processing location: {e}")

    # If we are here, it means we failed to get user's location or weather.
    # Let's return weather for Toronto as a fallback.
    weather_data = get_weather_data_for_city("Toronto")
    if weather_data and "error" not in weather_data:
        return JsonResponse(weather_data)

    return JsonResponse({'error_message': 'Failed to determine your location and fallback location.'}, status=500)

def get_weather_data_for_city(city_name):
    if not API_KEY:
        print("API_KEY for OpenWeather is not set.")
        return None
    weather_url = f'http://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={API_KEY}'
    try:
        response = requests.get(weather_url)
        if response.status_code == 200:
            return format_weather_data(response.json())
        else:
            print(f"Error fetching weather data for {city_name}: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Error fetching weather data for {city_name}: {e}")
    return None

# Cache tiles for 1 hour (3600 seconds)
@cache_page(60 * 60)
@require_http_methods(["GET"])
def map_tile_proxy(request, layer, z, x, y):
    """
    Proxy for OpenWeatherMap tiles with caching and error handling.
    
    Args:
        layer: Weather layer type (temp_new, precipitation_new, wind_new, clouds_new)
        z: Zoom level
        x: Tile X coordinate
        y: Tile Y coordinate
    """
    api_key = os.getenv('API_KEY')
    
    if not api_key:
        logger.error("API_KEY not found in environment variables")
        return HttpResponse("API key not configured", status=500)
    
    # Construct the OpenWeatherMap tile URL
    url = f"https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={api_key}"
    
    try:
        # Use a session for connection pooling (better performance)
        # You should create this session once at module level in production
        response = requests.get(
            url,
            stream=True,
            timeout=5,  # 5 second timeout
            headers={
                'User-Agent': 'WeatherApp/1.0',
            }
        )
        response.raise_for_status()
        
        # Create response with proper caching headers
        django_response = HttpResponse(
            response.content,
            content_type=response.headers.get('Content-Type', 'image/png')
        )
        
        # Add cache headers for browser caching
        django_response['Cache-Control'] = 'public, max-age=3600'  # Cache for 1 hour
        django_response['Expires'] = response.headers.get('Expires', '')
        
        return django_response
        
    except requests.exceptions.Timeout:
        logger.error(f"Timeout fetching tile: {layer}/{z}/{x}/{y}")
        return HttpResponse("Request timeout", status=504)
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching tile {layer}/{z}/{x}/{y}: {str(e)}")
        return HttpResponse("Error fetching tile", status=500)


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


@cache_page(60 * 60)
@require_http_methods(["GET"])
def map_tile_proxy_optimized(request, layer, z, x, y):
    """
    Optimized proxy using connection pooling.
    """
    api_key = os.getenv('API_KEY')
    
    if not api_key:
        logger.error("API_KEY not found in environment variables")
        return HttpResponse("API key not configured", status=500)
    
    url = f"https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={api_key}"
    
    try:
        session = get_session()
        response = session.get(
            url,
            stream=True,
            timeout=5,
            headers={'User-Agent': 'WeatherApp/1.0'}
        )
        response.raise_for_status()
        
        django_response = HttpResponse(
            response.content,
            content_type=response.headers.get('Content-Type', 'image/png')
        )
        
        # Aggressive caching
        django_response['Cache-Control'] = 'public, max-age=3600'
        django_response['ETag'] = f'"{layer}-{z}-{x}-{y}"'
        
        return django_response
        
    except requests.exceptions.Timeout:
        logger.error(f"Timeout fetching tile: {layer}/{z}/{x}/{y}")
        return HttpResponse("Request timeout", status=504)
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching tile {layer}/{z}/{x}/{y}: {str(e)}")
        return HttpResponse("Error fetching tile", status=500)

_city_list_cache = None

CITY_LIST_CACHE_DURATION = timedelta(days=7) # Refresh city list every 7 days

def get_city_list():
    """
    Loads the city list into an in-memory cache to avoid disk I/O on every request.
    It uses a file-based cache as a backing store, which is populated from a remote URL if it doesn't exist or is too old.
    """
    global _city_list_cache
    if _city_list_cache is not None:
        return _city_list_cache

    cache_dir = settings.BASE_DIR / 'cache'
    json_path = cache_dir / 'city.list.json'
    
    cities = None
    file_needs_refresh = True

    if os.path.exists(json_path):
        try:
            mod_time = datetime.fromtimestamp(os.path.getmtime(json_path))
            if datetime.now() - mod_time < CITY_LIST_CACHE_DURATION:
                with open(json_path, 'r', encoding='utf-8') as file:
                    cities = json.load(file)
                file_needs_refresh = False
            else:
                logger.info(f"City list cache file is older than {CITY_LIST_CACHE_DURATION.days} days. Refreshing...")
        except (json.JSONDecodeError, UnicodeDecodeError):
            logger.warning("City list cache file is corrupt. Refreshing...")
            cities = None  # File is corrupt, will be overwritten

    if file_needs_refresh or cities is None:
        url = "https://bulk.openweathermap.org/sample/city.list.json.gz"
        try:
            response = requests.get(url)
            response.raise_for_status()
            
            decompressed_content = gzip.decompress(response.content)
            cities = json.loads(decompressed_content.decode('utf-8'))

            os.makedirs(cache_dir, exist_ok=True)
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(cities, f)
            logger.info("City list cache file refreshed successfully.")
        except (requests.RequestException, json.JSONDecodeError, gzip.BadGzipFile) as e:
            logger.error(f"Failed to fetch or process new city list: {e}")
            if os.path.exists(json_path) and cities is None: 
                try:
                    with open(json_path, 'r', encoding='utf-8') as file:
                        cities = json.load(file)
                        logger.warning("Using old/corrupted city list due to failed refresh.")
                except Exception:
                    cities = [] # Fallback to empty list
            else:
                cities = [] # Fallback to empty list
            
    _city_list_cache = cities
    return _city_list_cache
def search_suggestions(request):
    city_name = request.GET.get('city_name', '').lower()

    if not city_name:
        return JsonResponse({'success': True, 'suggestions': []})

    try:
        cities = get_city_list()
        
        # Filter cities and limit the number of suggestions
        suggestions = [city['name'] for city in cities if city_name in city['name'].lower()]
        return JsonResponse({'success': True, 'suggestions': suggestions[:10]}) # Limit to 10

    except Exception as e:
        logger.error(f"Error in search_suggestions: {e}")
        return JsonResponse({'success': False, 'error': str(e)})