"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

// The custom geometric logo
const Logo = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-500 mb-4 mx-auto">
    <rect x="4" y="4" width="6" height="6" rx="1.5" />
    <rect x="4" y="14" width="6" height="6" rx="1.5" />
    <rect x="14" y="14" width="6" height="6" rx="1.5" />
  </svg>
);

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

  const getRoleRoute = (role: string): string => {
    // Map backend roles to frontend routes
    switch (role) {
      case "WORKER":
      case "ROLE_WORKER":
        return "/hub";
      case "INSTITUTION_ADMIN":
      case "INST_ADMIN":
      case "ROLE_INSTITUTION_ADMIN":
        return "/admin";
      case "SUPER_ADMIN":
      case "ROLE_SUPER_ADMIN":
        return "/super-admin";
      default:
        return "/hub"; // Default fallback
    }
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
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
          email: email,
          password: password,
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Invalid email or password");
        }
        throw new Error("Authentication failed. Please try again.");
      }

      const data: AuthResponse = await response.json();

      // Store authentication data
      localStorage.setItem("kingsrunner_dev_mock", "false");
      localStorage.setItem("kingsrunner_jwt", data.token);
      localStorage.setItem("kingsrunner_role", data.role);
      localStorage.setItem("kingsrunner_fullName", data.fullName);

      // Success toast
      toast.success("Authentication successful", {
        description: `Welcome back, ${data.fullName}`,
      });

      // Route based on role
      const route = getRoleRoute(data.role);
      router.push(route);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error("Login failed", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevBypass = (role: string, route: string) => {
    // Set mock flags and routing
    localStorage.setItem("kingsrunner_dev_mock", "true");
    localStorage.setItem("kingsrunner_jwt", "mock_jwt_token_12345");
    localStorage.setItem("kingsrunner_role", role);
    router.push(route);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-md bg-zinc-900/50 backdrop-blur-md border-zinc-800 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <Logo />
          <CardTitle className="text-2xl font-bold tracking-tight text-zinc-50">The Institution Runner</CardTitle>
          <CardDescription className="text-zinc-400">Enterprise Resource Planning</CardDescription>
        </CardHeader>

        <form onSubmit={handleStandardLogin}>
          <CardContent className="space-y-4 pt-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/50">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-zinc-950/50 border-zinc-800 text-zinc-100 focus-visible:ring-emerald-500"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-950/50 border-zinc-800 text-zinc-100 focus-visible:ring-emerald-500"
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "Authenticate"}
            </Button>

            <Accordion type="single" collapsible className="w-full mt-2 border-t border-zinc-800/50 pt-2">
              <AccordionItem value="bypass" className="border-none">
                <AccordionTrigger className="text-[10px] text-zinc-500 uppercase tracking-widest hover:text-zinc-300 hover:no-underline py-2">
                  Dev Only: Bypass Auth
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-2 pt-2 pb-0">
                  <Button type="button" variant="outline" size="sm" onClick={() => handleDevBypass("WORKER", "/hub")} className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-emerald-400">
                    [ Login as Worker ]
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleDevBypass("INST_ADMIN", "/admin")} className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-emerald-400">
                    [ Login as Inst. Admin ]
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleDevBypass("SUPER_ADMIN", "/super-admin")} className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-emerald-400">
                    [ Login as Super Admin ]
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
