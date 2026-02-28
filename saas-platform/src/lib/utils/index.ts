import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format a date to locale string
 */
export function formatDate(date: string | Date, locale = "he-IL"): string {
    return new Date(date).toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number, currency = "USD"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(amount);
}

/**
 * Calculate ranking change indicator
 */
export function getRankingChange(
    current: number,
    previous: number | null
): { value: number; direction: "up" | "down" | "same" } {
    if (previous === null) {
        return { value: 0, direction: "same" };
    }
    const change = previous - current; // Lower is better
    if (change > 0) return { value: change, direction: "up" };
    if (change < 0) return { value: Math.abs(change), direction: "down" };
    return { value: 0, direction: "same" };
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + "...";
}

/**
 * Delay execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
    if (!name?.trim()) return "";
    return name
        .split(" ")
        .filter((n) => n.length > 0)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}
