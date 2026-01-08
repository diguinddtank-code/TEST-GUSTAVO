export interface MediaItem {
  id: string;
  thumbnailUrl: string;
  title: string;
  date: string;
  type: 'video' | 'photo';
  category: 'Match' | 'Training' | 'Physical';
  status: 'pending' | 'approved' | 'featured';
  duration?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'high' | 'normal';
}

export interface UserProfile {
  id: string;
  email: string; // Added email for auth
  username: string;
  fullName: string;
  avatarUrl: string; // Can be empty initially
  position: string;
  club: string;
  bio: string;
  physical: {
    height: string;
    weight: string;
    foot: string;
    age: string; // Changed to string for easier input handling
  };
  stats: {
    matches: number;
    goals: number;
    assists: number;
  };
}

export interface Notification {
  id: string;
  from: string;
  message: string;
  time: string;
  read: boolean;
  type: 'feedback' | 'system';
}