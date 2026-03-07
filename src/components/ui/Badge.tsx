import { cn } from "@/lib/utils";

type Variant = "default" | "primary" | "success" | "warning" | "danger" | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  default:  "bg-slate-100 text-slate-700",
  primary:  "bg-indigo-100 text-indigo-700",
  success:  "bg-emerald-100 text-emerald-700",
  warning:  "bg-amber-100 text-amber-700",
  danger:   "bg-red-100 text-red-700",
  outline:  "border border-slate-300 text-slate-600",
};

export default function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
