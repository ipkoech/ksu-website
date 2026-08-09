# Included only in public API proxy locations. Never cache authenticated or
# cookie-bearing traffic; nginx also refuses responses carrying Set-Cookie.
proxy_cache ksu_public_api;
proxy_cache_methods GET HEAD;
proxy_cache_key "$scheme$request_method$host$request_uri";
proxy_cache_bypass $skip_public_api_cache;
proxy_no_cache $skip_public_api_cache $upstream_http_set_cookie;
proxy_cache_valid 200 30s;
proxy_cache_valid any 0s;
proxy_cache_lock on;
proxy_cache_lock_timeout 3s;
proxy_cache_use_stale updating error timeout http_500 http_502 http_503 http_504;
proxy_cache_background_update on;
add_header X-Edge-Cache $upstream_cache_status always;
