import { useEffect, useRef, useState } from "react";
import { Send, Smile, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";
import { taskService } from "@/services/task.service";
import { getSocket } from "@/services/socket";
import { timeAgo } from "@/utils/date";
import { cn } from "@/utils/cn";
import type { Comment } from "@/types/task";

const QUICK_REACTIONS = ["👍", "🎉", "❤️", "😄", "👀"];

export function CommentsSection({ taskId }: { taskId: string; projectId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    taskService
      .getComments(taskId)
      .then(setComments)
      .finally(() => setLoading(false));
  }, [taskId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handleNew = (comment: Comment) => {
      if (comment.task === taskId) setComments((prev) => (prev.some((c) => c._id === comment._id) ? prev : [...prev, comment]));
    };
    socket.on("comment:new", handleNew);
    return () => {
      socket.off("comment:new", handleNew);
    };
  }, [taskId]);

  const handleSend = async () => {
    if (!content.trim()) return;
    setSending(true);
    try {
      const comment = await taskService.addComment(taskId, content.trim());
      setComments((prev) => (prev.some((c) => c._id === comment._id) ? prev : [...prev, comment]));
      setContent("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } finally {
      setSending(false);
    }
  };

  const handleReact = async (commentId: string, emoji: string) => {
    const updated = await taskService.toggleReaction(commentId, emoji);
    setComments((prev) => prev.map((c) => (c._id === commentId ? updated : c)));
  };

  const handleDelete = async (commentId: string) => {
    await taskService.deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        {loading && <p className="text-sm text-[var(--color-text-muted)]">Loading comments…</p>}
        {!loading && comments.length === 0 && (
          <p className="text-sm text-[var(--color-text-muted)]">No comments yet. Start the conversation.</p>
        )}
        {comments.map((c) => (
          <div key={c._id} className="group flex gap-2.5">
            <Avatar name={c.author.name} initials={c.author.avatarInitials} color={c.author.avatarColor} size="sm" />
            <div className="flex-1">
              <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] px-3 py-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-[var(--color-text)]">{c.author.name}</span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {timeAgo(c.createdAt)}
                    {c.edited && " · edited"}
                  </span>
                </div>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-[var(--color-text-secondary)]">{c.content}</p>
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                {c.reactions.map((r) => (
                  <button
                    key={r.emoji}
                    onClick={() => handleReact(c._id, r.emoji)}
                    className={cn(
                      "flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs",
                      r.users.includes(user?.id ?? "")
                        ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                        : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                    )}
                  >
                    {r.emoji} {r.users.length}
                  </button>
                ))}
                <ReactionPicker onSelect={(emoji) => handleReact(c._id, emoji)} />
                {c.author.id === user?.id && (
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
                    aria-label="Delete comment"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-end gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          placeholder="Write a comment…"
          className="surface-neu-inset flex-1 resize-none px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        />
        <button
          onClick={handleSend}
          disabled={sending || !content.trim()}
          aria-label="Send comment"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-white disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ReactionPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]" aria-label="Add reaction">
        <Smile className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="surface-glass absolute bottom-6 left-0 z-30 flex gap-1 rounded-full px-2 py-1.5 shadow-xl">
          {QUICK_REACTIONS.map((e) => (
            <button
              key={e}
              onClick={() => {
                onSelect(e);
                setOpen(false);
              }}
              className="text-base hover:scale-125 transition-transform"
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
