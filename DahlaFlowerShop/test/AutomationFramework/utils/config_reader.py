"""
ConfigReader - Đọc cấu hình từ biến môi trường hoặc giá trị mặc định.
"""
from __future__ import annotations

import os


class ConfigReader:
    """Cung cấp cấu hình cho toàn bộ framework."""

    FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://127.0.0.1:5500")
    API_BASE_URL = os.getenv("API_BASE_URL", "https://localhost:7114")
    IMPLICIT_WAIT = int(os.getenv("IMPLICIT_WAIT", "10"))
    EXPLICIT_WAIT = int(os.getenv("EXPLICIT_WAIT", "15"))
    HEADLESS = os.getenv("HEADLESS", "true").lower() in ("true", "1", "yes")

    @classmethod
    def page_url(cls, relative_path: str) -> str:
        """Tạo URL đầy đủ từ đường dẫn tương đối."""
        base = cls.FRONTEND_BASE_URL.rstrip("/")
        path = relative_path if relative_path.startswith("/") else f"/{relative_path}"
        return f"{base}{path}"
