"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

/**
 * Bespoke Crafted Brand Mark:
 * Combines camera aperture geometry with a vault lock core.
 */
function VaultLogoMark() {
  return (
    <div
      style={{
        width: "3.5rem",
        height: "3.5rem",
        background: "linear-gradient(145deg, #5B7BFA 0%, #7C3AED 100%)",
        borderRadius: "1rem",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow:
          "0 0 0 1px rgba(255, 255, 255, 0.2) inset, 0 8px 24px -4px rgba(79, 110, 247, 0.45)",
        position: "relative",
      }}
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Camera outer body */}
        <path
          d="M3.5 8C3.5 6.61929 4.61929 5.5 6 5.5H8.2C8.75 5.5 9.27 5.2 9.55 4.72L10.2 3.65C10.6 3 11.3 2.5 12.1 2.5H13.9C14.7 2.5 15.4 3 15.8 3.65L16.45 4.72C16.73 5.2 17.25 5.5 17.8 5.5H20C21.3807 5.5 22.5 6.61929 22.5 8V18C22.5 19.3807 21.3807 20.5 20 20.5H6C4.61929 20.5 3.5 19.3807 3.5 18V8Z"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Vault lock / lens aperture core */}
        <circle
          cx="13"
          cy="13"
          r="4.2"
          stroke="white"
          strokeWidth="1.8"
        />
        <circle
          cx="13"
          cy="13"
          r="1.5"
          fill="white"
        />
        {/* Small flash dot */}
        <circle
          cx="18.5"
          cy="8.5"
          r="0.9"
          fill="white"
        />
      </svg>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/library";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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
        setError("Invalid email or password. Please check your credentials.");
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        width: "100%",
        background: "linear-gradient(180deg, rgba(24, 24, 28, 0.94) 0%, rgba(16, 16, 18, 0.98) 100%)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "1.25rem",
        padding: "2.5rem 2.25rem",
        boxShadow:
          "0 0 0 1px rgba(255, 255, 255, 0.04) inset, 0 24px 48px -12px rgba(0, 0, 0, 0.75), 0 0 40px -10px rgba(79, 110, 247, 0.12)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ marginBottom: "1.125rem", display: "inline-block" }}>
          <VaultLogoMark />
        </div>
        <h1
          style={{
            fontSize: "1.45rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.03em",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Photo Vault
        </h1>
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: "0.875rem",
            margin: "0.4rem 0 0 0",
            letterSpacing: "-0.01em",
          }}
        >
          Sign in to your private vault
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            padding: "0.75rem 0.875rem",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.375rem",
            fontSize: "0.8125rem",
            color: "#F87171",
            lineHeight: 1.4,
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
        {/* Email Field */}
        <div style={{ marginBottom: "1.125rem" }}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "var(--color-text-primary)",
              marginBottom: "0.375rem",
              letterSpacing: "-0.01em",
            }}
          >
            Email address
          </label>
          <div style={{ position: "relative" }}>
            <Mail
              size={15}
              style={{
                position: "absolute",
                left: "0.875rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: emailFocused ? "var(--color-accent)" : "var(--color-text-faint)",
                transition: "color var(--duration-fast)",
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
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "0.6875rem 0.875rem 0.6875rem 2.625rem",
                background: "rgba(10, 10, 12, 0.6)",
                border: emailFocused
                  ? "1px solid var(--color-accent)"
                  : "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-primary)",
                fontSize: "0.875rem",
                outline: "none",
                boxShadow: emailFocused
                  ? "0 0 0 3px rgba(79, 110, 247, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.3)"
                  : "inset 0 1px 2px rgba(0, 0, 0, 0.2)",
                transition: "all var(--duration-fast) var(--ease-default)",
              }}
            />
          </div>
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: "1rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.375rem",
            }}
          >
            <label
              htmlFor="password"
              style={{
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--color-text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              Password
            </label>
            <button
              type="button"
              onClick={() =>
                alert("For this personal self-hosted vault, reset passwords via the CLI or server admin.")
              }
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-accent)",
                fontSize: "0.75rem",
                fontWeight: 500,
                cursor: "pointer",
                padding: 0,
                textDecoration: "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              Forgot password?
            </button>
          </div>

          <div style={{ position: "relative" }}>
            <Lock
              size={15}
              style={{
                position: "absolute",
                left: "0.875rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: passwordFocused ? "var(--color-accent)" : "var(--color-text-faint)",
                transition: "color var(--duration-fast)",
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
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "0.6875rem 0.875rem 0.6875rem 2.625rem",
                background: "rgba(10, 10, 12, 0.6)",
                border: passwordFocused
                  ? "1px solid var(--color-accent)"
                  : "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text-primary)",
                fontSize: "0.875rem",
                outline: "none",
                boxShadow: passwordFocused
                  ? "0 0 0 3px rgba(79, 110, 247, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.3)"
                  : "inset 0 1px 2px rgba(0, 0, 0, 0.2)",
                transition: "all var(--duration-fast) var(--ease-default)",
              }}
            />
          </div>
        </div>

        {/* Remember Me Option */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
              fontSize: "0.8125rem",
              color: "var(--color-text-muted)",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                accentColor: "var(--color-accent)",
                width: "0.9375rem",
                height: "0.9375rem",
                cursor: "pointer",
              }}
            />
            <span>Remember this device</span>
          </label>
        </div>

        {/* Primary Action Button (Linear-style elevation) */}
        <button
          type="submit"
          id="sign-in-btn"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: loading
              ? "var(--color-surface-3)"
              : "linear-gradient(180deg, #5B7BFA 0%, #4362F4 100%)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-md)",
            fontSize: "0.875rem",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading
              ? "none"
              : "0 0 0 1px rgba(255, 255, 255, 0.2) inset, 0 2px 8px rgba(79, 110, 247, 0.3), 0 4px 16px rgba(79, 110, 247, 0.2)",
            transition: "all var(--duration-fast) var(--ease-default)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background =
                "linear-gradient(180deg, #6B87FF 0%, #4F6EF7 100%)";
              e.currentTarget.style.boxShadow =
                "0 0 0 1px rgba(255, 255, 255, 0.3) inset, 0 4px 20px rgba(79, 110, 247, 0.45)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background =
                "linear-gradient(180deg, #5B7BFA 0%, #4362F4 100%)";
              e.currentTarget.style.boxShadow =
                "0 0 0 1px rgba(255, 255, 255, 0.2) inset, 0 2px 8px rgba(79, 110, 247, 0.3), 0 4px 16px rgba(79, 110, 247, 0.2)";
            }
          }}
          onMouseDown={(e) => {
            if (!loading) e.currentTarget.style.transform = "scale(0.99)";
          }}
          onMouseUp={(e) => {
            if (!loading) e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          <span>{loading ? "Signing in…" : "Sign in"}</span>
        </button>
      </form>

      {/* Footer Navigation */}
      <div
        style={{
          marginTop: "1.75rem",
          paddingTop: "1.25rem",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          textAlign: "center",
          fontSize: "0.8125rem",
          color: "var(--color-text-muted)",
        }}
      >
        No account yet?{" "}
        <Link
          href="/register"
          style={{
            color: "var(--color-accent)",
            fontWeight: 600,
            textDecoration: "none",
            transition: "color var(--duration-fast)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          Create one
        </Link>
      </div>
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
