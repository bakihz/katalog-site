import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline";
type ButtonSize = "sm" | "md" | "lg";

type AppButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const baseClasses =
  "inline-flex items-center justify-center font-bold transition disabled:cursor-not-allowed";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#10231d] text-white shadow-lg shadow-[#10231d]/15 hover:bg-[#173f32] disabled:bg-[#d8d2c6] disabled:text-[#7a867f]",
  secondary:
    "bg-[#edf1ec] text-[#173f32] hover:bg-[#dfe8de] disabled:bg-[#edf1ec]/60 disabled:text-[#7a867f]",
  outline:
    "border border-[#17201c]/10 bg-white text-[#173f32] hover:border-[#173f32]/30 hover:bg-[#edf1ec] disabled:bg-white disabled:text-[#7a867f]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "rounded-full px-3 py-1.5 text-xs",
  md: "rounded-full px-4 py-2 text-sm",
  lg: "rounded-2xl px-6 py-3 text-sm",
};

function getButtonClassName({
  variant,
  size,
  className,
}: {
  variant: ButtonVariant;
  size: ButtonSize;
  className?: string;
}) {
  return [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function AppButton({
  children,
  className,
  href,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: AppButtonProps) {
  const classes = getButtonClassName({ variant, size, className });

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
