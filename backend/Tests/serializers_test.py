import pytest
from django.contrib.auth.models import User
from authentication.serializers import UserSerializer, RegisterSerializer, LoginSerializer
from unittest.mock import patch, MagicMock
from rest_framework import serializers

@pytest.mark.django_db
def test_user_serializer():
    user = User.objects.create_user(username='testuser', email='test@example.com', password='password123')
    serializer = UserSerializer(user)
    assert serializer.data == {'id': user.id, 'username': 'testuser', 'email': 'test@example.com'}

@pytest.mark.django_db
def test_register_serializer_create():
    data = {'username': 'newuser', 'email': 'new@example.com', 'password': 'newpassword'}
    serializer = RegisterSerializer(data=data)
    assert serializer.is_valid(raise_exception=True)
    user = serializer.save()
    assert user.username == 'newuser'
    assert user.email == 'new@example.com'
    assert user.check_password('newpassword')

@pytest.mark.django_db
def test_login_serializer_validate_success():
    user = User.objects.create_user(username='loginuser', password='loginpassword')
    data = {'username': 'loginuser', 'password': 'loginpassword'}
    
    with patch('django.contrib.auth.authenticate') as mock_authenticate:
        mock_authenticate.return_value = user
        serializer = LoginSerializer(data=data)
        assert serializer.is_valid(raise_exception=True)
        assert serializer.validated_data['user'] == user

@pytest.mark.django_db
def test_login_serializer_validate_invalid_credentials():
    data = {'username': 'nonexistent', 'password': 'wrongpassword'}
    
    with patch('django.contrib.auth.authenticate') as mock_authenticate:
        mock_authenticate.return_value = None
        serializer = LoginSerializer(data=data)
        with pytest.raises(serializers.ValidationError, match='Invalid credentials'):
            serializer.is_valid(raise_exception=True)

@pytest.mark.django_db
def test_login_serializer_validate_missing_fields():
    data_missing_username = {'password': 'testpassword'}
    serializer_username = LoginSerializer(data=data_missing_username)
    with pytest.raises(serializers.ValidationError, match='Must include "username" and "password".'):
        serializer_username.is_valid(raise_exception=True)

    data_missing_password = {'username': 'testuser'}
    serializer_password = LoginSerializer(data=data_missing_password)
    with pytest.raises(serializers.ValidationError, match='Must include "username" and "password".'):
        serializer_password.is_valid(raise_exception=True)
