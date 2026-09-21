"use client";

import type { ComponentProps, ReactNode } from "react";
import {
  MiniHeader,
  PublicFooter,
  PublicHeader,
  type MegaMenuData,
} from "@ksu/ui/layout/public";

type PublicSiteChromeProps = {
  contactInfo: NonNullable<ComponentProps<typeof PublicFooter>["contactInfo"]>;
  quickLinks: ComponentProps<typeof MiniHeader>["quickLinks"];
  socialLinks: ComponentProps<typeof MiniHeader>["socialLinks"];
  megaMenuData?: MegaMenuData;
  transparent: boolean;
  researchHref: string;
  libraryHref: string;
  heriHref: string;
  header?: ReactNode;
};

/**
 * Client display boundary for request-scoped navigation and social data.
 * PageShell remains responsible for loading and sanitizing the DTOs; this
 * component owns the interactive header/footer presentation.
 */
export function PublicSiteChrome({
  contactInfo,
  quickLinks,
  socialLinks,
  megaMenuData,
  transparent,
  researchHref,
  libraryHref,
  heriHref,
  header,
}: PublicSiteChromeProps) {
  return (
    <div className="contents" data-server-data-display="web-site-chrome">
      <MiniHeader
        contactInfo={contactInfo}
        quickLinks={quickLinks}
        socialLinks={socialLinks}
      />
      {header ?? (
        <PublicHeader
          transparent={transparent}
          megaMenuData={megaMenuData}
          researchHref={researchHref}
          libraryHref={libraryHref}
          heriHref={heriHref}
        />
      )}
    </div>
  );
}
