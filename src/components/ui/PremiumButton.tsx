import React from "react";
import { cn } from "@/lib/utils";

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  containerClassName?: string;
  onClick?: () => void;
}

export function PremiumButton({
  children,
  icon,
  className,
  containerClassName,
  onClick,
  ...props
}: PremiumButtonProps) {
  return (
    <div className={cn("relative group w-fit", containerClassName)}>
      <button
        onClick={onClick}
        className={cn(
          "relative inline-flex items-center justify-center p-[2px] font-semibold text-white bg-white/10 shadow-2xl cursor-pointer rounded-xl shadow-[var(--electric-blue)]/10 transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95 overflow-hidden",
          className
        )}
        {...props}
      >
        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--electric-blue)] via-blue-500 to-purple-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="relative z-10 flex px-8 md:px-10 py-4 rounded-[10px] bg-[#020617] border border-white/5 w-full h-full items-center justify-center">
          <div className="flex items-center gap-3">
            <span
              className="text-[12px] md:text-[14px] font-bold uppercase transition-all duration-500 group-hover:translate-x-1 tracking-[0.2em] whitespace-nowrap"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {children}
            </span>
            {icon && (
              <span className="transition-transform duration-500 group-hover:translate-x-1 text-[var(--electric-blue)] shrink-0">
                {icon}
              </span>
            )}
          </div>
        </span>
      </button>
    </div>
  );
}
