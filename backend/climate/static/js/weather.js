document.addEventListener('DOMContentLoaded', function () {
    const homeButton = document.getElementById('homeButton');
    const form = document.getElementById('weather-form');
    const searchInput = document.getElementById('search');
    const resultContainer = document.getElementById('result-container');
    const weatherDetails = document.getElementById('weather-details');
    const errorMessage = document.getElementById('error-message');
    const tryAgainButton = document.getElementById('try-again-button');
    const suggestionsContainer = document.getElementById('suggestions-container');
    const validCityNamePattern = /^[a-zA-Z\s\-]+$/;

    let currentIndex = -1;
    let suggestions = [];

    homeButton.addEventListener('click', function () {
        window.location.href = redirect;
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const cityName = searchInput.value.trim();

        if (!cityName) {
            Swal.fire({
                icon: 'warning',
                title: 'Input Required',
                text: 'Please enter a city name before searching!',
            });
            return;
        }

        if (!validCityNamePattern.test(cityName)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Input',
                text: 'City name must only contain letters, spaces, or hyphens.',
            });
            return;
        }

        fetchWeather(cityName);
    });

    tryAgainButton.addEventListener('click', function () {
        resultContainer.classList.add('opacity-0', 'translate-y-4');
        setTimeout(() => {
            resultContainer.classList.add('hidden');
            form.closest('.input-container').classList.remove('hidden', 'opacity-0', 'translate-y-4');
            form.closest('.input-container').classList.add('opacity-100', 'translate-y-0');
        }, 300);
    });

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
        console.log("Error message set:", message);

        form.closest('.input-container').classList.add('hidden');
        weatherDetails.classList.add('hidden');

        resultContainer.classList.remove('hidden');
        errorMessage.classList.remove('hidden');
        errorMessage.classList.add('flex');
        tryAgainButton.classList.remove('hidden');
    }

    searchInput.addEventListener('input', function () {
        const query = searchInput.value.trim();
        suggestionsContainer.innerHTML = '';
        currentIndex = -1;

        if (query.length >= 3) {
            fetch(`/search_suggestions/?city_name=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        suggestions = data.suggestions;
                        suggestions.forEach((city, index) => {
                            const suggestion = document.createElement('div');
                            suggestion.textContent = city;
                            suggestion.className = "cursor-pointer p-2 transition-all hover:bg-[#f1f1f1] dark:hover:bg-[#3c3c3c] hover:text-[#2c3e50]"; 
                            suggestion.addEventListener('click', () => {
                                searchInput.value = city;
                                suggestionsContainer.innerHTML = ''; 
                                suggestionsContainer.classList.add('hidden'); 
                            });

                            suggestion.addEventListener('mouseenter', () => {
                                currentIndex = index;
                                updateSuggestionHighlight();
                            });

                            suggestionsContainer.appendChild(suggestion);
                        });
                        suggestionsContainer.classList.remove('hidden');
                    }
                });
        }
    });

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (event.key === 'ArrowDown' && currentIndex < suggestions.length - 1) {
                currentIndex++;
            } else if (event.key === 'ArrowUp' && currentIndex > 0) {
                currentIndex--;
            }
            updateSuggestionHighlight();
        }
    });

    function updateSuggestionHighlight() {
        const items = suggestionsContainer.querySelectorAll('div');
        items.forEach((item, index) => {
            if (index === currentIndex) {
                item.style.backgroundColor = '#e1f5fe'; 
                item.style.color = '#2c3e50';
            } else {
                item.style.backgroundColor = ''; 
                item.style.color = ''; 
            }
        });
    }
});
