import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  const cleanProps = { ...props };
  if ('data-permission' in cleanProps) delete cleanProps['data-permission'];
  if ('data-toast-success' in cleanProps) delete cleanProps['data-toast-success'];
  if ('data-action' in cleanProps) delete cleanProps['data-action'];
  if ('__wrapped_audit' in cleanProps) delete cleanProps['__wrapped_audit'];

  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...cleanProps}
    />
  );
})
Input.displayName = "Input"

export { Input }