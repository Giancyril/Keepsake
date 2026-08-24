"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Camera, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/library";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "400px",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        padding: "2.5rem",
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div
          style={{
            width: "3rem",
            height: "3rem",
            background:
              "linear-gradient(135deg, var(--color-accent), #7C3AED)",
            borderRadius: "var(--radius-lg)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1rem",
          }}
        >
          <Camera size={22} color="white" />
        </div>
        <h1
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            margin: 0,
            marginBottom: "0.375rem",
          }}
        >
          Photo Vault
        </h1>
        <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: "var(--text-sm)" }}>
          Sign in to your private vault
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem",
            background: "var(--color-danger-dim)",
            border: "1px solid var(--color-danger)",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.25rem",
            fontSize: "var(--text-sm)",
            color: "var(--color-danger)",
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label
            htmlFor="email"
            style={{
              display: "block",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              color: "var(--color-text-muted)",
              marginBottom: "0.375rem",
            }}
          >
            Email address
          </label>
          <div style={{ position: "relative" }}>
            <Mail
              size={16}
              style={{
                position: "absolute",
                left: "0.875rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-faint)",
                pointerEvents: "none",
              }}
            />
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "0.625rem 0.875rem 0.625rem 2.5rem",
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-primary)",
                fontSize: "var(--text-sm)",
                outline: "none",
                transition: "border-color var(--duration-fast)",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--color-accent)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--color-border)")
              }
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            style={{
              display: "block",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              color: "var(--color-text-muted)",
              marginBottom: "0.375rem",
            }}
          >
            Password
          </label>
          <div style={{ position: "relative" }}>
            <Lock
              size={16}
              style={{
                position: "absolute",
                left: "0.875rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-faint)",
                pointerEvents: "none",
              }}
            />
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "0.625rem 0.875rem 0.625rem 2.5rem",
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-primary)",
                fontSize: "var(--text-sm)",
                outline: "none",
                transition: "border-color var(--duration-fast)",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--color-accent)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--color-border)")
              }
            />
          </div>
        </div>

        <button
          type="submit"
          id="sign-in-btn"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: loading ? "var(--color-surface-3)" : "var(--color-accent)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background var(--duration-fast)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "0.5rem",
          }}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {/* Register link */}
      <p
        style={{
          textAlign: "center",
          marginTop: "1.5rem",
          fontSize: "var(--text-sm)",
          color: "var(--color-text-muted)",
        }}
      >
        No account?{" "}
        <Link
          href="/register"
          style={{ color: "var(--color-accent)", fontWeight: 500, textDecoration: "none" }}
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <Loader2 size={28} className="animate-spin" style={{ color: "var(--color-accent)" }} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
