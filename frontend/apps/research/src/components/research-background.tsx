import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import {
  Atom,
  BarChart3,
  BookOpen,
  Dna,
  FlaskConical,
  Leaf,
  Lightbulb,
  Microscope,
  Network,
  Orbit,
} from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";

type ResearchBackgroundVariant = "discovery" | "evidence" | "field" | "innovation";
type ResearchBackgroundIntensity = "soft" | "medium";

type ResearchBackgroundProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  variant?: ResearchBackgroundVariant;
  intensity?: ResearchBackgroundIntensity;
  contentClassName?: string;
  plateImage?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

const variantIcons = {
  discovery: [Microscope, Atom, BookOpen, Network],
  evidence: [BarChart3, BookOpen, Dna, FlaskConical],
  field: [Leaf, FlaskConical, Network, BookOpen],
  innovation: [Lightbulb, Orbit, Atom, Network],
};

const intensityClasses: Record<ResearchBackgroundIntensity, string> = {
  soft: "opacity-60",
  medium: "opacity-90",
};

export function ResearchBackground<T extends ElementType = "div">({
  as,
  children,
  variant = "discovery",
  intensity = "soft",
  contentClassName,
  className,
  plateImage,
  ...props
}: ResearchBackgroundProps<T>) {
  const Component = as ?? "div";
  const icons = variantIcons[variant];

  return (
    <Component
      className={cn(
        "relative isolate overflow-hidden bg-[hsl(var(--surface-page))] text-foreground",
        className,
      )}
      {...props}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
          intensityClasses[intensity],
        )}
      >
        {plateImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.065] grayscale"
            style={{ backgroundImage: `url(${plateImage})` }}
          />
        ) : null}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,hsl(var(--primary)/0.15),transparent_27%),radial-gradient(circle_at_92%_14%,hsl(var(--secondary)/0.10),transparent_25%),radial-gradient(circle_at_55%_100%,hsl(var(--primary)/0.08),transparent_34%)]" />
        <div className="research-background-grid absolute inset-0" />
        <div className="research-background-dots absolute -right-8 -top-10 h-72 w-72" />
        <div className="research-background-dots absolute -bottom-12 -left-10 h-64 w-64 opacity-60" />

        <svg viewBox="0 0 1200 420" preserveAspectRatio="none" className="absolute inset-x-0 top-1/2 h-72 w-full -translate-y-1/2 opacity-35">
          <path d="M-40 310C140 140 250 250 410 150S690 70 820 190s250 80 430-70" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="7 11" />
          <path d="M-20 350C180 230 300 340 470 230s300-80 420 10 230 60 350-30" fill="none" stroke="hsl(var(--secondary))" strokeWidth="1.5" strokeDasharray="3 13" />
          {[120, 410, 720, 1030].map((x, index) => (
            <g key={x}>
              <circle cx={x} cy={[226, 150, 174, 148][index]} r="8" fill={index % 2 ? "hsl(var(--secondary))" : "hsl(var(--primary))"} />
              <circle cx={x} cy={[226, 150, 174, 148][index]} r="20" fill="none" stroke="hsl(var(--primary))" strokeOpacity=".32" />
            </g>
          ))}
        </svg>

        <div className="absolute inset-0">
          {icons.map((Icon, index) => (
            <span
              key={`${variant}-${index}`}
              className={cn(
                "absolute flex h-14 w-14 items-center justify-center rounded-full border border-primary/15 bg-white/45 text-primary shadow-sm backdrop-blur-sm",
                index === 0 && "left-[5%] top-[18%]",
                index === 1 && "right-[8%] top-[22%] text-secondary",
                index === 2 && "bottom-[12%] left-[16%] hidden sm:flex",
                index === 3 && "bottom-[16%] right-[20%] hidden lg:flex",
              )}
            >
              <Icon className="h-6 w-6" strokeWidth={1.35} />
            </span>
          ))}
        </div>
      </div>

      <div className={cn("relative z-0", contentClassName)}>{children}</div>
    </Component>
  );
}

