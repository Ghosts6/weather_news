import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from knox.models import AuthToken

@pytest.fixture
def api_client():
    return APIClient()

@pytest.mark.django_db
def test_dig_api(api_client):
    url = reverse('dig')
    response = api_client.get(url)
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

@pytest.mark.django_db
def test_register_api_success(api_client):
    url = reverse('register')
    data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "strongpassword"
    }
    response = api_client.post(url, data, format='json')
    assert response.status_code == 200
    assert "user" in response.data
    assert "token" in response.data
    assert User.objects.filter(username="testuser").exists()

@pytest.mark.django_db
def test_register_api_existing_user(api_client):
    User.objects.create_user(username="testuser", password="password")
    url = reverse('register')
    data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "strongpassword"
    }
    response = api_client.post(url, data, format='json')
    assert response.status_code == 400

@pytest.mark.django_db
def test_user_api_valid_token(api_client):
    user = User.objects.create_user(username="testuser", password="password")
    token = AuthToken.objects.create(user)[1]
    api_client.credentials(HTTP_AUTHORIZATION='Token ' + token)
    url = reverse('user')
    response = api_client.get(url)
    assert response.status_code == 200
    assert response.data['username'] == 'testuser'

@pytest.mark.django_db
def test_user_api_invalid_token(api_client):
    api_client.credentials(HTTP_AUTHORIZATION='Token invalidtoken')
    url = reverse('user')
    response = api_client.get(url)
    assert response.status_code == 401

@pytest.mark.django_db
def test_user_api_no_token(api_client):
    url = reverse('user')
    response = api_client.get(url)
    assert response.status_code == 401

@pytest.mark.django_db
def test_login_api_success(api_client):
    User.objects.create_user(username="testuser", password="password")
    url = reverse('login')
    data = {"username": "testuser", "password": "password"}
    response = api_client.post(url, data, format='json')
    assert response.status_code == 200
    assert "token" in response.data

@pytest.mark.django_db
def test_login_api_invalid_credentials(api_client):
    User.objects.create_user(username="testuser", password="password")
    url = reverse('login')
    data = {"username": "testuser", "password": "wrongpassword"}
    response = api_client.post(url, data, format='json')
    assert response.status_code == 400
