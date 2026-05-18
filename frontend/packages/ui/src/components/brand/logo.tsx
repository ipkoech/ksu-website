"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "../../lib/utils";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizeMap: Record<LogoSize, { width: number; height: number; className: string }> = {
  xs: { width: 24, height: 24, className: "h-6 w-6" },
  sm: { width: 32, height: 32, className: "h-8 w-8" },
  md: { width: 40, height: 40, className: "h-10 w-10" },
  lg: { width: 64, height: 64, className: "h-16 w-16" },
  xl: { width: 96, height: 96, className: "h-24 w-24" },
};

interface LogoProps {
  size?: LogoSize;
  showText?: boolean;
  textClassName?: string;
  className?: string;
  href?: string;
  variant?: "full" | "icon";
  priority?: boolean;
}

export function Logo({
  size = "md",
  showText = false,
  textClassName,
  className,
  href,
  variant = "icon",
  priority = false,
}: LogoProps) {
  const { width, height, className: sizeClass } = sizeMap[size];

  const logoContent = (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="/logos/ksu-logo.png"
        alt="Kisii University Logo"
        width={width}
        height={height}
        className={cn(sizeClass, "object-contain")}
        priority={priority}
      />
      {showText && variant === "full" && (
        <div className={cn("hidden sm:block", textClassName)}>
          <p className="text-lg font-bold text-primary leading-tight">Kisii University</p>
          <p className="text-xs text-muted-foreground">Excellence in Education</p>
        </div>
      )}
      {showText && variant === "icon" && (
        <span className={cn("font-semibold", textClassName)}>KSU Admin</span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

interface LogoIconProps {
  size?: LogoSize;
  className?: string;
  priority?: boolean;
}

export function LogoIcon({ size = "md", className, priority = false }: LogoIconProps) {
  const { width, height, className: sizeClass } = sizeMap[size];

  return (
    <Image
      src="/logos/ksu-logo.png"
      alt="Kisii University Logo"
      width={width}
      height={height}
      className={cn(sizeClass, "object-contain", className)}
      priority={priority}
    />
  );
}
