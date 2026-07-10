// Simple class name merger — avoids clsx/tailwind-merge dependency for Tailwind v4
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
