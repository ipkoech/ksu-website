"use client";

import {
  useEffect,
  useRef,
  useCallback,
  useState,
  createContext,
  useContext,
  type ReactNode,
  type RefObject,
} from "react";

// ============================================================================
// Focus Trap Hook - Traps focus within a container (for modals/lightbox)
// ============================================================================

export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  isActive: boolean
) {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the currently focused element to restore later
    previousActiveElement.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab: if on first element, go to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: if on last element, go to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
      // Restore focus to previous element
      previousActiveElement.current?.focus();
    };
  }, [isActive, containerRef]);
}

// ============================================================================
// Focus Restoration Hook - Restores focus when a component unmounts
// ============================================================================

export function useFocusRestoration() {
  const previousElement = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousElement.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    previousElement.current?.focus();
  }, []);

  return { saveFocus, restoreFocus };
}

// ============================================================================
// Live Region Hook - Announces changes to screen readers
// ============================================================================

export function useLiveAnnounce() {
  const [announcement, setAnnouncement] = useState("");
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);

  const announce = useCallback((message: string, delay = 100) => {
    // Clear any pending announcement
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Small delay to ensure screen readers pick up the change
    timeoutRef.current = setTimeout(() => {
      setAnnouncement(message);
      // Clear after announcement
      setTimeout(() => setAnnouncement(""), 1000);
    }, delay);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const LiveRegion = useCallback(
    () => (
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    ),
    [announcement]
  );

  return { announce, LiveRegion };
}

// ============================================================================
// Skip Animation Link - Allows users to skip animated content
// ============================================================================

export interface SkipAnimationLinkProps {
  targetId: string;
  children?: ReactNode;
  className?: string;
}

export function SkipAnimationLink({
  targetId,
  children = "Skip animation",
  className,
}: SkipAnimationLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={
        className ??
        "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      }
    >
      {children}
    </a>
  );
}

// ============================================================================
// Accessible Video Player - Auto-playing video with proper controls
// ============================================================================

export interface AccessibleVideoProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
  videoClassName?: string;
  showControls?: "always" | "hover" | "never";
  pauseOnReducedMotion?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export function AccessibleVideo({
  src,
  poster,
  autoPlay = true,
  loop = true,
  muted = true,
  className,
  videoClassName,
  showControls = "hover",
  pauseOnReducedMotion = true,
  ariaLabel = "Background video",
  ariaDescribedBy,
}: AccessibleVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showControlsState, setShowControlsState] = useState(
    showControls === "always"
  );

  // Check for reduced motion preference
  useEffect(() => {
    if (!pauseOnReducedMotion) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches && videoRef.current) {
      videoRef.current.pause();
      setIsPaused(true);
    }
  }, [pauseOnReducedMotion]);

  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPaused(false);
    } else {
      videoRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        togglePlayPause();
      }
    },
    [togglePlayPause]
  );

  return (
    <div
      className={className}
      onMouseEnter={() => showControls === "hover" && setShowControlsState(true)}
      onMouseLeave={() =>
        showControls === "hover" && setShowControlsState(false)
      }
      onFocus={() => showControls === "hover" && setShowControlsState(true)}
      onBlur={() => showControls === "hover" && setShowControlsState(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline
        className={videoClassName}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      />

      {showControls !== "never" && (
        <button
          onClick={togglePlayPause}
          onKeyDown={handleKeyDown}
          className={`absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white transition-opacity focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black ${
            showControlsState ? "opacity-100" : "opacity-0"
          }`}
          aria-label={isPaused ? "Play video" : "Pause video"}
          aria-pressed={!isPaused}
        >
          {isPaused ? (
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Prefers Reduced Motion Context - Share state across components
// ============================================================================

interface ReducedMotionContextValue {
  prefersReducedMotion: boolean;
  forceReducedMotion: boolean;
  setForceReducedMotion: (value: boolean) => void;
  shouldReduceMotion: boolean;
}

const ReducedMotionContext = createContext<ReducedMotionContextValue | null>(
  null
);

export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [forceReducedMotion, setForceReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const shouldReduceMotion = prefersReducedMotion || forceReducedMotion;

  return (
    <ReducedMotionContext.Provider
      value={{
        prefersReducedMotion,
        forceReducedMotion,
        setForceReducedMotion,
        shouldReduceMotion,
      }}
    >
      {children}
    </ReducedMotionContext.Provider>
  );
}

export function useReducedMotionContext() {
  const context = useContext(ReducedMotionContext);
  if (!context) {
    throw new Error(
      "useReducedMotionContext must be used within a ReducedMotionProvider"
    );
  }
  return context;
}

// ============================================================================
// Accessible Motion Wrapper - Wraps any motion component with a11y features
// ============================================================================

export interface AccessibleMotionProps {
  children: ReactNode;
  skipLinkTarget?: string;
  announceOnReveal?: string;
  role?: string;
  ariaLabel?: string;
}

export function AccessibleMotion({
  children,
  skipLinkTarget,
  announceOnReveal,
  role,
  ariaLabel,
}: AccessibleMotionProps) {
  const { announce, LiveRegion } = useLiveAnnounce();
  const hasAnnounced = useRef(false);

  useEffect(() => {
    if (announceOnReveal && !hasAnnounced.current) {
      announce(announceOnReveal);
      hasAnnounced.current = true;
    }
  }, [announceOnReveal, announce]);

  return (
    <>
      {skipLinkTarget && (
        <SkipAnimationLink targetId={skipLinkTarget}>
          Skip to main content
        </SkipAnimationLink>
      )}
      <div role={role} aria-label={ariaLabel}>
        {children}
      </div>
      <LiveRegion />
    </>
  );
}

// ============================================================================
// Focus Visible Styles - Consistent focus indicators
// ============================================================================

export const focusVisibleStyles = {
  default:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  primary:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  white:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary",
  inset:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
};

// ============================================================================
// Animation Duration Constants (WCAG compliant)
// ============================================================================

export const a11yTimingLimits = {
  maxAutoplayDuration: 5000, // 5 seconds max for auto-playing animations
  maxTransitionDuration: 400, // Transitions should be under 400ms for comfort
  minPauseDuration: 1500, // Minimum pause between animation cycles
  flashThreshold: 3, // Max 3 flashes per second (WCAG 2.3.1)
};

// ============================================================================
// Screen Reader Only Text
// ============================================================================

export function ScreenReaderOnly({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

// ============================================================================
// Visually Hidden but Focusable (for skip links)
// ============================================================================

export function VisuallyHiddenFocusable({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`sr-only focus:not-sr-only focus:absolute focus:z-50 ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
