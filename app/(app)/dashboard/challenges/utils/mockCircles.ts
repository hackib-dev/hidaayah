import { Circle } from '../types';

// Mock circles data - replace with actual API calls
export const mockCircles: Circle[] = [
  {
    id: 'circle-1',
    name: 'Family Circle',
    memberCount: 5,
    members: [
      { id: 'user-1', name: 'You', isOnline: true },
      { id: 'user-2', name: 'Ahmad', isOnline: true },
      { id: 'user-3', name: 'Fatima', isOnline: false },
      { id: 'user-4', name: 'Yusuf', isOnline: true },
      { id: 'user-5', name: 'Aisha', isOnline: true }
    ]
  },
  {
    id: 'circle-2',
    name: 'Study Group',
    memberCount: 8,
    members: [
      { id: 'user-1', name: 'You', isOnline: true },
      { id: 'user-6', name: 'Ibrahim', isOnline: true },
      { id: 'user-7', name: 'Maryam', isOnline: true },
      { id: 'user-8', name: 'Omar', isOnline: false }
    ]
  },
  {
    id: 'circle-3',
    name: 'Masjid Community',
    memberCount: 12,
    members: [
      { id: 'user-1', name: 'You', isOnline: true },
      { id: 'user-9', name: 'Khadija', isOnline: false },
      { id: 'user-10', name: 'Ali', isOnline: true }
    ]
  }
];

export function getUserCircles(): Circle[] {
  return mockCircles;
}
