import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export const StepIndicator = ({ currentStep, totalSteps, stepLabels }: StepIndicatorProps) => {
  return (
    <div className="w-full mb-4 sm:mb-8">
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, index) => (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all",
                  step < currentStep
                    ? "bg-primary text-primary-foreground"
                    : step === currentStep
                    ? "bg-primary text-primary-foreground ring-2 sm:ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step < currentStep ? <Check className="w-3 h-3 sm:w-5 sm:h-5" /> : step}
              </div>
              <span
                className={cn(
                  "mt-1 sm:mt-2 text-[10px] sm:text-xs text-center max-w-[50px] sm:max-w-[80px] leading-tight",
                  step === currentStep ? "text-primary font-medium" : "text-muted-foreground"
                )}
              >
                {stepLabels[index]}
              </span>
            </div>
            {index < totalSteps - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2",
                  step < currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
