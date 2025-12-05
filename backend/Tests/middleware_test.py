import pytest
from django.http import HttpResponse, JsonResponse
from unittest.mock import MagicMock
import json
from weather.middleware import ExceptionHandlingMiddleware
from weather.custom_exceptions import APIException
from rest_framework.exceptions import ValidationError

def test_exception_handling_middleware_call():
    get_response = MagicMock(return_value=HttpResponse("Success"))
    middleware = ExceptionHandlingMiddleware(get_response)
    request = MagicMock()
    response = middleware(request)
    assert response.status_code == 200
    assert response.content == b"Success"
    get_response.assert_called_once_with(request)

def test_exception_handling_middleware_api_exception():
    middleware = ExceptionHandlingMiddleware(MagicMock())
    request = MagicMock()
    exception = APIException("API Error", status_code=400)
    response = middleware.process_exception(request, exception)
    assert isinstance(response, JsonResponse)
    assert response.status_code == 400
    assert json.loads(response.content)['message'] == "API Error"

def test_exception_handling_middleware_validation_error():
    middleware = ExceptionHandlingMiddleware(MagicMock())
    request = MagicMock()
    exception = ValidationError("Validation Error")
    response = middleware.process_exception(request, exception)
    assert isinstance(response, JsonResponse)
    assert response.status_code == 400
    assert json.loads(response.content)['message'] == "Validation Error"

def test_exception_handling_middleware_unhandled_exception():
    middleware = ExceptionHandlingMiddleware(MagicMock())
    request = MagicMock()
    exception = Exception("Unhandled Error")
    response = middleware.process_exception(request, exception)
    assert isinstance(response, JsonResponse)
    assert response.status_code == 500
    assert json.loads(response.content)['message'] == "A server error occurred."
