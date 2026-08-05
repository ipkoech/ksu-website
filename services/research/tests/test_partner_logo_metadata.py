from pathlib import Path


ATTACH_PARTNER_LOGOS = (
    Path(__file__).resolve().parents[1] / "app" / "seeders" / "attach_partner_logos.py"
).read_text()


def test_minnesota_seed_metadata_uses_local_asset_without_brand_webpage():
    minnesota_metadata = ATTACH_PARTNER_LOGOS.split(
        '"university-of-minnesota":',
        maxsplit=1,
    )[1].split(
        '"mozilla-foundation":',
        maxsplit=1,
    )[0]

    assert '"filename": "university-of-minnesota.svg"' in minnesota_metadata
    assert "https://brand.umn.edu" not in minnesota_metadata
