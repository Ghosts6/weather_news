from mock import mock_open
import pytest
from django.urls import reverse
from unittest.mock import patch, MagicMock
from rest_framework.test import APIClient
import json

from weather.views import get_timezone_data

@pytest.fixture
def api_client():
    return APIClient()

@pytest.mark.django_db
def test_home_view(api_client):
    url = reverse('home') 
    response = api_client.get(url)

    assert response.status_code == 200
    assert 'user_location_summary' in response.context
    assert 'paris_weather_summary' in response.context
    
@pytest.mark.django_db
def test_search_weather_valid(api_client):
    url = reverse('search_suggestions')
    response = api_client.get(url, {'city_name': 'Paris'})

    assert response.status_code == 200
    assert response.json().get('success') is True

@pytest.mark.django_db
def test_search_suggestions_valid(api_client):
    url = reverse('search_suggestions')  
    with patch('builtins.open', mock_open(read_data=json.dumps([
        {'name': 'Paris'},
        {'name': 'Parma'},
        {'name': 'Paradise'}
    ]))):
        response = api_client.get(url, {'city_name': 'par'})
        data = response.json()

        assert data['success'] is True
        assert 'Paris' in data['suggestions']
        assert 'Parma' in data['suggestions']
        assert 'Paradise' in data['suggestions']

@pytest.mark.django_db
def test_search_suggestions_no_match(api_client):
    url = reverse('search_suggestions')
    with patch('builtins.open', mock_open(read_data=json.dumps([
        {'name': 'Paris'},
        {'name': 'Parma'},
        {'name': 'Paradise'}
    ]))):
        response = api_client.get(url, {'city_name': 'xyz'})
        data = response.json()

        assert data['success'] is True
        assert len(data['suggestions']) == 0

@pytest.mark.django_db
def test_get_weather_data_valid(api_client):
    url = reverse('get_weather_data')

    weather_data_mock = {
        'cod': 200,
        'main': {'temp': 295.15, 'humidity': 80},
        'weather': [{'description': 'Clear sky', 'icon': '01d'}],
        'wind': {'speed': 5},
        'timezone': 3600
    }
    
    weatherapi_data_mock = {
        'forecast': {
            'forecastday': [{
                'hour': [{
                    'time': '2024-11-29 00:00',
                    'temp_c': 18.0,
                    'condition': {'text': 'Clear', 'icon': '01d'}
                }]
            }]
        }
    }

    with patch('requests.get') as mock_get:
        mock_get.side_effect = [
            MagicMock(status_code=200, json=MagicMock(return_value=weather_data_mock)),
            MagicMock(status_code=200, json=MagicMock(return_value=weatherapi_data_mock))
        ]

        response = api_client.get(url, {'city_name': 'Paris'})
        data = response.json()

        assert response.status_code == 200
        assert data['city_name'] == 'Paris'
        assert 'temperature' in data
        assert 'description' in data
        assert len(data['hourly_forecast']) == 1
        assert data['hourly_forecast'][0]['time'] == '00:00'
        assert data['hourly_forecast'][0]['temperature'] == 18.0

@pytest.mark.django_db
def test_get_weather_data_city_not_found(api_client):
    url = reverse('get_weather_data')

    weather_data_mock = {'cod': '404'}

    with patch('requests.get') as mock_get:
        mock_get.return_value = MagicMock(status_code=404, json=MagicMock(return_value=weather_data_mock))

        response = api_client.get(url, {'city_name': 'InvalidCity'})
        data = response.json()

        assert response.status_code == 404
        assert data['error_message'] == 'City Not Found'

@pytest.mark.django_db
def test_get_weather_data_missing_city(api_client):
    url = reverse('get_weather_data')

    response = api_client.get(url, {'city_name': ''})
    data = response.json()

    assert response.status_code == 400
    assert data['error_message'] == 'City name is required'
    
@pytest.mark.django_db
def test_get_timezone_data_valid():
    timezone_data_mock = {'timezone': 'Europe/Paris'}

    with patch('requests.get') as mock_get:
        mock_get.return_value = MagicMock(status_code=200, json=MagicMock(return_value=timezone_data_mock))

        result = get_timezone_data('Paris')

        assert result == 'Europe/Paris'

@pytest.mark.django_db
def test_get_timezone_data_invalid():
    timezone_data_mock = {}

    with patch('requests.get') as mock_get:
        mock_get.return_value = MagicMock(status_code=200, json=MagicMock(return_value=timezone_data_mock))

        result = get_timezone_data('InvalidCity')

        assert result is None

@pytest.mark.django_db
def test_get_timezone_data_exception():
    with patch('requests.get') as mock_get:
        mock_get.side_effect = Exception("API Error")

        result = get_timezone_data('Paris')

        assert result is None
        
@pytest.mark.django_db
def test_get_time_zone_valid(api_client):
    url = reverse('get_time_zone')

    timezone_data_mock = {'timezone': 'Europe/Paris'}

    with patch('requests.get') as mock_get:
        mock_get.return_value = MagicMock(status_code=200, json=MagicMock(return_value=timezone_data_mock))

        response = api_client.get(url, {'city_name': 'Paris'})
        data = response.json()

        assert response.status_code == 200
        assert data['city_name'] == 'Paris'
        assert data['timezone'] == 'Europe/Paris'

@pytest.mark.django_db
def test_get_time_zone_city_not_found(api_client):
    url = reverse('get_time_zone')

    with patch('requests.get') as mock_get:
        mock_get.return_value = MagicMock(status_code=404, json=MagicMock(return_value={}))

        response = api_client.get(url, {'city_name': 'InvalidCity'})
        data = response.json()

        assert response.status_code == 404
        assert data['error_message'] == 'Could not fetch timezone data'

@pytest.mark.django_db
def test_get_time_zone_missing_city(api_client):
    url = reverse('get_time_zone')

    response = api_client.get(url, {'city_name': ''})
    data = response.json()

    assert response.status_code == 400
    assert data['error_message'] == 'City name is required'

