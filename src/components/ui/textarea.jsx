import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  const cleanProps = { ...props };
  if ('data-permission' in cleanProps) delete cleanProps['data-permission'];
  if ('data-toast-success' in cleanProps) delete cleanProps['data-toast-success'];
  if ('data-action' in cleanProps) delete cleanProps['data-action'];
  if ('__wrapped_audit' in cleanProps) delete cleanProps['__wrapped_audit'];

  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...cleanProps}
    />
  );
})
Textarea.displayName = "Textarea"

export { Textarea }