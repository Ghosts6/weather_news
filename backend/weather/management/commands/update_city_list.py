import gzip
import json
import logging
import requests
from django.core.cache import cache
from django.core.management.base import BaseCommand

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Fetches the city list from OpenWeatherMap and caches it in Redis.'

    def handle(self, *args, **options):
        self.stdout.write('Fetching and caching city list...')
        url = "https://bulk.openweathermap.org/sample/city.list.json.gz"
        try:
            response = requests.get(url)
            response.raise_for_status()
            
            decompressed_content = gzip.decompress(response.content)
            cities = json.loads(decompressed_content.decode('utf-8'))
            
            cache.set('city_list', cities, timeout=None) # Cache forever
            
            self.stdout.write(self.style.SUCCESS('Successfully fetched and cached the city list.'))
        except (requests.RequestException, json.JSONDecodeError, gzip.BadGzipFile) as e:
            logger.error(f"Failed to fetch or process new city list: {e}")
            self.stderr.write(self.style.ERROR('Failed to fetch and cache the city list.'))
