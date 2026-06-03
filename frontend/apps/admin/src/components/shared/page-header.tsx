"use client";

import { motion } from "framer-motion";
import { Button } from "@ksu/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  createHref?: string;
  createLabel?: string;
  actions?: React.ReactNode;
  backHref?: string;
}

export function PageHeader({
  title,
  description,
  createHref,
  createLabel,
  actions,
  backHref,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8"
    >
      <div className="flex items-center gap-3">
        {backHref && (
          <Button variant="ghost" size="icon" asChild>
            <Link href={backHref} aria-label="Go back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {createHref && (
          <Button asChild>
            <Link href={createHref}>
              <Plus className="h-4 w-4 mr-2" />
              {createLabel || "Create New"}
            </Link>
          </Button>
        )}
      </div>
    </motion.div>
  );
}
