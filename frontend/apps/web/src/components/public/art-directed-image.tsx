import { getImageProps, type ImageProps } from "next/image";

type ImageDimensions = {
  width: number;
  height: number;
};

type ArtDirectedImageProps = {
  alt: string;
  desktopSrc: string;
  mobileSrc?: string | null;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  desktopDimensions?: ImageDimensions;
  mobileDimensions?: ImageDimensions;
};

const defaultDesktopDimensions = {
  width: 1920,
  height: 900,
} satisfies ImageDimensions;

const defaultMobileDimensions = {
  width: 768,
  height: 900,
} satisfies ImageDimensions;

function optimizedImageProps({
  src,
  alt,
  sizes,
  priority,
  dimensions,
  imageClassName,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority: boolean;
  dimensions: ImageDimensions;
  imageClassName?: string;
}) {
  return getImageProps({
    src,
    alt,
    sizes,
    width: dimensions.width,
    height: dimensions.height,
    priority,
    className: imageClassName,
  } satisfies ImageProps).props;
}

export function ArtDirectedImage({
  alt,
  desktopSrc,
  mobileSrc,
  className = "block h-full w-full",
  imageClassName = "h-full w-full object-cover",
  sizes = "100vw",
  priority = false,
  desktopDimensions = defaultDesktopDimensions,
  mobileDimensions = defaultMobileDimensions,
}: ArtDirectedImageProps) {
  const desktop = optimizedImageProps({
    src: desktopSrc,
    alt,
    sizes,
    priority,
    dimensions: desktopDimensions,
    imageClassName,
  });

  const mobile = mobileSrc
    ? optimizedImageProps({
        src: mobileSrc,
        alt,
        sizes,
        priority,
        dimensions: mobileDimensions,
        imageClassName,
      })
    : null;

  return (
    <picture className={className}>
      {mobile?.srcSet ? (
        <source media="(max-width: 767px)" srcSet={mobile.srcSet} />
      ) : null}
      {desktop.srcSet ? (
        <source media="(min-width: 768px)" srcSet={desktop.srcSet} />
      ) : null}
      <img {...desktop} alt={alt} className={imageClassName} />
    </picture>
  );
}
