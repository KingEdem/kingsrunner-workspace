"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, UserPlus, Building2, Megaphone } from "lucide-react";
import { toast } from "sonner";

interface Worker {
  id: number;
  fullName: string;
  email: string;
  role: string;
  departmentName: string;
}

interface Department {
  id: number;
  name: string;
  description: string;
}

const MOCK_WORKERS: Worker[] = [
  { id: 1, fullName: "Sarah Chen", email: "sarah.chen@institution.edu", role: "WORKER", departmentName: "Engineering" },
  { id: 2, fullName: "Marcus Rodriguez", email: "marcus.r@institution.edu", role: "WORKER", departmentName: "Product" },
  { id: 3, fullName: "Emily Watson", email: "emily.w@institution.edu", role: "WORKER", departmentName: "Design" },
  { id: 4, fullName: "James O'Brien", email: "james.o@institution.edu", role: "WORKER", departmentName: "Engineering" },
  { id: 5, fullName: "Priya Patel", email: "priya.p@institution.edu", role: "WORKER", departmentName: "Analytics" },
];

const MOCK_DEPARTMENTS: Department[] = [
  { id: 1, name: "Engineering", description: "Software development and technical operations" },
  { id: 2, name: "Product", description: "Product management and strategy" },
  { id: 3, name: "Design", description: "UI/UX and creative design" },
  { id: 4, name: "Analytics", description: "Data analysis and business intelligence" },
  { id: 5, name: "Marketing", description: "Marketing and communications" },
];

export default function InstitutionAdmin() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHiring, setIsHiring] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hire Worker Form
  const [hireDialogOpen, setHireDialogOpen] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState("");
  const [newWorkerEmail, setNewWorkerEmail] = useState("");
  const [newWorkerDepartment, setNewWorkerDepartment] = useState("");

  // Announcement Form
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementHighPriority, setAnnouncementHighPriority] = useState(false);

  const isDevMock = typeof window !== "undefined" && localStorage.getItem("kingsrunner_dev_mock") === "true";

  useEffect(() => {
    fetchWorkers();
    fetchDepartments();
  }, []);

  const fetchWorkers = async () => {
    if (isDevMock) {
      setTimeout(() => {
        setWorkers(MOCK_WORKERS);
        setIsLoading(false);
      }, 300);
      return;
    }

    try {
      const jwt = localStorage.getItem("kingsrunner_jwt");
      const response = await fetch("http://localhost:8080/api/tenant/workers", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!response.ok) throw new Error("Failed to fetch workers");
      const data = await response.json();
      setWorkers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    if (isDevMock) {
      setTimeout(() => setDepartments(MOCK_DEPARTMENTS), 300);
      return;
    }

    try {
      const jwt = localStorage.getItem("kingsrunner_jwt");
      const response = await fetch("http://localhost:8080/api/tenant/departments", {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!response.ok) throw new Error("Failed to fetch departments");
      const data = await response.json();
      setDepartments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleHireWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsHiring(true);

    if (isDevMock) {
      setTimeout(() => {
        const newWorker: Worker = {
          id: Date.now(),
          fullName: newWorkerName,
          email: newWorkerEmail,
          role: "WORKER",
          departmentName: newWorkerDepartment,
        };
        setWorkers([...workers, newWorker]);
        setHireDialogOpen(false);
        setNewWorkerName("");
        setNewWorkerEmail("");
        setNewWorkerDepartment("");
        setIsHiring(false);
        toast.success("Worker hired successfully", {
          description: `${newWorkerName} has been added to ${newWorkerDepartment}`,
        });
      }, 500);
      return;
    }

    try {
      const jwt = localStorage.getItem("kingsrunner_jwt");
      const response = await fetch("http://localhost:8080/api/tenant/workers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          fullName: newWorkerName,
          email: newWorkerEmail,
          departmentName: newWorkerDepartment,
        }),
      });
      if (!response.ok) throw new Error("Failed to hire worker");
      await fetchWorkers();
      setHireDialogOpen(false);
      setNewWorkerName("");
      setNewWorkerEmail("");
      setNewWorkerDepartment("");
      toast.success("Worker hired successfully", {
        description: `${newWorkerName} has been added to the team`,
      });
    } catch (err) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Failed to hire worker",
      });
    } finally {
      setIsHiring(false);
    }
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);

    if (isDevMock) {
      setTimeout(() => {
        setAnnouncementTitle("");
        setAnnouncementContent("");
        setAnnouncementHighPriority(false);
        setIsPublishing(false);
        toast.success("Announcement published", {
          description: "Your announcement has been shared with the team",
        });
      }, 500);
      return;
    }

    try {
      const jwt = localStorage.getItem("kingsrunner_jwt");
      const response = await fetch("http://localhost:8080/api/tenant/workspace/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          title: announcementTitle,
          content: announcementContent,
          priority: announcementHighPriority ? "HIGH" : "MEDIUM",
        }),
      });
      if (!response.ok) throw new Error("Failed to publish announcement");
      setAnnouncementTitle("");
      setAnnouncementContent("");
      setAnnouncementHighPriority(false);
      toast.success("Announcement published", {
        description: "Your announcement has been shared with the team",
      });
    } catch (err) {
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Failed to publish announcement",
      });
    } finally {
      setIsPublishing(false);
    }
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
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-50 mb-2">Institution Admin</h1>
          <p className="text-zinc-400">Manage your organization and communications</p>
        </header>

        <Tabs defaultValue="organization" className="space-y-6">
          <TabsList className="bg-zinc-900/50 border border-zinc-800">
            <TabsTrigger value="organization" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <Building2 className="w-4 h-4 mr-2" />
              Organization
            </TabsTrigger>
            <TabsTrigger value="communications" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              <Megaphone className="w-4 h-4 mr-2" />
              Communications
            </TabsTrigger>
          </TabsList>

          {/* Organization Tab */}
          <TabsContent value="organization" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Workers Table */}
              <Card className="bg-zinc-900/50 border-zinc-800 lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-zinc-50">Workers</CardTitle>
                      <CardDescription className="text-zinc-400">Manage your team members</CardDescription>
                    </div>
                    <Dialog open={hireDialogOpen} onOpenChange={setHireDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-emerald-600 hover:bg-emerald-500">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Hire Worker
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-zinc-900 border-zinc-800">
                        <form onSubmit={handleHireWorker}>
                          <DialogHeader>
                            <DialogTitle className="text-zinc-50">Hire New Worker</DialogTitle>
                            <DialogDescription className="text-zinc-400">Add a new team member to your institution</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="name" className="text-zinc-300">Full Name</Label>
                              <Input
                                id="name"
                                placeholder="Jane Doe"
                                value={newWorkerName}
                                onChange={(e) => setNewWorkerName(e.target.value)}
                                className="bg-zinc-950/50 border-zinc-800 text-zinc-100 focus-visible:ring-emerald-500"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email" className="text-zinc-300">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="jane.doe@institution.edu"
                                value={newWorkerEmail}
                                onChange={(e) => setNewWorkerEmail(e.target.value)}
                                className="bg-zinc-950/50 border-zinc-800 text-zinc-100 focus-visible:ring-emerald-500"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="department" className="text-zinc-300">Department</Label>
                              <Input
                                id="department"
                                placeholder="Engineering"
                                value={newWorkerDepartment}
                                onChange={(e) => setNewWorkerDepartment(e.target.value)}
                                className="bg-zinc-950/50 border-zinc-800 text-zinc-100 focus-visible:ring-emerald-500"
                                required
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500" disabled={isHiring}>
                              {isHiring ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                              Hire Worker
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                    </div>
                  ) : (
                    <div className="rounded-md border border-zinc-800">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                            <TableHead className="text-zinc-400">Name</TableHead>
                            <TableHead className="text-zinc-400">Email</TableHead>
                            <TableHead className="text-zinc-400">Role</TableHead>
                            <TableHead className="text-zinc-400">Department</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {workers.map((worker) => (
                            <TableRow key={worker.id} className="border-zinc-800 hover:bg-zinc-800/50">
                              <TableCell className="text-zinc-100 font-medium">{worker.fullName}</TableCell>
                              <TableCell className="text-zinc-400">{worker.email}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-emerald-600/20 text-emerald-400 border-emerald-600/50">
                                  {worker.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-zinc-400">{worker.departmentName}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Departments List */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-zinc-50">Departments</CardTitle>
                  <CardDescription className="text-zinc-400">Active departments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {departments.map((dept) => (
                      <Card key={dept.id} className="bg-zinc-950/50 border-zinc-800/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm text-zinc-100">{dept.name}</CardTitle>
                          <CardDescription className="text-xs text-zinc-400">{dept.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications">
            <Card className="bg-zinc-900/50 border-zinc-800 max-w-2xl">
              <CardHeader>
                <CardTitle className="text-zinc-50">Publish Announcement</CardTitle>
                <CardDescription className="text-zinc-400">Share important updates with your team</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePublishAnnouncement} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="announcement-title" className="text-zinc-300">Title</Label>
                    <Input
                      id="announcement-title"
                      placeholder="System Update"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      className="bg-zinc-950/50 border-zinc-800 text-zinc-100 focus-visible:ring-emerald-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="announcement-content" className="text-zinc-300">Content</Label>
                    <textarea
                      id="announcement-content"
                      placeholder="Describe the announcement..."
                      value={announcementContent}
                      onChange={(e) => setAnnouncementContent(e.target.value)}
                      className="w-full min-h-[120px] rounded-md bg-zinc-950/50 border border-zinc-800 text-zinc-100 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="high-priority"
                      checked={announcementHighPriority}
                      onCheckedChange={(checked) => setAnnouncementHighPriority(checked as boolean)}
                      className="border-zinc-700 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <Label htmlFor="high-priority" className="text-zinc-300 cursor-pointer">
                      Mark as High Priority
                    </Label>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500"
                    disabled={isPublishing}
                  >
                    {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Publish Announcement
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
