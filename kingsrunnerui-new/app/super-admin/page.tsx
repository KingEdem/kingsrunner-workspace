'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  pendingRequests, 
  institutions, 
  isDevMockEnabled,
  type PendingRequest 
} from '@/lib/mock-data';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Copy } from 'lucide-react';

interface CommandLogEntry {
  id: string;
  command: string;
  output: string[];
  status: 'success' | 'error' | 'info';
  timestamp: Date;
}

interface CommandSection {
  title: string;
  icon: string;
  commands: CommandItem[];
}

interface CommandItem {
  name: string;
  params?: string;
  description?: string;
}

const commandSections: CommandSection[] = [
  {
    title: 'IDENTITY & ACCESS',
    icon: 'user',
    commands: [
      { name: 'CREATE_INST_ADMIN', params: '--name "..." --email "..." (scoped)' },
      { name: 'GLOBAL_FIND_USER', params: '--email "..."' },
      { name: 'FORCE_PASSWORD_RESET', params: '--id "..."' },
      { name: 'REVOKE_ALL_SESSIONS' }
    ]
  },
  {
    title: 'ERP MODULE PIPELINE',
    icon: 'gear',
    commands: [
      { name: 'LIST_MODULES' },
      { name: 'LIST_PENDING_REQUESTS' },
      { name: 'APPROVE_MODULE_REQUEST' },
      { name: 'REJECT_MODULE_REQUEST' },
      { name: 'FORCE_ENABLE_MODULE', params: '--id "..." --module "..."' }
    ]
  },
  {
    title: 'PERFORMANCE & OPTIMIZATION',
    icon: 'bolt',
    commands: [
      { name: 'SET_RATE_LIMIT', params: '--id "..." --limit "..."' },
      { name: 'CLEAR_TENANT_CACHE', params: '--id "..."' }
    ]
  },
  {
    title: 'DATA COMPLIANCE',
    icon: 'lock',
    commands: [
      { name: 'EXPORT_TENANT_AUDIT', params: '--id "..."' },
      { name: 'ANONYMIZE_DROPPED_WORKERS', params: '--id "..."' }
    ]
  },
  {
    title: 'DEV GOD MODE',
    icon: 'bolt',
    commands: [
      { name: 'SEED_MOCK_DATA', params: '--id "..."', description: 'destructive' }
    ]
  }
];

export default function SuperAdminPage() {
  const router = useRouter();
  const [commandLog, setCommandLog] = useState<CommandLogEntry[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [requests, setRequests] = useState<PendingRequest[]>(pendingRequests);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [provName, setProvName] = useState("");
  const [provDomain, setProvDomain] = useState("");
  const [provEmail, setProvEmail] = useState("");
  const [provModules, setProvModules] = useState<string[]>([]);
  const [generatedPass, setGeneratedPass] = useState("");
  const [isProvisioning, setIsProvisioning] = useState(false);

  const pendingCount = requests.length;

  useEffect(() => {
    const userJson = localStorage.getItem('kingsrunner_user');
    if (!userJson) {
      router.push('/');
      return;
    }

    // Add welcome message
    addLogEntry('INFO', ['institution-runner v2.4.1 - Super Admin Terminal', 'Type "HELP" for a list of available commands.'], 'info');
  }, [router]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [commandLog]);

  const handleProvisionSubmit = async () => {
    if(!provName || !provDomain || !provEmail) return toast.error("Fill all required fields.");
    setIsProvisioning(true);
    try {
        const token = localStorage.getItem("kingsrunner_jwt");
        const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

        // 1. Create Tenant
        const tRes = await fetch("http://localhost:8080/api/super-admin/tenant/provision", {
            method: "POST", headers, body: JSON.stringify({ name: provName, domain: provDomain })
        });
        
        if (!tRes.ok) {
            const errData = await tRes.text();
            throw new Error(`Tenant creation failed: ${errData || tRes.statusText}`);
        }
        const tenant = await tRes.json();

        // 2. Create Admin Account
        const tempPass = Math.random().toString(36).slice(-8) + "X9!";
        const adminRes = await fetch("http://localhost:8080/api/super-admin/identity/create-admin", {
            method: "POST", headers, body: JSON.stringify({ institutionId: tenant.id, email: provEmail, password: tempPass })
        });

        if (!adminRes.ok) {
             throw new Error("Tenant created, but failed to create root admin account.");
        }

        // 3. Enable Modules
        for (const mod of provModules) {
            const modRes = await fetch(`http://localhost:8080/api/super-admin/modules/${tenant.id}/force-enable`, {
                method: "POST", headers, body: JSON.stringify({ module: mod })
            });
            if (!modRes.ok) console.error(`Failed to enable module: ${mod}`);
        }

        setGeneratedPass(tempPass);
        toast.success("Institution provisioned successfully!");
        
        // Refresh UI Matrix if the function exists
        if (typeof fetchTenants === 'function') fetchTenants();
        
    } catch(e: any) {
        toast.error(e.message || "Provisioning pipeline failed.");
    } finally {
        setIsProvisioning(false);
    }
  };

  const addLogEntry = (command: string, output: string[], status: 'success' | 'error' | 'info') => {
    const entry: CommandLogEntry = {
      id: Date.now().toString(),
      command,
      output,
      status,
      timestamp: new Date()
    };
    setCommandLog(prev => [...prev, entry]);
  };

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    // Support commands with args, e.g. `FORCE_ENABLE_MODULE --id 1 --module CRM`.
    const parts = trimmed.split(/\s+/);
    const commandName = parts[0]?.toUpperCase() ?? '';
    const args = parts.slice(1).join(' ');
    const displayCommand = trimmed.toUpperCase();

    const withArgs = (lines: string[]) => {
      if (!args) return lines;
      return [...lines, `ARGS: ${args}`];
    };

    switch (commandName) {
      case 'HELP':
        addLogEntry('HELP', [
          'Available commands:',
          '  CREATE_INST_ADMIN          - Create a scoped institution admin',
          '  GLOBAL_FIND_USER           - Find a user by email/ID',
          '  FORCE_PASSWORD_RESET      - Force password reset for a user',
          '  REVOKE_ALL_SESSIONS       - Revoke all sessions for a user/tenant',
          '',
          '  LIST_MODULES               - List all ERP modules',
          '  LIST_PENDING_REQUESTS    - Show pending module requests',
          '  APPROVE_MODULE_REQUEST   - Approve a pending request',
          '  REJECT_MODULE_REQUEST    - Reject a pending request',
          '  FORCE_ENABLE_MODULE      - Force-enable a module',
          '',
          '  SET_RATE_LIMIT            - Set rate limiting for a tenant',
          '  CLEAR_TENANT_CACHE        - Clear tenant cache',
          '',
          '  EXPORT_TENANT_AUDIT      - Export tenant audit data',
          '  ANONYMIZE_DROPPED_WORKERS - Anonymize dropped worker records',
          '',
          '  SEED_MOCK_DATA            - (DEV) Seed mock data (destructive)',
          '',
          '  CLEAR                      - Clear terminal'
        ], 'info');
        break;

      case 'CLEAR':
        setCommandLog([]);
        break;

      case 'LIST_MODULES':
        addLogEntry(displayCommand, [
          '+----+---------------------+----------+',
          '| ID | MODULE              | STATUS   |',
          '+----+---------------------+----------+',
          '| 1  | FINANCIAL_MGMT      | locked   |',
          '| 2  | HUMAN_RESOURCES     | active   |',
          '| 3  | SUPPLY_CHAIN        | pending  |',
          '| 4  | CRM                 | active   |',
          '| 5  | OPERATIONS          | locked   |',
          '+----+---------------------+----------+'
        ], 'success');
        break;

      case 'LIST_PENDING_REQUESTS':
        if (requests.length === 0) {
          addLogEntry(displayCommand, ['No pending requests.'], 'info');
        } else {
          const table = [
            '+----+------------------------+------------------------+------------+',
            '| ID | INSTITUTION            | MODULE                 | DATE       |',
            '+----+------------------------+------------------------+------------+',
            ...requests.map(r => 
              `| ${r.id.toString().padEnd(2)} | ${r.institution.padEnd(22)} | ${r.module.padEnd(22)} | ${r.date} |`
            ),
            '+----+------------------------+------------------------+------------+'
          ];
          addLogEntry(displayCommand, table, 'success');
        }
        break;

      case 'APPROVE_MODULE_REQUEST':
        if (requests.length === 0) {
          addLogEntry(displayCommand, ['- No pending requests to approve.'], 'info');
        } else {
          addLogEntry(displayCommand, ['- Select a request to approve:'], 'info');
          if (isDevMockEnabled()) {
            const approved = requests[0];
            setRequests(prev => prev.filter(r => r.id !== approved.id));
            setTimeout(() => {
              addLogEntry('', [`OK: Request #${approved.id} approved.`], 'success');
            }, 500);
          } else {
            setTimeout(() => {
              addLogEntry('', ['ERR: Server returned 403.'], 'error');
            }, 500);
          }
        }
        break;

      case 'REJECT_MODULE_REQUEST':
        addLogEntry(displayCommand, ['- Select a request to reject:'], 'info');
        setTimeout(() => {
          addLogEntry('', ['ERR: Server returned 403.'], 'error');
        }, 500);
        break;

      // --- Identity & Access ---
      case 'CREATE_INST_ADMIN':
      case 'GLOBAL_FIND_USER':
      case 'FORCE_PASSWORD_RESET':
      case 'REVOKE_ALL_SESSIONS':
      // --- ERP Module Pipeline ---
      case 'FORCE_ENABLE_MODULE':
      case 'SET_RATE_LIMIT':
      case 'CLEAR_TENANT_CACHE':
      // --- Data Compliance ---
      case 'EXPORT_TENANT_AUDIT':
      case 'ANONYMIZE_DROPPED_WORKERS':
        if (isDevMockEnabled()) {
          addLogEntry(displayCommand, withArgs(['OK: Dev mock executed this command.']), 'success');
        } else {
          addLogEntry(displayCommand, withArgs(['ERR: Server returned 403. (backend wiring needed)']), 'error');
        }
        break;

      // --- DEV GOD MODE (destructive) ---
      case 'SEED_MOCK_DATA':
        if (isDevMockEnabled()) {
          setRequests(pendingRequests);
          addLogEntry(
            displayCommand,
            withArgs([
              'CAUTION: SEED_MOCK_DATA is destructive (dev mock).',
              'Mock pending requests have been reset.',
            ]),
            'error',
          );
        } else {
          addLogEntry(displayCommand, withArgs(['ERR: Server returned 403. (backend wiring needed)']), 'error');
        }
        break;

      default:
        addLogEntry(
          displayCommand,
          [`ERR: Unknown command "${commandName}". Type HELP for available commands.`],
          'error',
        );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleCommand(inputValue);
      setInputValue('');
    }
  };

  const handleCommandClick = (commandName: string) => {
    setInputValue(commandName);
    inputRef.current?.focus();
  };

  const handleLogout = () => {
    localStorage.removeItem('kingsrunner_jwt');
    localStorage.removeItem('kingsrunner_user');
    router.push('/');
  };

  const stats = [
    { label: 'INST', value: institutions.length },
    { label: 'DEPT', value: institutions.reduce((acc, i) => acc + i.departments, 0) },
    { label: 'WRKR', value: institutions.reduce((acc, i) => acc + i.workers, 0) }
  ];

  const getSectionIcon = (icon: string) => {
    const icons: Record<string, string> = {
      user: String.fromCodePoint(0x1F464),
      gear: String.fromCodePoint(0x2699),
      bolt: String.fromCodePoint(0x26A1),
      monitor: String.fromCodePoint(0x1F5A5),
      lock: String.fromCodePoint(0x1F512)
    };
    return icons[icon] || String.fromCodePoint(0x2699);
  };

  return (
    <div className="h-screen w-full font-mono flex overflow-hidden bg-white text-zinc-900 dark:bg-black dark:text-emerald-500">
      {/* Command Reference Sidebar */}
      {sidebarOpen && (
        <aside className="w-72 border-r border-black/20 dark:border-emerald-900/50 flex flex-col bg-white dark:bg-black shrink-0">
          <div className="flex items-center justify-between p-4 border-b border-black/20 dark:border-emerald-900/50">
            <h2 className="text-sm font-bold tracking-wider text-emerald-700 dark:text-emerald-400">COMMAND REFERENCE</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="text-zinc-600 dark:text-emerald-500/50 hover:text-zinc-900 dark:hover:text-emerald-400 hover:bg-black/5 dark:hover:bg-emerald-900/20 h-6 w-6"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 min-h-0 p-2">
            {commandSections.map((section, i) => (
              <div key={i} className="mb-4">
                <div
                  className={`flex items-center gap-2 px-2 py-1.5 text-xs ${
                    section.title === 'DEV GOD MODE'
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-emerald-800/70 dark:text-emerald-500/60'
                  }`}
                >
                  <span>{getSectionIcon(section.icon)}</span>
                  <span className="tracking-wider">{section.title}</span>
                  {section.title === 'ERP MODULE PIPELINE' && pendingCount > 0 && (
                    <Badge className="ml-auto bg-amber-500 text-amber-950 border border-amber-600 text-xs px-1.5 py-0 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30">
                      {pendingCount} pending
                    </Badge>
                  )}
                </div>
                <div className="space-y-0.5">
                  {section.commands.map((cmd, j) => (
                    <button
                      key={j}
                      onClick={() => handleCommandClick(cmd.name)}
                      className="w-full text-left px-2 py-1 text-xs rounded border border-black/10 dark:border-transparent transition-all duration-300 hover:-translate-y-1 hover:bg-black/5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:translate-y-0 dark:hover:bg-emerald-900/20 dark:hover:shadow-none group"
                    >
                      <span
                        className={`${
                          cmd.description === 'destructive'
                            ? 'text-red-700 group-hover:text-red-600 dark:text-red-400 dark:group-hover:text-red-300'
                            : 'text-emerald-800 group-hover:text-emerald-700 dark:text-emerald-400 dark:group-hover:text-emerald-300'
                        }`}
                      >
                        {cmd.name}
                      </span>
                      {cmd.params && (
                        <span className="text-indigo-700/70 ml-1 dark:text-cyan-500/70">{cmd.params}</span>
                      )}
                      {cmd.description === 'destructive' && (
                        <Badge className="ml-2 border border-red-600/30 bg-red-600/15 text-red-700 text-[10px] px-1 py-0 dark:bg-red-900/50 dark:border-red-600/30 dark:text-red-400">
                          destructive
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </ScrollArea>

          {/* Stats Footer */}
          <div className="border-t border-black/20 dark:border-emerald-900/50 p-2">
            <div className="flex justify-around">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{stat.value}</div>
                  <div className="text-[10px] text-emerald-800/50 dark:text-emerald-500/50">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}

      {/* Main Terminal Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Terminal Header */}
        <header className="relative flex items-center justify-between px-4 py-3 border-b border-black/20 dark:border-emerald-900/50 bg-white dark:bg-black shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-sm text-emerald-700/70 font-medium dark:text-emerald-500/70">institution-runner v2.4.1</span>
            <span className="text-emerald-700/30 dark:text-emerald-500/30">|</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm text-emerald-700 font-medium dark:text-emerald-400">SUPER_ADMIN</span>
            </div>
            <span className="text-emerald-700/30 dark:text-emerald-500/30">|</span>
            <span className="text-sm text-emerald-700/50 dark:text-emerald-500/50">session_active</span>
            {pendingCount > 0 && (
              <Badge className="bg-amber-500 text-amber-950 border border-amber-600 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30">
                {pendingCount} pending requests
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsProvisionOpen(true)}
              className="h-9 px-3 border-black/70 bg-white text-black hover:bg-black hover:text-white dark:bg-black dark:text-emerald-300 dark:border-emerald-500/40 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-100"
            >
              <span className="font-mono text-sm font-semibold tracking-wider">+ PROVISION TENANT</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-9 px-3 border-black/70 bg-white text-black hover:bg-black hover:text-white dark:bg-black dark:text-emerald-300 dark:border-emerald-500/40 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-100"
            >
              <span className="font-mono text-sm font-semibold tracking-wider">[ ➔ Logout ]</span>
            </Button>
          </div>
        </header>

        {/* Terminal Output */}
        <ScrollArea className="flex-1 min-h-0 p-4 terminal-scrollbar">
          <div className="space-y-4">
            {commandLog.map(entry => (
              <div key={entry.id} className="space-y-1">
                {entry.command && entry.command !== 'INFO' && (
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-700/50 dark:text-emerald-500/50">{`>`}</span>
                    <span className="text-indigo-700/80 font-bold dark:text-cyan-400">{entry.command}</span>
                  </div>
                )}
                {entry.output.map((line, i) => (
                  <div
                    key={i}
                    className={`text-sm pl-4 ${
                      entry.status === 'error' 
                        ? 'text-red-700 dark:text-red-400' 
                        : entry.status === 'success' && line.startsWith('OK:')
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : line.startsWith('|') || line.startsWith('+')
                            ? 'text-emerald-800/80 dark:text-emerald-300'
                            : 'text-emerald-700/80 dark:text-emerald-500/80'
                    }`}
                  >
                    {line}
                  </div>
                ))}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </ScrollArea>

        {/* Command Input */}
        <form onSubmit={handleSubmit} className="border-t border-black/20 dark:border-emerald-900/50 p-4 bg-white dark:bg-black shrink-0">
          <div className="flex items-center gap-2 rounded-md border border-black/15 dark:border-emerald-900/50 px-3 py-2">
            <span className="text-emerald-700 text-sm dark:text-emerald-400">institution-runner</span>
            <span className="text-emerald-800/50 dark:text-emerald-500/50">{`>`}</span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter a command..."
              className="flex-1 bg-transparent border-none outline-none text-zinc-900 placeholder:text-zinc-500/60 text-sm dark:text-emerald-300 dark:placeholder:text-emerald-500/30"
              autoFocus
            />
          </div>
        </form>
      </main>

      {/* Floating Toggle for Sidebar */}
      {!sidebarOpen && (
        <Button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-6 right-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 h-12 w-12"
        >
          N
        </Button>
      )}

      {/* Provisioning Modal */}
      <Dialog open={isProvisionOpen} onOpenChange={(open) => { setIsProvisionOpen(open); if(!open) setGeneratedPass(""); }}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle>Provision New Institution</DialogTitle>
            <DialogDescription>Initialize a new database tenant and root admin account.</DialogDescription>
          </DialogHeader>
          
          {generatedPass ? (
            <div className="py-8 text-center space-y-4">
               <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-8 h-8"/></div>
               <h3 className="text-xl font-bold">Tenant Activated</h3>
               <p className="text-sm text-zinc-500">Provide these temporary credentials to the new Institution Admin. They will be forced to change the password upon first login.</p>
               <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-lg font-mono text-lg flex justify-between items-center border border-zinc-200 dark:border-zinc-800">
                  <span>{generatedPass}</span>
                  <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(generatedPass); toast.success("Copied!"); }}><Copy className="w-4 h-4"/></Button>
               </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Institution Name</Label><Input placeholder="e.g. Stanford University" value={provName} onChange={e => setProvName(e.target.value)} /></div>
                <div className="space-y-2"><Label>Primary Domain</Label><Input placeholder="e.g. stanford.edu" value={provDomain} onChange={e => setProvDomain(e.target.value)} /></div>
              </div>
              <div className="space-y-2">
                <Label>Admin Root Email</Label>
                <Input placeholder={`admin@${provDomain || 'domain.edu'}`} value={provEmail} onChange={e => setProvEmail(e.target.value)} />
              </div>
              <div className="space-y-2 pt-2">
                <Label>Active ERP Modules</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {["HR_CORE", "FLEET_TRACKING", "INVENTORY", "FINANCE"].map(mod => (
                    <div key={mod} className="flex items-center space-x-2 border p-2 rounded-lg border-zinc-200 dark:border-zinc-800">
                      <Checkbox id={mod} checked={provModules.includes(mod)} onCheckedChange={(checked) => {
                         setProvModules(prev => checked ? [...prev, mod] : prev.filter(m => m !== mod));
                      }} />
                      <label htmlFor={mod} className="text-xs font-bold cursor-pointer">{mod.replace('_', ' ')}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!generatedPass && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsProvisionOpen(false)}>Cancel</Button>
              <Button onClick={handleProvisionSubmit} disabled={isProvisioning} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                {isProvisioning ? "Provisioning Database..." : "Deploy Tenant"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
