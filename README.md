# 🌍 Weather News

**this project is a sleek, modern web application that delivers real-time weather information and curated news from around the globe. Stay informed about the latest weather updates, and explore news related to tornadoes, storms, and floods, all in one place.**

## ✨ Key Features

- **Real-time Weather:** Get up-to-date weather information for any city, including temperature, wind speed, humidity, and a description of the current conditions.
- **Hourly Forecasts:** View a detailed hourly forecast.
- **Global News:** Stay informed with the latest news related to the weather in the selected location (Tornado, Storm, Flood).
- **Interactive Global Map:** Explore weather patterns worldwide with an interactive map tile proxy.
- **Search Suggestions:** Find locations easily with a smart search suggestion feature.
- **Horizontal Scrolling Interface:** A unique and engaging way to browse through different news and weather sections.
- **Light & Dark Mode:** Choose your preferred theme for a comfortable viewing experience.
- **Responsive Design:** Fully responsive and accessible on all devices.

## 🚀 Technologies

This project is built with a modern and powerful technology stack:

### Backend
- **Django:** A high-level Python web framework for rapid and clean development.
- **Django REST Framework:** A powerful toolkit for building robust Web APIs.
- **Redis:** In-memory data store for caching and performance optimization.
- **SQLite3:** Default database for simplicity, configurable to use PostgreSQL.
- **Knox:** For token-based authentication.

### Frontend
- **React (with TypeScript):** A JavaScript library for building dynamic user interfaces with static typing.
- **Tailwind CSS:** A utility-first CSS framework for creating custom designs with ease.
- **esbuild:** An extremely fast JavaScript bundler and minifier.
- **Leaflet:** An open-source JavaScript library for mobile-friendly interactive maps.

### DevOps
- **Docker & Docker Compose:** For containerizing and running the application in isolated environments.
- **GitHub Actions:** CI/CD pipeline for automated testing and deployment.

## 🔑 API Keys & Environment Variables

To run this project, you'll need to set up a `docker.env` file in the project's root directory with the following API keys and environment variables:

- **`API_KEY`**: From [OpenWeatherMap](https://openweathermap.org/) for primary weather data.
- **`NEWS_API_KEY`**: From [NewsAPI](https://newsapi.org/) for news articles.
- **`WEATHER_API_KEY2`**: From [WeatherAPI](https://www.weatherapi.com/) for hourly forecasts.
- **`SECRET_KEY`**: A unique secret key for your Django application.
- **`DJANGO_DEBUG`**: Set to `True` for development and `False` for production.
- **`DJANGO_ALLOWED_HOSTS`**: Comma-separated list of allowed hosts (e.g., `localhost,127.0.0.1`).
- **`CORS_ALLOWED_ORIGINS`**: Comma-separated list of allowed origins for CORS (e.g., `http://localhost:3001,http://127.0.0.1:3001`).

## 🏃‍♀️ How to Run

You can run this project using Docker (recommended) or set it up locally for development.

### Using Docker (Recommended)
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ghosts6/weather_news
   ```
2. **Create and populate the `docker.env` file:**
   Create a `docker.env` file in the root of the project and add the necessary API keys and environment variables.
3. **Build and run with Docker Compose:**
   ```bash
   docker-compose build
   docker-compose up
   ```
4. **Access the application:**
   - Backend API: `http://localhost:8000/`
   - Frontend App: `http://localhost:3001/`

### Local Development
<details>
<summary>Click to expand for local setup instructions</summary>

For local development, you will need to run the backend and frontend servers in separate terminals.

#### Backend
1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```
2. **Create a virtual environment and install dependencies:**
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r ../requirements.txt
   ```
3. **Set environment variables:**
   Create a `.env` file in the `backend` directory and add the required environment variables.
4. **Run the development server:**
   ```bash
   python manage.py runserver
   ```
   The backend will be available at `http://localhost:8000/`.

#### Frontend
1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the development server:**
   ```bash
   npm start
   ```
   The frontend development server will start on `http://localhost:3000/`. It's configured to proxy API requests from `/api` to the backend server running on port 8000. In `docker-compose.yml`, the frontend is exposed on port `3001`.

</details>

## 📂 Project Structure

The project is organized into two main parts: a Django backend and a React frontend.

<details>
<summary>Click to expand for project structure details</summary>

```
/
├── backend/          # Django project
│   ├── climate/      # Main Django project configuration
│   ├── weather/      # Django app for weather and news
│   ├── authentication/ # Django app for user authentication
│   └── ...
├── frontend/         # React project
│   ├── src/
│   │   ├── components/ # Reusable React components
│   │   ├── pages/      # Main pages of the application
│   │   ├── context/    # React context for state management
│   │   └── ...
│   └── ...
├── docker-compose.yml
├── Dockerfile        # For the backend
├── Dockerfile.frontend
└── README.md
```
</details>

## 🎥 Demo


https://github.com/user-attachments/assets/c5e61fd6-3571-4f17-b75b-33293191a466




