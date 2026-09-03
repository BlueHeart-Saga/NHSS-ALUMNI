import time
import logging

logger = logging.getLogger("app.cache")

class InMemoryTTLCache:
    def __init__(self, default_ttl: int = 60):
        self._store = {}
        self._default_ttl = default_ttl

    def get(self, key: str):
        now = time.perf_counter()
        if key in self._store:
            value, expires_at = self._store[key]
            if now < expires_at:
                logger.debug(f"Cache HIT for key: {key}")
                return value
            else:
                logger.debug(f"Cache EXPIRED for key: {key}")
                del self._store[key]
        return None

    def set(self, key: str, value, ttl: int = None):
        ttl = ttl if ttl is not None else self._default_ttl
        expires_at = time.perf_counter() + ttl
        self._store[key] = (value, expires_at)
        logger.debug(f"Cache SET for key: {key} (TTL: {ttl}s)")

    def invalidate(self, key_prefix: str = None):
        if key_prefix is None:
            self._store.clear()
            logger.info("Cache CLEARED completely.")
        else:
            keys_to_del = [k for k in self._store.keys() if k.startswith(key_prefix)]
            for k in keys_to_del:
                del self._store[k]
            logger.info(f"Cache INVALIDATED for prefix '{key_prefix}': {len(keys_to_del)} keys removed.")

ttl_cache = InMemoryTTLCache(default_ttl=60)
