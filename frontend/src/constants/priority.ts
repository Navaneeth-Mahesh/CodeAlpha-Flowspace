import type { Priority } from "@/types/task";

export const PRIORITY_META: Record<Priority, { label: string; tone: "neutral" | "primary" | "success" | "danger" | "warning" | "accent" }> = {
  low: { label: "Low", tone: "neutral" },
  medium: { label: "Medium", tone: "primary" },
  high: { label: "High", tone: "warning" },
  urgent: { label: "Urgent", tone: "danger" },
};

export const PRIORITY_ORDER: Priority[] = ["urgent", "high", "medium", "low"];
