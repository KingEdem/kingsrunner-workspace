"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, Server, Database, AlertTriangle } from "lucide-react";

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
      </div>
    </div>
  );
}
