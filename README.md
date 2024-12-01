![baner](https://github.com/Ghosts6/Local-website/blob/main/img/Baner.png)

# 🌍 Django Weather App with Search Functionality

This Django application allows users to search for weather information in different locations. By entering a city name, users can view real-time details like temperature, description, wind speed, and humidity. The app also displays current weather icons based on the conditions (e.g., sunny, rainy, snowy, etc.).

## Key Features:
- **Weather Search**: Search for weather information by city name.
- **Real-Time Data**: View temperature, wind speed, humidity, and weather description.
- **Weather Icons**: Visual representation of weather conditions (sun, rain, snow, etc.).
- **Time Zone Integration**: Displays the current time for the searched city.
- **Dark Mode**: Option to toggle dark mode for better readability.

Our goal is to work with APIs, manage their integration, and handle key concepts such as sending and receiving data between the backend and frontend. This project focuses on fetching data from external providers through their APIs, allowing you to understand how to interact with external services and present dynamic information in a web application.

---

## 💻 Technologies Used:

### Technologies Used:
- ![Django](https://img.shields.io/badge/django-%23092E20.svg?style=plastic&logo=django&logoColor=white) – Backend framework for scalable web applications.
- ![Python](https://img.shields.io/badge/python-3670A0?style=plastic&logo=python&logoColor=ffdd54) – The programming language powering the backend logic.
- ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=plastic&logo=tailwind-css&logoColor=white) – A utility-first CSS framework for sleek, responsive designs.
- ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=plastic&logo=javascript&logoColor=%23F7DF1E) – Adds interactivity and dynamic behavior to the frontend.
- ![Font Awesome](https://img.shields.io/badge/font%20awesome-%23F7DF1E.svg?style=plastic&logo=font-awesome&logoColor=black) – A library of scalable vector icons for visual elements.
- ![DRF](https://img.shields.io/badge/DRF-%2300B8A1.svg?style=plastic&logo=django&logoColor=white) – For building powerful REST APIs.
- ![Redis](https://img.shields.io/badge/redis-%23D72C25.svg?style=plastic&logo=redis&logoColor=white) – In-memory data store for caching and message brokering.
- ![pytest](https://img.shields.io/badge/pytest-%232C2A29.svg?style=plastic&logo=pytest&logoColor=white) – A robust testing framework for ensuring code reliability.
- ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%23336791.svg?style=plastic&logo=postgresql&logoColor=white) – Relational database system, where applicable for data storage.

---

# 🧑‍💻code_sample:

In this section, we'll show you how we fetch weather data from an external API and send it to the frontend using Django's backend. The frontend will use JavaScript (fetch) to get the data asynchronously and display it to the user.

## Backend: Django API View

Here’s the backend code, which integrates the backend API call to fetch weather data and explains how it interacts with the frontend using fetch and JSON. The backend API receives the city name, queries external weather services for data, and sends back a structured JSON response. The JavaScript fetch function on the frontend then calls this API, retrieves the data, and updates the webpage accordingly. By using JSON format, both the frontend and backend can communicate seamlessly, ensuring the correct information is displayed to the user in real time.:
```py
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
            # Fetch data from OpenWeatherMap API
            weather_response = fetch_with_retry(weather_url)
            weather_data = weather_response.json()

            if weather_data.get('cod') != 200:
                return JsonResponse({'error_message': 'City Not Found'}, status=404)

            # Extract necessary weather details
            temperature = kelvin_to_celsius(weather_data.get('main', {}).get('temp', 0))
            description = weather_data.get('weather', [{}])[0].get('description', '')
            icon = weather_data.get('weather', [{}])[0].get('icon', '')
            wind_speed = weather_data.get('wind', {}).get('speed', 0)
            humidity = weather_data.get('main', {}).get('humidity', 0)

            city_timezone = weather_data.get('timezone', 0)
            utc_time = datetime.utcnow() + timedelta(seconds=city_timezone)
            city_time = utc_time.strftime('%Y-%m-%d %H:%M:%S')

            # Fetch data from WeatherAPI for hourly forecast
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

            # Prepare response data to send to frontend
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

def kelvin_to_celsius(kelvin):
    return kelvin - 273.15  # Convert temperature from Kelvin to Celsius
```

## Frontend: JavaScript Code to Fetch and Display Data

The following JavaScript code is designed to interact with the backend of  weather application. It sends an HTTP request to the backend to fetch weather data for a specified city. The request is made using the fetch function, which communicates with the Django backend API endpoint that retrieves weather data. Once the backend responds, the weather data is returned in JSON format. The frontend then processes this data to dynamically update the user interface, displaying details like the current temperature, weather description, and hourly forecasts for the chosen city.
```py
function fetchWeather(cityName) {
    fetch(`/get_weather_data/?city_name=${encodeURIComponent(cityName)}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    const message = data.error_message || "City not found";
                    showError(message);
                    throw new Error(message);
                });
            }
            return response.json();
        })
        .then(data => {
            const errorMessage = document.getElementById('error-message');
            if (errorMessage) {
                errorMessage.classList.add('hidden');
                errorMessage.classList.remove('flex');
            }

            if (data.error_message) {
                showError(data.error_message);
                return;
            }

            form.closest('.input-container').classList.add('opacity-0', 'translate-y-4');
            setTimeout(() => {
                form.closest('.input-container').classList.add('hidden');
                resultContainer.classList.remove('hidden', 'opacity-0', 'translate-y-4');
                weatherDetails.classList.remove('hidden');
                resultContainer.classList.add('opacity-100', 'translate-y-0');
            }, 300);

            renderWeatherDetails(data);
        })
        .catch(error => {
            showError(error.message || "An unexpected error occurred. Please try again.");
        });
}

function renderWeatherDetails(data) {
    document.getElementById('city-name').innerText = data.city_name;
    document.getElementById('city-time').innerText = data.city_time;
    document.getElementById('current-temp').innerText = data.temperature;
    document.getElementById('current-condition').innerText = data.description;

    const hourlyWeatherContainer = document.querySelector('.hourly-weather');
    hourlyWeatherContainer.innerHTML = ''; 

    if (data.hourly_forecast && Array.isArray(data.hourly_forecast)) {
        data.hourly_forecast.forEach(hour => {
            const weatherIconUrl = `https://openweathermap.org/img/wn/${hour.icon}@2x.png`;
            const hourCard = document.createElement('div');
            hourCard.classList.add('hour-card');

            hourCard.innerHTML = `
                <div class="hour-time">${hour.time}</div>
                <img src="${weatherIconUrl}" alt="${hour.description}" class="weather-icon">
                <div class="hour-temp">${hour.temperature}°C</div>
            `;
            hourlyWeatherContainer.appendChild(hourCard);
        });
    } else {
        console.error("Hourly forecast data is missing or incorrect.");
    }
}

function showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.querySelector('p').textContent = message;
    console.log("Error
```

---

# 🎥 video:

[weather_news.webm](https://github.com/user-attachments/assets/8574d359-b3ba-4bbf-86c3-27c07d835dcb)

This video showcases the app's functionality, including how users can search for cities and view the weather data in real time.

---

# 🚀 How to Run:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Ghosts6/Local-website.git
   ```
2. **Install dependencies:**

Make sure you have a virtual environment set up. If not, you can create one by running:
   ```bash
   python -m venv venv
   source venv/bin/activate   # On macOS/Linux
   venv\Scripts\activate      # On Windows
   ```
Then, install the required dependencies from the requirements.txt file:
   ```bash
   pip install -r requirements.txt
   ```
3. **Run database migrations:**

Before running the server, make sure to apply any database migrations:
   ```bash
   python manage.py migrate
   ```
4. **Collect static files:**

To ensure your static assets (like CSS, JS, images) are served correctly, run:
   ```bash
   python manage.py collectstatic
   ```
5. **Run the development server:**

Now, you can start the Django development server:
   ```bash
   python manage.py runserver
   ```
6. **Visit the app:**

Open your browser and visit the app at:

http://127.0.0.1:8000/


