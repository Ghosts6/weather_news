from django.shortcuts import render , redirect
from django.http import HttpResponse
from django.http import JsonResponse
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderUnavailable
from datetime import datetime
import json
import pytz
import requests
import os

def get_news(api_key, query, count=5):
    news_url = f'https://newsapi.org/v2/everything?q={query}&apiKey={api_key}&pageSize={count}'
    response = requests.get(news_url)

    if response.status_code == 200:
        news_data = response.json()
        articles = news_data.get('articles', [])

        news_list = []
        for article in articles:
            title = article.get('title', 'N/A')
            description = article.get('description', 'N/A')
            url = article.get('url', '#')

            news_list.append({
                'title': title,
                'description': description,
                'url': url,
            })
        return news_list
    else:
        print(f"Failed to fetch news for {query}. Status code: {response.status_code}")
        print(response.text)
        return None



def home(request):
    api_key = '0f00a482322f82d0c38ea32028a6eada'  
    cities = ['London', 'Toronto', 'Dubai', 'Tehran', 'New York', 'Los Angeles']
    weather_news_list = []
    paris_url = f'http://api.openweathermap.org/data/2.5/weather?q=Paris&appid={api_key}'
    paris_response = requests.get(paris_url)

    if paris_response.status_code == 200:
        paris_data = paris_response.json()
        city_name = paris_data['name']
        weather_description = paris_data['weather'][0]['description']
        temperature = kelvin_to_celsius(paris_data['main']['temp'])
        feels_like = kelvin_to_celsius(paris_data['main']['feels_like'])
        humidity = paris_data['main']['humidity']
        wind_speed = paris_data['wind']['speed']
        paris_weather_summary = f"""
            ## Current Weather in {city_name}:

            * Description: {weather_description}
            * Temperature: {temperature:.2f}°C
            * Feels Like: {feels_like:.2f}°C
            * Humidity: {humidity}%
            * Wind Speed: {wind_speed:.2f} m/s
        """
    else:
        paris_weather_summary = "Failed to fetch weather data for Paris."
        
    geolocator = Nominatim(user_agent="your_app_name")
    try:
        ip_response = requests.get('https://httpbin.org/ip')
        user_ip = ip_response.json()['origin']
        location = geolocator.geocode(user_ip, timeout=50)
    except GeocoderUnavailable as e:
        print(f"GeocoderUnavailable: {e}")
        location = None

        if location:
            latitude = location.latitude
            longitude = location.longitude

            user_location_url = f'http://api.openweathermap.org/data/2.5/weather?lat={latitude}&lon={longitude}&appid={api_key}'
            user_location_response = requests.get(user_location_url)

        if user_location_response.status_code == 200:
            user_location_data = user_location_response.json()
            city_name = user_location_data['name']
            weather_description = user_location_data['weather'][0]['description']
            temperature = kelvin_to_celsius(user_location_data['main']['temp'])
            feels_like = kelvin_to_celsius(user_location_data['main']['feels_like'])
            humidity = user_location_data['main']['humidity']
            wind_speed = user_location_data['wind']['speed']
            user_location_summary = f"""
                ## Current Weather in {city_name}:

                * Description: {weather_description}
                * Temperature: {temperature:.2f}°C
                * Feels Like: {feels_like:.2f}°C
                * Humidity: {humidity}%
                * Wind Speed: {wind_speed:.2f} m/s
            """
        else:
            user_location_summary = "Failed to fetch weather data for your location."
    else:
        user_location_summary = "Location permission is not granted or unavailable."


    for city in cities:
        api_url = f'http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}'
        response = requests.get(api_url)

        print(response.text)

        if response.status_code == 200:
            weather_data = response.json()
            weather_description = weather_data['weather'][0]['description']
            weather_news_list.append(f"Current weather in {city}: {weather_description}.")
        else:
            error_message = f"Failed to fetch weather data for {city}. Status code: {response.status_code}"
            print(error_message)
            weather_news_list.append(error_message)


    print(weather_news_list)
    
    tornado_news = get_news('74ea19f185cf45d99bcb73417986ac1e', 'tornado')
    storm_news = get_news('74ea19f185cf45d99bcb73417986ac1e', 'storm')
    flood_news = get_news('74ea19f185cf45d99bcb73417986ac1e', 'flood')

    return render(request, 'home.html', context={
        'weather_news_list': weather_news_list,
        'paris_weather_summary': paris_weather_summary,
        'user_location_summary': user_location_summary,
        'tornado_news': tornado_news,
        'storm_news': storm_news,
        'flood_news': flood_news,
    })

def weather(request):
    city_name = request.GET.get('city_name', '')
    
    if city_name:

        api_key = '0f00a482322f82d0c38ea32028a6eada'
        weather_url = f'http://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={api_key}'
        time_url = f'http://worldtimeapi.org/api/timezone/Europe/{city_name}.json'

        try:

            weather_response = requests.get(weather_url)
            weather_data = weather_response.json()

            time_response = requests.get(time_url)
            time_data = time_response.json()

            temperature = weather_data.get('main', {}).get('temp', '')
            description = weather_data.get('weather', [{}])[0].get('description', '')
            icon = weather_data.get('weather', [{}])[0].get('icon', '')
            wind_speed = weather_data.get('wind', {}).get('speed', '')
            humidity = weather_data.get('main', {}).get('humidity', '')


            city_timezone = time_data.get('timezone', '')
            city_time_utc = time_data.get('utc_datetime', '')
            
            if city_timezone and city_time_utc:
                utc_time = datetime.strptime(city_time_utc, '%Y-%m-%dT%H:%M:%S.%fZ')
                city_time = utc_time.astimezone(pytz.timezone(city_timezone)).strftime('%Y-%m-%d %H:%M:%S')
            else:
                city_time = ''


            rainy_weather = 'rain' in description.lower()
            sunny_weather = 'clear' in description.lower() or 'sun' in description.lower()
            snowy_weather = 'snow' in description.lower()
            tornado_weather = 'tornado' in description.lower()
            cloudy_weather = 'cloud' in description.lower()
            windy_weather = 'wind' in description.lower()
            moon_weather = 'moon' in description.lower()

            return render(request, 'weather.html', {
                'city_name': city_name,
                'temperature': temperature,
                'description': description,
                'icon': icon,
                'city_time': city_time,
                'wind_speed': wind_speed,
                'humidity': humidity,
                'rainy_weather': rainy_weather,
                'sunny_weather': sunny_weather,
                'snowy_weather': snowy_weather,
                'tornado_weather': tornado_weather,
                'cloudy_weather': cloudy_weather,
                'windy_weather': windy_weather,
                'moon_weather': moon_weather,
            })

        except Exception as e:
            error_message = f'Error fetching data: {str(e)}'
            return render(request, 'weather.html', {'error_message': error_message})

    return render(request, 'weather.html')


def kelvin_to_celsius(kelvin):
    return kelvin - 273.15
    
def search_weather(request):
    city_name = request.GET.get('city_name', '')
    api_key = '0f00a482322f82d0c38ea32028a6eada'

    if city_name and api_key:
        try:
            api_url = f'https://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={api_key}'
            response = requests.get(api_url)
            data = response.json()

            if response.status_code == 200:
                weather_data = {
                    'temperature': data['main']['temp'],
                    'description': data['weather'][0]['description'],
                    'icon': data['weather'][0]['icon']
                }
                return JsonResponse({'success': True, 'weather_data': weather_data})
            else:
                return JsonResponse({'success': False, 'error': 'Unable to fetch weather data'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    else:
        return JsonResponse({'success': False, 'error': 'City name or API key is missing'})


def get_user_location(request, latitude, longitude):
    return JsonResponse({"status": "success", "message": "Location received successfully."})

def search_suggestions(request):
    city_name = request.GET.get('city_name', '').lower()

    try:
        json_path = '/home/ghost/Desktop/webProject/virtual/climate/climate/fixture/city.list.json'
        
        with open(json_path, 'r', encoding='utf-8') as file:
            cities = json.load(file)

        suggestions = [city['name'] for city in cities if city_name in city['name'].lower()]
        return JsonResponse({'success': True, 'suggestions': suggestions})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})
