import * as React from "react";
import { cn } from "@/lib/utils";

/* shadcn/ui-style primitives (copied pattern, no runtime dependency). Logical properties (ps/pe/ms/me) for RTL. */

type ButtonVariant = "default" | "outline" | "ghost" | "destructive" | "secondary" | "link";
const variants: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  outline: "border border-border bg-card hover:bg-muted",
  ghost: "hover:bg-muted",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  secondary: "bg-muted text-foreground hover:bg-muted/70",
  link: "text-primary underline-offset-4 hover:underline px-0",
};
const sizes = { sm: "h-8 px-3 text-sm", md: "h-10 px-4", lg: "h-11 px-6 text-base", icon: "h-9 w-9" } as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: keyof typeof sizes;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "default", size = "md", ...p }, ref) => (
  <button
    ref={ref}
    className={cn("inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50", variants[variant], sizes[size], className)}
    {...p}
  />
));
Button.displayName = "Button";

export function buttonClass(variant: ButtonVariant = "default", size: keyof typeof sizes = "md", className?: string) {
  return cn("inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors", variants[variant], sizes[size], className);
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => (
  <input ref={ref} className={cn("h-10 w-full rounded-md border border-border bg-card px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40", className)} {...p} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => (
  <textarea ref={ref} className={cn("min-h-24 w-full rounded-md border border-border bg-card px-3 py-2 text-sm leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40", className)} {...p} />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...p }, ref) => (
  <select ref={ref} className={cn("h-10 w-full rounded-md border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40", className)} {...p} />
));
Select.displayName = "Select";

export function Label({ className, ...p }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1 block text-sm font-medium", className)} {...p} />;
}

export function Field({ label, htmlFor, hint, error, children, className }: { label: string; htmlFor: string; hint?: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm sm:p-5", className)} {...p} />;
}

export function Badge({ className, tone = "default", ...p }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "success" | "warning" | "danger" | "muted" | "ai" }) {
  const tones = {
    default: "bg-primary/10 text-primary",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-900",
    danger: "bg-red-100 text-red-800",
    muted: "bg-muted text-muted-foreground",
    ai: "bg-violet-100 text-violet-900",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone], className)} {...p} />;
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">{children}</div>;
}

export function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="num mt-1 text-2xl font-bold">{value}</div>
    </Card>
  );
}
