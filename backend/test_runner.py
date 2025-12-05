import os
import sys
import pytest
from django.test.runner import DiscoverRunner

class PytestTestRunner(DiscoverRunner):
    def run_tests(self, test_labels, extra_tests=None, **kwargs):
        os.environ['DJANGO_SETTINGS_MODULE'] = 'climate.settings'
        
        # Get the absolute path to the 'Tests' directory
        tests_dir = os.path.join(os.path.dirname(__file__), 'Tests')
        
        pytest_args = [
            tests_dir,  
            '--ds=climate.settings',
        ]
        if test_labels:
            pytest_args.extend(test_labels)
        return pytest.main(pytest_args)