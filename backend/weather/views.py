from django.views.decorators.cache import cache_page
from datetime import datetime, timedelta
from django.shortcuts import render, redirect
from django.http import JsonResponse
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderUnavailable
import json
import pytz
import requests
import time
import os

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
            return "Fallback City, Fallback Region, Fallback Country"
        else:
            print(f"Failed IP location fetch. Status Code: {response.status_code}")
    except Exception as e:
        print(f"Error during IP geolocation: {e}")
    return "Location Unavailable"

def get_weather_data(request):
    city_name = request.GET.get('city_name', '').strip()

    if city_name:
        weather_url = f'http://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={API_KEY}'
        weatherapi_url = f'https://api.weatherapi.com/v1/forecast.json?key={WEATHER_API_KEY_2}&q={city_name}&hours=12'

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

            city_timezone = weather_data.get('timezone', 0)
            utc_time = datetime.utcnow() + timedelta(seconds=city_timezone)
            city_time = utc_time.strftime('%Y-%m-%d %H:%M:%S')

            weatherapi_response = fetch_with_retry(weatherapi_url)
            weatherapi_data = weatherapi_response.json()

            hourly_forecast = []
            if 'forecast' in weatherapi_data and 'forecastday' in weatherapi_data['forecast']:
                for hour in weatherapi_data['forecast']['forecastday'][0]['hour'][:12]:
                    hour_data = {
                        'time': hour['time'].split(' ')[1],
                        'temperature': hour['temp_c'],
                        'description': hour['condition']['text'],
                        'icon': hour['condition']['icon'],
                    }
                    hourly_forecast.append(hour_data)

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
            "temperature": f"{temperature:.2f}°C",
            "feels_like": f"{feels_like:.2f}°C",
            "humidity": f"{humidity}%",
            "wind_speed": f"{wind_speed:.2f} m/s",
        }
    except KeyError as e:
        print(f"Error formatting weather data: {e}")
        return {"error": "Incomplete weather data."}

def get_news_view(request):
    query = request.GET.get('query', '')
    if not query:
        return JsonResponse({'error_message': 'Query is required'}, status=400)
    
    news = get_news(query)
    return JsonResponse({'news': news})

def get_user_location_view(request):
    user_ip = fetch_user_ip()
    if user_ip:
        location_string = get_location_from_ip(user_ip)
        if location_string:
            try:
                city_name = location_string.split(',')[0]
                weather_data = get_weather_data_for_city(city_name)
                if weather_data:
                    return JsonResponse(weather_data)
                else:
                    return JsonResponse({'error_message': 'Failed to fetch weather data for your location'}, status=500)
            except Exception as e:
                return JsonResponse({'error_message': f'Error processing location: {str(e)}'}, status=500)
    
    return JsonResponse({'error_message': 'Failed to determine your location'}, status=500)

def get_weather_data_for_city(city_name):
    weather_url = f'http://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={API_KEY}'
    try:
        response = requests.get(weather_url)
        if response.status_code == 200:
            return format_weather_data(response.json())
    except Exception as e:
        print(f"Error fetching weather data for {city_name}: {e}")
    return None

def search_suggestions(request):
    city_name = request.GET.get('city_name', '').lower()

    try:
        json_path = 'backend/climate/fixture/city.list.json.txt'

        try:
            with open(json_path, 'r', encoding='utf-8') as file:
                cities = json.load(file)
        except FileNotFoundError:
            url = "https://bulk.openweathermap.org/sample/city.list.json.gz"
            response = requests.get(url)
            if response.status_code == 200:
                cities = json.loads(response.text)
            else:
                return JsonResponse({'success': False, 'error': f"Failed to fetch data from URL: {url}"})

        suggestions = [city['name'] for city in cities if city_name in city['name'].lower()]
        return JsonResponse({'success': True, 'suggestions': suggestions})

    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Error parsing JSON'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})