"use client";

import { Check } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { Button } from "@ksu/ui";

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface StepWizardProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  children: React.ReactNode;
  onNext?: () => void;
  onPrev?: () => void;
  onComplete?: () => void;
  isNextDisabled?: boolean;
  isCompleting?: boolean;
  completeLabel?: string;
}

export function StepWizard({
  steps,
  currentStep,
  onStepClick,
  children,
  onNext,
  onPrev,
  onComplete,
  isNextDisabled = false,
  isCompleting = false,
  completeLabel = "Complete",
}: StepWizardProps) {
  const isLastStep = currentStep === steps.length;
  const isFirstStep = currentStep === 1;

  return (
    <div className="space-y-8">
      <nav aria-label="Progress" className="px-4">
        <ol className="flex items-center justify-between">
          {steps.map((step, index) => (
            <li key={step.id} className="relative flex-1">
              <button
                onClick={() => step.id < currentStep && onStepClick?.(step.id)}
                disabled={step.id > currentStep}
                className={cn(
                  "group flex flex-col items-center w-full",
                  step.id <= currentStep ? "cursor-pointer" : "cursor-not-allowed"
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    step.id < currentStep
                      ? "border-primary bg-primary text-primary-foreground"
                      : step.id === currentStep
                      ? "border-primary text-primary"
                      : "border-muted text-muted-foreground"
                  )}
                >
                  {step.id < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="font-semibold">{step.id}</span>
                  )}
                </span>
                <span
                  className={cn(
                    "mt-2 text-sm font-medium text-center",
                    step.id <= currentStep ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute left-[calc(50%+24px)] top-5 h-0.5 w-[calc(100%-48px)]",
                    step.id < currentStep ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="min-h-[300px]">
        {children}
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onPrev} disabled={isFirstStep}>
          Previous
        </Button>
        {isLastStep ? (
          <Button onClick={onComplete} disabled={isNextDisabled || isCompleting}>
            {isCompleting ? "Processing..." : completeLabel}
          </Button>
        ) : (
          <Button onClick={onNext} disabled={isNextDisabled}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}