import { Badge } from "@/components/ui/Badge";
import { PRIORITY_META } from "@/constants/priority";
import type { Priority } from "@/types/task";

export function PriorityBadge({ priority }: { priority: Priority }) {
  const meta = PRIORITY_META[priority];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
