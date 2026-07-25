/**
 * Select the public image asset for a research partner.
 *
 * @param {Record<string, unknown>} partner
 * @returns {string}
 */
export function getPartnerLogo(partner) {
  const socialLinks =
    partner.social_links &&
    typeof partner.social_links === "object" &&
    !Array.isArray(partner.social_links)
      ? partner.social_links
      : {};

  const candidates = [
    socialLinks.logo_url,
    socialLinks.logo_asset_path,
    partner.logo_url,
    partner.logo,
    partner.image_url,
    partner.cover_image_url,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return "";
}
