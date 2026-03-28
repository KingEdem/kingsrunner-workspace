"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Loader2, Activity, Server, Database, AlertTriangle, TerminalSquare,
  Building2, Inbox, Plus, CheckCircle2, XCircle, FileText, Lock,
  Shield, Mail, Users, Layers, Settings, Play, AlertCircle
} from "lucide-react";

interface Tenant {
  id: number;
  name: string;
  domain: string;
  status: string;
  createdAt: string;
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
}

interface LogEntry {
  id: number;
  timestamp: string;
  level: string;
  message: string;
  source: string;
}

const MOCK_TENANTS: Tenant[] = [
  { id: 1, name: "Harvard University", domain: "harvard.edu", status: "ACTIVE", createdAt: "2025-01-15T08:00:00Z" },
  { id: 2, name: "MIT", domain: "mit.edu", status: "ACTIVE", createdAt: "2025-02-03T10:30:00Z" },
  { id: 3, name: "Stanford University", domain: "stanford.edu", status: "ACTIVE", createdAt: "2025-03-12T14:45:00Z" },
  { id: 4, name: "Yale University", domain: "yale.edu", status: "SUSPENDED", createdAt: "2024-11-20T09:15:00Z" },
  { id: 5, name: "Princeton University", domain: "princeton.edu", status: "ACTIVE", createdAt: "2025-01-28T16:20:00Z" },
];

const MOCK_METRICS: SystemMetrics = {
  cpuUsage: 34.7,
  memoryUsage: 62.3,
  activeConnections: 127,
};

const generateMockLog = (id: number): LogEntry => {
  const levels = ["INFO", "WARN", "ERROR", "DEBUG"];
  const sources = ["AUTH_SERVICE", "DB_POOL", "API_GATEWAY", "SCHEDULER", "CACHE_LAYER"];
  const messages = [
    "Database connection pool resized",
    "API request rate within normal bounds",
    "Cache hit ratio: 87.3%",
    "Authentication token validated",
    "Scheduled job completed successfully",
    "Memory threshold warning: 85%",
    "New tenant registration detected",
    "Background worker process spawned",
    "Redis cluster sync completed",
    "SSL certificate expiring in 30 days",
  ];

  const level = levels[Math.floor(Math.random() * levels.length)];
  const source = sources[Math.floor(Math.random() * sources.length)];
  const message = messages[Math.floor(Math.random() * messages.length)];

  return {
    id,
    timestamp: new Date().toISOString(),
    level,
    message,
    source,
  };
};

const INITIAL_LOGS: LogEntry[] = Array.from({ length: 15 }, (_, i) => generateMockLog(i + 1));

export default function SuperAdminTerminal() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const isDevMock = typeof window !== "undefined" && localStorage.getItem("kingsrunner_dev_mock") === "true";

  useEffect(() => {
    fetchTenants();
    fetchMetrics();

    // Simulate live log streaming in dev mock mode
    if (isDevMock) {
      const logInterval = setInterval(() => {
        setLogs((prevLogs) => {
          const newLog = generateMockLog(prevLogs.length + 1);
          const updatedLogs = [...prevLogs, newLog];
          // Keep only last 50 logs
          return updatedLogs.slice(-50);
        });
      }, 3000);

      return () => clearInterval(logInterval);
    }
  }, [isDevMock]);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const fetchTenants = async () => {
    if (isDevMock) {
      setTimeout(() => {
        setTenants(MOCK_TENANTS);
        setIsLoading(false);
      }, 300);
      return;
    }

    try {
      const jwt = localStorage.getItem("kingsrunner_jwt");
      const response = await fetch("http://localhost:8080/api/admin/tenants", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!response.ok) throw new Error("Failed to fetch tenants");
      const data = await response.json();
      setTenants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetrics = async () => {
    if (isDevMock) {
      setTimeout(() => setMetrics(MOCK_METRICS), 300);
      return;
    }

    try {
      const jwt = localStorage.getItem("kingsrunner_jwt");
      const response = await fetch("http://localhost:8080/api/admin/metrics", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!response.ok) throw new Error("Failed to fetch metrics");
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "text-emerald-500";
      case "SUSPENDED":
        return "text-yellow-500";
      case "INACTIVE":
        return "text-red-500";
      default:
        return "text-zinc-500";
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "INFO":
        return "text-emerald-500";
      case "WARN":
        return "text-yellow-500";
      case "ERROR":
        return "text-red-500";
      case "DEBUG":
        return "text-cyan-500";
      default:
        return "text-zinc-500";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-mono">
        <Card className="bg-zinc-950 border-red-600">
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              SYSTEM ERROR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-400 font-mono">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 font-mono">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-emerald-500/30 pb-4">
          <h1 className="text-2xl font-bold text-emerald-500 mb-1">[ SUPER ADMIN TERMINAL ]</h1>
          <p className="text-emerald-500/60 text-sm">System-wide monitoring and control interface</p>
        </div>

        {/* Master Control Tabs Wrapper */}
        <Tabs defaultValue="stats" className="space-y-6">
          <div className="flex items-center justify-between mb-4 overflow-x-auto pb-2">
            <TabsList className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl shadow-sm inline-flex h-12">
              <TabsTrigger value="stats" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-zinc-500 font-bold px-5 transition-all rounded-lg">
                <Activity className="w-4 h-4 mr-2" /> System Stats
              </TabsTrigger>
              <TabsTrigger value="tenants" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-zinc-500 font-bold px-5 transition-all rounded-lg">
                <Building2 className="w-4 h-4 mr-2" /> Tenant Directory
              </TabsTrigger>
              <TabsTrigger value="requests" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-zinc-500 font-bold px-5 transition-all rounded-lg relative">
                <Inbox className="w-4 h-4 mr-2" /> Module Requests
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </TabsTrigger>
              <TabsTrigger value="controls" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-zinc-500 font-bold px-5 transition-all rounded-lg">
                <TerminalSquare className="w-4 h-4 mr-2" /> Root Controls
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: EXISTING STATS */}
          <TabsContent value="stats" className="m-0 space-y-6 animate-in fade-in duration-500">
            {/* System Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-zinc-950 border-emerald-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-emerald-500 text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    CPU USAGE
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics ? (
                    <>
                      <div className="text-3xl font-bold text-emerald-500 mb-2">{metrics.cpuUsage.toFixed(1)}%</div>
                      <div className="w-full bg-zinc-900 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${metrics.cpuUsage}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                  )}
                </CardContent>
              </Card>

              <Card className="bg-zinc-950 border-emerald-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-emerald-500 text-sm flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    MEMORY USAGE
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics ? (
                    <>
                      <div className="text-3xl font-bold text-emerald-500 mb-2">{metrics.memoryUsage.toFixed(1)}%</div>
                      <div className="w-full bg-zinc-900 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${metrics.memoryUsage}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                  )}
                </CardContent>
              </Card>

              <Card className="bg-zinc-950 border-emerald-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-emerald-500 text-sm flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    ACTIVE CONNECTIONS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {metrics ? (
                    <div className="text-3xl font-bold text-emerald-500">{metrics.activeConnections}</div>
                  ) : (
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tenant Management Grid */}
            <Card className="bg-zinc-950 border-emerald-500/30">
              <CardHeader>
                <CardTitle className="text-emerald-500 text-lg">REGISTERED TENANTS / INSTITUTIONS</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Header Row */}
                    <div className="grid grid-cols-5 gap-4 text-emerald-500/60 text-xs font-bold uppercase border-b border-emerald-500/20 pb-2">
                      <div>ID</div>
                      <div>NAME</div>
                      <div>DOMAIN</div>
                      <div>STATUS</div>
                      <div>REGISTERED</div>
                    </div>
                    {/* Data Rows */}
                    {tenants.map((tenant) => (
                      <div
                        key={tenant.id}
                        className="grid grid-cols-5 gap-4 text-sm py-2 border-b border-emerald-500/10 hover:bg-emerald-500/5 transition-colors"
                      >
                        <div className="text-emerald-500 font-mono">#{tenant.id.toString().padStart(4, "0")}</div>
                        <div className="text-emerald-500">{tenant.name}</div>
                        <div className="text-emerald-500/80">{tenant.domain}</div>
                        <div>
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(tenant.status)} border-current font-mono text-xs`}
                          >
                            {tenant.status}
                          </Badge>
                        </div>
                        <div className="text-emerald-500/60 text-xs">{new Date(tenant.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Logs Terminal */}
            <Card className="bg-zinc-950 border-emerald-500/30">
              <CardHeader>
                <CardTitle className="text-emerald-500 text-lg flex items-center justify-between">
                  <span>GLOBAL SYSTEM LOGS</span>
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500 font-mono text-xs">
                    LIVE STREAM
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black border border-emerald-500/20 rounded-lg p-4 h-[400px] overflow-y-auto font-mono text-xs">
                  <div className="space-y-1">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 text-emerald-500/90">
                        <span className="text-emerald-500/50">[{formatTimestamp(log.timestamp)}]</span>
                        <span className={`font-bold ${getLogLevelColor(log.level)} min-w-[50px]`}>{log.level}</span>
                        <span className="text-emerald-500/70">{log.source}:</span>
                        <span className="text-emerald-500">{log.message}</span>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: TENANT DIRECTORY */}
          <TabsContent value="tenants" className="m-0 animate-in fade-in duration-500">
            <Card className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/50 flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                <div>
                  <CardTitle className="text-lg font-black text-zinc-900 dark:text-white">Registered Institutions</CardTitle>
                  <CardDescription className="text-xs mt-1">Manage tenant databases and provision root admins.</CardDescription>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm h-10 shrink-0 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" /> Register Institution
                </Button>
              </div>
              <Table>
                <TableHeader className="bg-zinc-50/80 dark:bg-zinc-950/50">
                  <TableRow className="border-zinc-200 dark:border-zinc-800">
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">Institution Name</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">Primary Domain</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500">Admin Contact</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500 text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <TableCell className="font-bold text-zinc-900 dark:text-white">University of Mines and Technology</TableCell>
                    <TableCell className="text-zinc-500 font-mono text-xs">umat.edu.gh</TableCell>
                    <TableCell><div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300"><Mail className="w-3 h-3 text-emerald-500"/> admin@umat.edu.gh</div></TableCell>
                    <TableCell className="text-right"><Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">Active Tenant</Badge></TableCell>
                  </TableRow>
                  <TableRow className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <TableCell className="font-bold text-zinc-900 dark:text-white">Accra Technical University</TableCell>
                    <TableCell className="text-zinc-500 font-mono text-xs">atu.edu.gh</TableCell>
                    <TableCell><div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300"><Mail className="w-3 h-3 text-amber-500"/> pending_setup@atu.edu.gh</div></TableCell>
                    <TableCell className="text-right"><Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5">Provisioning</Badge></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* TAB 3: MODULE REQUESTS (INBOX) */}
          <TabsContent value="requests" className="m-0 animate-in fade-in duration-500 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white">Pending Approvals</h3>
                <p className="text-sm text-zinc-500">Review business justifications before granting module access.</p>
              </div>
              <Badge className="bg-emerald-600 text-white">2 Pending</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Request Card 1 */}
              <Card className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Badge variant="outline" className="mb-2 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">University of Mines and Technology</Badge>
                      <h4 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <Layers className="w-5 h-5 text-emerald-500" /> Advanced Fleet Tracking
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-zinc-400">Today, 09:15 AM</span>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-lg p-4 mb-5 relative">
                    <FileText className="absolute top-4 right-4 w-4 h-4 text-zinc-300 dark:text-zinc-700" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Message from Institution Admin:</p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                      "We have just acquired 5 new transport buses for the engineering campus and need the Fleet Tracking module activated to manage driver logs and fuel consumption."
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Provision
                    </Button>
                    <Button variant="outline" className="flex-1 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20">
                      <XCircle className="w-4 h-4 mr-2" /> Deny Request
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Request Card 2 */}
              <Card className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Badge variant="outline" className="mb-2 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">Accra Technical University</Badge>
                      <h4 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-cyan-500" /> HR Premium Features
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-zinc-400">Yesterday, 14:30 PM</span>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-lg p-4 mb-5 relative">
                    <FileText className="absolute top-4 right-4 w-4 h-4 text-zinc-300 dark:text-zinc-700" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Message from Institution Admin:</p>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                      "Requesting access to the premium HR analytics dashboard for our Q2 staff performance review cycle."
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Provision
                    </Button>
                    <Button variant="outline" className="flex-1 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20">
                      <XCircle className="w-4 h-4 mr-2" /> Deny Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 4: ROOT CONTROLS (TERMINAL) */}
          <TabsContent value="controls" className="m-0 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

              {/* The Terminal Window (Spans 3/4) */}
              <div className="xl:col-span-3">
                <div className="rounded-xl overflow-hidden bg-[#0A0A0A] border border-zinc-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-white/10 flex flex-col h-[600px]">
                  <div className="bg-zinc-900/80 border-b border-zinc-800 px-4 py-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="text-xs font-mono text-zinc-500 flex items-center gap-2"><Lock className="w-3 h-3" /> root@kingsrunner-core:~</div>
                    <div className="w-12" />
                  </div>

                  <div className="flex-1 p-5 overflow-y-auto font-mono text-sm space-y-3">
                    <div className="text-emerald-500/70">KingsRunner OS v2.0.4 (GNU/Linux 5.15.0-101-generic x86_64)</div>
                    <br />
                    <div className="text-zinc-300">Initializing Super Admin secure shell... <span className="text-emerald-400">DONE</span></div>
                    <div className="text-zinc-300">Loading multi-tenant registries... <span className="text-emerald-400">DONE</span></div>
                    <br />
                    <div className="text-amber-400 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" /> WARNING: You are operating with global privileges.</div>
                    <br />
                    <div className="text-zinc-400"><span className="text-emerald-500 font-bold">root@kingsrunner:~$</span> system.status_check()</div>
                    <div className="text-zinc-300 pl-4">[OK] Core Database connected. <br />[OK] Active Tenants: 14</div>
                  </div>

                  <div className="bg-zinc-950 p-4 border-t border-zinc-800/50 flex items-center gap-3 shrink-0">
                    <span className="text-emerald-500 font-bold font-mono text-sm shrink-0">root@kingsrunner:~$</span>
                    <input type="text" placeholder="Type a command..." className="flex-1 bg-transparent border-none outline-none font-mono text-emerald-400 text-sm placeholder:text-zinc-700" />
                    <Button size="sm" className="bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 font-mono text-xs">EXECUTE</Button>
                  </div>
                </div>
              </div>

              {/* Command Reference (Spans 1/4) */}
              <div className="space-y-4">
                <Card className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-sm h-[600px] flex flex-col">
                  <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
                    <CardTitle className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2"><TerminalSquare className="w-4 h-4 text-emerald-500" /> Registry</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 overflow-y-auto flex-1 space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 mb-3"><Server className="w-3 h-3" /> Core System</h4>
                      <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-lg group hover:border-emerald-500/50"><p className="font-mono text-[11px] text-zinc-800 dark:text-emerald-400 font-bold">system.purge_cache()</p></div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 mb-3"><Database className="w-3 h-3" /> Multi-Tenancy</h4>
                      <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-lg group hover:border-red-500/50"><p className="font-mono text-[11px] text-zinc-800 dark:text-red-400 font-bold">tenant.suspend("UUID")</p></div>
                      <div className="p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-lg group hover:border-emerald-500/50"><p className="font-mono text-[11px] text-zinc-800 dark:text-emerald-400 font-bold">tenant.migrate_db()</p></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
