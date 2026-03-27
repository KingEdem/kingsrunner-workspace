'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Building2,
  Lock,
  CheckCircle2,
  Clock,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Settings,
  TrendingUp,
  Heart,
  Truck,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TIRLogo } from '@/components/tir-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  erpModules,
  departments as initialDepartments,
  workers as initialWorkers,
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
  const [modules, setModules] = useState<ERPModule[]>(erpModules);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [workers, setWorkers] = useState<User[]>(initialWorkers);
  const [selectedModule, setSelectedModule] = useState<ERPModule | null>(null);
  const [isHireDialogOpen, setIsHireDialogOpen] = useState(false);
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', email: '', department: '', role: '' });
  const [newDept, setNewDept] = useState('');
  const [chatOpen, setChatOpen] = useState(false);

  const availableRoles = getAvailableRoles(modules);

  useEffect(() => {
    const userJson = localStorage.getItem('kingsrunner_user');
    if (!userJson) {
      router.push('/');
      return;
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('kingsrunner_jwt');
    localStorage.removeItem('kingsrunner_user');
    router.push('/');
  };

  const handleApplyForAccess = (module: ERPModule) => {
    if (isDevMockEnabled()) {
      setModules(modules.map(m =>
        m.id === module.id ? { ...m, status: 'pending' as const } : m
      ));
      toast.success(`Access requested for ${module.name}`);
    }
  };

  const handleHireWorker = () => {
    if (!newWorker.name || !newWorker.email || !newWorker.department || !newWorker.role) {
      toast.error('Please fill all fields');
      return;
    }

    const worker: User = {
      id: Date.now().toString(),
      name: newWorker.name,
      email: newWorker.email,
      department: newWorker.department,
      role: newWorker.role,
      createdAt: new Date().toISOString()
    };

    setWorkers([...workers, worker]);
    setNewWorker({ name: '', email: '', department: '', role: '' });
    setIsHireDialogOpen(false);
    toast.success(`${worker.name} has been onboarded`);
  };

  const handleDeleteWorker = (id: string) => {
    setWorkers(workers.filter(w => w.id !== id));
    toast.success('Worker removed');
  };

  const handleAddDepartment = () => {
    if (!newDept.trim()) {
      toast.error('Please enter a department name');
      return;
    }

    const dept: Department = {
      id: Date.now().toString(),
      name: newDept,
      workerCount: 0
    };

    setDepartments([...departments, dept]);
    setNewDept('');
    setIsDeptDialogOpen(false);
    toast.success(`Department "${dept.name}" created`);
  };

  const handleDeleteDepartment = (id: string) => {
    setDepartments(departments.filter(d => d.id !== id));
    toast.success('Department removed');
  };

  const getModuleIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      lock: <Lock className="w-5 h-5" />,
      users: <Users className="w-5 h-5" />,
      truck: <Truck className="w-5 h-5" />,
      heart: <Heart className="w-5 h-5" />,
      building: <Building2 className="w-5 h-5" />,
      dollar: <DollarSign className="w-5 h-5" />
    };
    return icons[iconName] || <Building2 className="w-5 h-5" />;
  };

  const getStatusBadge = (status: ERPModule['status']) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-emerald-500 text-white border-emerald-600">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Active
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-orange-500 text-white border-orange-600">
            <Clock className="w-3 h-3 mr-1" /> Pending Approval
          </Badge>
        );
      case 'locked':
        return (
          <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30 bg-muted/30">
            <Lock className="w-3 h-3 mr-1" /> Locked
          </Badge>
        );
    }
  };

  const stats = [
    { label: 'Total Workers', value: workers.length },
    { label: 'ERP Modules', value: modules.filter(m => m.status === 'active').length },
    { label: 'Admins', value: 1 },
    { label: 'Staff', value: workers.length - 1 }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TIRLogo size="sm" />
            <span className="font-semibold text-foreground">Institution Admin</span>
          </div>
          
          {/* Right: Theme Toggle, Avatar, Logout */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Avatar className="w-9 h-9 bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 transition-all cursor-pointer">
              <AvatarFallback className="text-emerald-500 text-sm">
                IA
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <Card key={i} className="bg-card border-border hover-lift transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <p className="text-sm text-emerald-500">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="modules" className="space-y-6">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="modules" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              ERP Modules
            </TabsTrigger>
            <TabsTrigger value="workers" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              Workers
            </TabsTrigger>
            <TabsTrigger value="departments" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              Departments
            </TabsTrigger>
          </TabsList>

          {/* ERP Modules Tab */}
          <TabsContent value="modules" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Platform ERP Modules</h2>
              <p className="text-sm text-muted-foreground">
                {modules.filter(m => m.status === 'active').length} of {modules.length} modules active for this institution
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map(module => (
                <Card
                  key={module.id}
                  className={`bg-card border-border relative transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                    module.status === 'active' 
                      ? 'border-emerald-500/50 shadow-emerald-500/20 hover:shadow-emerald-500/30' 
                      : module.status === 'pending' 
                        ? 'border-orange-500/30 hover:shadow-orange-500/20' 
                        : 'hover:shadow-muted/20'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-lg ${
                        module.status === 'active' 
                          ? 'bg-emerald-500/20 text-emerald-500' 
                          : module.status === 'pending'
                            ? 'bg-orange-500/20 text-orange-500'
                            : 'bg-secondary text-muted-foreground'
                      }`}>
                        {getModuleIcon(module.icon)}
                      </div>
                      {getStatusBadge(module.status)}
                    </div>
                    <CardTitle className="text-foreground mt-3">{module.name}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {module.status === 'active' ? (
                      <Button
                        onClick={() => setSelectedModule(module)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20"
                      >
                        Manage Module
                      </Button>
                    ) : module.status === 'pending' ? (
                      <Button disabled className="w-full bg-orange-500/30 text-orange-300 border border-orange-500/50">
                        Pending Approval
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleApplyForAccess(module)}
                        className="w-full border-border text-muted-foreground hover:text-foreground hover:border-emerald-500/50 transition-all duration-300"
                      >
                        <Lock className="w-4 h-4 mr-2" /> Apply for Access
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Module Management Dialog */}
            {selectedModule && (
              <Dialog open={!!selectedModule} onOpenChange={() => setSelectedModule(null)}>
                <DialogContent className="bg-card border-border max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-500" />
                      {selectedModule.name}
                    </DialogTitle>
                    <DialogDescription>
                      Grant or revoke worker access to this module. Changes take effect immediately.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Worker Access Table */}
                    <div className="border border-border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-muted-foreground">Departments</TableHead>
                            <TableHead className="text-muted-foreground">Worker</TableHead>
                            <TableHead className="text-muted-foreground">Email</TableHead>
                            <TableHead className="text-muted-foreground">Access</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {workers.slice(0, 1).map((worker) => (
                            <TableRow key={worker.id} className="border-border">
                              <TableCell>
                                <Badge className="bg-emerald-500 text-white">
                                  {worker.department}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-foreground">
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6 bg-emerald-500/20 border border-emerald-500/30">
                                    <AvatarFallback className="text-emerald-500 text-xs">
                                      {worker.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  {worker.name}
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{worker.email}</TableCell>
                              <TableCell>
                                <Switch defaultChecked className="data-[state=checked]:bg-emerald-500" />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Module Configuration */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-foreground">
                        <Settings className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-medium">Module Configuration</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Tenant-level settings for {selectedModule.name}. Changes apply to all workers in your institution.
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                            Default Working Hours / Week
                          </Label>
                          <Input
                            type="number"
                            defaultValue={moduleConfig.defaultWorkingHours}
                            className="bg-input border-border"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                            Leave Policy
                          </Label>
                          <Select defaultValue="standard">
                            <SelectTrigger className="bg-input border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              <SelectItem value="standard">Standard (20 days/yr)</SelectItem>
                              <SelectItem value="extended">Extended (25 days/yr)</SelectItem>
                              <SelectItem value="unlimited">Unlimited PTO</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                            Payroll Cycle
                          </Label>
                          <Select defaultValue="monthly">
                            <SelectTrigger className="bg-input border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="biweekly">Bi-weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                            Probation Period (Months)
                          </Label>
                          <Input
                            type="number"
                            defaultValue={moduleConfig.probationPeriod}
                            className="bg-input border-border"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20">
                          Save Configuration
                        </Button>
                      </div>
                    </div>

                    {/* Usage Metrics */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-foreground">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-medium">Usage & Quota Metrics</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Module utilization snapshot. Data refreshes every 5 minutes.
                      </p>

                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center p-4 rounded-lg bg-secondary/30">
                          <div className="text-2xl font-bold text-emerald-500">{usageMetrics.activeUsers}</div>
                          <p className="text-xs text-muted-foreground uppercase">Active Users</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-secondary/30">
                          <div className="text-2xl font-bold text-emerald-500">{usageMetrics.storageUsed}</div>
                          <p className="text-xs text-muted-foreground uppercase">Storage Used</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-secondary/30">
                          <div className="text-2xl font-bold text-emerald-500">{usageMetrics.lastSync}</div>
                          <p className="text-xs text-muted-foreground uppercase">Last Sync</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-secondary/30">
                          <div className="text-2xl font-bold text-emerald-500">{usageMetrics.uptime}</div>
                          <p className="text-xs text-muted-foreground uppercase">Uptime</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          {/* Workers Tab */}
          <TabsContent value="workers" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Worker Management</h2>
                <p className="text-sm text-muted-foreground">
                  Manage employee records and access permissions
                </p>
              </div>
              <Dialog open={isHireDialogOpen} onOpenChange={setIsHireDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Onboard New Worker
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Onboard New Worker</DialogTitle>
                    <DialogDescription>
                      Add a new employee to your institution
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Full Name</Label>
                      <Input
                        value={newWorker.name}
                        onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Email</Label>
                      <Input
                        type="email"
                        value={newWorker.email}
                        onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Department</Label>
                      <Select
                        value={newWorker.department}
                        onValueChange={(v) => setNewWorker({ ...newWorker, department: v })}
                      >
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {departments.map(dept => (
                            <SelectItem key={dept.id} value={dept.name}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Role</Label>
                      <Select
                        value={newWorker.role}
                        onValueChange={(v) => setNewWorker({ ...newWorker, role: v })}
                      >
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {availableRoles.length === 0 ? (
                            <SelectItem value="" disabled>
                              No roles available - Activate modules first
                            </SelectItem>
                          ) : (
                            availableRoles.map(role => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Only roles from active modules are available
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsHireDialogOpen(false)}
                      className="border-border"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleHireWorker}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      Onboard Worker
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Email</TableHead>
                    <TableHead className="text-muted-foreground">Department</TableHead>
                    <TableHead className="text-muted-foreground">Role</TableHead>
                    <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workers.map(worker => (
                    <TableRow key={worker.id} className="border-border hover:bg-secondary/30 transition-colors">
                      <TableCell className="text-foreground">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8 bg-emerald-500/20 border border-emerald-500/30">
                            <AvatarFallback className="text-emerald-500 text-xs">
                              {worker.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {worker.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{worker.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-border">
                          {worker.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                          {worker.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteWorker(worker.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Department Management</h2>
                <p className="text-sm text-muted-foreground">
                  Organize your institution&apos;s structure
                </p>
              </div>
              <Dialog open={isDeptDialogOpen} onOpenChange={setIsDeptDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Department
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Create Department</DialogTitle>
                    <DialogDescription>
                      Add a new department to your institution
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Department Name</Label>
                      <Input
                        value={newDept}
                        onChange={(e) => setNewDept(e.target.value)}
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDeptDialogOpen(false)}
                      className="border-border"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddDepartment}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      Create Department
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map(dept => (
                <Card key={dept.id} className="bg-card border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-foreground text-base">{dept.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDepartment(dept.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {workers.filter(w => w.department === dept.name).length} workers
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating AI Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setChatOpen(!chatOpen)}
          className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 h-14 px-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/30"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          TIR AI Analyst
        </Button>
      </div>
    </div>
  );
}
