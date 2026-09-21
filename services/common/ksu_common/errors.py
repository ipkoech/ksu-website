"""Transport-independent application failures with stable, public messages.

Messages must be safe to return to callers. Internal exception details belong
in secret-safe diagnostics, never in these exceptions.
"""


class ApplicationError(Exception):
    code = "application_error"


class InvalidInput(ApplicationError):
    code = "bad_request"


class AuthenticationRequired(ApplicationError):
    code = "unauthorized"


class AccessDenied(ApplicationError):
    code = "forbidden"


class ResourceNotFound(ApplicationError):
    code = "not_found"


class Conflict(ApplicationError):
    code = "conflict"


class TemporarilyUnavailable(ApplicationError):
    code = "unavailable"
