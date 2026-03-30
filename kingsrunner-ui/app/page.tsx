"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Mail, Lock, Loader2, AlertTriangle, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface AuthResponse {
  token: string;
  fullName: string;
  role: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDevMock, setIsDevMock] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Invalid credentials. Access denied.");
      }

      const data: AuthResponse = await response.json();

      const jwt = data.token;
      if (!jwt) throw new Error("Authentication succeeded, but no token was received.");
      
      localStorage.setItem("kingsrunner_jwt", jwt);
      
      if (data.role) localStorage.setItem("kingsrunner_role", data.role);
      localStorage.setItem("kingsrunner_user", JSON.stringify({ fullName: data.fullName, role: data.role }));

      toast.success("Authentication successful. Initializing session...");

      const normalizedRole = (data.role || "").trim().toUpperCase();
      console.log("Assigned Role from Backend:", data.role);

      if (normalizedRole === "SUPER_ADMIN" || normalizedRole === "ROLE_SUPER_ADMIN") {
        router.push("/super-admin");
      } else if (normalizedRole === "INSTITUTION_ADMIN" || normalizedRole === "ROLE_INSTITUTION_ADMIN") {
        router.push("/admin");
      } else if (normalizedRole === "WORKER" || normalizedRole === "ROLE_WORKER") {
        router.push("/worker-hub");
      } else {
        console.warn("Unknown role routed to worker-hub:", data.role);
        router.push("/worker-hub");
      }

    } catch (error: any) {
      console.error("Login Error:", error);
      setError(error.message || "Connection to authentication server failed.");
      toast.error(error.message || "Connection to authentication server failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevBypass = (role: string, route: string) => {
    // Set mock flags and routing
    localStorage.setItem("kingsrunner_dev_mock", "true");
    localStorage.setItem("kingsrunner_jwt", "mock_jwt_token_12345");
    localStorage.setItem("kingsrunner_user", JSON.stringify({
      fullName: "Dev User",
      role: role
    }));
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Background Glowing Orbs - Amplified for Dark Mode */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] opacity-70 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[120px] opacity-70 pointer-events-none" />

      {/* Main Login Card Container */}
      <div className="w-full max-w-[360px] p-4 relative z-10">

        {/* The Raised Dark Panel */}
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] rounded-[20px] p-6 relative overflow-hidden ring-1 ring-white/5">

          {/* Top border neon glow line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />

          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-6 text-center space-y-2 mt-1">
            <img src="/kingsrunner-logo.png" alt="Kingsrunner Logo" className="h-12 w-auto mx-auto object-contain mb-4" />
            <h1 className="text-xl font-semibold tracking-wide text-zinc-100">
              Institution Runner
            </h1>
            <p className="text-xs font-medium text-zinc-400">
              Sign in to your secure workspace
            </p>
          </div>

          {/* Form Container */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Email Address</Label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  className="pl-9 bg-zinc-950 border-zinc-800 text-white focus-visible:bg-zinc-950 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-10 shadow-inner transition-all placeholder:text-zinc-600"
                  required
                  disabled={isLoading}
                />
                <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Password</Label>
                <a href="#" className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 transition-colors">Forgot?</a>
              </div>
              <div className="relative">
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 bg-zinc-950 border-zinc-800 text-white focus-visible:bg-zinc-950 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 h-10 shadow-inner transition-all placeholder:text-zinc-600"
                  required
                  disabled={isLoading}
                />
                <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
              </div>
            </div>

            {/* Error State - Adapted for Dark Mode */}
            {error && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <p className="font-bold leading-tight">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 mt-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-[0_8px_25px_-8px_rgba(16,185,129,0.5)] hover:shadow-[0_12px_30px_-8px_rgba(16,185,129,0.8)] transition-all duration-300 transform hover:-translate-y-0.5 border border-emerald-400/20"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Secure Sign In"}
            </Button>
          </form>

          {/* Dev Bypass Toggle */}
          <div className="mt-6 pt-5 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Developer Bypass</Label>
            </div>
            <Switch
              checked={isDevMock}
              onCheckedChange={setIsDevMock}
              className="data-[state=checked]:bg-amber-500 bg-zinc-800 border-zinc-700"
            />
          </div>

          {/* Dev Bypass Buttons - shown when toggle is on */}
          {isDevMock && (
            <div className="space-y-2 pt-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDevBypass("WORKER", "/hub")}
                className="w-full border-zinc-700 text-zinc-300 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/50 transition-all font-medium text-xs h-8"
              >
                Login as Worker
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDevBypass("INST_ADMIN", "/admin")}
                className="w-full border-zinc-700 text-zinc-300 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/50 transition-all font-medium text-xs h-8"
              >
                Login as Institution Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDevBypass("SUPER_ADMIN", "/super-admin")}
                className="w-full border-zinc-700 text-zinc-300 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/50 transition-all font-medium text-xs h-8"
              >
                Login as Super Admin
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
