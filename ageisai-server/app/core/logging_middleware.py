import time
import logging
from typing import Callable

from fastapi import Request

logger = logging.getLogger("aegisai")


async def logging_middleware(request: Request, call_next: Callable):
    start_time = time.time()
    response = None
    try:
        response = await call_next(request)
        return response
    finally:
        process_time = (time.time() - start_time) * 1000
        status_code = response.status_code if response else 500
        logger.info(
            "%s %s - %d - %.2fms",
            request.method,
            request.url.path,
            status_code,
            process_time,
        )

