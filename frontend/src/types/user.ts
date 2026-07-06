export interface NotificationPrefs {
  taskAssigned: boolean;
  comments: boolean;
  mentions: boolean;
  deadlines: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  avatarColor: string;
  bio: string;
  role: "owner" | "admin" | "manager" | "member" | "guest";
  jobTitle: string;
  teamSize: string;
  timezone: string;
  onboarded: boolean;
  notificationPrefs: NotificationPrefs;
  createdAt: string;
}
