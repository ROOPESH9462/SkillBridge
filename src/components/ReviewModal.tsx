"use client";

import React, { useState } from "react";
import { Star, MessageSquare, X, Send, AlertCircle, CheckCircle2 } from "lucide-react";

interface ReviewModalProps {
  sessionId: string;
  mentorName: string;
  topic: string;
  onSuccess?: () => void;
}

export function ReviewModal({ sessionId, mentorName, topic, onSuccess }: ReviewModalProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!comment || comment.trim().length < 5) {
      setError("Please write a constructive review comment (at least 5 characters).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit review.");
      }

      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Review submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition-all"
      >
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        Leave Verified Review
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-card border border-emerald-500/30 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-emerald-500/10">
              <div>
                <h2 className="text-lg font-bold text-slate-100">Leave Verified Session Review</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reviewing <strong>{mentorName}</strong> for "{topic}"
                </p>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  setSuccess(false);
                  setError(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {success ? (
              <div className="py-6 text-center space-y-4 glow-green">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-100">Review Published!</h3>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  Thank you for your feedback. Your verified rating has updated {mentorName}'s public profile metrics.
                </p>
                <button
                  onClick={() => {
                    setOpen(false);
                    setSuccess(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Star Rating Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                    Rating (1 to 5 Stars) *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-2 rounded-xl border transition-all"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? "fill-amber-400 stroke-amber-400 scale-110"
                              : "stroke-slate-600 fill-transparent"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 font-mono font-bold text-amber-400 text-sm">{rating}.0 / 5.0</span>
                  </div>
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    Your Detailed Feedback *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="e.g. Excellent session! Aarav provided deep technical insights on React Server Components caching architecture and helped fix my production memory leak..."
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-emerald-500/20 bg-dark-bg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-emerald-500/10">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {loading ? "Publishing..." : "Publish Review"}
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
