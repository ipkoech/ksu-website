import Image from "next/image";
import { resolveMainMediaUrl } from "@ksu/api-client/media";

export function TeamPersonPhoto({ photoUrl, name, initials }: {
  photoUrl?: string | null;
  name: string;
  initials: string;
}) {
  const src = resolveMainMediaUrl(photoUrl);
  return src ? <Image src={src} alt={name} width={48} height={48} className="h-full w-full rounded-full object-cover" unoptimized /> : <>{initials}</>;
}
