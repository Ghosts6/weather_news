import pytest
from unittest.mock import patch, MagicMock
import requests
from django.core.cache import cache
import json
import hashlib
import gzip
import logging
from weather.utils import (
    redis_cache, kelvin_to_celsius, get_news, fetch_user_ip, 
    get_location_from_ip, get_timezone_data, fetch_weather_by_coordinates,
    format_weather_data, get_weather_data_for_city, get_session, get_city_list
)

# Fixture for clearing cache before each test
@pytest.fixture(autouse=True)
def clear_cache():
    cache.clear()

# Test for kelvin_to_celsius
def test_kelvin_to_celsius():
    assert kelvin_to_celsius(273.15) == 0.0
    assert kelvin_to_celsius(0) == -273.15
    assert kelvin_to_celsius(300) == pytest.approx(26.85)

# Tests for redis_cache decorator
def test_redis_cache_decorator():
    @redis_cache(timeout=1)
    def test_func(a, b):
        return a + b

    # First call, should not be in cache
    result1 = test_func(1, 2)
    assert result1 == 3
    
    # Second call, should be in cache
    result2 = test_func(1, 2)
    assert result2 == 3

# Test for get_news
@patch('weather.utils.requests.get')
@patch('weather.utils.NEWS_API_KEY', 'test_news_api_key')
def test_get_news_success(mock_get):
    mock_get.return_value = MagicMock(
        status_code=200,
        json=MagicMock(return_value={
            'articles': [{'title': 'Article 1', 'description': 'Desc 1', 'url': 'http://url1.com'}]
        })
    )
    news = get_news('test_query')
    assert len(news) == 1
    assert news[0]['title'] == 'Article 1'

@patch('weather.utils.requests.get', side_effect=requests.RequestException)
@patch('weather.utils.NEWS_API_KEY', 'test_news_api_key')
def test_get_news_request_exception(mock_get):
    news = get_news('test_query')
    assert news == []

@patch('weather.utils.logger.warning')
@patch('weather.utils.requests.get')
@patch('weather.utils.NEWS_API_KEY', 'test_news_api_key')
def test_get_news_api_key_warning(mock_get, mock_warning):
    mock_get.return_value = MagicMock(status_code=401)
    news = get_news('test_query')
    assert news == []
    mock_warning.assert_called_with("Invalid API Key for News API.")

# Tests for fetch_user_ip
@patch('weather.utils.requests.get')
def test_fetch_user_ip_success(mock_get):
    mock_get.return_value = MagicMock(
        status_code=200, json=MagicMock(return_value={'origin': '192.168.1.1'})
    )
    ip = fetch_user_ip()
    assert ip == '192.168.1.1'

@patch('weather.utils.requests.get', side_effect=requests.RequestException)
def test_fetch_user_ip_exception(mock_get):
    ip = fetch_user_ip()
    assert ip is None

# Tests for get_location_from_ip
@patch('weather.utils.requests.get')
def test_get_location_from_ip_success(mock_get):
    mock_get.return_value = MagicMock(
        status_code=200, json=MagicMock(return_value={'city': 'Paris', 'region': 'Ile-de-France', 'country_name': 'France'})
    )
    location = get_location_from_ip('192.168.1.1')
    assert location == 'Paris, Ile-de-France, France'

@patch('weather.utils.logger.warning')
@patch('weather.utils.requests.get')
def test_get_location_from_ip_rate_limit(mock_get, mock_warning):
    mock_get.return_value = MagicMock(status_code=429)
    location = get_location_from_ip('192.168.1.1')
    assert location == 'Toronto, Ontario, Canada'
    mock_warning.assert_called_with("Rate limit exceeded. Falling back to default location.")

@patch('weather.utils.requests.get', side_effect=requests.RequestException)
def test_get_location_from_ip_exception(mock_get):
    location = get_location_from_ip('192.168.1.1')
    assert location == 'Location Unavailable'

# Tests for get_timezone_data
@patch('weather.utils.requests.get')
def test_get_timezone_data_success(mock_get):
    mock_get.return_value = MagicMock(
        status_code=200, json=MagicMock(return_value={'timezone': 'Europe/Paris'})
    )
    timezone = get_timezone_data('Paris')
    assert timezone == 'Europe/Paris'

@patch('weather.utils.requests.get')
def test_get_timezone_data_no_timezone_key(mock_get):
    mock_get.return_value = MagicMock(
        status_code=200, json=MagicMock(return_value={})
    )
    timezone = get_timezone_data('InvalidCity')
    assert timezone is None

@patch('weather.utils.requests.get', side_effect=requests.RequestException)
def test_get_timezone_data_exception_handling(mock_get):
    timezone = get_timezone_data('Paris')
    assert timezone is None

# Tests for fetch_weather_by_coordinates
@patch('weather.utils.requests.get')
@patch('weather.utils.API_KEY', 'test_api_key')
def test_fetch_weather_by_coordinates_success(mock_get):
    mock_get.return_value = MagicMock(
        status_code=200, json=MagicMock(return_value={'temp': 280})
    )
    weather_data = fetch_weather_by_coordinates(0, 0)
    assert weather_data == {'temp': 280}

@patch('weather.utils.requests.get', side_effect=requests.RequestException)
@patch('weather.utils.API_KEY', 'test_api_key')
def test_fetch_weather_by_coordinates_exception(mock_get):
    weather_data = fetch_weather_by_coordinates(0, 0)
    assert weather_data is None

@patch('weather.utils.logger.warning')
@patch('weather.utils.API_KEY', 'test_api_key')
@patch('weather.utils.requests.get')
def test_fetch_weather_by_coordinates_api_key_warning(mock_get, mock_warning):
    mock_get.return_value = MagicMock(status_code=401)
    weather_data = fetch_weather_by_coordinates(0, 0)
    assert weather_data is None
    mock_warning.assert_called_with("Invalid API Key for OpenWeather API.")

# Tests for format_weather_data
def test_format_weather_data_success():
    raw_data = {
        'name': 'London',
        'weather': [{'description': 'clear sky'}],
        'main': {'temp': 280, 'feels_like': 275, 'humidity': 80},
        'wind': {'speed': 10}
    }
    formatted_data = format_weather_data(raw_data)
    assert formatted_data['city_name'] == 'London'
    assert formatted_data['temperature'] == pytest.approx(6.85)

def test_format_weather_data_key_error():
    raw_data = {'name': 'London'} # Missing 'weather' key
    formatted_data = format_weather_data(raw_data)
    assert 'error' in formatted_data

# Tests for get_weather_data_for_city
@patch('weather.utils.requests.get')
@patch('weather.utils.API_KEY', 'test_api_key')
def test_get_weather_data_for_city_success(mock_get):
    mock_get.return_value = MagicMock(
        status_code=200, json=MagicMock(return_value={
            'name': 'London',
            'weather': [{'description': 'clear sky'}],
            'main': {'temp': 280, 'feels_like': 275, 'humidity': 80},
            'wind': {'speed': 10}
        })
    )
    data = get_weather_data_for_city('London')
    assert data['city_name'] == 'London'

@patch('weather.utils.requests.get', side_effect=requests.RequestException)
@patch('weather.utils.API_KEY', 'test_api_key')
def test_get_weather_data_for_city_exception(mock_get):
    data = get_weather_data_for_city('London')
    assert data is None

@patch('weather.utils.API_KEY', None) # Test missing API key scenario
@patch('weather.utils.logger.error')
@patch('weather.utils.requests.get')
def test_get_weather_data_for_city_no_api_key(mock_get, mock_error):
    data = get_weather_data_for_city('London')
    assert data is None
    mock_error.assert_called_with("API_KEY for OpenWeather is not set.")

# Tests for get_session
def test_get_session_returns_session():
    session1 = get_session()
    session2 = get_session()
    assert session1 is session2 # Should return the same session object

# Tests for get_city_list
@patch('weather.utils.requests.get')
def test_get_city_list_from_cache(mock_get):
    cache.set('city_list', [{'name': 'CachedCity'}])
    cities = get_city_list()
    assert len(cities) == 1
    assert cities[0]['name'] == 'CachedCity'
    mock_get.assert_not_called()

@patch('weather.utils.requests.get')
def test_get_city_list_fetch_and_cache(mock_get):
    mock_response = MagicMock()
    mock_response.raise_for_status.return_value = None
    mock_response.content = gzip.compress(json.dumps([{'name': 'FetchedCity'}]).encode('utf-8'))
    mock_get.return_value = mock_response

    cities = get_city_list()
    assert len(cities) == 1
    assert cities[0]['name'] == 'FetchedCity'
    mock_get.assert_called_once()
    assert cache.get('city_list') is not None

@patch('weather.utils.requests.get', side_effect=requests.RequestException)
def test_get_city_list_fetch_exception(mock_get):
    cities = get_city_list()
    assert cities == []
    mock_get.assert_called_once()
