"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Send, X, Sparkles, AlertTriangle, Bell, CheckCircle2, MessageSquare, Clock, Home, Users, User, Shield, LogOut, Mail, ArrowRight, Loader2, Briefcase, MapPin, Smartphone, Calendar, Fingerprint, Lock, Pencil, Heart, Share2, Hash, CircleDot, Pin, ImageIcon, SendHorizontal, MoreHorizontal, CheckSquare, Layers, Truck, FolderOpen, Plus, FileText, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { TIRLogo } from "@/components/tir-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";

// --- BACKEND INTERFACES ---
interface Colleague {
  id: number;
  fullName: string;
  role: string;
}

interface BackendPost {
  id: number;
  authorName: string;
  content: string;
  createdAt: string;
  loungeName?: string;
  likes?: number;
  replies?: number;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: string;
  createdAt: string;
}

// --- VISUAL FALLBACK DATA (For UI completeness) ---
const userQuickStats = { pendingTasks: 4, newModuleAccess: 1, unreadMessages: 3, upcomingDeadlines: 2 };

type TabType = 'home' | 'community' | 'profile';
type LoungeType = 'staff' | 'General';

export default function WorkerHubPage() {
  const router = useRouter();

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [activeLounge, setActiveLounge] = useState<LoungeType>('General');

  // --- BACKEND STATE ---
  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [feed, setFeed] = useState<BackendPost[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newPost, setNewPost] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Home Tab State
  const [tasks, setTasks] = useState([
    { id: 't1', title: 'Submit Weekly Timesheet', subtitle: 'Due today at 5:00 PM', type: 'required' },
    { id: 't2', title: 'Acknowledge Safety Policy', subtitle: 'From: Institution Admin', type: 'overdue' }
  ]);
  const [dmInputs, setDmInputs] = useState<Record<string, string>>({});
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [accessRequest, setAccessRequest] = useState({ moduleName: '', justification: '' });

  // Profile Tab State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ phone: '+233 55 123 4567', bio: '' });
  const [prefs, setPrefs] = useState({
    twoFactor: true,
    emailNotif: true,
    pushNotif: true,
    dmNotif: true
  });

  // Get current user from localStorage
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("kingsrunner_user");
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch (e) {
          console.error("Failed to parse user data", e);
        }
      }
    }
  }, []);

  const isDevMock = typeof window !== "undefined" && localStorage.getItem("kingsrunner_dev_mock") === "true";

  // --- DATA FETCHING ---
  useEffect(() => {
    fetchColleagues();
    fetchFeed();
    fetchAnnouncements();
  }, []);

  const fetchColleagues = async () => {
    if (isDevMock) return;
    try {
      const jwt = localStorage.getItem("kingsrunner_jwt");
      const response = await fetch("http://localhost:8080/api/tenant/workspace/directory", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (response.ok) setColleagues(await response.json());
    } catch (err) { console.error("Colleagues fetch error", err); }
  };

  const fetchFeed = async () => {
    if (isDevMock) return;
    try {
      const jwt = localStorage.getItem("kingsrunner_jwt");
      const response = await fetch("http://localhost:8080/api/tenant/feed", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (response.ok) setFeed(await response.json());
    } catch (err) { console.error("Feed fetch error", err); }
    finally { setIsLoading(false); }
  };

  const fetchAnnouncements = async () => {
    if (isDevMock) {
      setAnnouncements([
        { id: 1, title: 'Quarterly Review Reminder', content: 'Please ensure all self-assessments are submitted.', priority: 'NORMAL', createdAt: new Date().toISOString() },
        { id: 2, title: 'Server Downtime', content: 'HR module will be offline Sunday 2AM-4AM.', priority: 'HIGH', createdAt: new Date(Date.now() - 86400000).toISOString() }
      ]);
      return;
    }
    try {
      const jwt = localStorage.getItem("kingsrunner_jwt");
      const response = await fetch("http://localhost:8080/api/tenant/workspace/announcements", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (response.ok) setAnnouncements(await response.json());
    } catch (err) { console.error("Announcements fetch error", err); }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    setIsPosting(true);
    try {
      const jwt = localStorage.getItem("kingsrunner_jwt");
      const response = await fetch("http://localhost:8080/api/tenant/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ content: newPost }),
      });
      if (!response.ok) throw new Error("Failed to create post");
      setNewPost("");
      await fetchFeed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post");
    } finally {
      setIsPosting(false);
    }
  };

  const handleToggleLike = (postId: number) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });
  };

  const handleSubmitReply = (postId: number) => {
    if (!replyContent.trim()) return;
    toast.success("Reply submitted.");
    setReplyingTo(null);
    setReplyContent('');
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    toast.success("Task marked as complete!");
  };

  const handleSendDM = (recipient: string) => {
    const message = dmInputs[recipient];
    if (!message?.trim()) return;
    toast.success(`Message sent to ${recipient}`);
    setDmInputs(prev => ({ ...prev, [recipient]: '' }));
  };

  const handleRequestModuleAccess = () => {
    if (!accessRequest.moduleName || !accessRequest.justification) {
      toast.error("Please fill out all fields.");
      return;
    }
    toast.success(`Request for ${accessRequest.moduleName} sent to Admin.`);
    setIsRequestModalOpen(false);
    setAccessRequest({ moduleName: '', justification: '' });
  };

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully.");
    setIsEditProfileOpen(false);
  };

  const handleSavePassword = () => {
    toast.success("Security credentials updated.");
    setIsPasswordModalOpen(false);
  };

  const handleTogglePref = (key: keyof typeof prefs) => {
    setPrefs(prev => {
      const newState = { ...prev, [key]: !prev[key] };
      toast.info("Preferences auto-saved.");
      return newState;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("kingsrunner_jwt");
    localStorage.removeItem("kingsrunner_user");
    router.push("/");
  };

  // --- UTILS ---
  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

  const formatTimestamp = (ts: string) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading && !isDevMock) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50 selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TIRLogo size="sm" />
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent hidden sm:inline">Worker Hub</span>
          </div>

          <nav className="flex items-center gap-1">
            <Button variant={activeTab === 'home' ? 'default' : 'ghost'} onClick={() => setActiveTab('home')}
              className={activeTab === 'home' ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'}>
              <Home className="w-4 h-4 mr-2" /> Home
            </Button>
            <Button variant={activeTab === 'community' ? 'default' : 'ghost'} onClick={() => setActiveTab('community')}
              className={activeTab === 'community' ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'}>
              <Users className="w-4 h-4 mr-2" /> Community
            </Button>
            <Button variant={activeTab === 'profile' ? 'default' : 'ghost'} onClick={() => setActiveTab('profile')}
              className={activeTab === 'profile' ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'}>
              <User className="w-4 h-4 mr-2" /> Profile
            </Button>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Area */}
          <main className="flex-1 min-w-0">

            {/* HOME TAB */}
            {activeTab === 'home' && (
              <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Top Stat Cards - True 3D Raised Tiles */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 border-b-[3px] border-b-amber-500 shadow-md hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardContent className="p-4 flex items-center gap-4 relative z-10">
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500"><Clock className="w-5 h-5" /></div>
                      <div><div className="text-3xl font-black text-slate-900 dark:text-white leading-none">{userQuickStats.pendingTasks}</div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Pending</p></div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 border-b-[3px] border-b-emerald-500 shadow-md hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardContent className="p-4 flex items-center gap-4 relative z-10">
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500"><CheckCircle2 className="w-5 h-5" /></div>
                      <div><div className="text-3xl font-black text-slate-900 dark:text-white leading-none">{userQuickStats.newModuleAccess}</div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Access</p></div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 border-b-[3px] border-b-cyan-500 shadow-md hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardContent className="p-4 flex items-center gap-4 relative z-10">
                      <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-500"><MessageSquare className="w-5 h-5" /></div>
                      <div><div className="text-3xl font-black text-slate-900 dark:text-white leading-none">{userQuickStats.unreadMessages}</div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Messages</p></div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 border-b-[3px] border-b-red-500 shadow-md hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1 transition-all group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardContent className="p-4 flex items-center gap-4 relative z-10">
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500"><Bell className="w-5 h-5" /></div>
                      <div><div className="text-3xl font-black text-slate-900 dark:text-white leading-none">{userQuickStats.upcomingDeadlines}</div><p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Deadlines</p></div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column (Spans 2/3) - Messages & Tasks */}
                  <div className="lg:col-span-2 space-y-6">

                    {/* Direct Messages Inbox */}
                    <Card className="bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 shadow-sm">
                      <CardHeader className="pb-3 border-b border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/50 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-cyan-500" /> Recent Messages
                        </CardTitle>
                        <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-cyan-600 dark:text-cyan-500 hover:text-cyan-700 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10">
                          View Inbox <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                          {/* Message 1 */}
                          <div className="p-5 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors">
                            <div className="flex gap-4">
                              <Avatar className="w-10 h-10 border border-slate-200 dark:border-zinc-700 mt-1 shrink-0 bg-white">
                                <AvatarFallback className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 font-bold">IA</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-sm text-slate-900 dark:text-zinc-100">Institution Admin</span>
                                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">12 mins ago</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">Please review the new compliance guidelines I sent over. We need sign-off by EOD tomorrow.</p>
                                <div className="pt-2 flex gap-2">
                                  <Input
                                    placeholder="Type a quick reply..."
                                    value={dmInputs['admin'] || ''}
                                    onChange={e => setDmInputs({...dmInputs, admin: e.target.value})}
                                    onKeyDown={e => e.key === 'Enter' && handleSendDM('admin')}
                                    className="h-9 bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-white focus-visible:ring-cyan-500"
                                  />
                                  <Button size="icon" onClick={() => handleSendDM('admin')} className="h-9 w-9 bg-cyan-600 hover:bg-cyan-500 text-white shrink-0 shadow-sm">
                                    <Send className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Message 2 */}
                          <div className="p-5 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors">
                            <div className="flex gap-4">
                              <Avatar className="w-10 h-10 border border-slate-200 dark:border-zinc-700 shrink-0 bg-white">
                                <AvatarFallback className="bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-500 font-bold">EK</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-sm text-slate-900 dark:text-zinc-100">Eric Kwame</span>
                                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase">2 hours ago</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-zinc-400">Hey, are we still meeting at 2 PM for the module sync?</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Priority Action Items */}
                    <Card className="bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 shadow-sm">
                      <CardHeader className="pb-3 border-b border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/50">
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-emerald-500" /> Priority Action Items
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        {tasks.length === 0 ? (
                          <div className="p-6 text-center text-slate-500 text-sm">All caught up! No pending tasks.</div>
                        ) : (
                          tasks.map(task => (
                            <div key={task.id} onClick={() => handleCompleteTask(task.id)} className={`flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-950/80 border-x border-t border-slate-200 dark:border-zinc-800 border-b-[3px] rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group ${task.type === 'required' ? 'border-b-amber-500 hover:shadow-[0_8px_20px_-8px_rgba(245,158,11,0.2)]' : 'border-b-red-500 hover:shadow-[0_8px_20px_-8px_rgba(239,68,68,0.2)]'}`}>
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${task.type === 'required' ? 'border-slate-300 dark:border-zinc-600 group-hover:border-amber-500 group-hover:bg-amber-50 dark:group-hover:bg-amber-500/20' : 'border-slate-300 dark:border-zinc-600 group-hover:border-red-500 group-hover:bg-red-50 dark:group-hover:bg-red-500/20'}`}>
                                  <CheckCircle2 className="w-3 h-3 text-transparent group-hover:text-current transition-colors" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900 dark:text-zinc-200 group-hover:text-emerald-700 dark:group-hover:text-white transition-colors">{task.title}</p>
                                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{task.subtitle}</p>
                                </div>
                              </div>
                              <Badge className={`font-bold shadow-none ${task.type === 'required' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20'}`}>
                                {task.type.toUpperCase()}
                              </Badge>
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>

                  </div>

                  {/* Right Column (Spans 1/3) - Launcher & Calendar */}
                  <div className="space-y-6">

                    {/* Module Launcher */}
                    <Card className="bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 shadow-sm">
                      <CardHeader className="pb-3 border-b border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/50">
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <Layers className="w-4 h-4 text-teal-500" /> My Workspace
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 grid grid-cols-2 gap-3">
                        <Button variant="outline" className="h-24 flex-col gap-3 bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 hover:border-teal-300 dark:hover:border-teal-500/50 hover:bg-teal-50 dark:hover:bg-teal-500/10 transition-all group">
                          <Users className="w-6 h-6 text-slate-400 dark:text-zinc-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
                          <span className="text-xs font-bold text-slate-600 dark:text-zinc-300 group-hover:text-slate-900 dark:group-hover:text-white">HR Portal</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex-col gap-3 bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all group">
                          <Truck className="w-6 h-6 text-slate-400 dark:text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                          <span className="text-xs font-bold text-slate-600 dark:text-zinc-300 group-hover:text-slate-900 dark:group-hover:text-white">Fleet Log</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex-col gap-3 bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 hover:border-cyan-300 dark:hover:border-cyan-500/50 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 transition-all group">
                          <FolderOpen className="w-6 h-6 text-slate-400 dark:text-zinc-500 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors" />
                          <span className="text-xs font-bold text-slate-600 dark:text-zinc-300 group-hover:text-slate-900 dark:group-hover:text-white">Documents</span>
                        </Button>
                        <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="h-24 flex-col gap-2 bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 border-dashed hover:border-slate-400 dark:hover:border-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800/50 transition-all">
                              <Plus className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Request<br/>Access</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Request Module Access</DialogTitle>
                              <DialogDescription className="text-slate-500">Ask your Institution Admin to provision a new ERP module for your account.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Module Name</Label>
                                <Input
                                  placeholder="e.g., Advanced Fleet Tracking"
                                  value={accessRequest.moduleName}
                                  onChange={e => setAccessRequest({...accessRequest, moduleName: e.target.value})}
                                  className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                  <FileText className="w-3 h-3" /> Business Justification
                                </Label>
                                <Textarea
                                  placeholder="Why do you need access to this tool?"
                                  value={accessRequest.justification}
                                  onChange={e => setAccessRequest({...accessRequest, justification: e.target.value})}
                                  className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 resize-none min-h-[100px]"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsRequestModalOpen(false)} className="border-slate-200 dark:border-zinc-800">Cancel</Button>
                              <Button onClick={handleRequestModuleAccess} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">Submit Request</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>

                    {/* Upcoming Schedule */}
                    <Card className="bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 shadow-sm">
                      <CardHeader className="pb-3 border-b border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/50">
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-emerald-500" /> Today's Agenda
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shrink-0">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase">Mar</span>
                            <span className="text-lg font-black text-slate-900 dark:text-white leading-none">28</span>
                          </div>
                          <div className="pt-1">
                            <p className="text-sm font-bold text-slate-900 dark:text-zinc-100">All-Hands Sync</p>
                            <p className="text-xs text-slate-500 font-medium">10:00 AM • Main Channel</p>
                          </div>
                        </div>

                        <div className="flex gap-4 opacity-60">
                          <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shrink-0">
                            <span className="text-xs font-bold text-slate-500 uppercase">Mar</span>
                            <span className="text-lg font-black text-slate-600 dark:text-zinc-400 leading-none">28</span>
                          </div>
                          <div className="pt-1">
                            <p className="text-sm font-bold text-slate-600 dark:text-zinc-400">Quarterly Review Prep</p>
                            <p className="text-xs text-slate-500 font-medium">2:00 PM • Solo Focus</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                  </div>
                </div>
              </div>
            )}

            {/* COMMUNITY TAB (Backend Feed Integration) */}
            {activeTab === 'community' && (
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Main Feed Column (Spans 2/3) */}
                <div className="lg:col-span-2 space-y-6">

                  {/* Create Post Box */}
                  <Card className="bg-white dark:bg-zinc-900/80 backdrop-blur-md border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex gap-4">
                        <Avatar className="w-10 h-10 border border-slate-200 dark:border-zinc-800 shrink-0 bg-white">
                          <AvatarFallback className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 font-bold">
                            {currentUser?.fullName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                          <Textarea
                            placeholder="Share an update, ask a question, or post to a lounge..."
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            disabled={isPosting}
                            className="min-h-[80px] bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus-visible:ring-emerald-500 resize-none text-sm p-3"
                          />
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="h-8 text-slate-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-2">
                                <ImageIcon className="w-4 h-4 mr-1.5" /> Media
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 text-slate-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-2">
                                <Hash className="w-4 h-4 mr-1.5" /> Tag Lounge
                              </Button>
                            </div>
                            <Button onClick={handleCreatePost} disabled={!newPost.trim() || isPosting} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm">
                              {isPosting ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <>Post <SendHorizontal className="w-4 h-4 ml-1.5" /></>}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pinned Announcement Card - Upgraded to Responsive Raised Tile */}
                  <Card className="bg-white dark:bg-zinc-900/90 backdrop-blur-md border border-slate-100 dark:border-zinc-800 border-b-[3px] border-b-emerald-500 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                    <CardContent className="p-5 relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-100 dark:border-emerald-500/20">
                          <Pin className="w-3.5 h-3.5 fill-current" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Pinned by Admin</span>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">2 hours ago</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">System Maintenance Schedule</h3>
                      <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed mb-4">
                        Please be advised that the main HR module will be undergoing scheduled maintenance this Sunday from 2:00 AM to 4:00 AM. Access may be intermittent during this window.
                      </p>
                      <div className="flex items-center gap-4 border-t border-slate-100 dark:border-zinc-800/50 pt-3">
                        <Button variant="ghost" size="sm" className="text-slate-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 h-8 px-2 transition-all">
                          <Heart className="w-4 h-4 mr-1.5" /> Acknowledge (24)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dynamic Feed Posts from Backend */}
                  {feed.map((post) => (
                    <Card key={post.id} className="bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-3">
                            <Avatar className="w-10 h-10 border border-slate-200 dark:border-zinc-800 bg-white">
                              <AvatarFallback className="bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-500 font-bold">
                                {getInitials(post.authorName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">{post.authorName}</span>
                                <span className="text-xs text-slate-500">• {formatTimestamp(post.createdAt)}</span>
                              </div>
                              <p className="text-[11px] font-medium text-teal-600 dark:text-teal-400">Worker</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed mb-4 whitespace-pre-wrap">
                          {post.content}
                        </p>

                        {/* Interaction Bar */}
                        <div className="flex items-center gap-4 border-t border-slate-100 dark:border-zinc-800/50 pt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleLike(post.id)}
                            className={`h-8 px-2 transition-colors ${likedPosts.has(post.id) ? 'text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800'}`}>
                            <Heart className={`w-4 h-4 mr-1.5 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                            {likedPosts.has(post.id) ? 'Liked' : 'Like'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                            className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 h-8 px-2">
                            <MessageSquare className="w-4 h-4 mr-1.5" /> Reply
                          </Button>
                        </div>

                        {/* Inline Reply Input Box */}
                        {replyingTo === post.id && (
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/50 flex gap-3 animate-in fade-in slide-in-from-top-2">
                            <Avatar className="w-8 h-8 border border-slate-200 dark:border-zinc-700 shrink-0 bg-white">
                              <AvatarFallback className="bg-slate-100 dark:bg-zinc-800 text-xs text-slate-500 dark:text-zinc-400">Me</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 flex gap-2">
                              <Input
                                autoFocus
                                placeholder="Write a reply..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply(post.id)}
                                className="h-9 bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-sm text-slate-900 dark:text-white focus-visible:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-zinc-600"
                              />
                              <Button size="icon" onClick={() => handleSubmitReply(post.id)} className="h-9 w-9 bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 shadow-sm">
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {/* Static Example Post */}
                  <Card className="bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3">
                          <Avatar className="w-10 h-10 border border-slate-200 dark:border-zinc-800 bg-white">
                            <AvatarFallback className="bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-500 font-bold">EK</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">Eric Kwame</span>
                              <span className="text-xs text-slate-500">• 4 hours ago</span>
                            </div>
                            <p className="text-[11px] font-medium text-teal-600 dark:text-teal-400">Engineering Department</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed mb-4">
                        Does anyone have the updated documentation for the new fleet tracking API? I'm trying to integrate it with the dashboard but hitting a 403 error on the main endpoint.
                      </p>
                      <div className="flex items-center gap-4 border-t border-slate-100 dark:border-zinc-800/50 pt-3">
                        <Button variant="ghost" size="sm" className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 h-8 px-2">
                          <Heart className="w-4 h-4 mr-1.5" /> Like
                        </Button>
                        <Button variant="ghost" size="sm" className="text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 h-8 px-2">
                          <MessageSquare className="w-4 h-4 mr-1.5" /> Reply (3)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Sidebar (Spans 1/3) */}
                <div className="space-y-6">

                  {/* Lounges / Channels */}
                  <Card className="bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/50">
                      <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Hash className="w-4 h-4 text-emerald-500" /> Active Lounges
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 space-y-1">
                      <button
                        onClick={() => { setActiveLounge('General'); toast.info("Switched to #general-discussion"); }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors group ${activeLounge === 'General' ? 'bg-slate-100 dark:bg-zinc-800/80 text-slate-900 dark:text-white font-bold' : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'}`}>
                        <div className="flex items-center gap-2">
                          <Hash className={`w-4 h-4 ${activeLounge === 'General' ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-400 dark:text-zinc-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400'}`} />
                          <span className="text-sm">general-discussion</span>
                        </div>
                      </button>
                      <button
                        onClick={() => { setActiveLounge('staff'); toast.info("Switched to #staff-only"); }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors group ${activeLounge === 'staff' ? 'bg-slate-100 dark:bg-zinc-800/80 text-slate-900 dark:text-white font-bold' : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'}`}>
                        <div className="flex items-center gap-2">
                          <Shield className={`w-4 h-4 ${activeLounge === 'staff' ? 'text-amber-600 dark:text-amber-500' : 'text-amber-500/70'}`} />
                          <span className="text-sm">staff-only</span>
                        </div>
                        <Badge className="bg-emerald-500 text-white border-none h-5 px-1.5 text-[10px]">3</Badge>
                      </button>
                    </CardContent>
                  </Card>

                  {/* Online Colleagues */}
                  <Card className="bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <CardHeader className="pb-3 border-b border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/50">
                      <CardTitle className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <CircleDot className="w-4 h-4 text-emerald-500 animate-pulse" /> Online Now
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      {[
                        { name: 'Sarah Jenkins', role: 'HR Manager', color: 'emerald' },
                        { name: 'David Osei', role: 'Fleet Controller', color: 'teal' },
                        { name: 'Admin Hub', role: 'System Admin', color: 'amber' }
                      ].map((user, i) => (
                        <div key={i} className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative">
                            <Avatar className="w-8 h-8 border border-slate-200 dark:border-zinc-800 group-hover:border-slate-300 dark:group-hover:border-zinc-600 transition-colors bg-white">
                              <AvatarFallback className={`bg-${user.color}-50 dark:bg-${user.color}-500/10 text-${user.color}-600 dark:text-${user.color}-500 text-xs font-bold`}>
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700 dark:text-zinc-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors leading-tight">{user.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{user.role}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                </div>
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && currentUser && (
              <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Top Identity Header */}
                <Card className="bg-white dark:bg-zinc-900/90 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 shadow-md overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-600 to-teal-500" />
                  <CardContent className="p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                    <Avatar className="w-28 h-28 border-4 border-white dark:border-zinc-950 shadow-md bg-slate-50 dark:bg-zinc-900">
                      <AvatarFallback className="bg-emerald-50 dark:bg-gradient-to-br dark:from-emerald-500/20 dark:to-teal-500/20 text-emerald-600 dark:text-emerald-500 text-3xl font-black">
                        {currentUser.fullName?.charAt(0) || currentUser.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 text-center md:text-left space-y-2">
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{currentUser.fullName || currentUser.name}</h2>
                      <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center md:justify-start gap-2">
                        <Briefcase className="w-4 h-4" /> {currentUser.role}
                      </p>

                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4 pt-2">
                        <Badge className="bg-slate-100 dark:bg-zinc-950/50 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 px-3 py-1 font-medium shadow-sm"><Users className="w-3.5 h-3.5 mr-1.5"/> {currentUser.departmentName || currentUser.department || 'General'}</Badge>
                        <Badge className="bg-slate-100 dark:bg-zinc-950/50 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 px-3 py-1 font-medium shadow-sm"><MapPin className="w-3.5 h-3.5 mr-1.5"/> Ho, Ghana</Badge>
                        <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1 font-medium shadow-sm"><CheckCircle2 className="w-3.5 h-3.5 mr-1.5"/> Active Account</Badge>
                      </div>
                    </div>

                    <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition-all shrink-0">
                          <Pencil className="w-4 h-4 mr-2" /> Edit Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Edit Profile</DialogTitle>
                          <DialogDescription className="text-slate-500">Update your contact information and bio.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Phone Number</Label>
                            <Input
                              value={profileForm.phone}
                              onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                              className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus-visible:ring-emerald-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Bio / Status</Label>
                            <Textarea
                              placeholder="I'm currently working on..."
                              value={profileForm.bio}
                              onChange={e => setProfileForm({...profileForm, bio: e.target.value})}
                              className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus-visible:ring-emerald-500 resize-none"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsEditProfileOpen(false)} className="border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800">Cancel</Button>
                          <Button onClick={handleSaveProfile} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">Save Changes</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>

                {/* Profile Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Personal Information */}
                  <Card className="bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <CardHeader className="border-b border-slate-100 dark:border-zinc-800/50 pb-4 bg-slate-50/50 dark:bg-zinc-900/50 rounded-t-xl">
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-emerald-500" /> Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Full Name</Label>
                          <Input readOnly value={currentUser.fullName || currentUser.name} className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 font-medium h-10" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Employee ID</Label>
                          <Input readOnly value="EMP-2026X" className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-400 font-mono h-10 cursor-not-allowed" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email Address</Label>
                        <div className="relative">
                          <Input readOnly value={currentUser.email} className="pl-9 bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 font-medium h-10" />
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Phone Number</Label>
                        <div className="relative">
                          <Input readOnly value="+233 55 123 4567" className="pl-9 bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 font-medium h-10" />
                          <Smartphone className="absolute left-3 top-3 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Employment Details */}
                  <Card className="bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <CardHeader className="border-b border-slate-100 dark:border-zinc-800/50 pb-4 bg-slate-50/50 dark:bg-zinc-900/50 rounded-t-xl">
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-emerald-500" /> Employment Record
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Department</Label>
                          <Input readOnly value={currentUser.departmentName || currentUser.department || 'General'} className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 font-medium h-10" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Role</Label>
                          <Input readOnly value={currentUser.role} className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 font-medium h-10" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Hire Date</Label>
                        <div className="relative">
                          <Input readOnly value={currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Jan 1, 2026'} className="pl-9 bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 font-medium h-10" />
                          <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Direct Supervisor</Label>
                        <Input readOnly value="Institution Admin" className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-400 font-medium h-10 cursor-not-allowed" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Security & Access */}
                  <Card className="bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <CardHeader className="border-b border-slate-100 dark:border-zinc-800/50 pb-4 bg-slate-50/50 dark:bg-zinc-900/50 rounded-t-xl">
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-amber-500" /> Security & Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white dark:bg-zinc-900 rounded-md border border-slate-200 dark:border-zinc-800 shadow-sm"><Lock className="w-4 h-4 text-slate-600 dark:text-zinc-300" /></div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Password</p>
                            <p className="text-xs text-slate-500">Last changed 30 days ago</p>
                          </div>
                        </div>
                        <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800">Update</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[400px] bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 shadow-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">Update Password</DialogTitle>
                              <DialogDescription className="text-slate-500">Ensure your account remains secure.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Current Password</Label>
                                <Input type="password" placeholder="••••••••" className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus-visible:ring-amber-500" />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">New Password</Label>
                                <Input type="password" placeholder="••••••••" className="bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white focus-visible:ring-amber-500" />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)} className="border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800">Cancel</Button>
                              <Button onClick={handleSavePassword} className="bg-amber-600 hover:bg-amber-500 text-white font-bold">Update Security</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-md border border-emerald-200 dark:border-emerald-500/20 shadow-sm"><Fingerprint className="w-4 h-4 text-emerald-600 dark:text-emerald-500" /></div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Two-Factor Auth</p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-500">Secured via Authenticator</p>
                          </div>
                        </div>
                        <Switch checked={prefs.twoFactor} onCheckedChange={() => handleTogglePref('twoFactor')} className="data-[state=checked]:bg-emerald-500 bg-slate-200 dark:bg-zinc-800" />
                      </div>

                      <div className="space-y-3 pt-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Active ERP Modules</Label>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="bg-emerald-50 dark:bg-zinc-950 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-sm">Worker Hub</Badge>
                          <Badge variant="outline" className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 shadow-sm">HR Portal</Badge>
                          <Badge variant="outline" className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 shadow-sm">Communications</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notification Preferences */}
                  <Card className="bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 shadow-sm">
                    <CardHeader className="border-b border-slate-100 dark:border-zinc-800/50 pb-4 bg-slate-50/50 dark:bg-zinc-900/50 rounded-t-xl">
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Bell className="w-5 h-5 text-cyan-500" /> Notification Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Email Notifications</p>
                          <p className="text-xs text-slate-500">Receive daily summaries and alerts</p>
                        </div>
                        <Switch checked={prefs.emailNotif} onCheckedChange={() => handleTogglePref('emailNotif')} className="data-[state=checked]:bg-emerald-500 bg-slate-200 dark:bg-zinc-800" />
                      </div>
                      <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Push Notifications</p>
                          <p className="text-xs text-slate-500">Real-time alerts in your browser</p>
                        </div>
                        <Switch checked={prefs.pushNotif} onCheckedChange={() => handleTogglePref('pushNotif')} className="data-[state=checked]:bg-emerald-500 bg-slate-200 dark:bg-zinc-800" />
                      </div>
                      <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Direct Messages</p>
                          <p className="text-xs text-slate-500">Notify when colleagues message you</p>
                        </div>
                        <Switch checked={prefs.dmNotif} onCheckedChange={() => handleTogglePref('dmNotif')} className="data-[state=checked]:bg-emerald-500 bg-slate-200 dark:bg-zinc-800" />
                      </div>
                      <div className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">System Announcements</p>
                          <p className="text-xs text-slate-500">Mandatory alerts from Institution Admin</p>
                        </div>
                        <Switch defaultChecked disabled className="opacity-50 data-[state=checked]:bg-slate-400 dark:data-[state=checked]:bg-zinc-600" />
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </div>
            )}
          </main>

          {/* Right Sidebar - Admin Announcements (Backend Integration) */}
          {(activeTab === 'home' || activeTab === 'community') && (
            <aside className="w-80 shrink-0 hidden lg:block">
              <Card className="bg-white dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 shadow-sm sticky top-24 overflow-hidden">
                <CardHeader className="pb-4 bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800/50">
                  <CardTitle className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-slate-900 dark:text-white">
                    <Bell className="w-4 h-4 text-emerald-500" /> Live Broadcasts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {announcements.map(ann => (
                    <div key={ann.id} className={`p-4 bg-white dark:bg-zinc-950/80 backdrop-blur-md border-x border-t border-slate-200 dark:border-zinc-800 border-b-[3px] rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group ${ann.priority === 'HIGH' ? 'border-b-red-500 hover:shadow-[0_8px_20px_-8px_rgba(239,68,68,0.2)]' : 'border-b-emerald-500 hover:shadow-[0_8px_20px_-8px_rgba(16,185,129,0.2)]'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{ann.title}</h4>
                        {ann.priority === 'HIGH' && <Badge className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 text-[10px] h-5 px-1.5 font-bold shadow-none">URGENT</Badge>}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1.5 leading-relaxed">{ann.content}</p>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 mt-3 uppercase tracking-widest">{formatTimestamp(ann.createdAt)}</p>
                    </div>
                  ))}
                  {announcements.length === 0 && <p className="text-xs font-medium text-slate-500 text-center py-8">No live broadcasts.</p>}
                </CardContent>
              </Card>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}