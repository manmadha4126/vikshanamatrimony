import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { Zap } from "lucide-react";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
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
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
