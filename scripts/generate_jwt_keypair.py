#!/usr/bin/env python3
"""Generate base64-encoded RS256 key settings for the KSU identity boundary."""

from __future__ import annotations

import argparse
import base64
import secrets

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--key-id", help="Stable identifier published in JWT headers and JWKS")
    args = parser.parse_args()

    private_key = rsa.generate_private_key(public_exponent=65537, key_size=3072)
    private_pem = private_key.private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.PKCS8,
        serialization.NoEncryption(),
    )
    public_pem = private_key.public_key().public_bytes(
        serialization.Encoding.PEM,
        serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    key_id = args.key_id or f"ksu-{secrets.token_hex(8)}"

    print(f"JWT_KEY_ID={key_id}")
    print(f"JWT_PRIVATE_KEY_B64={base64.b64encode(private_pem).decode('ascii')}")
    print(f"JWT_PUBLIC_KEY_B64={base64.b64encode(public_pem).decode('ascii')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
