"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, AlertCircle, CheckCircle, Loader2, Camera } from "lucide-react";

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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 1500);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const getInputStyle = (focused: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "0.6875rem 0.875rem 0.6875rem 2.625rem",
    background: "var(--color-surface)",
    border: focused
      ? "1px solid var(--color-accent)"
      : "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    color: "var(--color-text-primary)",
    fontSize: "0.875rem",
    outline: "none",
    boxShadow: focused
      ? "0 0 0 3px rgba(79, 110, 247, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.3)"
      : "inset 0 1px 2px rgba(0, 0, 0, 0.2)",
    transition: "all var(--duration-fast) var(--ease-default)",
  });

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
          Create your vault
        </h1>
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: "0.875rem",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          Set up your private, self-hosted media storage
        </p>
      </div>

      {success ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            padding: "1rem",
            background: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-success)",
            fontSize: "0.875rem",
            marginBottom: "1.5rem",
          }}
        >
          <CheckCircle size={18} />
          <span>Account created! Redirecting to sign in…</span>
        </div>
      ) : (
        <>
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

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
            {/* Name Field */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                htmlFor="name"
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                  marginBottom: "0.375rem",
                  letterSpacing: "-0.01em",
                }}
              >
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <User
                  size={15}
                  style={{
                    position: "absolute",
                    left: "0.875rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: nameFocused ? "var(--color-accent)" : "var(--color-text-faint)",
                    transition: "color var(--duration-fast)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  placeholder="Your name"
                  style={getInputStyle(nameFocused)}
                />
              </div>
            </div>

            {/* Email Field */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                htmlFor="reg-email"
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
                  id="reg-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="you@example.com"
                  style={getInputStyle(emailFocused)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: "1.75rem" }}>
              <label
                htmlFor="reg-password"
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  color: "var(--color-text-primary)",
                  marginBottom: "0.375rem",
                  letterSpacing: "-0.01em",
                }}
              >
                Password <span style={{ color: "var(--color-text-faint)", fontWeight: 400 }}>(min. 8 characters)</span>
              </label>
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
                  id="reg-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="••••••••"
                  style={getInputStyle(passwordFocused)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="register-btn"
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
              <span>{loading ? "Creating account…" : "Create vault account"}</span>
            </button>
          </form>
        </>
      )}

      {/* Footer Sign-in Link */}
      <div
        style={{
          marginTop: "2rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid var(--color-border)",
          fontSize: "0.8125rem",
          color: "var(--color-text-muted)",
        }}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          style={{
            color: "var(--color-accent)",
            fontWeight: 600,
            textDecoration: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
