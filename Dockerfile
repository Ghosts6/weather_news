# Use stable, multi-arch Python image
FROM python:3.11-alpine

# Environment
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    build-base \
    cyrus-sasl-dev \
    openldap-dev \
    openssl-dev \
    python3-dev

# Upgrade pip/setuptools to avoid pyproject.toml build issues
RUN pip install --upgrade pip setuptools wheel

# Copy dependency file first (leverage cache)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy Django app
COPY backend/ .

# Expose app port
EXPOSE 8000

# Default command
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

