"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";

interface CTAAction {
  label: string;
  href: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  external?: boolean;
}

interface CTAProps {
  variant?: "banner" | "card" | "inline";
  title: string;
  description?: string;
  actions: CTAAction[];
  backgroundImage?: string;
  backgroundColor?: "primary" | "secondary" | "dark" | "gradient";
  icon?: React.ReactNode;
  className?: string;
}

const bgClasses = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  dark: "bg-brand-overlay",
  gradient: "bg-gradient-to-r from-primary to-primary/80",
};

export function CTA({
  variant = "banner",
  title,
  description,
  actions,
  backgroundImage,
  backgroundColor = "primary",
  icon,
  className,
}: CTAProps) {
  if (variant === "inline") {
    return (
      <div className={cn("flex flex-wrap items-center gap-4", className)}>
        <span className="text-foreground/80">{title}</span>
        {actions.map((action, idx) => (
          <Link
            key={idx}
            href={action.href}
            target={action.external ? "_blank" : undefined}
            rel={action.external ? "noopener noreferrer" : undefined}
            className="inline-flex items-center gap-1 text-primary font-medium hover:gap-2 transition-all"
          >
            {action.label}
            <ArrowRight className="w-4 h-4" />
          </Link>
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={cn(
          "rounded-xl p-6 text-white",
          bgClasses[backgroundColor],
          className
        )}
      >
        {icon && <div className="mb-4">{icon}</div>}
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        {description && (
          <p className="text-white/80 mb-4">{description}</p>
        )}
        <div className="flex flex-wrap gap-3">
          {actions.map((action, idx) => (
            <Button
              key={idx}
              asChild
              variant={action.variant === "outline" ? "outline" : "secondary"}
              className={cn(
                action.variant === "outline" &&
                  "border-white text-white hover:bg-white hover:text-primary"
              )}
            >
              <Link
                href={action.href}
                target={action.external ? "_blank" : undefined}
                rel={action.external ? "noopener noreferrer" : undefined}
              >
                {action.label}
              </Link>
            </Button>
          ))}
        </div>
      </motion.div>
    );
  }

  // Banner variant (default)
  return (
    <section
      className={cn(
        "relative py-16 lg:py-24 text-white overflow-hidden",
        !backgroundImage && bgClasses[backgroundColor],
        className
      )}
    >
      {/* Background Image */}
      {backgroundImage && (
        <>
          <Image
            src={backgroundImage}
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-primary/80" />
        </>
      )}

      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">{title}</h2>
          {description && (
            <p className="text-lg lg:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {description}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-4">
            {actions.map((action, idx) => (
              <Button
                key={idx}
                asChild
                size="lg"
                variant={action.variant === "outline" ? "outline" : "secondary"}
                className={cn(
                  action.variant === "outline" &&
                    "border-white text-white hover:bg-white hover:text-primary"
                )}
              >
                <Link
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  rel={action.external ? "noopener noreferrer" : undefined}
                >
                  {action.label}
                  {idx === 0 && <ArrowRight className="w-4 h-4 ml-2" />}
                </Link>
              </Button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
