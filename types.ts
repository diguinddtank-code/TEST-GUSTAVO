
export interface MediaItem {
  id: string;
  userId: string; // Link media to a user
  thumbnailUrl: string;
  title: string;
  date: string;
  type: 'video' | 'photo';
  category: 'Match' | 'Training' | 'Physical';
  status: 'pending' | 'approved' | 'featured';
  duration?: string;
  userFullName?: string; // For Admin view
  userAvatar?: string; // For Admin view
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
  email: string;
  role: 'admin' | 'athlete'; // Role based access control
  username: string;
  fullName: string;
  avatarUrl: string;
  position: string;
  club: string;
  bio: string;
  physical: {
    height: string;
    weight: string;
    foot: string;
    age: string;
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
