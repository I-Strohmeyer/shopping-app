import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../lib/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", asChild = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1",
          "disabled:opacity-50 disabled:pointer-events-none select-none",
          variant === "primary" &&
            "bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700",
          variant === "secondary" &&
            "bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300",
          variant === "ghost" &&
            "text-slate-600 hover:bg-slate-100 active:bg-slate-200",
          variant === "danger" &&
            "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
          size === "sm" && "text-sm px-3 py-1.5 min-h-[34px]",
          size === "md" && "text-sm px-4 py-2.5 min-h-[42px]",
          size === "lg" && "text-base px-5 py-3 min-h-[50px]",
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
