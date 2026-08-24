"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

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
      }}
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3.5 8C3.5 6.61929 4.61929 5.5 6 5.5H8.2C8.75 5.5 9.27 5.2 9.55 4.72L10.2 3.65C10.6 3 11.3 2.5 12.1 2.5H13.9C14.7 2.5 15.4 3 15.8 3.65L16.45 4.72C16.73 5.2 17.25 5.5 17.8 5.5H20C21.3807 5.5 22.5 6.61929 22.5 8V18C22.5 19.3807 21.3807 20.5 20 20.5H6C4.61929 20.5 3.5 19.3807 3.5 18V8Z"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="13" cy="13" r="4.2" stroke="white" strokeWidth="1.8" />
        <circle cx="13" cy="13" r="1.5" fill="white" />
        <circle cx="18.5" cy="8.5" r="0.9" fill="white" />
      </svg>
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
    background: "rgba(10, 10, 12, 0.6)",
    border: focused
      ? "1px solid var(--color-accent)"
      : "1px solid rgba(255, 255, 255, 0.1)",
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
    <div
      style={{
        width: "100%",
        background:
          "linear-gradient(180deg, rgba(24, 24, 28, 0.94) 0%, rgba(16, 16, 18, 0.98) 100%)",
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
          Create your vault
        </h1>
        <p
          style={{
            color: "var(--color-text-muted)",
            fontSize: "0.875rem",
            margin: "0.4rem 0 0 0",
            letterSpacing: "-0.01em",
          }}
        >
          Your photos, your server, your control
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

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
            {/* Name Field */}
            <div style={{ marginBottom: "1.125rem" }}>
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
            <div style={{ marginBottom: "1.125rem" }}>
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
            <div style={{ marginBottom: "1.5rem" }}>
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
              <span>{loading ? "Creating account…" : "Create account"}</span>
            </button>
          </form>
        </>
      )}

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
        Already have an account?{" "}
        <Link
          href="/login"
          style={{
            color: "var(--color-accent)",
            fontWeight: 600,
            textDecoration: "none",
            transition: "color var(--duration-fast)",
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
