from pydantic import BaseModel
from typing import Optional
from fastapi import HTTPException
from fastapi.responses import JSONResponse


class ErrorResponse(BaseModel):
    error: str
    message: str
    detail: Optional[str] = None
    status_code: int


class VeltrixError(HTTPException):
    def __init__(
        self,
        status_code: int,
        error: str,
        message: str,
        detail: Optional[str] = None,
    ):
        self.error = error
        self.veltrix_message = message
        self.veltrix_detail = detail
        super().__init__(status_code=status_code, detail=message)


class BadRequestError(VeltrixError):
    def __init__(self, message: str, error: str = "BAD_REQUEST", detail: str = None):
        super().__init__(400, error, message, detail)


class UnauthorizedError(VeltrixError):
    def __init__(self, message: str = "Non authentifie", error: str = "UNAUTHORIZED"):
        super().__init__(401, error, message)


class ForbiddenError(VeltrixError):
    def __init__(self, message: str = "Acces interdit", error: str = "FORBIDDEN"):
        super().__init__(403, error, message)


class NotFoundError(VeltrixError):
    def __init__(self, resource: str, error: str = None):
        super().__init__(
            404,
            error or f"{resource.upper()}_NOT_FOUND",
            f"{resource} introuvable",
        )


class ConflictError(VeltrixError):
    def __init__(self, message: str, error: str = "CONFLICT"):
        super().__init__(409, error, message)


class RateLimitError(VeltrixError):
    def __init__(self, message: str = "Trop de requetes"):
        super().__init__(429, "RATE_LIMIT_EXCEEDED", message)


def veltrix_error_handler(request, exc: VeltrixError):
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.error,
            message=exc.veltrix_message,
            detail=exc.veltrix_detail,
            status_code=exc.status_code,
        ).model_dump(),
    )
