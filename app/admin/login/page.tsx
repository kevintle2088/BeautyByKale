"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabasePublic } from "@/lib/supabase";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await supabasePublic.auth.signInWithPassword({
      email,
      password,
    });

    console.log("Supabase auth result:", result);

    if (result.error) {
      setError("Incorrect email or password");
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-[var(--sage)]/30 border border-black/10 rounded-2xl p-8">
        <h1 className="font-display text-2xl tracking-[0.1em] uppercase text-center mb-8">
          Admin Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-black/20 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ink)]"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-black/20 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ink)]"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--ink)] text-white rounded-full py-2.5 text-sm tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}