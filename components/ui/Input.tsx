import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium uppercase tracking-[0.15em] text-muted"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full border border-border bg-background px-4 py-3 text-base md:text-sm text-foreground rounded-none",
          "placeholder:text-muted/50",
          "focus:border-black focus:ring-1 focus:ring-black/10 focus:outline-none",
          "transition-all duration-200",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1 font-semibold">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className, id, children, ...props }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium uppercase tracking-[0.15em] text-muted"
        >
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          "w-full border border-border bg-background px-4 py-3 text-base md:text-sm text-foreground rounded-none appearance-none",
          "focus:border-black focus:ring-1 focus:ring-black/10 focus:outline-none",
          "transition-all duration-200",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500 mt-1 font-semibold">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium uppercase tracking-[0.15em] text-muted"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          "w-full resize-none border border-border bg-background px-4 py-3 text-base md:text-sm text-foreground rounded-none",
          "placeholder:text-muted/50",
          "focus:border-black focus:ring-1 focus:ring-black/10 focus:outline-none",
          "transition-all duration-200",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1 font-semibold">{error}</p>}
    </div>
  );
}
