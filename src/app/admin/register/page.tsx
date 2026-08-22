"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Mail, Lock, User, AlertCircle, ArrowRight, KeyRound, Sparkles } from "lucide-react";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (!adminSecret.trim()) {
      setError("Admin Passcode Secret Key is required.");
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
          role: "ADMIN",
          adminSecret,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Admin Registration failed");
      }

      router.push("/dashboard/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Admin Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md mx-auto p-8 rounded-3xl glass-card border border-emerald-500/40 shadow-2xl space-y-6 glow-green relative overflow-hidden">
        {/* Admin Register Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest border border-emerald-500/40 glow-green-sm">
            <Sparkles className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
            Admin Registration Portal
          </div>
          <h1 className="text-2xl font-black text-slate-100">Register Administrator</h1>
          <p className="text-xs text-slate-400">
            Create an Administrator account with full platform management & verification privileges.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Admin Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Admin Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Admin Supervisor"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-emerald-500/20 bg-dark-bg/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          {/* Admin Email */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Admin Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@skillbridge.dev"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-emerald-500/20 bg-dark-bg/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          {/* Admin Secret Passcode */}
          <div>
            <label className="block text-xs font-bold text-emerald-400 mb-1.5 uppercase tracking-wider">
              Admin Master Passcode Key *
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
            <p className="text-[11px] text-emerald-400/80 mt-1 font-medium">
              * Required security key to grant Admin privileges (default: <code className="text-emerald-300 font-bold">admin123</code>).
            </p>
          </div>

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
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-emerald-500/20 bg-dark-bg/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
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
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-emerald-500/20 bg-dark-bg/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Registering Admin..." : "Register Admin & Enter Command Center"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-emerald-500/10 text-center text-xs text-slate-400">
          Already registered as Admin?{" "}
          <Link href="/admin/login" className="font-bold text-emerald-400 hover:underline">
            Admin Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
