// File: kingsrunner-ui/app/hub/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Send, X, Sparkles, AlertTriangle, Bell, CheckCircle2, MessageSquare, Clock, Home, Users, User, Shield, LogOut, Mail, ArrowRight, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TIRLogo } from "@/components/tir-logo";
import { ThemeToggle } from "@/components/theme-toggle";

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
const activityFeed = [
  { id: 1, type: "module_access", title: "Access Granted", description: "You now have access to HR Module", timestamp: new Date().toISOString() },
  { id: 2, type: "task", title: "New Task Assigned", description: "Review Q3 System Logs", timestamp: new Date(Date.now() - 3600000).toISOString() }
];

type TabType = 'home' | 'community' | 'profile';
type LoungeType = 'staff' | 'General';

export default function WorkerHubPage() {
  const router = useRouter();

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [activeLounge, setActiveLounge] = useState<LoungeType>('General');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  // --- BACKEND STATE ---
  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [feed, setFeed] = useState<BackendPost[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newPost, setNewPost] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDevMock = typeof window !== "undefined" && localStorage.getItem("kingsrunner_dev_mock") === "true";

  // --- DATA FETCHING (Preserved from original logic) ---
  useEffect(() => {
    fetchColleagues();
    fetchFeed();
    fetchAnnouncements();
  }, []);

  const fetchColleagues = async () => {
    if (isDevMock) return; // Skip in mock mode to let UI handle it
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
    if (isDevMock) return;
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TIRLogo size="sm" />
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent hidden sm:inline">Worker Hub</span>
          </div>

          <nav className="flex items-center gap-1">
            <Button variant={activeTab === 'home' ? 'default' : 'ghost'} onClick={() => setActiveTab('home')}
              className={activeTab === 'home' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'text-muted-foreground'}>
              <Home className="w-4 h-4 mr-2" /> Home
            </Button>
            <Button variant={activeTab === 'community' ? 'default' : 'ghost'} onClick={() => setActiveTab('community')}
              className={activeTab === 'community' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'text-muted-foreground'}>
              <Users className="w-4 h-4 mr-2" /> Community
            </Button>
            <Button variant={activeTab === 'profile' ? 'default' : 'ghost'} onClick={() => setActiveTab('profile')}
              className={activeTab === 'profile' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'text-muted-foreground'}>
              <User className="w-4 h-4 mr-2" /> Profile
            </Button>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Content Area */}
          <main className="flex-1 min-w-0">

            {/* HOME TAB */}
            {activeTab === 'home' && (
              <div className="space-y-6">
                <Card className="bg-gradient-to-r from-emerald-600/10 to-emerald-400/5 border-emerald-500/20 shadow-sm">
                  <CardContent className="pt-6">
                    <h1 className="text-2xl font-bold mb-2">Welcome to your Workspace</h1>
                    <p className="text-muted-foreground">Here is what is happening in your institution today.</p>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Amber Card - Pending Tasks */}
                  <Card className="bg-amber-50/50 dark:bg-card border-amber-100 dark:border-border hover:border-amber-500/30 transition-all hover:-translate-y-1">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-500"><Clock className="w-5 h-5" /></div>
                      <div><div className="text-2xl font-bold text-amber-600">{userQuickStats.pendingTasks}</div><p className="text-xs text-muted-foreground">Pending Tasks</p></div>
                    </CardContent>
                  </Card>

                  {/* Emerald Card - New Access */}
                  <Card className="bg-emerald-50/50 dark:bg-card border-emerald-100 dark:border-border hover:border-emerald-500/30 transition-all hover:-translate-y-1">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-500"><CheckCircle2 className="w-5 h-5" /></div>
                      <div><div className="text-2xl font-bold text-emerald-600">{userQuickStats.newModuleAccess}</div><p className="text-xs text-muted-foreground">New Access</p></div>
                    </CardContent>
                  </Card>

                  {/* Cyan Card - Unread Messages */}
                  <Card className="bg-cyan-50/50 dark:bg-card border-cyan-100 dark:border-border hover:border-cyan-500/30 transition-all hover:-translate-y-1">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-500"><MessageSquare className="w-5 h-5" /></div>
                      <div><div className="text-2xl font-bold text-cyan-600">{userQuickStats.unreadMessages}</div><p className="text-xs text-muted-foreground">Unread Msgs</p></div>
                    </CardContent>
                  </Card>

                  {/* Red Card - Deadlines */}
                  <Card className="bg-red-50/50 dark:bg-card border-red-100 dark:border-border hover:border-red-500/30 transition-all hover:-translate-y-1">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-500/20 text-red-600 dark:text-red-500"><Bell className="w-5 h-5" /></div>
                      <div><div className="text-2xl font-bold text-red-600">{userQuickStats.upcomingDeadlines}</div><p className="text-xs text-muted-foreground">Deadlines</p></div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Activity Feed */}
                  <Card className="bg-card border-border">
                    <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {activityFeed.map(act => (
                        <div key={act.id} className="flex gap-3 p-3 rounded-lg bg-secondary/30">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">{act.title}</p>
                            <p className="text-xs text-muted-foreground">{act.description}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Team Directory (Mapped from backend) */}
                  <Card className="bg-card border-border">
                    <CardHeader><CardTitle>Active Colleagues</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {colleagues.slice(0, 5).map(col => (
                        <div key={col.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-emerald-500/10 transition-colors">
                          <Avatar className="w-8 h-8 bg-emerald-500/20 text-emerald-600 text-xs">
                            <AvatarFallback>{getInitials(col.fullName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{col.fullName}</p>
                            <p className="text-xs text-muted-foreground">{col.role}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* COMMUNITY TAB (Backend Feed Integration) */}
            {activeTab === 'community' && (
              <div className="flex gap-6">
                <aside className="w-64 shrink-0 hidden md:block">
                  <Card className="bg-card border-border sticky top-24">
                    <CardHeader className="pb-3"><CardTitle className="text-sm">Lounges</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      <button onClick={() => setActiveLounge('General')} className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${activeLounge === 'General' ? 'bg-emerald-500/20 text-emerald-600' : 'hover:bg-secondary'}`}>
                        <Users className="w-4 h-4" /> <span className="text-sm font-medium">General Hub</span>
                      </button>
                    </CardContent>
                  </Card>
                </aside>

                <div className="flex-1 space-y-4">
                  <Card className="bg-card border-border">
                    <CardContent className="pt-4 flex gap-3">
                      <Avatar className="w-10 h-10 bg-emerald-500/20 shrink-0"><AvatarFallback>ME</AvatarFallback></Avatar>
                      <div className="flex-1 space-y-3">
                        <Textarea
                          placeholder="Share an update with the team..."
                          value={newPost} onChange={(e) => setNewPost(e.target.value)}
                          className="bg-zinc-50 dark:bg-zinc-900 border-border focus-visible:ring-emerald-500"
                          disabled={isPosting}
                        />
                        <div className="flex justify-end">
                          <Button onClick={handleCreatePost} disabled={!newPost.trim() || isPosting} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                            {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                            Post
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    {feed.map(post => (
                      <Card key={post.id} className="bg-card border-border hover:border-emerald-500/30 transition-all">
                        <CardContent className="pt-4 flex gap-3">
                          <Avatar className="w-10 h-10 bg-emerald-500/20 shrink-0">
                            <AvatarFallback className="text-emerald-600">{getInitials(post.authorName)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-emerald-700 dark:text-emerald-400">{post.authorName}</span>
                              <span className="text-xs text-muted-foreground">• {formatTimestamp(post.createdAt)}</span>
                            </div>
                            <p className="mt-2 text-foreground whitespace-pre-wrap">{post.content}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <Card className="max-w-2xl mx-auto border-border">
                <CardHeader><CardTitle>Profile Settings</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>Theme Preference</Label>
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-secondary/20">
                      <span>Toggle Dark/Light Mode</span>
                      <ThemeToggle />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </main>

          {/* Right Sidebar - Admin Announcements (Backend Integration) */}
          {(activeTab === 'home' || activeTab === 'community') && (
            <aside className="w-80 shrink-0 hidden lg:block">
              <Card className="bg-card border-border sticky top-24">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-emerald-600">
                    <Bell className="w-4 h-4" /> Announcements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {announcements.map(ann => (
                    <div key={ann.id} className={`p-3 rounded-lg border-l-4 ${ann.priority === 'HIGH' ? 'border-l-red-500 bg-red-500/5' : 'border-l-emerald-500 bg-emerald-500/5'}`}>
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{ann.title}</h4>
                        {ann.priority === 'HIGH' && <Badge variant="destructive" className="text-[10px] h-4 px-1">High</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{ann.content}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">{formatTimestamp(ann.createdAt)}</p>
                    </div>
                  ))}
                  {announcements.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No new announcements</p>}
                </CardContent>
              </Card>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
