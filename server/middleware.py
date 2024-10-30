# middleware.py
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import  Request, HTTPException, Response
from logger.logging import logging
from config import redis_host, redis_port, redis_db
import redis
import time

# Kết nối đến Redis
redis_client = redis.Redis(host=redis_host, port=redis_port, db=redis_db)


class SpamFilterMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = Response("Too many requests", status_code=429)

        ip = request.client.host
        url = request.url.path

        current_time = int(time.time())
        login_window_size = 3
        window_size = 1  # Thời gian trong giây
        limit = 10  # Giới hạn số yêu cầu

        # Tạo key cho Redis
        key = f"request_count:{ip}:{current_time // window_size}"
        if url == "/login":
            response = Response("Too many requests login", status_code=429)
            window_size = login_window_size
            key = f"request_count:{ip}:login:{current_time // login_window_size}"

        # Tăng số lượng yêu cầu
        request_count = redis_client.incr(key)

        # Đặt thời gian hết hạn cho key nếu nó là lần đầu tiên
        if request_count == 1:
            redis_client.expire(key, window_size)

        # Kiểm tra xem số lượng yêu cầu có vượt quá giới hạn không
        if request_count > limit:
            if request_count > limit:
                logging.info(f"Too many requests from {ip} to {url}")
            return response

        response = await call_next(request)
        return response