import os
import subprocess
import shutil
from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Builds React app, copies build files to Django static directory, and runs collectstatic.'

    def handle(self, *args, **kwargs):
        project_root_dir = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../..'))  
        
        frontend_dir = os.path.join(project_root_dir, 'frontend')
        
        if not os.path.isdir(frontend_dir):
            self.stdout.write(self.style.ERROR(f"Frontend directory not found at {frontend_dir}"))
            return

        self.stdout.write(self.style.WARNING('Building React app...'))
        try:
            subprocess.run(['npm', 'run', 'build'], cwd=frontend_dir, check=True)
            self.stdout.write(self.style.SUCCESS('React app built successfully.'))
        except subprocess.CalledProcessError as e:
            self.stdout.write(self.style.ERROR(f"Error occurred while building React app: {e}"))
            return

        build_dir = os.path.join(frontend_dir, 'build')
        static_frontend_dir = os.path.join(project_root_dir, 'backend/climate/static/frontend')

        if not os.path.isdir(build_dir):
            self.stdout.write(self.style.ERROR(f"Build directory not found at {build_dir}"))
            return

        self.stdout.write(self.style.WARNING('Copying build files to Django static directory...'))
        try:
            shutil.copytree(build_dir, static_frontend_dir, dirs_exist_ok=True)  
            self.stdout.write(self.style.SUCCESS('Build files copied successfully.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error occurred while copying build files: {e}"))
            return

        self.stdout.write(self.style.WARNING('Running collectstatic...'))
        try:
            call_command('collectstatic', '--noinput')
            self.stdout.write(self.style.SUCCESS('collectstatic completed successfully.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error occurred during collectstatic: {e}"))
            return

