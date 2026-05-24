"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export type TestimonialItem = {
  id: string;
  name: string;
  quote: string;
  rating: number;
  createdAt: string;
};

type Props = {
  businessName: string;
  initialTestimonials: TestimonialItem[];
};

const POLL_MS = 12_000;

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="star-picker" role="group" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= (hover || value) ? "active" : ""}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${star} stars`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function TestimonialsPageContent({
  businessName,
  initialTestimonials,
}: Props) {
  const [testimonials, setTestimonials] =
    useState<TestimonialItem[]>(initialTestimonials);
  const [name, setName] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [liveIndicator, setLiveIndicator] = useState(false);

  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await fetch("/api/testimonials", { cache: "no-store" });
      if (!res.ok) return;
      const data: TestimonialItem[] = await res.json();
      setTestimonials(data);
    } catch {
      /* ignore poll errors */
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchTestimonials();
      setLiveIndicator(true);
      setTimeout(() => setLiveIndicator(false), 600);
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchTestimonials]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, quote, rating }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setStatus("success");
      setName("");
      setQuote("");
      setRating(5);
      await fetchTestimonials();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <section className="section testimonials-page">
      <div className="container">
        <header className="testimonials-hero">
          <h1 className="section-title">Customer Reviews</h1>
          <p className="section-subtitle">
            Share your experience at {businessName} — reviews update live as
            they&apos;re approved.
          </p>
          <div className={`live-badge ${liveIndicator ? "pulse" : ""}`}>
            <span className="live-dot" />
            Live feed
          </div>
        </header>

        <div className="testimonials-layout">
          <aside className="testimonials-submit-panel">
            <div className="form-card testimonials-form-card">
              <h2>Share Your Experience</h2>
              <p className="form-hint">
                Tell others about your visit. We review submissions before they
                appear publicly.
              </p>

              {status === "success" ? (
                <div className="alert alert-success">
                  <strong>Thank you!</strong> Your review was received and will
                  show here once approved.
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {status === "error" && (
                    <div className="alert alert-error">{errorMsg}</div>
                  )}

                  <div className="form-group">
                    <label htmlFor="review-name">Your Name</label>
                    <input
                      id="review-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="First name or initials"
                      required
                      minLength={2}
                      maxLength={80}
                    />
                  </div>

                  <div className="form-group">
                    <label>Your Rating</label>
                    <StarPicker value={rating} onChange={setRating} />
                  </div>

                  <div className="form-group">
                    <label htmlFor="review-quote">Your Review</label>
                    <textarea
                      id="review-quote"
                      value={quote}
                      onChange={(e) => setQuote(e.target.value)}
                      rows={5}
                      placeholder="What did you like about your wash?"
                      required
                      minLength={10}
                      maxLength={1000}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: "100%" }}
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? "Submitting…" : "Submit Review"}
                  </button>
                </form>
              )}

              {status === "success" && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: "100%", marginTop: "1rem" }}
                  onClick={() => setStatus("idle")}
                >
                  Write Another Review
                </button>
              )}
            </div>

            <div className="testimonials-cta-card">
              <h3>Ready for a shine?</h3>
              <p>Book your next wash in under a minute.</p>
              <Link href="/book" className="btn btn-primary">
                Book Now
              </Link>
            </div>
          </aside>

          <div className="testimonials-feed-panel">
            <div className="feed-header">
              <h2>Recent Reviews</h2>
              <span className="feed-count">{testimonials.length} published</span>
            </div>

            <div className="testimonials-feed">
              {testimonials.length === 0 ? (
                <div className="testimonials-empty">
                  <p>No published reviews yet.</p>
                  <p>Be the first to share your experience!</p>
                </div>
              ) : (
                testimonials.map((t, index) => (
                  <article
                    key={t.id}
                    className={`testimonial-card feed-card ${index === 0 ? "newest" : ""}`}
                  >
                    <div className="feed-card-top">
                      <div className="stars">{"★".repeat(t.rating)}</div>
                      <time
                        dateTime={t.createdAt}
                        className="testimonial-time"
                        title={new Date(t.createdAt).toLocaleString()}
                      >
                        {formatDistanceToNow(new Date(t.createdAt), {
                          addSuffix: true,
                        })}
                      </time>
                    </div>
                    <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
                    <cite>— {t.name}</cite>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
