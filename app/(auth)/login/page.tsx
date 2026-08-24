"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, AlertCircle, Loader2, Camera } from "lucide-react";

/**
 * Small Wayfinding Logo Mark for the form panel
 */
function WayfindingLogo() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.625rem",
        marginBottom: "2rem",
      }}
    >
      <div
        style={{
          width: "2rem",
          height: "2rem",
          background: "linear-gradient(135deg, var(--color-accent), #7C3AED)",
          borderRadius: "0.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          boxShadow: "0 2px 8px rgba(79, 110, 247, 0.35)",
        }}
      >
        <Camera size={15} strokeWidth={2.2} />
      </div>
      <span
        style={{
          fontSize: "0.9375rem",
          fontWeight: 700,
          color: "var(--color-text-primary)",
          letterSpacing: "-0.02em",
        }}
      >
        Photo Vault
      </span>
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
        setError("Invalid email or password. Please try again.");
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
    <div style={{ width: "100%" }}>
      {/* Top Small Brand Wayfinding Mark */}
      <WayfindingLogo />

      {/* Left-Aligned Headline */}
      <div style={{ marginBottom: "1.75rem" }}>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.03em",
            margin: "0 0 0.4rem 0",
            lineHeight: 1.2,
          }}
        >
          Welcome back
        </h1>
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: "0.875rem",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Sign in to your private photo and video archive
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
            marginBottom: "1.5rem",
            fontSize: "0.8125rem",
            color: "#F87171",
            lineHeight: 1.4,
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
        {/* Email */}
        <div style={{ marginBottom: "1.25rem" }}>
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
                background: "var(--color-surface)",
                border: emailFocused
                  ? "1px solid var(--color-accent)"
                  : "1px solid var(--color-border)",
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

        {/* Password */}
        <div style={{ marginBottom: "1.125rem" }}>
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
                background: "var(--color-surface)",
                border: passwordFocused
                  ? "1px solid var(--color-accent)"
                  : "1px solid var(--color-border)",
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

        {/* Remember Me */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "1.75rem" }}>
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

        {/* Linear-Style Elevated Sign-in Button */}
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

      {/* Footer Register Link */}
      <div
        style={{
          marginTop: "2rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid var(--color-border)",
          fontSize: "0.8125rem",
          color: "var(--color-text-muted)",
        }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          style={{
            color: "var(--color-accent)",
            fontWeight: 600,
            textDecoration: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          Create your vault
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
