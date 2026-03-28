'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Building2, Lock, CheckCircle2, Clock, Plus, Pencil, Trash2, LogOut, Settings, TrendingUp, Heart, Truck, DollarSign, Sparkles, Loader2, Activity, Layers, Shield, Megaphone, MessageSquare, Pin, ArrowRight, Eye, AlertTriangle, Hash, Globe, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { TIRLogo } from '@/components/tir-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  erpModules,
  getAvailableRoles,
  moduleConfig,
  usageMetrics,
  type ERPModule,
  type Department,
  type User,
  isDevMockEnabled
} from '@/lib/mock-data';
import { toast } from 'sonner';

export default function AdminPage() {
  const router = useRouter();

  // UI State
  const [modules, setModules] = useState<ERPModule[]>(erpModules);
  const [selectedModule, setSelectedModule] = useState<ERPModule | null>(null);
  const [isHireDialogOpen, setIsHireDialogOpen] = useState(false);
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', email: '', department: '', role: '' });
  const [newDept, setNewDept] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [isLoungeDialogOpen, setIsLoungeDialogOpen] = useState(false);
  const [newLounge, setNewLounge] = useState({ name: '', description: '', isPrivate: false });
  const [requestMessage, setRequestMessage] = useState('');
  const [selectedModuleForRequest, setSelectedModuleForRequest] = useState<ERPModule | null>(null);

  // Temporary Mock State until backend is connected
  const [lounges, setLounges] = useState([
    { id: '1', name: 'general-discussion', description: 'Public open forum.', isPrivate: false, memberCount: 42 },
    { id: '2', name: 'staff-only', description: 'Highly restricted comms.', isPrivate: true, memberCount: 3 }
  ]);

  // Backend State
  const [departments, setDepartments] = useState<Department[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHiring, setIsHiring] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const availableRoles = getAvailableRoles(modules);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userJson = localStorage.getItem('kingsrunner_user');
      const jwt = localStorage.getItem('kingsrunner_jwt');

      console.log("Checking Auth...", { hasUser: !!userJson, hasJwt: !!jwt });

      if (!userJson || !jwt) {
        router.push('/');
        return;
      }

      try {
        const user = JSON.parse(userJson);
        console.log("User Role found:", user.role);

        // Strict check based on Role.java: SUPER_ADMIN or INSTITUTION_ADMIN
        if (user.role === "INSTITUTION_ADMIN" || user.role === "SUPER_ADMIN") {
          setIsAuthorized(true);
          fetchDepartments();
          fetchWorkers();
        } else {
          console.warn("Unauthorized Role:", user.role);
          router.push('/hub');
        }
      } catch (e) {
        console.error("Auth Parse Error:", e);
        router.push('/');
      }
    }
  }, [router]);

  // --- SPRING BOOT API CALLS ---
  const fetchDepartments = async () => {
    const isDevMock = typeof window !== "undefined" && localStorage.getItem("kingsrunner_dev_mock") === "true";
    if (isDevMock) return;
    try {
      const jwt = localStorage.getItem("kingsrunner_jwt");
      const response = await fetch("http://localhost:8080/api/tenant/departments", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (response.ok) {
        const data = await response.json();
        // Adapt backend Department to UI Department
        const adaptedDepts: Department[] = data.map((d: any) => ({
          id: d.id.toString(),
          name: d.name,
          workerCount: 0 // Will be calculated in UI
        }));
        setDepartments(adaptedDepts);
      }
    } catch (err) { console.error(err); }
  };

  const fetchWorkers = async () => {
    const isDevMock = typeof window !== "undefined" && localStorage.getItem("kingsrunner_dev_mock") === "true";
    if (isDevMock) return;
    try {
      const jwt = localStorage.getItem("kingsrunner_jwt");
      const response = await fetch("http://localhost:8080/api/tenant/workers", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (response.ok) {
        const data = await response.json();
        // Adapt backend Worker to UI User
        const adaptedWorkers: User[] = data.map((w: any) => ({
          id: w.id.toString(),
          name: w.fullName,
          email: w.email,
          department: w.departmentName,
          role: w.role,
          createdAt: new Date().toISOString()
        }));
        setWorkers(adaptedWorkers);
      }
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handleHireWorker = async () => {
    if (!newWorker.name || !newWorker.email || !newWorker.department || !newWorker.role) {
      toast.error('Please fill all fields');
      return;
    }

    setIsHiring(true);
    const isDevMock = typeof window !== "undefined" && localStorage.getItem("kingsrunner_dev_mock") === "true";
    if (isDevMock) return; // Skip actual fetch if mock is forced

    try {
      const jwt = localStorage.getItem("kingsrunner_jwt");
      const response = await fetch("http://localhost:8080/api/tenant/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({
          fullName: newWorker.name,
          email: newWorker.email,
          departmentName: newWorker.department,
        }),
      });
      if (!response.ok) throw new Error("Failed to hire worker");

      await fetchWorkers(); // Refresh the list from the backend
      setNewWorker({ name: '', email: '', department: '', role: '' });
      setIsHireDialogOpen(false);
      toast.success(`${newWorker.name} has been onboarded`);
    } catch (err) {
      toast.error("Failed to onboard worker");
    } finally {
      setIsHiring(false);
    }
  };

  const handleAddDepartment = () => {
    if (!newDept.trim()) {
      toast.error('Please enter a department name');
      return;
    }
    // Note: If you have a Spring Boot endpoint for creating departments, it goes here.
    // For now, keeping your original UI state logic so it doesn't crash.
    const dept: Department = { id: Date.now().toString(), name: newDept, workerCount: 0 };
    setDepartments([...departments, dept]);
    setNewDept('');
    setIsDeptDialogOpen(false);
    toast.success(`Department "${dept.name}" created`);
  };

  const handleCreateLounge = () => {
    if (!newLounge.name) { toast.error('Please provide a lounge name'); return; }
    setLounges([...lounges, { id: Date.now().toString(), name: newLounge.name.toLowerCase().replace(/\s+/g, '-'), description: newLounge.description, isPrivate: newLounge.isPrivate, memberCount: 1 }]);
    setNewLounge({ name: '', description: '', isPrivate: false });
    setIsLoungeDialogOpen(false);
    toast.success(`Lounge #${newLounge.name} created successfully.`);
  };

  const handleDeleteWorker = (id: string) => {
    setWorkers(workers.filter(w => w.id !== id));
    toast.success('Worker removed');
  };

  const handleDeleteDepartment = (id: string) => {
    setDepartments(departments.filter(d => d.id !== id));
    toast.success('Department removed');
  };

  const handleLogout = () => {
    localStorage.removeItem('kingsrunner_jwt');
    localStorage.removeItem('kingsrunner_user');
    router.push('/');
  };

  const handleApplyForAccess = () => {
    if (!selectedModuleForRequest) return;
    if (!requestMessage.trim()) { toast.error("Please provide a business justification."); return; }

    const isDevMock = typeof window !== "undefined" && localStorage.getItem("kingsrunner_dev_mock") === "true";
    if (isDevMock) {
      setModules(modules.map(m => m.id === selectedModuleForRequest.id ? { ...m, status: 'pending' as const } : m));
      toast.success(`Access requested for ${selectedModuleForRequest.name}. Sent to Super Admin.`);
      setSelectedModuleForRequest(null);
      setRequestMessage('');
    } else {
      // TODO: Hook up to Spring Boot POST /api/tenant/modules/request
      toast.info("Backend connection pending.");
    }
  };

  const getModuleIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      lock: <Lock className="w-5 h-5" />, users: <Users className="w-5 h-5" />,
      truck: <Truck className="w-5 h-5" />, heart: <Heart className="w-5 h-5" />,
      building: <Building2 className="w-5 h-5" />, dollar: <DollarSign className="w-5 h-5" />
    };
    return icons[iconName] || <Building2 className="w-5 h-5" />;
  };

  const getStatusBadge = (status: ERPModule['status']) => {
    switch (status) {
      case 'active': return (<Badge className="bg-emerald-500 text-white border-emerald-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</Badge>);
      case 'pending': return (<Badge className="bg-orange-500 text-white border-orange-600"><Clock className="w-3 h-3 mr-1" /> Pending Approval</Badge>);
      case 'locked': return (<Badge variant="outline" className="text-muted-foreground border-muted-foreground/30 bg-muted/30"><Lock className="w-3 h-3 mr-1" /> Locked</Badge>);
    }
  };

  const stats = [
    { label: 'Total Workers', value: workers.length },
    { label: 'ERP Modules', value: modules.filter(m => m.status === 'active').length },
    { label: 'Admins', value: 1 },
    { label: 'Staff', value: Math.max(0, workers.length - 1) }
  ];

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm text-muted-foreground">Verifying Security...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/80 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 selection:bg-emerald-500 selection:text-white pb-12">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 mt-1">
            <TIRLogo size="sm" />
            <span className="text-xl font-black tracking-wider bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent uppercase hidden sm:inline">
              Institution Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Avatar className="w-9 h-9 border-2 border-emerald-500/20 shadow-sm cursor-pointer hover:border-emerald-500/50 transition-colors bg-white">
              <AvatarFallback className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-xs font-bold">IA</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Raised Tile Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-zinc-900/80 backdrop-blur-md border-x border-t border-zinc-200 dark:border-zinc-800 border-b-[3px] border-b-emerald-500 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-5 flex items-center gap-4 relative z-10">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 shadow-sm"><Users className="w-5 h-5" /></div>
              <div><div className="text-3xl font-black text-zinc-900 dark:text-white leading-none">{workers.length}</div><p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Total Workers</p></div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-zinc-900/80 backdrop-blur-md border-x border-t border-zinc-200 dark:border-zinc-800 border-b-[3px] border-b-cyan-500 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-5 flex items-center gap-4 relative z-10">
              <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-500 shadow-sm"><Layers className="w-5 h-5" /></div>
              <div><div className="text-3xl font-black text-zinc-900 dark:text-white leading-none">{modules.filter(m => m.status === 'active').length}</div><p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Active Modules</p></div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-zinc-900/80 backdrop-blur-md border-x border-t border-zinc-200 dark:border-zinc-800 border-b-[3px] border-b-amber-500 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-5 flex items-center gap-4 relative z-10">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 shadow-sm"><MessageSquare className="w-5 h-5" /></div>
              <div><div className="text-3xl font-black text-zinc-900 dark:text-white leading-none">4</div><p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Active Lounges</p></div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-zinc-900/80 backdrop-blur-md border-x border-t border-zinc-200 dark:border-zinc-800 border-b-[3px] border-b-teal-500 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-5 flex items-center gap-4 relative z-10">
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-500 shadow-sm"><Activity className="w-5 h-5" /></div>
              <div><div className="text-3xl font-black text-zinc-900 dark:text-white leading-none">99%</div><p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">System Health</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Master Control Layout: Vertical Sidebar + Content Area */}
        <Tabs defaultValue="lounges" className="flex flex-col md:flex-row gap-8 items-start">

          {/* Left Sidebar Navigation */}
          <div className="w-full md:w-64 shrink-0 sticky top-24">
            <TabsList className="flex flex-col h-auto w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl p-2 gap-1.5">
              <TabsTrigger value="lounges" className="justify-start px-4 py-3 data-[state=active]:bg-emerald-500 data-[state=active]:text-white w-full text-zinc-600 dark:text-zinc-400 font-bold tracking-wide transition-all data-[state=inactive]:hover:bg-zinc-50 dark:data-[state=inactive]:hover:bg-zinc-800/50">
                <MessageSquare className="w-4 h-4 mr-3" /> Lounges & Comms
              </TabsTrigger>
              <TabsTrigger value="workers" className="justify-start px-4 py-3 data-[state=active]:bg-emerald-500 data-[state=active]:text-white w-full text-zinc-600 dark:text-zinc-400 font-bold tracking-wide transition-all data-[state=inactive]:hover:bg-zinc-50 dark:data-[state=inactive]:hover:bg-zinc-800/50">
                <Users className="w-4 h-4 mr-3" /> Directory
              </TabsTrigger>
              <TabsTrigger value="modules" className="justify-start px-4 py-3 data-[state=active]:bg-emerald-500 data-[state=active]:text-white w-full text-zinc-600 dark:text-zinc-400 font-bold tracking-wide transition-all data-[state=inactive]:hover:bg-zinc-50 dark:data-[state=inactive]:hover:bg-zinc-800/50">
                <Layers className="w-4 h-4 mr-3" /> ERP Modules
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Right Main Content Area */}
          <div className="flex-1 min-w-0 w-full">

            {/* TAB: LOUNGES & COMMS */}
            <TabsContent value="lounges" className="m-0 space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left Col: Lounge Moderation */}
                <div className="xl:col-span-2 space-y-6">
                  <Card className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-500" /> Community Moderation
                      </CardTitle>

                      {/* Create Lounge Dialog */}
                      <Dialog open={isLoungeDialogOpen} onOpenChange={setIsLoungeDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm h-8">
                            <Plus className="w-4 h-4 mr-1.5" /> New Lounge
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-black text-zinc-900 dark:text-white">Create Channel</DialogTitle>
                            <DialogDescription className="text-zinc-500">Establish a new communication lounge for workers.</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-5 py-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Lounge Name</Label>
                              <div className="relative">
                                <Hash className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                                <Input
                                  placeholder="e.g., q3-planning"
                                  value={newLounge.name}
                                  onChange={e => setNewLounge({...newLounge, name: e.target.value})}
                                  className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-emerald-500"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Description</Label>
                              <Input
                                placeholder="What is this channel for?"
                                value={newLounge.description}
                                onChange={e => setNewLounge({...newLounge, description: e.target.value})}
                                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-emerald-500"
                              />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                              <div className="space-y-0.5">
                                <Label className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                  {newLounge.isPrivate ? <Lock className="w-4 h-4 text-amber-500"/> : <Globe className="w-4 h-4 text-emerald-500"/>}
                                  Private Lounge
                                </Label>
                                <p className="text-xs text-zinc-500">{newLounge.isPrivate ? 'Only invited members can view/join.' : 'Anyone in the institution can join.'}</p>
                              </div>
                              <Switch
                                checked={newLounge.isPrivate}
                                onCheckedChange={checked => setNewLounge({...newLounge, isPrivate: checked})}
                                className="data-[state=checked]:bg-amber-500"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsLoungeDialogOpen(false)} className="border-zinc-200 dark:border-zinc-800">Cancel</Button>
                            <Button onClick={handleCreateLounge} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">Create Lounge</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardHeader>

                    <CardContent className="p-0">
                      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                        {lounges.length === 0 ? (
                           <div className="p-8 text-center text-zinc-500 text-sm">No lounges created yet.</div>
                        ) : (
                          lounges.map(lounge => (
                            <div key={lounge.id} className="p-5 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${lounge.isPrivate ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'}`}>
                                  {lounge.isPrivate ? <Lock className="w-5 h-5 text-amber-600 dark:text-amber-500" /> : <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />}
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">#{lounge.name}</h4>
                                  <p className="text-xs font-medium text-zinc-500 mt-0.5">{lounge.isPrivate ? 'Highly restricted' : 'Public'} • {lounge.memberCount} active members</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => toast.info(`Opening settings for #${lounge.name}`)} className="h-8 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900">Settings</Button>
                                {lounge.isPrivate ? (
                                  <Button variant="outline" size="sm" onClick={() => toast.error(`Purging logs for #${lounge.name}`)} className="h-8 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 bg-white dark:bg-zinc-900">Purge Logs</Button>
                                ) : (
                                  <Button variant="outline" size="sm" onClick={() => toast.warning(`Locking #${lounge.name}`)} className="h-8 border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 bg-white dark:bg-zinc-900">Lock Chat</Button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Col: Global Broadcast */}
                <div className="space-y-6">
                  <Card className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
                    <CardHeader className="pb-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800/50">
                      <CardTitle className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-emerald-500" /> Global Broadcast
                      </CardTitle>
                      <CardDescription className="text-xs text-zinc-500">Push pinned alerts to all worker feeds.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-5">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Alert Title</Label>
                        <Input placeholder="e.g., System Maintenance" className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm h-10 shadow-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Message Body</Label>
                        <Textarea placeholder="Enter official announcement..." className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-sm resize-none min-h-[120px] shadow-sm" />
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <Pin className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Pin to top of feeds</span>
                        </div>
                        <Switch defaultChecked className="data-[state=checked]:bg-emerald-500" />
                      </div>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md mt-2 h-10">
                        Push Broadcast
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* TAB: DIRECTORY */}
            <TabsContent value="workers" className="m-0 space-y-6 animate-in fade-in duration-300">
              <Card className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/50 flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                  <Input placeholder="Search workers by name or email..." className="max-w-md w-full bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 h-10 text-sm shadow-sm" />

                  <div className="flex items-center gap-3 w-full sm:w-auto">

                    {/* Add Department Dialog */}
                    <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 shadow-sm h-10 shrink-0 w-full sm:w-auto hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                          <Plus className="w-4 h-4 mr-2" /> Add Department
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-black text-zinc-900 dark:text-white">Create Department</DialogTitle>
                          <DialogDescription className="text-zinc-500">Establish a new organizational unit.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-5 py-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Department Name</Label>
                            <Input
                              placeholder="e.g., Engineering"
                              value={newDept}
                              onChange={(e) => setNewDept(e.target.value)}
                              className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-emerald-500"
                            />
                          </div>
                          <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                            <div className="space-y-0.5">
                              <Label className="text-sm font-bold text-zinc-900 dark:text-white">Auto-create Lounge</Label>
                              <p className="text-xs text-zinc-500">Generate a private community channel.</p>
                            </div>
                            <Switch defaultChecked className="data-[state=checked]:bg-emerald-500" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDeptDialogOpen(false)} className="border-zinc-200 dark:border-zinc-800">Cancel</Button>
                          <Button onClick={handleAddDepartment} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">Create Department</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Onboard Worker Dialog */}
                    <Dialog open={isHireDialogOpen} onOpenChange={setIsHireDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm h-10 shrink-0 w-full sm:w-auto">
                          <Plus className="w-4 h-4 mr-2" /> Onboard Worker
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-black text-zinc-900 dark:text-white">Provision New Worker</DialogTitle>
                          <DialogDescription className="text-zinc-500">Add an employee and assign ERP system access.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-5 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Full Name</Label>
                              <Input placeholder="John Doe" value={newWorker.name} onChange={e => setNewWorker({...newWorker, name: e.target.value})} className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email Address</Label>
                              <Input type="email" placeholder="john@institution.edu" value={newWorker.email} onChange={e => setNewWorker({...newWorker, email: e.target.value})} className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Department</Label>
                              <Select value={newWorker.department} onValueChange={val => setNewWorker({...newWorker, department: val})}>
                                <SelectTrigger className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                  <SelectValue placeholder="Select Dept" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                                  {departments.map(d => (
                                    <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                                  ))}
                                  {departments.length === 0 && <SelectItem value="general" disabled>No departments found</SelectItem>}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500">System Role</Label>
                              <Select value={newWorker.role} onValueChange={val => setNewWorker({...newWorker, role: val})}>
                                <SelectTrigger className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                                  <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                                  {availableRoles.map(role => (
                                    <SelectItem key={role} value={role}>{role.replace('_', ' ')}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg mt-2">
                            <div className="space-y-0.5">
                              <Label className="text-sm font-bold text-zinc-900 dark:text-white">Send Welcome Email</Label>
                              <p className="text-xs text-zinc-500">Includes secure temporary password.</p>
                            </div>
                            <Switch defaultChecked className="data-[state=checked]:bg-emerald-500" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsHireDialogOpen(false)} className="border-zinc-200 dark:border-zinc-800">Cancel</Button>
                          <Button onClick={handleHireWorker} disabled={isHiring} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                            {isHiring ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Provision Worker
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <Table>
                  <TableHeader className="bg-zinc-50/80 dark:bg-zinc-950/50">
                    <TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500 h-10">Employee</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500 h-10">Department</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500 h-10">System Role</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider text-zinc-500 h-10 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workers.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-12 text-zinc-500 text-sm">No workers found in directory.</TableCell></TableRow>
                    ) : (
                      workers.map(w => (
                        <TableRow key={w.id} className="border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                          <TableCell className="py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-9 h-9 border border-zinc-200 dark:border-zinc-700 bg-white">
                                <AvatarFallback className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 text-xs font-bold">{w.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-bold text-zinc-900 dark:text-white">{w.name}</p>
                                <p className="text-[10px] text-zinc-500">{w.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3"><Badge variant="outline" className="border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 font-semibold">{w.department}</Badge></TableCell>
                          <TableCell className="py-3"><Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shadow-none hover:bg-emerald-100 font-semibold">{w.role}</Badge></TableCell>
                          <TableCell className="py-3 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"><Settings className="w-4 h-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* TAB: ERP MODULES */}
            <TabsContent value="modules" className="m-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {modules.map(m => (
                <Card key={m.id} className="bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group flex flex-col">
                  <CardHeader className="pb-4 flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`p-3 rounded-xl border transition-colors ${
                        m.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-500' :
                        m.status === 'pending' ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-500' :
                        'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400'
                      }`}>
                        <Layers className="w-5 h-5" />
                      </div>
                      <Badge variant={m.status === 'active' ? 'default' : 'outline'} className={
                        m.status === 'active' ? 'bg-emerald-500 text-white shadow-sm' :
                        m.status === 'pending' ? 'text-amber-500 border-amber-500/50 bg-amber-50 dark:bg-amber-500/10' :
                        'text-zinc-500 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                      }>
                        {m.status.toUpperCase()}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold text-zinc-900 dark:text-white">{m.name}</CardTitle>
                    <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed line-clamp-2">{m.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="shrink-0 pt-0">
                    {m.status === 'active' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold h-10 shadow-sm transition-colors border border-zinc-200 dark:border-zinc-700">
                            Configure Policies
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-black">{m.name} Settings</DialogTitle>
                            <DialogDescription>Manage global institution policies for this module.</DialogDescription>
                          </DialogHeader>
                          <div className="py-6 text-center text-sm text-zinc-500">
                            <Settings className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-3 animate-[spin_3s_linear_infinite]" />
                            Configuration panels will be available once the {m.name} backend service is fully deployed.
                          </div>
                          <DialogFooter>
                            <Button variant="outline" className="w-full border-zinc-200 dark:border-zinc-800">Close</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}

                    {m.status === 'locked' && (
                      <Dialog open={selectedModuleForRequest?.id === m.id} onOpenChange={(open) => !open ? setSelectedModuleForRequest(null) : setSelectedModuleForRequest(m)}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-10 shadow-sm">
                            Request Access
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-black text-zinc-900 dark:text-white">Unlock {m.name}</DialogTitle>
                            <DialogDescription className="text-zinc-500">Submit a business justification to the Super Admin.</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-3 rounded-lg flex items-start gap-3">
                              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-500 mt-0.5 shrink-0" />
                              <p className="text-xs text-emerald-800 dark:text-emerald-400 font-medium">This module requires elevated provisioning. Access is typically granted within 24 hours.</p>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                <FileText className="w-3 h-3" /> Business Justification
                              </Label>
                              <Textarea
                                placeholder="Explain why your institution needs this module (e.g., 'We just acquired 5 new buses...')"
                                value={requestMessage}
                                onChange={e => setRequestMessage(e.target.value)}
                                className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-emerald-500 resize-none min-h-[100px]"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedModuleForRequest(null)} className="border-zinc-200 dark:border-zinc-800">Cancel</Button>
                            <Button onClick={handleApplyForAccess} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">Submit Request</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}

                    {m.status === 'pending' && (
                      <Button disabled className="w-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 font-bold h-10 border border-amber-200 dark:border-amber-500/20 opacity-100">
                        <Clock className="w-4 h-4 mr-2" /> Request Pending
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

          </div>
        </Tabs>
      </main>
    </div>
  );
}
