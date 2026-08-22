"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight, KeyRound, Sparkles } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid Admin credentials");
      }

      if (data.user?.role !== "ADMIN") {
        throw new Error("Access Denied: This portal is strictly for Platform Administrators.");
      }

      router.push("/dashboard/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Admin Sign In failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md mx-auto p-8 rounded-3xl glass-card border border-emerald-500/40 shadow-2xl space-y-6 glow-green relative overflow-hidden">
        {/* Admin Portal Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest border border-emerald-500/40 glow-green-sm">
            <Sparkles className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
            Admin Command Center
          </div>
          <h1 className="text-2xl font-black text-slate-100">Administrator Sign In</h1>
          <p className="text-xs text-slate-400">
            Authorized entry portal for platform analytics, mentor verification queue, and user management.
          </p>
        </div>

        {/* Portal Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-dark-bg/80 border border-emerald-500/20 text-xs font-bold">
          <Link
            href="/login"
            className="py-2 text-center rounded-lg text-slate-400 hover:text-emerald-400 transition-colors"
          >
            Learner / Mentor Portal
          </Link>
          <div className="py-2 text-center rounded-lg bg-emerald-500 text-slate-950 font-extrabold shadow-sm">
            Admin Portal
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Admin Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@skillbridge.dev"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-emerald-500/30 bg-dark-bg/90 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-emerald-500/30 bg-dark-bg/90 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Authenticating Admin..." : "Enter Admin Command Center"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-emerald-500/10 flex items-center justify-between text-xs text-slate-400">
          <span>Need an Admin Account?</span>
          <Link href="/admin/register" className="font-bold text-emerald-400 hover:underline flex items-center gap-1">
            Register Admin
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
