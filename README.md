![baner](https://github.com/Ghosts6/Local-website/blob/main/img/Baner.png)

# ⛈️ weather_news:

here we have my weather project which created with help of django and include pages like home and weather,home page: inside this page you can check out weather news about
cities around word,storm ,torando,flood ,weather in your place and etc also there are links so if something was interesting for you,you  could read more  about it.
weather page: this page created for searching and check out weather in differend locations ,in this page by searching city name you will recive data about location like
weather,temperature,wind speed,time and etc

# 💻 Technologies:

for this projec i use django and api like drf and rest api for backend and for frontend i use js/html/css for customize and create pages

 ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=plastic&logo=css3&logoColor=white) ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=plastic&logo=html5&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=plastic&logo=javascript&logoColor=%23F7DF1E) ![Python](https://img.shields.io/badge/python-3670A0?style=plastic&logo=python&logoColor=ffdd54) ![Django](https://img.shields.io/badge/django-%23092E20.svg?style=plastic&logo=django&logoColor=white) ![REST API](https://img.shields.io/badge/REST%20API-%2320232a.svg?style=plastic&logo=api&logoColor=white) ![RESTful API](https://img.shields.io/badge/RESTful%20API-%2320232a.svg?style=plastic&logo=api&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%23336791.svg?style=plastic&logo=postgresql&logoColor=white)


# 🧑‍💻code_sample:

in this section we will take closer look to weather page which created for checking cities weather by searching they name

weather.html
```html
{% load static%}
<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" type="image/png" sizes="32x32" href="{% static 'fav/favicon-32x32.png'%}">
    <link rel="icon" type="image/png" sizes="16x16" href="{% static 'fav/favicon-16x16.png'%}">
    <link rel="manifest" href="/site.webmanifest">
    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">
    <link rel="stylesheet" href="{% static 'css/weather.css' %}">
    <link rel="stylesheet" href="https://site-assets.fontawesome.com/releases/v6.4.2/css/all.css">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="msapplication-TileColor" content="#da532c">
    <meta name="theme-color" content="#ffffff">
    <title>search bar</title>   
</head>
<body>
    <div id="particles-js"></div>
    <div id="dark-mode-toggle" onclick="toggleDarkMode()">
    <i id="dark-mode-icon" class="fa-solid fa-moon"></i>
    </div>
    <a href="https://github.com/Ghosts6" target="_blank" id="github-link">
        <i class="fa-brands fa-github"></i>
    </a>
    <div class="search-container">
            <div class="input-container">
                <label for="search">check the weather</label>
                <i class="fa-regular fa-magnifying-glass"></i>
                <form method="get" action="{% url 'weather' %}">
                        <input type="search" id="search" name="city_name" placeholder="search city by typing name">
                        <div id="suggestions-container" class="suggestions-container"></div>
                </form>
            </div>
            <div class="weather-container">
                {% if city_name %}
                    <h2>Weather in {{ city_name }}</h2>
                    <h3>Time: {{ city_time }}</h3>
                    <p>Temperature: {{ temperature }}°C</p>
                    <u class="u1">Description: {{ description }}</u>
                    <u class="u2">WindSpeed: {{ wind_speed }}</u>
                    <u class="u3">Humidity: {{ humidity }}</u>
                {% endif %}
                <i class="fa-solid fa-temperature-low"></i>
                <div class="h3-icon">
                    <i class="fa-solid fa-clock"></i>
                </div>
                <div class="u2-icon">
                    <i class="fa-duotone fa-wind"></i>
                </div>
                <div class="u3-icon">
                    <i class="fa-regular fa-droplet"></i>
                </div>
                <div class="weather">
                {% if rainy_weather %}
                    <i class="fa-solid fa-cloud-rain"></i>
                {% elif sunny_weather %}
                    <i class="fa-solid fa-sun"></i>
                {% elif snowy_weather %}
                    <i class="fa-solid fa-snowflake"></i>
                {% elif tornado_weather %}
                    <i class="fa-solid fa-tornado"></i>
                {% elif cloudy_weather %}
                    <i class="fa-solid fa-cloud"></i>
                {% elif windy_weather %}
                    <i class="fa-solid fa-wind"></i>
                {% elif moon_weather %}
                    <i class="fa-solid fa-moon"></i>
                {% else %}
                    <i class="fa-solid fa-cloud"></i>
                {% endif %}
            </div>
        </div>        
    </div>
    <div class="home-button">
        <button id="homeButton" class="button">Home</button>
    </div>
<script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script> 
<script src="{% static 'js/weather.js' %}"></script>    
</body>
</html>
```
views.py
```python
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
```

# 🎥 video:
