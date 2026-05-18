import { getNavData } from "@/lib/nav-data";
import { PageShell } from "./site-shell";

interface PublicLayoutProps {
  children: React.ReactNode;
  transparent?: boolean;
}

export async function PublicLayout({ children, transparent = false }: PublicLayoutProps) {
  const megaMenuData = await getNavData();

  return (
    <PageShell transparent={transparent} megaMenuData={megaMenuData}>
      {children}
    </PageShell>
  );
}
