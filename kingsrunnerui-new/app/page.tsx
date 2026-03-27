'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TIRLogo } from '@/components/tir-logo';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [devBypassOpen, setDevBypassOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if mock mode is enabled
      const isMockMode = localStorage.getItem('kingsrunner_dev_mock') === 'true';
      
      if (isMockMode) {
        // Mock authentication
        if (email && password) {
          localStorage.setItem('kingsrunner_jwt', 'mock-jwt-token');
          localStorage.setItem('kingsrunner_user', JSON.stringify({
            email,
            role: 'worker',
            name: 'Test User'
          }));
          toast.success('Authentication successful');
          router.push('/hub');
        } else {
          toast.error('Please enter email and password');
        }
      } else {
        // Real API call
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('kingsrunner_jwt', data.token);
          localStorage.setItem('kingsrunner_user', JSON.stringify(data.user));
          toast.success('Authentication successful');
          router.push('/hub');
        } else {
          toast.error('Authentication failed');
        }
      }
    } catch (error) {
      toast.error('Connection error. Enable Dev Mock mode.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevBypass = (role: 'worker' | 'admin' | 'super-admin') => {
    localStorage.setItem('kingsrunner_dev_mock', 'true');
    localStorage.setItem('kingsrunner_jwt', `mock-${role}-jwt`);
    
    const userData = {
      worker: { name: 'Alice Johnson', email: 'alice@greenfield.edu', role: 'HR Director' },
      admin: { name: 'Admin User', email: 'admin@kingsrunner.tech', role: 'Institution Admin' },
      'super-admin': { name: 'Super Admin', email: 'super@kingsrunner.tech', role: 'Super Admin' }
    };

    localStorage.setItem('kingsrunner_user', JSON.stringify(userData[role]));
    toast.success(`Bypassing as ${role.replace('-', ' ').toUpperCase()}`);

    const routes = {
      worker: '/hub',
      admin: '/admin',
      'super-admin': '/super-admin'
    };

    router.push(routes[role]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="rounded-xl border border-emerald-500/20 bg-card/50 backdrop-blur-sm p-8 shadow-2xl shadow-emerald-500/5">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <TIRLogo size="lg" className="mb-4" />
            <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <TIRLogo size="sm" />
              The Institution Runner
            </h1>
            <p className="text-sm text-emerald-500/80 mt-1">Enterprise Resource Planning</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-input border-border focus:border-emerald-500/50 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-input border-border focus:border-emerald-500/50 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-5 rounded-full transition-all"
            >
              {isLoading ? 'Authenticating...' : 'Authenticate'}
            </Button>
          </form>

          {/* Dev Bypass Accordion */}
          <div className="mt-6 pt-6 border-t border-border">
            <Collapsible open={devBypassOpen} onOpenChange={setDevBypassOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full text-xs uppercase tracking-wider text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                <span>DEV ONLY: BYPASS AUTH</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${devBypassOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDevBypass('worker')}
                  className="w-full border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400"
                >
                  Worker
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDevBypass('admin')}
                  className="w-full border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                >
                  Inst. Admin
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDevBypass('super-admin')}
                  className="w-full border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400"
                >
                  Super Admin
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    </div>
  );
}
