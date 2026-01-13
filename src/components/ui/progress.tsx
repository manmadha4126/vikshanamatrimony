import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { Zap } from "lucide-react";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  showLabel?: boolean;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, showLabel = false, ...props }, ref) => (
  <div className="flex items-center gap-2">
    <ProgressPrimitive.Root
      ref={ref}
      className={cn("relative h-2.5 w-3/4 overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all flex items-center justify-end shadow-sm"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      >
        <Zap className="h-2.5 w-2.5 text-primary-foreground mr-0.5 fill-current" />
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
    {showLabel && (
      <span className="text-xs font-medium text-muted-foreground min-w-[2.5rem]">
        {Math.round(value || 0)}%
      </span>
    )}
  </div>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
