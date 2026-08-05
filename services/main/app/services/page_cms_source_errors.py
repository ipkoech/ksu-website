"""Typed errors raised by Page CMS source adapters."""


class PageCmsSourceError(Exception):
    status_code = 500


class PageCmsSourcePreviewUnsupportedError(PageCmsSourceError):
    status_code = 422


class PageCmsSourceProviderError(PageCmsSourceError):
    status_code = 502


__all__ = [
    "PageCmsSourceError",
    "PageCmsSourcePreviewUnsupportedError",
    "PageCmsSourceProviderError",
]
