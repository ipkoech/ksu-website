const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * next/image and plain <img> do not apply the Next.js basePath to string
 * src values, so local public/ assets must be prefixed explicitly.
 */
export function withBasePath(path: string): string {
  if (!path.startsWith("/") || path.startsWith(`${basePath}/`)) return path;
  return `${basePath}${path}`;
}
