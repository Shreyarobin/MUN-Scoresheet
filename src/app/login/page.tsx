"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 8,
    color: "#000",
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: 4,
    marginTop: 4,
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "80px auto",
        fontFamily: "sans-serif",
        color: "#fff",
      }}
    >
      <h1>{mode === "login" ? "Chair Login" : "Create Chair Account"}</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={inputStyle}
          />
        </div>
        {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "8px 16px",
            background: "#fff",
            color: "#000",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          {loading ? "Please wait..." : mode === "login" ? "Log In" : "Sign Up"}
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        {mode === "login" ? (
          <>
            No account?{" "}
            <button
              type="button"
              onClick={() => setMode("signup")}
              style={{
                background: "none",
                border: "none",
                color: "#8ab4f8",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Have an account?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              style={{
                background: "none",
                border: "none",
                color: "#8ab4f8",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Log in
            </button>
          </>
        )}
      </p>
    </div>
  );
}