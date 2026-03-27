"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Users, Megaphone } from "lucide-react";

interface Colleague {
  id: number;
  fullName: string;
  role: string;
}

interface Post {
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

const MOCK_COLLEAGUES: Colleague[] = [
  { id: 1, fullName: "Sarah Chen", role: "Senior Developer" },
  { id: 2, fullName: "Marcus Rodriguez", role: "Product Manager" },
  { id: 3, fullName: "Emily Watson", role: "UI/UX Designer" },
  { id: 4, fullName: "James O'Brien", role: "Backend Engineer" },
  { id: 5, fullName: "Priya Patel", role: "Data Analyst" },
  { id: 6, fullName: "Alex Kim", role: "DevOps Engineer" },
];

const MOCK_FEED: Post[] = [
  {
    id: 1,
    authorName: "Sarah Chen",
    content: "Just wrapped up the authentication module! Ready for code review. 🚀",
    createdAt: "2026-03-26T10:30:00Z",
  },
  {
    id: 2,
    authorName: "Marcus Rodriguez",
    content: "Great meeting today, team. Let's crush those sprint goals!",
    createdAt: "2026-03-26T09:15:00Z",
  },
  {
    id: 3,
    authorName: "Emily Watson",
    content: "New design mockups are in Figma. Check them out and leave feedback!",
    createdAt: "2026-03-25T16:45:00Z",
  },
];

const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    title: "System Maintenance",
    content: "Scheduled maintenance window this Saturday 2-4 AM EST.",
    priority: "HIGH",
    createdAt: "2026-03-26T08:00:00Z",
  },
  {
    id: 2,
    title: "New Feature Release",
    content: "Dark mode is now available across all platforms!",
    priority: "MEDIUM",
    createdAt: "2026-03-25T14:30:00Z",
  },
  {
    id: 3,
    title: "Team Social Event",
    content: "Join us for happy hour this Friday at 5 PM in the lounge.",
    priority: "LOW",
    createdAt: "2026-03-24T11:00:00Z",
  },
];

export default function WorkerHub() {
  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [feed, setFeed] = useState<Post[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newPost, setNewPost] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDevMock = typeof window !== "undefined" && localStorage.getItem("kingsrunner_dev_mock") === "true";

  useEffect(() => {
    fetchColleagues();
    fetchFeed();
    fetchAnnouncements();
  }, []);

  const fetchColleagues = async () => {
    if (isDevMock) {
      setTimeout(() => {
        setColleagues(MOCK_COLLEAGUES);
        setIsLoading(false);
      }, 300);
      return;
    }

    try {
      const jwt = localStorage.getItem("kingsrunner_jwt");
      const response = await fetch("http://localhost:8080/api/tenant/workspace/directory", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!response.ok) throw new Error("Failed to fetch colleagues");
      const data = await response.json();
      setColleagues(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeed = async () => {
    if (isDevMock) {
      setTimeout(() => setFeed(MOCK_FEED), 300);
      return;
    }

    try {
      const jwt = localStorage.getItem("kingsrunner_jwt");
      const response = await fetch("http://localhost:8080/api/tenant/feed", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!response.ok) throw new Error("Failed to fetch feed");
      const data = await response.json();
      setFeed(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const fetchAnnouncements = async () => {
    if (isDevMock) {
      setTimeout(() => setAnnouncements(MOCK_ANNOUNCEMENTS), 300);
      return;
    }

    try {
      const jwt = localStorage.getItem("kingsrunner_jwt");
      const response = await fetch("http://localhost:8080/api/tenant/workspace/announcements", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!response.ok) throw new Error("Failed to fetch announcements");
      const data = await response.json();
      setAnnouncements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setIsPosting(true);

    if (isDevMock) {
      setTimeout(() => {
        const mockPost: Post = {
          id: Date.now(),
          authorName: "You",
          content: newPost,
          createdAt: new Date().toISOString(),
        };
        setFeed([mockPost, ...feed]);
        setNewPost("");
        setIsPosting(false);
      }, 500);
      return;
    }

    try {
      const jwt = localStorage.getItem("kingsrunner_jwt");
      const response = await fetch("http://localhost:8080/api/tenant/feed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-300">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Worker Hub</h1>
          <p className="text-muted-foreground">Your workspace. Your team. Your updates.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Colleagues */}
          <Card className="glass-card p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
                Colleagues
              </CardTitle>
              <CardDescription className="text-muted-foreground">Team directory</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-700 dark:text-emerald-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  {colleagues.map((colleague) => (
                    <div key={colleague.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-100/50 dark:hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-emerald-200 dark:hover:border-zinc-700">
                      <Avatar className="bg-emerald-700 dark:bg-emerald-600 text-white">
                        <AvatarFallback className="bg-emerald-700 dark:bg-emerald-600 text-white text-xs">
                          {getInitials(colleague.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{colleague.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{colleague.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Middle Column: Social Feed */}
          <Card className="glass-card p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-foreground">Social Feed</CardTitle>
              <CardDescription className="text-muted-foreground">What's happening</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <form onSubmit={handleCreatePost} className="flex gap-3">
                <Input
                  placeholder="Share an update..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="bg-zinc-100 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus-visible:ring-emerald-500"
                  disabled={isPosting}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
                  disabled={isPosting || !newPost.trim()}
                >
                  {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>

              <div className="space-y-4 max-h-[600px] overflow-y-auto terminal-scrollbar">
                {feed.map((post) => (
                  <Card key={post.id} className="bg-emerald-50 dark:bg-zinc-950/50 border-emerald-200 dark:border-zinc-800/50 p-4">
                    <CardContent className="p-0">
                      <div className="flex items-start gap-3">
                        <Avatar className="bg-emerald-700 dark:bg-emerald-600 text-white">
                          <AvatarFallback className="bg-emerald-700 dark:bg-emerald-600 text-white text-xs">
                            {getInitials(post.authorName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-foreground">{post.authorName}</p>
                            <span className="text-xs text-muted-foreground">·</span>
                            <p className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</p>
                          </div>
                          <p className="text-sm text-foreground">{post.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Announcements */}
          <Card className="glass-card p-6">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-foreground flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-emerald-700 dark:text-emerald-500" />
                Announcements
              </CardTitle>
              <CardDescription className="text-muted-foreground">Important updates</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              {announcements.map((announcement) => (
                <Card key={announcement.id} className="bg-emerald-50 dark:bg-zinc-950/50 border-emerald-200 dark:border-zinc-800/50 p-4">
                  <CardHeader className="p-0 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm text-foreground">{announcement.title}</CardTitle>
                      <Badge
                        variant={announcement.priority === "HIGH" ? "destructive" : "outline"}
                        className={
                          announcement.priority === "HIGH"
                            ? "bg-red-600/20 text-red-400 border-red-600/50"
                            : announcement.priority === "MEDIUM"
                            ? "bg-yellow-600/20 text-yellow-400 border-yellow-600/50"
                            : "bg-zinc-700/50 text-zinc-400 border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700"
                        }
                      >
                        {announcement.priority}
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">{formatDate(announcement.createdAt)}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <p className="text-xs text-foreground">{announcement.content}</p>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
