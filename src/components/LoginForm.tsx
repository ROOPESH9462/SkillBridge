"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, Sparkles, User, GraduationCap, CheckCircle } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid email or password");
      }

      // Hard redirect to ensure HttpOnly cookie is attached to all Server Components
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-3xl glass-card border border-emerald-500/30 shadow-2xl space-y-6 glow-green relative overflow-hidden">
      {/* Portal Top Header Badge */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
          <Sparkles className="w-7 h-7 fill-emerald-400 text-emerald-400" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Enterprise Portal Authentication
        </div>
        <h1 className="text-2xl font-black text-slate-100">Sign In to SkillBridge</h1>
        <p className="text-xs text-slate-400">
          Sign in to access your role-based dashboard, skill roadmaps, and mentorship sessions.
        </p>
      </div>

      {/* Portal Switcher Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-dark-bg/80 border border-emerald-500/20 text-xs font-bold">
        <div className="py-2 text-center rounded-lg bg-emerald-500 text-slate-950 font-extrabold shadow-sm">
          Learner / Mentor Portal
        </div>
        <Link
          href="/admin/login"
          className="py-2 text-center rounded-lg text-slate-400 hover:text-emerald-400 transition-colors flex items-center justify-center gap-1"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Admin Portal
        </Link>
      </div>

      {/* 1-Click Demo Login Autofill Chips */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
          ⚡ 1-Click Demo Sign In:
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillCredentials("learner@skillbridge.dev", "password123")}
            className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            Demo Learner
          </button>
          <button
            type="button"
            onClick={() => fillCredentials("mentor@skillbridge.dev", "password123")}
            className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            Demo Mentor
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
            Account Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. learner@skillbridge.dev"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-emerald-500/20 bg-dark-bg/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
            Password
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Authenticating..." : "Sign In to Dashboard"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="pt-4 border-t border-emerald-500/10 text-center text-xs text-slate-400">
        New to SkillBridge?{" "}
        <Link href="/register" className="font-bold text-emerald-400 hover:underline">
          Create New Account
        </Link>
      </div>
    </div>
  );
}
