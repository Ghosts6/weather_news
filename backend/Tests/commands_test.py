import pytest
from django.core.management import call_command
from unittest.mock import patch, MagicMock
from django.core.cache import cache
import json
import gzip
import requests
import logging

@pytest.mark.django_db
def test_update_city_list_command_success():
    mock_city_data = [{'name': 'CityA'}, {'name': 'CityB'}]
    gzipped_mock_data = gzip.compress(json.dumps(mock_city_data).encode('utf-8'))

    with patch('requests.get') as mock_requests_get:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = gzipped_mock_data
        mock_response.raise_for_status.return_value = None
        mock_requests_get.return_value = mock_response

        # Clear cache before running the command to ensure it's not pre-populated
        cache.clear()

        call_command('update_city_list')

        # Assert that requests.get was called
        mock_requests_get.assert_called_once_with("https://bulk.openweathermap.org/sample/city.list.json.gz")

        # Assert that the city list is now in cache
        cached_cities = cache.get('city_list')
        assert cached_cities == mock_city_data

@pytest.mark.django_db
def test_update_city_list_command_failure_requests_exception():
    with patch('requests.get') as mock_requests_get, \
         patch('weather.management.commands.update_city_list.logger') as mock_logger:
        mock_requests_get.side_effect = requests.RequestException("Network error")

        # Clear cache before running the command
        cache.clear()

        call_command('update_city_list')

        # Assert that requests.get was called
        mock_requests_get.assert_called_once()
        
        # Assert that cache is empty
        assert cache.get('city_list') is None
        
        # Assert that the error was logged
        mock_logger.error.assert_called_once_with(
            "Failed to fetch or process new city list: Network error"
        )
