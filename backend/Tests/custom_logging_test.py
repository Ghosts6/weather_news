import os
import time
import pytest
from logging import getLogger, INFO
from weather.custom_logging import GzipTimedRotatingFileHandler
from django.conf import settings


@pytest.fixture
def log_env():
    log_dir = os.path.join(settings.BASE_DIR, "climate/Logs")
    os.makedirs(log_dir, exist_ok=True)

    # Snapshot existing files
    before_files = set(os.listdir(log_dir))

    test_log_path = os.path.join(log_dir, "test_log.txt")

    # Ensure test file does not exist before running
    if os.path.exists(test_log_path):
        os.remove(test_log_path)

    yield test_log_path

    # Determine which files were created during the test
    after_files = set(os.listdir(log_dir))
    created_files = after_files - before_files

    # Remove only the files that this test created
    for f in created_files:
        try:
            os.remove(os.path.join(log_dir, f))
        except FileNotFoundError:
            pass


def test_gzip_timed_rotating_file_handler(log_env):
    logger = getLogger("test_logger")
    logger.setLevel(INFO)

    handler = GzipTimedRotatingFileHandler(
        log_env,
        when="s",
        interval=1,
        backupCount=2,
    )
    logger.addHandler(handler)

    # First log write
    logger.info("message 1")
    time.sleep(1.1)

    # First rollover
    logger.info("message 2")
    time.sleep(1.1)

    # Second rollover
    logger.info("message 3")

    handler.close()

    log_dir = os.path.dirname(log_env)
    all_files = os.listdir(log_dir)

    gz_files = [f for f in all_files if f.endswith(".gz")]

    assert len(gz_files) >= 1   # rollover occurred
    assert len(gz_files) <= 2   # obeys backupCount
