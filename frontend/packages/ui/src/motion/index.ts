// Timing and easing constants
export { timing, easing, stagger } from "./transitions";
export type { Timing, Easing } from "./transitions";

// Animation presets
export {
  fadeUp,
  fadeDown,
  fadeIn,
  fadeLeft,
  fadeRight,
  scaleIn,
  scaleUp,
  staggerContainer,
  staggerItem,
  kenBurns,
  crossfade,
  pageSlideLeft,
  pageSlideRight,
  pageFade,
  presets,
  interactions,
  hoverLift,
  hoverGlow,
  tapScale,
} from "./presets";
export type { PresetName } from "./presets";

// Hooks
export {
  useScrollReveal,
  useStaggerChildren,
  useCountUp,
  useReducedMotion,
  useImageRotation,
} from "./hooks";
export type {
  UseScrollRevealOptions,
  UseStaggerOptions,
  UseCountUpOptions,
} from "./hooks";

// Core motion components
export {
  RevealSection,
  StaggerGrid,
  MotionCard,
  KenBurnsImage,
  CrossfadeImages,
  CountUpNumber,
  VideoHero,
  PageHeader,
} from "./components";
export type {
  RevealSectionProps,
  StaggerGridProps,
  MotionCardProps,
  KenBurnsImageProps,
  CrossfadeImagesProps,
  CountUpNumberProps,
  VideoHeroProps,
  PageHeaderProps,
} from "./components";

// Asset reveal components (images, videos)
export {
  AssetReveal,
  RevealImage,
  RevealVideo,
} from "./asset-reveal";
export type {
  AssetRevealProps,
  AssetRevealType,
  RevealImageProps,
  RevealVideoProps,
} from "./asset-reveal";

// Section transitions
export {
  Section,
  SectionHeader,
  SectionDivider,
  PageTransition,
  ContentReveal,
} from "./section-transitions";
export type {
  SectionProps,
  SectionTransition,
  SectionHeaderProps,
  SectionDividerProps,
  PageTransitionProps,
  ContentRevealProps,
} from "./section-transitions";

// Gallery components
export {
  GalleryGrid,
  Lightbox,
  BentoGallery,
} from "./gallery";
export type {
  GalleryItem,
  GalleryLayout,
  GalleryColumns,
  HoverEffect,
  GalleryGridProps,
  LightboxProps,
  BentoGalleryProps,
} from "./gallery";

// Text reveal components
export {
  TextReveal,
  HighlightText,
  Typewriter,
  SplitText,
} from "./text-reveal";
export type {
  TextRevealType,
  TextRevealProps,
  HighlightTextProps,
  TypewriterProps,
  SplitTextProps,
} from "./text-reveal";

// Parallax components
export {
  ParallaxSection,
  ParallaxElement,
  ScrollProgress,
  FloatingElement,
  FadeOnScroll,
  StickyReveal,
} from "./parallax";
export type {
  ParallaxSectionProps,
  ParallaxElementProps,
  ScrollProgressProps,
  FloatingElementProps,
  FadeOnScrollProps,
  StickyRevealProps,
} from "./parallax";

// Accessibility utilities
export {
  useFocusTrap,
  useFocusRestoration,
  useLiveAnnounce,
  SkipAnimationLink,
  AccessibleVideo,
  ReducedMotionProvider,
  useReducedMotionContext,
  AccessibleMotion,
  focusVisibleStyles,
  a11yTimingLimits,
  ScreenReaderOnly,
  VisuallyHiddenFocusable,
} from "./accessibility";
export type {
  SkipAnimationLinkProps,
  AccessibleVideoProps,
  AccessibleMotionProps,
} from "./accessibility";
