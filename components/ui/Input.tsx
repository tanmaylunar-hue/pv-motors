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
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23525866' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 1rem center",
          backgroundSize: "1.2em",
          paddingRight: "2.5rem"
        }}
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
