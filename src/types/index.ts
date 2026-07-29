export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO date string
  priority: TaskPriority;
  status: TaskStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  pendingCount: number;
  completedCount: number;
  inProgressCount: number;
  totalCount: number;
  progressPercentage: number;
}
