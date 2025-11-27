import os
import shutil
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = 'Removes pytest cache and coverage files.'

    def handle(self, *args, **options):
        base_dir = settings.BASE_DIR
        pytest_cache_dir = os.path.join(base_dir, '.pytest_cache')
        coverage_file = os.path.join(base_dir, '.coverage')

        if os.path.exists(pytest_cache_dir):
            shutil.rmtree(pytest_cache_dir)
            self.stdout.write(self.style.SUCCESS(f'Removed {pytest_cache_dir}'))

        if os.path.exists(coverage_file):
            os.remove(coverage_file)
            self.stdout.write(self.style.SUCCESS(f'Removed {coverage_file}'))
