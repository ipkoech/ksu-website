"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@ksu/ui/alert-dialog";
import { motion } from "framer-motion";
import { AlertTriangle, Info, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";

type Variant = "default" | "warning" | "destructive" | "success";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: Variant;
  onConfirm: () => void;
  isLoading?: boolean;
}

const icons: Record<Variant, typeof Info> = {
  default: Info,
  warning: AlertTriangle,
  destructive: AlertCircle,
  success: CheckCircle,
};

const iconColors: Record<Variant, string> = {
  default: "text-blue-500",
  warning: "text-yellow-500",
  destructive: "text-red-500",
  success: "text-green-500",
};

const buttonVariants: Record<Variant, string> = {
  default: "",
  warning: "bg-yellow-600 hover:bg-yellow-700",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  success: "bg-green-600 hover:bg-green-700",
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  const Icon = icons[variant];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mx-auto mb-4"
          >
            <div className={cn("rounded-full p-3 bg-muted", iconColors[variant])}>
              <Icon className="h-8 w-8" />
            </div>
          </motion.div>
          <AlertDialogTitle className="text-center">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-2">
          <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={buttonVariants[variant]}
          >
            {isLoading ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}