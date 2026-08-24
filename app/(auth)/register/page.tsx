"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, Mail, Lock, User, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.625rem 0.875rem 0.625rem 2.5rem",
    background: "var(--color-surface-2)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    color: "var(--color-text-primary)",
    fontSize: "var(--text-sm)",
    outline: "none",
    transition: "border-color var(--duration-fast)",
  };

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
            background: "linear-gradient(135deg, var(--color-accent), #7C3AED)",
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
          Create your vault
        </h1>
        <p style={{ color: "var(--color-text-muted)", margin: 0, fontSize: "var(--text-sm)" }}>
          Your photos, your server, your control
        </p>
      </div>

      {success ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "1rem",
            background: "rgba(34,197,94,0.1)",
            border: "1px solid var(--color-success)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-success)",
            fontSize: "var(--text-sm)",
          }}
        >
          <CheckCircle size={16} />
          Account created! Redirecting to sign in…
        </div>
      ) : (
        <>
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

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Name */}
            <div>
              <label htmlFor="name" style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-text-muted)", marginBottom: "0.375rem" }}>
                Name
              </label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-faint)", pointerEvents: "none" }} />
                <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-text-muted)", marginBottom: "0.375rem" }}>
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-faint)", pointerEvents: "none" }} />
                <input id="reg-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--color-text-muted)", marginBottom: "0.375rem" }}>
                Password <span style={{ color: "var(--color-text-faint)", fontWeight: 400 }}>(min. 8 characters)</span>
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-faint)", pointerEvents: "none" }} />
                <input id="reg-password" type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")} />
              </div>
            </div>

            <button
              type="submit"
              id="register-btn"
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: "0.5rem",
              }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </>
      )}

      <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--color-accent)", fontWeight: 500, textDecoration: "none" }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
