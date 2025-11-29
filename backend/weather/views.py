from django.core.cache import cache
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
from .custom_exceptions import APIException, BadRequest, NotFound, ServiceUnavailable
from .utils import (
    kelvin_to_celsius,
    get_news,
    fetch_user_ip,
    get_location_from_ip,
    get_timezone_data,
    fetch_weather_by_coordinates,
    format_weather_data,
    get_weather_data_for_city,
    get_session,
    get_city_list,
)

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

def get_user_location(request, latitude, longitude):
    return JsonResponse({"status": "success", "message": "Location received successfully."})

@cache_page(900, key_prefix="weather_data") # Cache for 15 minutes
def get_weather_data(request):
    city_name = request.GET.get('city_name', '').strip()

    if not city_name:
        raise BadRequest('City name is required')

    if not API_KEY or not WEATHER_API_KEY_2:
        raise ServiceUnavailable("API keys for weather data not configured.")

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
                    raise ServiceUnavailable(f'Error fetching data from {url}') from e

    weather_response = fetch_with_retry(weather_url)
    weather_data = weather_response.json()

    if weather_data.get('cod') != 200:
        raise NotFound('City Not Found')

    temperature = kelvin_to_celsius(weather_data.get('main', {}).get('temp', 0))
    description = weather_data.get('weather', [{}])[0].get('description', '')
    icon = weather_data.get('weather', [{}])[0].get('icon', '')
    wind_speed = weather_data.get('wind', {}).get('speed', 0)
    humidity = weather_data.get('main', {}).get('humidity', 0)
    pressure = weather_data.get('main', {}).get('pressure', 0)

    city_timezone_offset = weather_data.get('timezone')
    city_tz = pytz.FixedOffset(city_timezone_offset / 60)
    city_time = datetime.now(city_tz).strftime('%Y-%m-%d %H:%M:%S')

    sunrise_ts = weather_data.get('sys', {}).get('sunrise')
    sunset_ts = weather_data.get('sys', {}).get('sunset')

    sunrise = 'N/A'
    sunset = 'N/A'
    if sunrise_ts:
        sunrise = datetime.fromtimestamp(sunrise_ts, city_tz).strftime('%H:%M')
    if sunset_ts:
        sunset = datetime.fromtimestamp(sunset_ts, city_tz).strftime('%H:%M')

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
        'timezone': city_timezone_offset,
        'hourly_forecast': hourly_forecast,
        'daily_forecast': daily_forecast,
        'pressure': pressure,
        'sunrise': sunrise,
        'sunset': sunset,
    }
    return JsonResponse(response_data)
def get_time_zone(request):
    city_name = request.GET.get('city_name', '').strip()

    if not city_name:
        raise BadRequest('City name is required')

    timezone = get_timezone_data(city_name)

    if timezone:
        return JsonResponse({'city_name': city_name, 'timezone': timezone})
    else:
        raise NotFound('Could not fetch timezone data')

def get_news_view(request):
    query = request.GET.get('query', '')
    if not query:
        raise BadRequest('Query is required')

    if not NEWS_API_KEY:
        raise ServiceUnavailable("API key for news data not configured.")

    if query.lower() in ['tornado', 'storm', 'flood']:
        query = f'{query} AND (weather OR disaster OR warning OR damage OR alert)'
    
    news = get_news(query, count=6)
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
                logger.error(f"Error processing location: {e}")

    # If we are here, it means we failed to get user's location or weather.
    # Let's return weather for Toronto as a fallback.
    weather_data = get_weather_data_for_city("Toronto")
    if weather_data and "error" not in weather_data:
        return JsonResponse(weather_data)

    raise ServiceUnavailable('Failed to determine your location and fallback location.')

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
        raise ServiceUnavailable("API key not configured")
    
    # Construct the OpenWeatherMap tile URL
    url = f"https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={api_key}"
    
    try:
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
        raise ServiceUnavailable("Request timeout")
        
    except requests.exceptions.RequestException as e:
        raise ServiceUnavailable("Error fetching tile")


@cache_page(60 * 60)
@require_http_methods(["GET"])
def map_tile_proxy_optimized(request, layer, z, x, y):
    """
    Optimized proxy using connection pooling.
    """
    api_key = os.getenv('API_KEY')
    
    if not api_key:
        raise ServiceUnavailable("API key not configured")
    
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
        raise ServiceUnavailable("Request timeout")
        
    except requests.exceptions.RequestException as e:
        raise ServiceUnavailable("Error fetching tile")

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
        raise ServiceUnavailable(f"Error in search_suggestions: {e}")