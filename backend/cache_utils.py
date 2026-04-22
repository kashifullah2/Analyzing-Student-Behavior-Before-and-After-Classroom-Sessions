"""
Caching utilities for emotion detection models and session data
Improves performance by avoiding redundant model loading and calculations
"""
import time
from functools import wraps
from typing import Any, Callable, Dict, Optional

class Cache:
    """Simple in-memory cache with TTL support"""
    def __init__(self, ttl: int = 300):  # 5 minutes default
        self.ttl = ttl
        self.data: Dict[str, tuple] = {}  # {key: (value, expiry_time)}

    def set(self, key: str, value: Any) -> None:
        """Store value with TTL"""
        self.data[key] = (value, time.time() + self.ttl)

    def get(self, key: str) -> Optional[Any]:
        """Retrieve value if not expired"""
        if key in self.data:
            value, expiry = self.data[key]
            if time.time() < expiry:
                return value
            else:
                del self.data[key]
        return None

    def clear(self) -> None:
        """Clear all cache"""
        self.data.clear()

    def cleanup_expired(self) -> None:
        """Remove expired entries"""
        current_time = time.time()
        expired_keys = [k for k, (_, expiry) in self.data.items() if current_time > expiry]
        for k in expired_keys:
            del self.data[k]


# Global caches
model_cache = Cache(ttl=3600)  # 1 hour TTL for models
session_stats_cache = Cache(ttl=60)  # 1 minute TTL for stats
detector_cache = Cache(ttl=3600)  # 1 hour TTL for face detectors


def cached(cache_obj: Cache, ttl: int = None):
    """Decorator for caching function results"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # Try to get from cache
            cached_value = cache_obj.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache_obj.set(cache_key, result)
            return result
        return wrapper
    return decorator
