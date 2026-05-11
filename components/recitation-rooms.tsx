'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Users,
  Plus,
  Hash,
  CheckCircle2,
  Flame,
  ArrowRight,
  ChevronLeft,
  Copy,
  Check,
  Bell,
  Star,
  UserPlus,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RecitationRoom, RoomMember } from '@/types/rooms';

// ─── Sub-components ───────────────────────────────────────────────────────────

function MemberAvatar({ member, size = 'md' }: { member: RoomMember; size?: 'sm' | 'md' }) {
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-primary-foreground shrink-0 relative',
        size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs',
        member.completedToday ? 'bg-primary' : 'bg-muted-foreground/40'
      )}
    >
      {member.avatarInitials}
      {member.completedToday && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
      )}
    </div>
  );
}

function StreakBadge({ days }: { days: number }) {
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold">
      <Flame className="w-3 h-3" />
      {days}d
    </span>
  );
}

// ─── Room Detail View ─────────────────────────────────────────────────────────

function RoomDetail({
  room,
  onBack,
  onMarkComplete
}: {
  room: RecitationRoom;
  onBack: () => void;
  onMarkComplete: (roomId: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyInvite = () => {
    navigator.clipboard.writeText(room.inviteCode).catch(() => null);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const completedMembers = room.members.filter((m) => m.completedToday);
  const pendingMembers = room.members.filter((m) => !m.completedToday);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-semibold"
      >
        <ChevronLeft className="w-4 h-4" />
        All Circles
      </button>

      {/* Room header */}
      <div className="p-5 rounded-2xl bg-card border border-border space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-serif font-bold text-foreground">{room.name}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{room.description}</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 shrink-0">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {room.roomStreakDays}d
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {room.members.length} members
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5" />
            {room.goal}
          </span>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full font-semibold',
              room.isPrivate ? 'bg-secondary text-muted-foreground' : 'bg-primary/10 text-primary'
            )}
          >
            {room.isPrivate ? 'Private' : 'Public'}
          </span>
        </div>

        {/* Today's progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Today's completion</span>
            <span className="font-semibold text-foreground">
              {room.totalCompletedToday} / {room.members.length}
            </span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(room.totalCompletedToday / room.members.length) * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>

        <button
          onClick={() => onMarkComplete(room.id)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" />
          Mark today's recitation complete
        </button>
      </div>

      {/* Members */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Members</p>
          <button className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-semibold">
            <UserPlus className="w-3.5 h-3.5" />
            Invite
          </button>
        </div>

        {completedMembers.length > 0 && (
          <div className="px-4 py-2 bg-emerald-500/5 border-b border-border">
            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
              Completed today ✓
            </p>
            <div className="space-y-2">
              {completedMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <MemberAvatar member={member} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">@{member.username}</p>
                  </div>
                  <StreakBadge days={member.streakDays} />
                  {member.role === 'admin' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
                      Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {pendingMembers.length > 0 && (
          <div className="px-4 py-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Yet to complete
            </p>
            <div className="space-y-2">
              {pendingMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 opacity-60">
                  <MemberAvatar member={member} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">@{member.username}</p>
                  </div>
                  <StreakBadge days={member.streakDays} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Activity feed */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Recent Activity</p>
        </div>
        <div className="divide-y divide-border">
          {room.activity.map((item) => (
            <div key={item.id} className="px-4 py-3 flex items-start gap-3">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                  item.type === 'streak_milestone'
                    ? 'bg-amber-500/15'
                    : item.type === 'room_streak'
                      ? 'bg-primary/10'
                      : 'bg-emerald-500/10'
                )}
              >
                {item.type === 'streak_milestone' ? (
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                ) : item.type === 'room_streak' ? (
                  <Flame className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                )}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{item.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Invite code */}
      <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Invite Code
          </p>
          <p className="text-lg font-bold text-foreground font-mono mt-0.5">{room.inviteCode}</p>
        </div>
        <button
          onClick={copyInvite}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Create Room Modal ────────────────────────────────────────────────────────

function CreateRoomModal({
  onClose,
  onCreate
}: {
  onClose: () => void;
  onCreate: (room: Partial<RecitationRoom>) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState<RecitationRoom['goalType']>('daily_page');
  const [isPrivate, setIsPrivate] = useState(true);

  const GOAL_OPTIONS: { id: RecitationRoom['goalType']; label: string }[] = [
    { id: 'daily_page', label: '1 page daily' },
    { id: 'daily_hizb', label: '1 hizb daily' },
    { id: 'weekly_juz', label: '1 juz weekly' },
    { id: 'custom', label: 'Custom goal' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card rounded-2xl border border-border shadow-xl p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-serif font-bold text-foreground">Create a Circle</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Circle Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning Tilawah Circle"
              className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's the intention of this circle?"
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Recitation Goal
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setGoal(opt.id)}
                  className={cn(
                    'py-2 px-3 rounded-xl text-xs font-medium border transition-colors text-left',
                    goal === opt.id
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-foreground">Private circle</p>
              <p className="text-xs text-muted-foreground">Only joinable via invite code</p>
            </div>
            <button
              onClick={() => setIsPrivate((v) => !v)}
              className={cn(
                'w-11 h-6 rounded-full transition-colors duration-200 relative',
                isPrivate ? 'bg-primary' : 'bg-secondary'
              )}
            >
              <motion.span
                animate={{ x: isPrivate ? 20 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow block"
              />
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            if (!name.trim()) return;
            onCreate({
              name: name.trim(),
              description: description.trim(),
              goalType: goal,
              isPrivate
            });
            onClose();
          }}
          disabled={!name.trim()}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          Create Circle
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Join Room Modal ──────────────────────────────────────────────────────────

function JoinRoomModal({
  onClose,
  onJoin
}: {
  onClose: () => void;
  onJoin: (code: string) => void;
}) {
  const [code, setCode] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-xl p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-serif font-bold text-foreground">Join a Circle</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter the invite code shared by your circle admin.
        </p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. FAJR2024"
          maxLength={12}
          className="w-full px-3 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-center tracking-widest uppercase"
        />
        <button
          onClick={() => {
            if (code.trim()) {
              onJoin(code.trim());
              onClose();
            }
          }}
          disabled={!code.trim()}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          Join Circle
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function RecitationRooms() {
  const [rooms, setRooms] = useState<RecitationRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RecitationRoom | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [completedRooms, setCompletedRooms] = useState<Set<string>>(new Set());

  const handleMarkComplete = (roomId: string) => {
    setCompletedRooms((prev) => new Set([...prev, roomId]));
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? { ...r, totalCompletedToday: Math.min(r.totalCompletedToday + 1, r.members.length) }
          : r
      )
    );
  };

  const handleCreate = (partial: Partial<RecitationRoom>) => {
    const newRoom: RecitationRoom = {
      id: `room-${Date.now()}`,
      name: partial.name ?? 'New Circle',
      description: partial.description ?? '',
      goal:
        partial.goalType === 'daily_page'
          ? '1 page daily'
          : partial.goalType === 'daily_hizb'
            ? '1 hizb daily'
            : partial.goalType === 'weekly_juz'
              ? '1 juz weekly'
              : 'Custom goal',
      goalType: partial.goalType ?? 'daily_page',
      goalValue: 1,
      members: [],
      roomStreakDays: 0,
      totalCompletedToday: 0,
      inviteCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
      createdAt: new Date().toISOString(),
      isPrivate: partial.isPrivate ?? true,
      activity: []
    };
    setRooms((prev) => [newRoom, ...prev]);
  };

  if (selectedRoom) {
    return (
      <AnimatePresence mode="wait">
        <RoomDetail
          key={selectedRoom.id}
          room={rooms.find((r) => r.id === selectedRoom.id) ?? selectedRoom}
          onBack={() => setSelectedRoom(null)}
          onMarkComplete={handleMarkComplete}
        />
      </AnimatePresence>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Circle
          </button>
          <button
            onClick={() => setShowJoin(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            <Hash className="w-4 h-4" />
            Join with Code
          </button>
        </div>

        {/* Rooms list */}
        {rooms.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">No circles yet</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Create a circle with friends or family to read the Quran together and keep each other
              consistent.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map((room, i) => {
              const isCompleted = completedRooms.has(room.id);
              return (
                <motion.button
                  key={room.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setSelectedRoom(room)}
                  className="w-full text-left p-4 rounded-2xl bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-foreground">{room.name}</p>
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Done today
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {room.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                        {room.roomStreakDays}d
                      </span>
                    </div>
                  </div>

                  {/* Member avatars */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {room.members.slice(0, 5).map((member, idx) => (
                        <div
                          key={member.id}
                          className="rounded-full border-2 border-background"
                          style={{ marginLeft: idx === 0 ? 0 : -8 }}
                        >
                          <MemberAvatar member={member} size="sm" />
                        </div>
                      ))}
                      {room.members.length > 5 && (
                        <div
                          className="w-7 h-7 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground"
                          style={{ marginLeft: -8 }}
                        >
                          +{room.members.length - 5}
                        </div>
                      )}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {room.totalCompletedToday}/{room.members.length} today
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>

                  {/* Today progress bar */}
                  <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(room.totalCompletedToday / Math.max(room.members.length, 1)) * 100}%`
                      }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.06 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Encouragement nudge */}
        {rooms.length > 0 && rooms[0].totalCompletedToday > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-2xl bg-primary/5 border border-primary/15 flex items-start gap-3"
          >
            <Bell className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-foreground/80 leading-relaxed">
              <span className="font-semibold text-primary">
                {rooms[0].totalCompletedToday} member{rooms[0].totalCompletedToday !== 1 ? 's' : ''}
              </span>{' '}
              completed today's recitation in your circle. Keep the streak going! 🌿
            </p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateRoomModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
        )}
        {showJoin && (
          <JoinRoomModal
            onClose={() => setShowJoin(false)}
            onJoin={(code) => {
              // API integration point: POST /circles/join { inviteCode: code }
              void code;
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
