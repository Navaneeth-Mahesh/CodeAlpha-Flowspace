import { format, isToday, isTomorrow, isPast, isThisYear, formatDistanceToNow } from "date-fns";

export function formatDueDate(date?: string | Date): string {
  if (!date) return "";
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, isThisYear(d) ? "MMM d" : "MMM d, yyyy");
}

export function isOverdue(date?: string | Date): boolean {
  if (!date) return false;
  return isPast(new Date(date)) && !isToday(new Date(date));
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
