"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
  isLoading?: boolean;
}

interface ButtonAsButton extends ButtonBaseProps {
  href?: undefined;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
}

interface ButtonAsLink extends ButtonBaseProps {
  href: string;
  target?: string;
  rel?: string;
  type?: never;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  disabled?: never;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-black text-white hover:bg-neutral-900 border border-black focus-visible:ring-black",
  secondary:
    "bg-transparent border border-black/20 text-black hover:border-black hover:bg-neutral-50/50 focus-visible:ring-black/50",
  outline:
    "border border-foreground/30 text-foreground hover:bg-foreground hover:text-background focus-visible:ring-foreground",
  ghost:
    "text-muted hover:text-foreground hover:bg-surface-elevated focus-visible:ring-foreground/30",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs uppercase tracking-wider",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-sm uppercase tracking-wider",
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40 disabled:pointer-events-none";

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  isLoading = false,
  ...props
}: ButtonProps) {
  const classes = cn(
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    isLoading && "opacity-75 pointer-events-none",
    className
  );

  const loaderIcon = isLoading && (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  if ("href" in props && props.href) {
    const { href, target, rel, onClick } = props as ButtonAsLink;
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        onClick={(e) => {
          if (isLoading) {
            e.preventDefault();
            return;
          }
          if (onClick) onClick(e);
        }}
        className={classes}
      >
        {loaderIcon}
        {children}
      </Link>
    );
  }

  const { type = "button", onClick, disabled } = props as ButtonAsButton;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={classes}
    >
      {loaderIcon}
      {children}
    </button>
  );
}
