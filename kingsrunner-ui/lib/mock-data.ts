// Mock Data for The Institution Runner ERP System

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar?: string;
  createdAt: string;
  isStaff?: boolean;
}

export interface Department {
  id: string;
  name: string;
  workerCount: number;
}

export interface ERPModule {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'locked' | 'pending';
  icon: string;
  roles: string[];
}

export interface Post {
  id: string;
  author: User;
  content: string;
  timestamp: string;
  department?: string;
  lounge?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  author: string;
}

export interface ActivityItem {
  id: string;
  type: 'module_access' | 'task' | 'announcement' | 'message';
  title: string;
  description: string;
  timestamp: string;
}

export interface PendingRequest {
  id: number;
  institution: string;
  module: string;
  date: string;
}

export interface Institution {
  id: string;
  name: string;
  workers: number;
  departments: number;
  admins: number;
  activeModules: number;
}

// ERP Modules with their associated roles
export const erpModules: ERPModule[] = [
  {
    id: 'financial',
    name: 'Financial Management',
    description: 'Accounting, payroll, budgeting, and financial reporting.',
    status: 'locked',
    icon: 'lock',
    roles: ['Accountant', 'Financial Analyst', 'Payroll Manager', 'Budget Controller']
  },
  {
    id: 'hr',
    name: 'Human Resources',
    description: 'Employee records, onboarding, leave management, and payroll.',
    status: 'active',
    icon: 'users',
    roles: ['HR Director', 'HR Specialist', 'Recruiter', 'Benefits Administrator']
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain',
    description: 'Inventory, procurement, vendor management, and logistics.',
    status: 'pending',
    icon: 'truck',
    roles: ['Logistics Manager', 'Procurement Officer', 'Inventory Specialist', 'Vendor Coordinator']
  },
  {
    id: 'crm',
    name: 'CRM',
    description: 'Customer, student, or patient relationship management.',
    status: 'active',
    icon: 'heart',
    roles: ['CRM Analyst', 'Customer Success Manager', 'Account Manager', 'Support Specialist']
  },
  {
    id: 'operations',
    name: 'Operations',
    description: 'Project management, task tracking, and facility operations.',
    status: 'locked',
    icon: 'building',
    roles: ['Operations Manager', 'Facilities Manager', 'Project Coordinator', 'Task Supervisor']
  }
];

// Get available roles based on active modules
export function getAvailableRoles(modules: ERPModule[]): string[] {
  return modules
    .filter(m => m.status === 'active')
    .flatMap(m => m.roles);
}

// Departments
export const departments: Department[] = [
  { id: 'cs', name: 'Computer Science', workerCount: 12 },
  { id: 'math', name: 'Mathematics', workerCount: 8 },
  { id: 'cardio', name: 'Cardiology', workerCount: 15 },
  { id: 'admin', name: 'Administration', workerCount: 5 },
  { id: 'finance', name: 'Finance', workerCount: 10 }
];

// Workers
export const workers: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@greenfield.edu',
    role: 'HR Director',
    department: 'Computer Science',
    createdAt: '2025-11-15',
    isStaff: true
  },
  {
    id: '2',
    name: 'Bob Williams',
    email: 'bob@greenfield.edu',
    role: 'CRM Analyst',
    department: 'Mathematics',
    createdAt: '2025-12-01',
    isStaff: false
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol@greenfield.edu',
    role: 'HR Specialist',
    department: 'Cardiology',
    createdAt: '2026-01-10',
    isStaff: true
  },
  {
    id: '4',
    name: 'David Chen',
    email: 'david@greenfield.edu',
    role: 'Customer Success Manager',
    department: 'Administration',
    createdAt: '2026-02-20',
    isStaff: false
  }
];

// Admin Announcements
export const announcements: Announcement[] = [
  {
    id: '1',
    title: 'System Maintenance Scheduled',
    content: 'The platform will undergo scheduled maintenance on March 30th from 2:00 AM to 4:00 AM EST. Please save your work beforehand.',
    priority: 'high',
    timestamp: '2026-03-26T08:00:00Z',
    author: 'System Admin'
  },
  {
    id: '2',
    title: 'New CRM Features Released',
    content: 'We have released new customer tracking features in the CRM module. Check out the documentation for details.',
    priority: 'medium',
    timestamp: '2026-03-25T14:30:00Z',
    author: 'Product Team'
  },
  {
    id: '3',
    title: 'Quarterly Review Deadline',
    content: 'All quarterly performance reviews must be submitted by April 5th.',
    priority: 'medium',
    timestamp: '2026-03-24T10:00:00Z',
    author: 'HR Department'
  }
];

// Activity Feed
export const activityFeed: ActivityItem[] = [
  {
    id: '1',
    type: 'module_access',
    title: 'CRM Module Access Granted',
    description: 'You now have access to the CRM module.',
    timestamp: '2026-03-26T09:00:00Z'
  },
  {
    id: '2',
    type: 'task',
    title: 'Task Assigned: Review Q1 Reports',
    description: 'Carol Davis assigned you a new task.',
    timestamp: '2026-03-25T16:30:00Z'
  },
  {
    id: '3',
    type: 'announcement',
    title: 'New Policy Update',
    description: 'Remote work policy has been updated.',
    timestamp: '2026-03-25T11:00:00Z'
  },
  {
    id: '4',
    type: 'message',
    title: 'New Message from HR',
    description: 'Bob Williams mentioned you in a discussion.',
    timestamp: '2026-03-24T14:00:00Z'
  }
];

// Hub Posts
export const hubPosts: Post[] = [
  {
    id: '1',
    author: workers[0],
    content: 'Welcome to the new Worker Hub! Feel free to share updates and connect with colleagues.',
    timestamp: '2026-03-25T10:30:00Z',
    lounge: 'staff'
  },
  {
    id: '2',
    author: workers[1],
    content: 'Just finished the quarterly CRM analysis. Results are looking great!',
    timestamp: '2026-03-25T14:15:00Z',
    department: 'Mathematics'
  },
  {
    id: '3',
    author: workers[2],
    content: 'Reminder: All leave requests for April need to be submitted by end of this week.',
    timestamp: '2026-03-26T09:00:00Z',
    lounge: 'staff'
  },
  {
    id: '4',
    author: workers[3],
    content: 'Anyone interested in joining the new wellness program? Sign-ups are open!',
    timestamp: '2026-03-26T10:30:00Z',
    department: 'Administration'
  }
];

// User quick stats
export const userQuickStats = {
  pendingTasks: 2,
  newModuleAccess: 1,
  unreadMessages: 3,
  upcomingDeadlines: 1
};

// Direct Messages Interface
export interface DirectMessage {
  id: string;
  sender: User;
  snippet: string;
  timestamp: string;
  unread: boolean;
}

// Direct Messages Data
export const directMessages: DirectMessage[] = [
  {
    id: '1',
    sender: workers[2],
    snippet: 'Hey, can you review the leave request I submitted yesterday?',
    timestamp: '2026-03-26T10:15:00Z',
    unread: true
  },
  {
    id: '2',
    sender: workers[1],
    snippet: 'The Q1 CRM report is ready for your review. Let me know if you need...',
    timestamp: '2026-03-26T09:30:00Z',
    unread: true
  },
  {
    id: '3',
    sender: workers[3],
    snippet: 'Thanks for approving my access request! Really appreciate it.',
    timestamp: '2026-03-25T16:45:00Z',
    unread: false
  },
  {
    id: '4',
    sender: workers[0],
    snippet: 'Meeting notes from today are attached. Please review before tomorrow.',
    timestamp: '2026-03-25T14:20:00Z',
    unread: false
  }
];

// Pending module requests for Super Admin
export const pendingRequests: PendingRequest[] = [
  { id: 1, institution: 'Kingsrunner Global', module: 'OPERATIONS', date: '2026-03-05' },
  { id: 2, institution: 'Kingsrunner Global', module: 'FINANCIAL_MANAGEMENT', date: '2026-03-07' },
  { id: 3, institution: 'Greenfield University', module: 'SUPPLY_CHAIN', date: '2026-03-10' }
];

// Institutions for Super Admin
export const institutions: Institution[] = [
  { id: '1', name: 'Kingsrunner Global', workers: 45, departments: 8, admins: 3, activeModules: 2 },
  { id: '2', name: 'Greenfield University', workers: 120, departments: 12, admins: 5, activeModules: 3 },
  { id: '3', name: 'Metro Health Systems', workers: 230, departments: 15, admins: 8, activeModules: 4 }
];

// Module configuration defaults
export const moduleConfig = {
  defaultWorkingHours: 40,
  leavePolicy: 'Standard (20 days/yr)',
  payrollCycle: 'Monthly',
  probationPeriod: 3
};

// Usage metrics
export const usageMetrics = {
  activeUsers: 12,
  storageUsed: '450 MB',
  lastSync: '10m ago',
  uptime: '99.8%'
};

// Helper to check if using mock data
export function isDevMockEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem('kingsrunner_dev_mock') === 'true';
}

// Helper to get JWT token
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('kingsrunner_jwt');
}

// API fetch helper with auth
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  return fetch(`http://localhost:8080/api${endpoint}`, {
    ...options,
    headers
  });
}
