# 🌍 Weather News

Weather News is a web application that provides real-time weather information and news for any location in the world. This project is currently undergoing a significant refactor to improve the user experience, modernize the technology stack, and improve the overall code quality.

## ✨ Key Features

- **Real-time Weather:** Get up-to-date weather information for any city, including temperature, wind speed, humidity, and a description of the current conditions.
- **Hourly Forecasts:** View a 12-hour forecast with temperature, conditions, and icons.
- **Global News:** Stay informed with the latest news related to the weather in the selected location.
- **Responsive Design:** The application is designed to be fully responsive and accessible on all devices.
- **Modern UI/UX:** The user interface is being redesigned to be more modern, intuitive, and user-friendly.

## 🚀 Technologies

This project is built with a modern technology stack, including:

### Backend
- **Django:** A high-level Python web framework that encourages rapid development and clean, pragmatic design.
- **Django REST Framework:** A powerful and flexible toolkit for building Web APIs.
- **PostgreSQL:** A powerful, open-source object-relational database system.
- **Redis:** An in-memory data structure store, used as a database, cache, and message broker.

### Frontend
- **React.ts:** A JavaScript library for building user interfaces, with the added benefits of TypeScript for static typing.
- **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.
- **Vite:** A build tool that aims to provide a faster and leaner development experience for modern web projects.

### DevOps
- **Docker:** A platform for developing, shipping, and running applications in containers.
- **GitHub Actions:** A CI/CD platform that allows you to automate your build, test, and deployment pipeline.

## 🔑 API Keys

This project uses the following API keys to fetch data from external services. You will need to obtain these keys and place them in a `docker.env` file in the root directory.

- **`API_KEY`**: From [OpenWeatherMap](https://openweathermap.org/). Used for the main weather data.
- **`NEWS_API_KEY`**: From [NewsAPI](https://newsapi.org/). Used to fetch news articles.
- **`WEATHER_API_KEY`**: From [WeatherStack](https://weatherstack.com/). This key is not currently used in the code.
- **`WEATHER_API_KEY2`**: From [WeatherAPI](https://www.weatherapi.com/). Used for the hourly forecast.
- **`SECRET_KEY`**: A Django secret key.

## 🏃‍♀️ How to Run

This project is fully containerized using Docker. To run the application, you will need to have Docker and Docker Compose installed on your machine.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ghosts6/weather_news
   ```
2. **Create the `docker.env` file:**
   Create a `docker.env` file in the root of the project and add the required API keys and environment variables.
3. **Build and run the Docker container:**
   ```bash
   docker-compose build
   docker-compose up
   ```
4. **Visit the app:**
   Open your browser and visit the app at: `http://localhost:8000/`