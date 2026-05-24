"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

/** Avoid redirecting to https:// when the site is only served over http:// */
function safeCallbackUrl(raw: string | null): string {
  if (!raw) return "/admin";
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;

  try {
    const url = new URL(raw, window.location.origin);
    // Full URL with wrong scheme (e.g. https while on http) → use path only
    if (
      url.protocol === "https:" &&
      window.location.protocol === "http:"
    ) {
      return url.pathname + url.search || "/admin";
    }
    if (url.origin === window.location.origin) {
      return url.pathname + url.search || "/admin";
    }
  } catch {
    /* ignore */
  }

  return "/admin";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Admin Login</h1>
        <p style={{ textAlign: "center", color: "var(--gray)", marginBottom: "1.5rem" }}>
          Alton&apos;s Carwash Admin
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="login-page">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
