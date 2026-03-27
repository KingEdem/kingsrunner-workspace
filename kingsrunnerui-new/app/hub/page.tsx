'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Send, 
  X, 
  Sparkles,
  AlertTriangle,
  Bell,
  CheckCircle2,
  MessageSquare,
  Clock,
  Home,
  Users,
  User,
  Shield,
  LogOut,
  Mail,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TIRLogo } from '@/components/tir-logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  hubPosts, 
  departments, 
  workers, 
  announcements,
  activityFeed,
  userQuickStats,
  directMessages,
  type Post, 
  type User as UserType, 
  isDevMockEnabled 
} from '@/lib/mock-data';
import { toast } from 'sonner';

type TabType = 'home' | 'community' | 'profile';
type LoungeType = 'staff' | string;

export default function WorkerHubPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [activeLounge, setActiveLounge] = useState<LoungeType>('staff');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userJson = localStorage.getItem('kingsrunner_user');
    if (!userJson) {
      router.push('/');
      return;
    }

    const user = JSON.parse(userJson);
    const fullUser = workers.find(w => w.email === user.email) || {
      id: '0',
      name: user.name || 'User',
      email: user.email,
      role: user.role || 'Worker',
      department: 'General',
      createdAt: new Date().toISOString(),
      isStaff: false
    };
    setCurrentUser(fullUser);

    if (isDevMockEnabled()) {
      setPosts(hubPosts);
    }
    setIsLoading(false);
  }, [router]);

  const handlePost = async () => {
    if (!newPost.trim() || !currentUser) return;

    const post: Post = {
      id: Date.now().toString(),
      author: currentUser,
      content: newPost,
      timestamp: new Date().toISOString(),
      lounge: activeLounge === 'staff' ? 'staff' : undefined,
      department: activeLounge !== 'staff' ? activeLounge : undefined
    };

    setPosts([post, ...posts]);
    setNewPost('');
    toast.success('Post published');
  };

  const handleLogout = () => {
    localStorage.removeItem('kingsrunner_jwt');
    localStorage.removeItem('kingsrunner_user');
    router.push('/');
  };

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPosts = activeLounge === 'staff'
    ? posts.filter(p => p.lounge === 'staff')
    : posts.filter(p => p.department === activeLounge);

  const userDepartments = currentUser 
    ? [currentUser.department, ...departments.filter(d => d.name !== currentUser.department).map(d => d.name).slice(0, 2)]
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-emerald-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <TIRLogo size="sm" />
            <span className="font-semibold text-foreground hidden sm:inline">Worker Hub</span>
          </div>
          
          {/* Center: Navigation Tabs */}
          <nav className="flex items-center gap-1">
            <Button
              variant={activeTab === 'home' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('home')}
              className={activeTab === 'home' 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                : 'text-muted-foreground hover:text-foreground'
              }
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button
              variant={activeTab === 'community' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('community')}
              className={activeTab === 'community' 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                : 'text-muted-foreground hover:text-foreground'
              }
            >
              <Users className="w-4 h-4 mr-2" />
              Community
            </Button>
            <Button
              variant={activeTab === 'profile' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('profile')}
              className={activeTab === 'profile' 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                : 'text-muted-foreground hover:text-foreground'
              }
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </nav>

          {/* Right: Theme Toggle, Avatar, Logout */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {currentUser && (
              <button 
                onClick={() => setActiveTab('profile')} 
                className="flex items-center"
                title="View Profile"
              >
                <Avatar className="w-9 h-9 bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 transition-all cursor-pointer">
                  <AvatarFallback className="text-emerald-500 text-sm">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </button>
            )}
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

      {/* Main Content with Right Sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* HOME TAB */}
            {activeTab === 'home' && (
              <div className="space-y-6">
                {/* Welcome Banner */}
                <Card className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
                  <CardContent className="pt-6">
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                      Welcome back, {currentUser?.name.split(' ')[0]}!
                    </h1>
                    <p className="text-muted-foreground">
                      Here&apos;s what&apos;s happening in your institution today.
                    </p>
                  </CardContent>
                </Card>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="hover-lift bg-card border-border">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/20">
                          <Clock className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-foreground">{userQuickStats.pendingTasks}</div>
                          <p className="text-xs text-muted-foreground">Pending Tasks</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="hover-lift bg-card border-border">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/20">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-foreground">{userQuickStats.newModuleAccess}</div>
                          <p className="text-xs text-muted-foreground">New Module Access</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="hover-lift bg-card border-border">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/20">
                          <MessageSquare className="w-5 h-5 text-cyan-500" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-foreground">{userQuickStats.unreadMessages}</div>
                          <p className="text-xs text-muted-foreground">Unread Messages</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="hover-lift bg-card border-border">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-500/20">
                          <Bell className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-foreground">{userQuickStats.upcomingDeadlines}</div>
                          <p className="text-xs text-muted-foreground">Upcoming Deadlines</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Activity Feed and Personal Inbox Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Activity Feed */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-foreground">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {activityFeed.map(activity => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                          <div className={`p-2 rounded-lg ${
                            activity.type === 'module_access' ? 'bg-emerald-500/20' :
                            activity.type === 'task' ? 'bg-amber-500/20' :
                            activity.type === 'announcement' ? 'bg-cyan-500/20' :
                            'bg-purple-500/20'
                          }`}>
                            {activity.type === 'module_access' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                            {activity.type === 'task' && <Clock className="w-4 h-4 text-amber-500" />}
                            {activity.type === 'announcement' && <Bell className="w-4 h-4 text-cyan-500" />}
                            {activity.type === 'message' && <MessageSquare className="w-4 h-4 text-purple-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm">{activity.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimestamp(activity.timestamp)}
                          </span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Personal Inbox / Direct Messages */}
                  <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-foreground flex items-center gap-2">
                        <Mail className="w-5 h-5 text-emerald-500" />
                        Personal Messages
                      </CardTitle>
                      {directMessages.filter(m => m.unread).length > 0 && (
                        <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                          {directMessages.filter(m => m.unread).length} new
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {directMessages.slice(0, 4).map(message => (
                        <div 
                          key={message.id} 
                          className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
                            message.unread 
                              ? 'bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20' 
                              : 'bg-secondary/30 hover:bg-secondary/50'
                          }`}
                        >
                          <Avatar className="w-9 h-9 bg-emerald-500/20 border border-emerald-500/30 shrink-0">
                            <AvatarFallback className="text-emerald-500 text-xs">
                              {message.sender.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground text-sm truncate">{message.sender.name}</span>
                              {message.unread && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {message.snippet}
                            </p>
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                      ))}
                      <button className="w-full flex items-center justify-center gap-2 text-sm text-emerald-500 hover:text-emerald-400 py-2 transition-colors">
                        View All Messages
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* COMMUNITY TAB */}
            {activeTab === 'community' && (
              <div className="flex gap-6">
                {/* Left Pane: Department Lounges */}
                <aside className="w-64 shrink-0">
                  <Card className="bg-card border-border sticky top-24">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-foreground text-sm">Department Lounges</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      {/* Staff Only Lounge - Pinned */}
                      <button
                        onClick={() => setActiveLounge('staff')}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                          activeLounge === 'staff'
                            ? 'bg-emerald-500/20 border border-emerald-500/30'
                            : 'hover:bg-secondary/50'
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-amber-500/20">
                          <Shield className="w-4 h-4 text-amber-500" />
                        </div>
                        <div>
                          <span className={`font-medium text-sm ${activeLounge === 'staff' ? 'text-emerald-500' : 'text-foreground'}`}>
                            Staff Only Lounge
                          </span>
                          <Badge variant="outline" className="ml-2 text-[10px] border-amber-500/30 text-amber-500">
                            Pinned
                          </Badge>
                        </div>
                      </button>

                      <div className="border-t border-border my-3" />

                      {/* User Department Lounges */}
                      {userDepartments.map(dept => (
                        <button
                          key={dept}
                          onClick={() => setActiveLounge(dept)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                            activeLounge === dept
                              ? 'bg-emerald-500/20 border border-emerald-500/30'
                              : 'hover:bg-secondary/50'
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-cyan-500/20">
                            <Users className="w-4 h-4 text-cyan-500" />
                          </div>
                          <span className={`font-medium text-sm ${activeLounge === dept ? 'text-emerald-500' : 'text-foreground'}`}>
                            {dept}
                          </span>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                </aside>

                {/* Right Pane: Chat/Feed */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">
                      {activeLounge === 'staff' ? 'Staff Only Lounge' : `${activeLounge} Lounge`}
                    </h2>
                    {activeLounge === 'staff' && (
                      <Badge variant="outline" className="border-amber-500/30 text-amber-500">
                        Staff Members Only
                      </Badge>
                    )}
                  </div>

                  {/* Post Composer */}
                  <Card className="bg-card border-border">
                    <CardContent className="pt-4">
                      <div className="flex gap-3">
                        {currentUser && (
                          <Avatar className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/30 shrink-0">
                            <AvatarFallback className="text-emerald-500">
                              {currentUser.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1 space-y-3">
                          <Textarea
                            placeholder={`Share something with ${activeLounge === 'staff' ? 'staff members' : activeLounge}...`}
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            className="bg-input border-border resize-none min-h-[80px]"
                          />
                          <div className="flex justify-end">
                            <Button
                              onClick={handlePost}
                              disabled={!newPost.trim()}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:-translate-y-0.5"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Post
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Posts Feed */}
                  <div className="space-y-4">
                    {filteredPosts.length === 0 ? (
                      <Card className="bg-card border-border">
                        <CardContent className="py-12 text-center text-muted-foreground">
                          No posts in this lounge yet. Be the first to share something!
                        </CardContent>
                      </Card>
                    ) : (
                      filteredPosts.map(post => (
                        <Card key={post.id} className="bg-card border-border hover:border-emerald-500/20 transition-all">
                          <CardContent className="pt-4">
                            <div className="flex gap-3">
                              <Avatar className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/30 shrink-0">
                                <AvatarFallback className="text-emerald-500">
                                  {post.author.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-foreground">{post.author.name}</span>
                                  <Badge className="bg-cyan-500/20 text-cyan-500 border-cyan-500/30 text-xs">
                                    {post.author.role}
                                  </Badge>
                                  {post.author.isStaff && (
                                    <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-xs">
                                      Staff
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {formatTimestamp(post.timestamp)}
                                </p>
                                <p className="mt-3 text-foreground whitespace-pre-wrap">
                                  {post.content}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && currentUser && (
              <div className="max-w-2xl space-y-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Profile Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar and Basic Info */}
                    <div className="flex items-center gap-6">
                      <Avatar className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500/30">
                        <AvatarFallback className="text-emerald-500 text-2xl">
                          {currentUser.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">{currentUser.name}</h2>
                        <p className="text-muted-foreground">{currentUser.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500/30">
                            {currentUser.role}
                          </Badge>
                          {currentUser.isStaff && (
                            <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                              Staff
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border pt-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Full Name</Label>
                          <Input value={currentUser.name} readOnly className="bg-input border-border" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Email</Label>
                          <Input value={currentUser.email} readOnly className="bg-input border-border" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Department</Label>
                          <Input value={currentUser.department} readOnly className="bg-input border-border" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground text-xs uppercase tracking-wider">Role</Label>
                          <Input value={currentUser.role} readOnly className="bg-input border-border" />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border pt-6 space-y-4">
                      <h3 className="font-medium text-foreground">Notification Preferences</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-foreground">Email Notifications</p>
                            <p className="text-xs text-muted-foreground">Receive updates via email</p>
                          </div>
                          <Switch defaultChecked className="data-[state=checked]:bg-emerald-500" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-foreground">Push Notifications</p>
                            <p className="text-xs text-muted-foreground">Receive browser notifications</p>
                          </div>
                          <Switch className="data-[state=checked]:bg-emerald-500" />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-foreground">Activity Digest</p>
                            <p className="text-xs text-muted-foreground">Weekly summary of activity</p>
                          </div>
                          <Switch defaultChecked className="data-[state=checked]:bg-emerald-500" />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button className="bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20">
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>

          {/* Right Sidebar - Admin Announcements (visible on Home and Community) */}
          {(activeTab === 'home' || activeTab === 'community') && (
            <aside className="w-80 shrink-0 hidden lg:block">
              <Card className="bg-card border-border sticky top-24">
                <CardHeader className="pb-3">
                  <CardTitle className="text-foreground text-sm flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-500" />
                    Important Admin Announcements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {announcements.map(announcement => (
                    <div 
                      key={announcement.id} 
                      className={`p-3 rounded-lg border-l-4 ${
                        announcement.priority === 'high' 
                          ? 'border-l-red-500 bg-red-500/5' 
                          : announcement.priority === 'medium'
                            ? 'border-l-amber-500 bg-amber-500/5'
                            : 'border-l-emerald-500 bg-emerald-500/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-foreground text-sm">{announcement.title}</h4>
                        {announcement.priority === 'high' && (
                          <Badge className="bg-red-500/20 text-red-500 border-red-500/30 text-[10px] shrink-0">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            High
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {announcement.content}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-2">
                        {announcement.author} - {formatTimestamp(announcement.timestamp)}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </aside>
          )}
        </div>
      </div>

      {/* Floating AI Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {chatOpen ? (
          <Card className="w-80 border-emerald-500/30 shadow-2xl shadow-emerald-500/10">
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4 bg-emerald-600 text-white rounded-t-lg">
              <span className="font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                TIR AI Analyst
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setChatOpen(false)}
                className="text-white hover:bg-white/20 w-6 h-6"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 min-h-[120px]">
              <p className="text-sm text-muted-foreground">
                Hello! I can help you analyze data, find information, or answer questions about your institution.
              </p>
            </CardContent>
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="bg-input border-border"
                />
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white shrink-0">
                  Send
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Button
            onClick={() => setChatOpen(true)}
            className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 h-14 px-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/30"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            TIR AI Analyst
          </Button>
        )}
      </div>
    </div>
  );
}
