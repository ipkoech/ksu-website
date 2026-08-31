import Image, { type ImageProps } from "next/image";

type ResearchImageProps = Omit<ImageProps, "src"> & {
  src?: ImageProps["src"] | null;
  fallback?: ImageProps["src"];
};

export function ResearchImage({
  src,
  fallback = "/images/research/research-home-hero.webp",
  alt,
  sizes = "(min-width: 1024px) 40vw, 100vw",
  ...props
}: ResearchImageProps) {
  const resolvedSource = src || fallback;
  const isRemote = typeof resolvedSource === "string" && /^https?:\/\//.test(resolvedSource);

  return (
    <Image
      {...props}
      src={resolvedSource}
      alt={alt}
      sizes={sizes}
      unoptimized={props.unoptimized ?? isRemote}
    />
  );
}
