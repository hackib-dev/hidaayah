export interface RoomMember {
  id: string;
  name: string;
  username: string;
  avatarInitials: string;
  streakDays: number;
  completedToday: boolean;
  lastActive: string; // ISO date
  role: 'admin' | 'member';
}

export interface RoomActivity {
  id: string;
  memberId: string;
  memberName: string;
  type: 'completed' | 'streak_milestone' | 'joined' | 'room_streak';
  message: string;
  timestamp: string;
}

export interface RecitationRoom {
  id: string;
  name: string;
  description: string;
  goal: string; // e.g. "1 Juz per week"
  goalType: 'daily_page' | 'weekly_juz' | 'daily_hizb' | 'custom';
  goalValue: number;
  members: RoomMember[];
  roomStreakDays: number;
  totalCompletedToday: number;
  inviteCode: string;
  createdAt: string;
  isPrivate: boolean;
  activity: RoomActivity[];
}

