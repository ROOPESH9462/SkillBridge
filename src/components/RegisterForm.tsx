"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, User, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, KeyRound } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<"LEARNER" | "MENTOR" | "ADMIN">("LEARNER");
  const [adminSecret, setAdminSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (accountType === "ADMIN" && !adminSecret.trim()) {
      setError("Admin Secret Key is required to create an Admin account.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role: accountType,
          adminSecret: accountType === "ADMIN" ? adminSecret : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Registration failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-3xl glass-card border border-emerald-500/30 shadow-2xl space-y-6 glow-green relative overflow-hidden">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
          <Sparkles className="w-7 h-7 fill-emerald-400 text-emerald-400" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Enterprise Portal Gateway
        </div>
        <h1 className="text-2xl font-black text-slate-100">Create New Account</h1>
        <p className="text-xs text-slate-400">Register as a Learner, Mentor applicant, or Platform Administrator.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
            Full Name *
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Siddharth Verma"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-emerald-500/20 bg-dark-bg/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. siddharth@example.com"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-emerald-500/20 bg-dark-bg/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
        </div>

        {/* Account Type Option */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
            Register Role *
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setAccountType("LEARNER")}
              className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                accountType === "LEARNER"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-sm"
                  : "border-emerald-500/20 bg-dark-bg/40 text-slate-400 hover:bg-emerald-500/5"
              }`}
            >
              <span>Learner</span>
              {accountType === "LEARNER" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => setAccountType("MENTOR")}
              className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                accountType === "MENTOR"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-sm"
                  : "border-emerald-500/20 bg-dark-bg/40 text-slate-400 hover:bg-emerald-500/5"
              }`}
            >
              <span>Mentor</span>
              {accountType === "MENTOR" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => setAccountType("ADMIN")}
              className={`p-2.5 rounded-xl border text-[11px] font-bold transition-all text-center flex flex-col items-center justify-center gap-1 ${
                accountType === "ADMIN"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-sm"
                  : "border-emerald-500/20 bg-dark-bg/40 text-slate-400 hover:bg-emerald-500/5"
              }`}
            >
              <span>Admin</span>
              {accountType === "ADMIN" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
          </div>
          {accountType === "MENTOR" && (
            <p className="text-[11px] text-emerald-400/80 mt-1.5 font-medium">
              * Mentor accounts require admin review & verification before appearing publicly.
            </p>
          )}
          {accountType === "ADMIN" && (
            <p className="text-[11px] text-emerald-400/80 mt-1.5 font-medium">
              * Admin registration requires secret key validation (default key: <code className="text-emerald-300 font-bold">admin123</code>).
            </p>
          )}
        </div>

        {/* Admin Secret Key Input */}
        {accountType === "ADMIN" && (
          <div>
            <label className="block text-xs font-bold text-emerald-400 mb-1.5 uppercase tracking-wider">
              Admin Secret Key *
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" />
              <input
                type="password"
                required
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                placeholder="e.g. admin123"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-emerald-500/40 bg-emerald-500/5 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors font-mono"
              />
            </div>
          </div>
        )}

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
            Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-emerald-500/20 bg-dark-bg/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
            Confirm Password *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-emerald-500/20 bg-dark-bg/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Creating Account..." : `Create ${accountType} Account & Enter Portal`}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-4 border-t border-emerald-500/10 text-center text-xs text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-emerald-400 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
