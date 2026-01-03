import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function unixToDate(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

export function toSentenceCase(value: string) {
    if (!value) return ""

    return (
        value
            .toLowerCase()
            .replaceAll("_", " ")
            .replace(/^./, (char) => char.toUpperCase())
    )
}