
export interface MediaItem {
  id: string;
  userId: string;
  thumbnailUrl: string;
  title: string;
  date: string; // ISO string preferred for sorting
  type: 'video' | 'photo';
  category: 'Match' | 'Training' | 'Physical' | 'Tactical';
  status: 'pending' | 'approved' | 'rejected' | 'featured';
  duration?: string;
  
  // New Fields for SaaS Value
  coachRating?: number; // 0-10
  coachFeedback?: string;
  views?: number;

  // Social Fields
  authorName?: string;
  authorAvatar?: string;
  likes?: string[]; // Array of User IDs
  commentsCount?: number;
}

export interface Comment {
    id: string;
    mediaId: string;
    userId: string;
    text: string;
    createdAt: string;
    authorName: string;
    authorAvatar: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'high' | 'normal';
}

export interface MatchEvent {
  id: string;
  userId: string;
  opponent: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  type: 'League' | 'Friendly' | 'Cup' | 'Training';
  status: 'scheduled' | 'completed';
  homeOrAway: 'Home' | 'Away';
  result?: string; // e.g. "2-1"
  userStats?: {
      minutes: number;
      goals: number;
      assists: number;
      rating: number; // 0-10
  }
}

export interface Award {
    id: string;
    userId: string;
    title: string;
    date: string;
    issuer: string;
    icon: 'trophy' | 'medal' | 'star';
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'athlete';
  username: string;
  fullName: string;
  avatarUrl: string;
  position: string;
  club: string;
  bio: string;
  
  // Personal Info
  phone?: string;
  dob?: string; // Date of Birth YYYY-MM-DD

  physical: {
    height: string; // Stored as "180" (cm)
    weight: string; // Stored as "75" (kg)
    foot: 'Right' | 'Left' | 'Both' | '-';
    age: string; // Auto-calc preferred, but stored for now
  };
  stats: {
    matches: number;
    goals: number;
    assists: number;
    minutesPlayed?: number;
    ratingAvg?: number; 
  };
  // Social Graph
  followers?: string[];
  following?: string[];
}

export interface Notification {
  id: string;
  from: string;
  message: string;
  time: string;
  read: boolean;
  type: 'feedback' | 'system' | 'alert' | 'social';
  linkToMediaId?: string; // Deep link to content
}
