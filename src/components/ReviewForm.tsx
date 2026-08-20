"use client";

import { useState, type FormEvent } from "react";

export interface ReviewFormProps {
  locationId: string;
  onSubmitted?: () => void;
}

export default function ReviewForm({ locationId, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ locationId, rating, text, authorName, honeypot }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Couldn't submit your review right now.");
        return;
      }

      setText("");
      setAuthorName("");
      onSubmitted?.();
    } catch {
      setError("Couldn't submit your review right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-oregon-blue/15 bg-white p-4">
      <label className="flex flex-col text-sm text-oregon-blue/80">
        Rating
        <select
          aria-label="Rating"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="mt-1 w-24 rounded border border-oregon-blue/25 px-2 py-1"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col text-sm text-oregon-blue/80">
        Your review
        <textarea
          aria-label="Your review"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          className="mt-1 rounded border border-oregon-blue/25 px-2 py-1"
          rows={3}
        />
      </label>

      <label className="flex flex-col text-sm text-oregon-blue/80">
        Name (optional)
        <input
          aria-label="Name"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="mt-1 rounded border border-oregon-blue/25 px-2 py-1"
        />
      </label>

      <input
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="absolute left-[-9999px]"
        name="website"
      />

      {error && (
        <p className="rounded border border-gold bg-gold/20 px-3 py-2 text-sm text-oregon-blue">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="self-start rounded-full bg-washington-green px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Submit review
      </button>
    </form>
  );
}
