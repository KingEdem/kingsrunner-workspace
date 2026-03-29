"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Terminal, LayoutDashboard, LogOut, Activity, Database, ShieldAlert,
  Server, Copy, Play, Plus, Search, ChevronRight, CheckCircle2, XCircle,
  TerminalSquare, Building2, Inbox, Mail, Layers, Users, Lock, AlertCircle, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TIRLogo } from "@/components/tir-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";

type TabType = "dashboard" | "cli";

export default function SuperAdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [cmdInput, setCmdInput] = useState("");
  const [terminalOutput, setTerminalOutput] = useState<{ type: 'input' | 'output' | 'error', text: string }[]>([
    { type: 'output', text: 'TIR KINGSRUNNER OS v2.0.4 initialized.' },
    { type: 'output', text: 'Connected to primary database cluster.' },
    { type: 'output', text: 'Awaiting sysadmin instructions...' }
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Mock Global Data
  const [tenants] = useState([
    { id: "TEN-001", name: "UMaT", domain: "umat.edu.gh", users: 1240, status: "active" },
    { id: "TEN-002", name: "University of Ghana", domain: "ug.edu.gh", users: 5420, status: "active" },
    { id: "TEN-003", name: "Kings Medical", domain: "kingsmedical.com", users: 312, status: "warning" },
  ]);

  const cliCommands = [
    { cmd: "sys:health-check", desc: "Run global diagnostics" },
    { cmd: "tenant:provision --domain=", desc: "Create new institution" },
    { cmd: "cache:flush --all", desc: "Clear global Redis cache" },
    { cmd: "mod:sync-registry", desc: "Sync ERP modules" },
    { cmd: "sec:force-logout --tenant=", desc: "Kill active sessions" }
  ];

  // Auto-scroll terminal
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalOutput]);

  const handleLogout = () => {
    localStorage.removeItem("kingsrunner_role");
    localStorage.removeItem("kingsrunner_user");
    router.push("/");
  };

  const handleRunCommand = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!cmdInput.trim()) return;

    // Add input to log
    setTerminalOutput(prev => [...prev, { type: 'input', text: `root@kingsrunner:~# ${cmdInput}` }]);
    
    // Process mock commands
    setTimeout(() => {
      const cmd = cmdInput.trim().toLowerCase();
      let response = "";
      let isError = false;

      if (cmd.includes("sys:health-check")) {
        response = "[OK] All 4 clusters operating at 99.9% uptime. Latency: 42ms.";
      } else if (cmd.includes("cache:flush")) {
        response = "[SUCCESS] Cleared 1.4GB from Redis global cache.";
      } else if (cmd.includes("tenant:provision")) {
        response = "[PENDING] Awaiting domain verification and SSL cert generation...";
      } else if (cmd === "clear") {
        setTerminalOutput([{ type: 'output', text: 'Terminal cleared.' }]);
        setCmdInput("");
        return;
      } else {
        response = `bash: ${cmd.split(' ')[0]}: command not found`;
        isError = true;
      }

      setTerminalOutput(prev => [...prev, { type: isError ? 'error' : 'output', text: response }]);
      setCmdInput("");
    }, 400);
  };

  const insertCommand = (cmd: string) => {
    setCmdInput(cmd);
    document.getElementById('cli-input')?.focus();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TIRLogo size="sm" />
            <span className="text-xl font-black tracking-tighter bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent hidden sm:inline">OVERSEER CONSOLE</span>
          </div>

          <nav className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-900 p-1 rounded-lg border border-slate-200 dark:border-zinc-800">
            <Button 
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setActiveTab('dashboard')}
              className={activeTab === 'dashboard' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400'}>
              <LayoutDashboard className="w-4 h-4 mr-2" /> Global Matrix
            </Button>
            <Button 
              variant={activeTab === 'cli' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setActiveTab('cli')}
              className={activeTab === 'cli' ? 'bg-zinc-900 dark:bg-black text-emerald-400 shadow-sm border border-zinc-800' : 'text-slate-500 dark:text-zinc-400'}>
              <Terminal className="w-4 h-4 mr-2" /> Root CLI
            </Button>
          </nav>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden md:flex bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border-red-200 dark:border-red-500/20">
              <ShieldAlert className="w-3 h-3 mr-1" /> God Mode
            </Badge>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        
        {/* TAB 1: GLOBAL DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Core Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <Card className="bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 border-b-[3px] border-b-emerald-500 shadow-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500"><Database className="w-6 h-6" /></div>
                  <div><div className="text-3xl font-black">{tenants.length}</div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Tenants</p></div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 border-b-[3px] border-b-cyan-500 shadow-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-500"><Server className="w-6 h-6" /></div>
                  <div><div className="text-3xl font-black">12</div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Modules</p></div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 border-b-[3px] border-b-amber-500 shadow-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500"><Activity className="w-6 h-6" /></div>
                  <div><div className="text-3xl font-black">6,972</div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Users</p></div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 border-b-[3px] border-b-red-500 shadow-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500"><ShieldAlert className="w-6 h-6" /></div>
                  <div><div className="text-3xl font-black">99.9%</div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Health</p></div>
                </CardContent>
              </Card>
            </div>

            {/* Tenant Matrix */}
            <Card className="bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 dark:border-zinc-800/50 pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-500" /> Tenant Registry
                </CardTitle>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Provision Institution
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                  {tenants.map(tenant => (
                    <div key={tenant.id} className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="font-bold text-slate-900 dark:text-white">{tenant.name}</h4>
                          <Badge variant="outline" className={tenant.status === 'active' ? 'border-emerald-500/30 text-emerald-500' : 'border-amber-500/30 text-amber-500'}>
                            {tenant.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                          <span className="font-mono text-xs">{tenant.id}</span>
                          <span>Domain: <strong className="text-slate-700 dark:text-zinc-300">@{tenant.domain}</strong></span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black">{tenant.users.toLocaleString()}</div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500">Registered Users</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 2: ROOT CLI TERMINAL */}
        {activeTab === "cli" && (
          <div className="h-[600px] flex rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl animate-in fade-in duration-300 bg-white dark:bg-black">
            
            {/* Left Sidebar - Command Book */}
            <div className="w-72 bg-slate-50 dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 flex flex-col hidden md:flex">
              <div className="p-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900/50">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> Command Reference
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {cliCommands.map((item, idx) => (
                  <div key={idx} onClick={() => insertCommand(item.cmd)} className="p-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500/50 cursor-pointer group transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <code className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{item.cmd.split(' ')[0]}</code>
                      <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Terminal Window */}
            <div className="flex-1 flex flex-col bg-zinc-950 relative">
              {/* Terminal Output Log */}
              <div className="flex-1 overflow-y-auto p-6 font-mono text-sm space-y-3">
                {terminalOutput.map((log, idx) => (
                  <div key={idx} className={`${log.type === 'input' ? 'text-zinc-300' : log.type === 'error' ? 'text-red-400' : 'text-emerald-400'} flex gap-3`}>
                    <span className="opacity-50 select-none">{log.type === 'input' ? '>' : '~'}</span>
                    <span className="whitespace-pre-wrap break-all">{log.text}</span>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Horizontal Command Input Bar */}
              <form onSubmit={handleRunCommand} className="border-t border-zinc-800 bg-zinc-900/50 p-4 flex items-center gap-3">
                <span className="font-mono text-emerald-500 font-bold select-none whitespace-nowrap">root@kingsrunner:~#</span>
                <Input 
                  id="cli-input"
                  autoFocus
                  autoComplete="off"
                  spellCheck="false"
                  value={cmdInput}
                  onChange={(e) => setCmdInput(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none shadow-none focus-visible:ring-0 text-white font-mono text-sm placeholder:text-zinc-600 h-10 px-0"
                  placeholder="Type a command or click one from the sidebar..."
                />
                <Button type="submit" disabled={!cmdInput.trim()} size="icon" className="bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 h-10 w-10 shadow-none border-none">
                  <Play className="w-4 h-4 ml-0.5" />
                </Button>
              </form>
            </div>
            
          </div>
        )}
      </main>
    </div>
  );
}