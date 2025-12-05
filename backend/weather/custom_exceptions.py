
class APIException(Exception):
    """Base class for API exceptions."""
    status_code = 500
    default_detail = 'A server error occurred.'

    def __init__(self, detail=None, status_code=None):
        if detail is not None:
            self.detail = detail
        else:
            self.detail = self.default_detail

        if status_code is not None:
            self.status_code = status_code

    def __str__(self):
        return self.detail


class ServiceUnavailable(APIException):
    status_code = 503
    default_detail = 'Service temporarily unavailable, try again later.'


class NotFound(APIException):
    status_code = 404
    default_detail = 'Not found.'


class BadRequest(APIException):
    status_code = 400
    default_detail = 'Bad request.'

