from django.http import JsonResponse
from .custom_exceptions import APIException, ServiceUnavailable, BadRequest, NotFound
import logging
from rest_framework.exceptions import ValidationError

logger = logging.getLogger(__name__)

class ExceptionHandlingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        if isinstance(exception, APIException):
            if isinstance(exception, ServiceUnavailable):
                logger.error(f"Service Unavailable Exception: {exception.detail}", exc_info=True)
                status_code = 503
            elif isinstance(exception, BadRequest):
                logger.warning(f"Bad Request Exception: {exception.detail}")
                status_code = 400
            elif isinstance(exception, NotFound):
                logger.info(f"Not Found Exception: {exception.detail}")
                status_code = 404
            else:
                logger.error(f"API Exception: {exception.detail}", exc_info=True)
                status_code = exception.status_code

            response_data = {'code': status_code, 'message': exception.detail}
            return JsonResponse(response_data, status=status_code)
        
        elif isinstance(exception, ValidationError):
            # For DRF validation errors, return 400 with details
            logger.warning(f"Validation Error: {exception.detail}")
            response_data = {'code': 400, 'message': 'Validation Error', 'details': exception.detail}
            return JsonResponse(response_data, status=400)

        # For any other unhandled exception, log it and return a generic 500 error.
        logger.error(f"Unhandled exception: {exception}", exc_info=True)
        response_data = {'code': 500, 'message': 'A server error occurred.'}
        return JsonResponse(response_data, status=500)
