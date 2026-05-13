'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Users,
  Plus,
  Hash,
  ArrowRight,
  ChevronLeft,
  UserPlus,
  X,
  Loader2,
  LogOut,
  Globe,
  Lock,
  MessageSquare,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Room, RoomMember as ApiRoomMember } from '@/app/(app)/dashboard/circles/types';
import type { ReflectPost } from '@/app/(app)/dashboard/reflections/types/reflect-posts';
import type { Comment } from '@/app/(app)/dashboard/circles/queries';
import {
  fetchJoinedRooms,
  fetchManagedRooms,
  fetchRoomMembers,
  fetchRoomPosts,
  createGroup,
  inviteUsersToRoom,
  leaveGroup,
  joinGroup,
  searchRooms,
  createRoomPost,
  deletePost,
  togglePostLike,
  fetchPostComments,
  createComment,
  deleteComment,
  toggleCommentLike
} from '@/app/(app)/dashboard/circles/queries';
import { fetchUserFollowing } from '@/app/(app)/dashboard/profile/queries';
import type { ReflectProfile } from '@/app/(app)/dashboard/profile/types';
import { useAuth } from '@/components/auth-provider';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string | null, username: string): string {
  if (name) {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── MemberAvatar ─────────────────────────────────────────────────────────────

function MemberAvatar({ member, size = 'md' }: { member: ApiRoomMember; size?: 'sm' | 'md' }) {
  const px = size === 'sm' ? 28 : 36;
  const avatarUrl = member.avatarUrls?.small;
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={member.username}
        width={px}
        height={px}
        className={cn('rounded-full object-cover shrink-0', size === 'sm' ? 'w-7 h-7' : 'w-9 h-9')}
      />
    );
  }
  const name = [member.firstName, member.lastName].filter(Boolean).join(' ') || null;
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-primary-foreground shrink-0 bg-primary/70',
        size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs'
      )}
    >
      {initials(name, member.username)}
    </div>
  );
}

// ─── PostCard ─────────────────────────────────────────────────────────────────

function PostCard({
  post,
  onDeleted
}: {
  post: ReflectPost;
  onDeleted: (id: string | number) => void;
}) {
  const author = post.author ?? post.user;
  const displayName = author
    ? [author.firstName, author.lastName].filter(Boolean).join(' ') || author.username || 'Unknown'
    : 'Unknown';

  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likesCount ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentBody, setCommentBody] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likedComments, setLikedComments] = useState<Record<number, boolean>>({});

  const loadComments = async () => {
    if (loadingComments) return;
    setLoadingComments(true);
    try {
      const res = await fetchPostComments(post.id, { limit: 20 });
      setComments(res.comments ?? []);
    } catch {
      // leave empty
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    if (!showComments && comments.length === 0) loadComments();
    setShowComments((v) => !v);
  };

  const handleSubmitComment = async () => {
    if (commentBody.trim().length < 1) return;
    setSubmittingComment(true);
    try {
      const res = await createComment({ body: commentBody.trim(), postId: post.id });
      setComments((prev) => [res.comment, ...prev]);
      setCommentBody('');
    } catch {
      // silent
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="px-4 py-4 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
            {initials(null, author?.username ?? 'U')}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
            <p className="text-[10px] text-muted-foreground">{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        <button
          onClick={async () => {
            if (!confirm('Delete this post?')) return;
            await deletePost(Number(post.id)).catch(() => null);
            onDeleted(post.id);
          }}
          className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <p className="text-sm text-foreground/80 leading-relaxed">{post.body}</p>

      {/* References */}
      {(post.references?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.references!.map((ref, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold"
            >
              {ref.chapterId}:{ref.from}
              {ref.from !== ref.to ? `–${ref.to}` : ''}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={async () => {
            const res = await togglePostLike(Number(post.id)).catch(() => null);
            if (res) {
              setLikeCount((c) => c + (res.liked ? 1 : -1));
              setLiked(res.liked);
            }
          }}
          className={cn(
            'flex items-center gap-1 text-xs font-medium transition-colors',
            liked ? 'text-primary' : 'text-muted-foreground hover:text-primary'
          )}
        >
          <span>{liked ? '♥' : '♡'}</span>
          <span>{likeCount}</span>
        </button>
        <button
          onClick={handleToggleComments}
          className={cn(
            'flex items-center gap-1 text-xs font-medium transition-colors',
            showComments ? 'text-primary' : 'text-muted-foreground hover:text-primary'
          )}
        >
          <MessageSquare className="w-3 h-3" />
          <span>
            {post.commentsCount +
              (comments.length > (post.commentsCount ?? 0)
                ? comments.length - (post.commentsCount ?? 0)
                : 0)}
          </span>
        </button>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-3 border-t border-border mt-2">
              {/* Comment composer */}
              <div className="flex gap-2">
                <input
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmitComment()}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={submittingComment || !commentBody.trim()}
                  className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors"
                >
                  {submittingComment ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Send'}
                </button>
              </div>

              {/* Comment list */}
              {loadingComments ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-1">No comments yet.</p>
              ) : (
                <div className="space-y-2">
                  {comments.map((c) => {
                    const cAuthor = c.author;
                    const cName = cAuthor
                      ? [cAuthor.firstName, cAuthor.lastName].filter(Boolean).join(' ') ||
                        cAuthor.username ||
                        'Unknown'
                      : 'Unknown';
                    const cLiked = likedComments[c.id] ?? c.isLiked ?? false;
                    return (
                      <div key={c.id} className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[9px] font-bold text-muted-foreground shrink-0 mt-0.5">
                          {initials(null, cAuthor?.username ?? 'U')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-secondary rounded-xl px-3 py-2">
                            <p className="text-[10px] font-semibold text-foreground">{cName}</p>
                            <p className="text-xs text-foreground/80 leading-relaxed">{c.body}</p>
                          </div>
                          <div className="flex items-center gap-3 mt-1 px-1">
                            <button
                              onClick={async () => {
                                const res = await toggleCommentLike(c.id).catch(() => null);
                                if (res)
                                  setLikedComments((prev) => ({ ...prev, [c.id]: res.liked }));
                              }}
                              className={cn(
                                'text-[10px] font-medium transition-colors',
                                cLiked ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                              )}
                            >
                              {cLiked ? '♥' : '♡'} {c.likesCount ?? 0}
                            </button>
                            <span className="text-[10px] text-muted-foreground">
                              {timeAgo(c.createdAt)}
                            </span>
                            <button
                              onClick={async () => {
                                await deleteComment(c.id).catch(() => null);
                                setComments((prev) => prev.filter((x) => x.id !== c.id));
                              }}
                              className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                            >
                              delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── RoomDetail ───────────────────────────────────────────────────────────────

function RoomDetail({
  room,
  onBack,
  onLeft
}: {
  room: Room;
  onBack: () => void;
  onLeft: (roomId: number) => void;
}) {
  const [members, setMembers] = useState<ApiRoomMember[]>([]);
  const [posts, setPosts] = useState<ReflectPost[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [newPostBody, setNewPostBody] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [inviteInput, setInviteInput] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<Record<string, boolean | string> | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [leavingRoom, setLeavingRoom] = useState(false);
  const [tab, setTab] = useState<'members' | 'posts'>('members');

  useEffect(() => {
    fetchRoomMembers(room.id)
      .then((res) => setMembers(res.data))
      .catch(() => null)
      .finally(() => setLoadingMembers(false));

    fetchRoomPosts(room.id, { limit: 20 })
      .then((res) => setPosts(res.data))
      .catch(() => null)
      .finally(() => setLoadingPosts(false));
  }, [room.id]);

  const handleInvite = async () => {
    const entries = inviteInput
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!entries.length) return;
    setInviting(true);
    setInviteError(null);
    setInviteStatus(null);
    const emails = entries.filter((e) => e.includes('@'));
    const userIds = entries.filter((e) => !e.includes('@'));
    try {
      const res = await inviteUsersToRoom(room.id, {
        ...(emails.length ? { emails } : {}),
        ...(userIds.length ? { userIds } : {})
      });
      setInviteStatus(res.inviteStatus as Record<string, boolean | string>);
      setInviteInput('');
    } catch {
      setInviteError('Could not send invites. Check the entries and try again.');
    } finally {
      setInviting(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm(`Leave "${room.name}"?`)) return;
    setLeavingRoom(true);
    await leaveGroup(room.id).catch(() => null);
    onLeft(room.id);
  };

  const admins = members.filter((m) => m.isAdmin);
  const regularMembers = members.filter((m) => !m.isAdmin);

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
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-serif font-bold text-foreground">{room.name}</h2>
            {room.description && (
              <p className="text-sm text-muted-foreground mt-0.5">{room.description}</p>
            )}
          </div>
          <span
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold shrink-0',
              !room.isPublic ? 'bg-secondary text-muted-foreground' : 'bg-primary/10 text-primary'
            )}
          >
            {!room.isPublic ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            {!room.isPublic ? 'Private' : 'Public'}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {room.membersCount} members
          </span>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setShowInvite((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Invite
          </button>
          <button
            onClick={handleLeave}
            disabled={leavingRoom}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors disabled:opacity-50"
          >
            {leavingRoom ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            Leave
          </button>
        </div>

        <AnimatePresence>
          {showInvite && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-2 space-y-2">
                <textarea
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  placeholder={'user-id-or-email@example.com\nanother@example.com'}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
                <p className="text-[10px] text-muted-foreground">
                  Separate multiple entries with commas, spaces, or new lines. Emails and user IDs
                  both work.
                </p>
                <button
                  onClick={handleInvite}
                  disabled={inviting || !inviteInput.trim()}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
                >
                  {inviting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Send Invites
                </button>
                {inviteStatus && (
                  <div className="space-y-1">
                    {Object.entries(inviteStatus).map(([key, val]) => (
                      <p key={key} className="text-xs">
                        <span className="font-medium text-foreground">{key}</span>
                        {' — '}
                        <span
                          className={
                            val === true
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }
                        >
                          {val === true ? 'invited' : String(val).replace(/_/g, ' ')}
                        </span>
                      </p>
                    ))}
                  </div>
                )}
                {inviteError && <p className="text-xs text-destructive">{inviteError}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary">
        {(['members', 'posts'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-semibold transition-colors capitalize',
              tab === t
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'members' && (
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {loadingMembers ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10">No members yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {admins.length > 0 && (
                <div className="px-4 pt-4 pb-3 space-y-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Admins · {admins.length}
                  </p>
                  {admins.map((m) => {
                    const fullName = [m.firstName, m.lastName].filter(Boolean).join(' ');
                    return (
                      <div key={m.id} className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <MemberAvatar member={m} />
                          {m.isOwner && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent flex items-center justify-center text-[8px]">
                              👑
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {fullName || m.username}
                            </p>
                            {m.verified && (
                              <span className="text-primary text-xs" title="Verified">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">@{m.username}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {m.isOwner ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-semibold">
                              Owner
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                              Admin
                            </span>
                          )}
                          {m.followersCount > 0 && (
                            <p className="text-[10px] text-muted-foreground">
                              {m.followersCount} followers
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {regularMembers.length > 0 && (
                <div className="px-4 pt-4 pb-4 space-y-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Members · {regularMembers.length}
                  </p>
                  {regularMembers.map((m) => {
                    const fullName = [m.firstName, m.lastName].filter(Boolean).join(' ');
                    return (
                      <div key={m.id} className="flex items-center gap-3">
                        <MemberAvatar member={m} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-foreground truncate">
                              {fullName || m.username}
                            </p>
                            {m.verified && (
                              <span className="text-primary text-xs" title="Verified">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">@{m.username}</p>
                        </div>
                        {m.followersCount > 0 && (
                          <p className="text-[10px] text-muted-foreground shrink-0">
                            {m.followersCount} followers
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'posts' && (
        <div className="space-y-3">
          {/* Composer */}
          <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
            <textarea
              value={newPostBody}
              onChange={(e) => setNewPostBody(e.target.value)}
              placeholder="Share a reflection with this circle..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
            {postError && <p className="text-xs text-destructive">{postError}</p>}
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">Min 6 characters</p>
              <button
                onClick={async () => {
                  if (newPostBody.trim().length < 6) return;
                  setSubmittingPost(true);
                  setPostError(null);
                  try {
                    const res = await createRoomPost({
                      body: newPostBody.trim(),
                      roomId: room.id,
                      roomPostStatus: 0
                    });
                    setPosts((prev) => [res.data, ...prev]);
                    setNewPostBody('');
                  } catch {
                    setPostError('Failed to post. Please try again.');
                  } finally {
                    setSubmittingPost(false);
                  }
                }}
                disabled={submittingPost || newPostBody.trim().length < 6}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors"
              >
                {submittingPost && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Post
              </button>
            </div>
          </div>

          {/* Feed */}
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            {loadingPosts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : posts.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground">No posts yet. Be the first!</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── CreateRoomModal ──────────────────────────────────────────────────────────

function CreateRoomModal({ onClose, onCreate }: { onClose: () => void; onCreate: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const url = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      await createGroup({
        name: name.trim(),
        url,
        description: description.trim() || undefined,
        public: !isPrivate
      });
      onCreate();
    } catch {
      setError('Failed to create circle. Please try again.');
    } finally {
      setCreating(false);
    }
  };

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

          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-foreground">Private circle</p>
              <p className="text-xs text-muted-foreground">Only joinable via invite</p>
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

        {error && <p className="text-xs text-destructive">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={!name.trim() || creating}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {creating && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Circle
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── JoinRoomModal ────────────────────────────────────────────────────────────

function JoinRoomModal({ onClose, onJoined }: { onClose: () => void; onJoined: () => void }) {
  const [roomId, setRoomId] = useState('');
  const [token, setToken] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    const id = parseInt(roomId.trim(), 10);
    if (!id || !token.trim()) return;
    setJoining(true);
    setError(null);
    try {
      const { acceptRoomInvite } = await import('@/app/(app)/dashboard/circles/queries');
      await acceptRoomInvite(id, token.trim());
      onJoined();
      onClose();
    } catch {
      setError('Invalid room ID or token. Please check and try again.');
    } finally {
      setJoining(false);
    }
  };

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
          Enter the circle ID and invite token shared by the admin.
        </p>
        <div className="space-y-2">
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.replace(/\D/g, ''))}
            placeholder="Circle ID (e.g. 42)"
            className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Invite token"
            className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <button
          onClick={handleJoin}
          disabled={!roomId.trim() || !token.trim() || joining}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {joining && <Loader2 className="w-4 h-4 animate-spin" />}
          Join Circle
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── SearchRoomsModal ─────────────────────────────────────────────────────────

function SearchRoomsModal({ onClose, onJoined }: { onClose: () => void; onJoined: () => void }) {
  const [query, setQuery] = useState('');
  const [roomType, setRoomType] = useState<'GROUP' | 'PAGE' | undefined>(undefined);
  const [results, setResults] = useState<Room[]>([]);
  const [searching, setSearching] = useState(false);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const tid = setTimeout(() => {
      setSearching(true);
      searchRooms({ query: query.trim(), roomType, limit: 10 })
        .then((res) => setResults(res.data))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(tid);
  }, [query, roomType]);

  const handleJoinPublic = async (room: Room) => {
    setJoiningId(room.id);
    try {
      await joinGroup(room.id);
      onJoined();
      onClose();
    } catch {
      setJoiningId(null);
    }
  };

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
          <h3 className="text-base font-serif font-bold text-foreground">Find a Circle</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search public circles..."
            autoFocus
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex gap-2">
          {(['All', 'GROUP', 'PAGE'] as const).map((t) => {
            const active = t === 'All' ? roomType === undefined : roomType === t;
            return (
              <button
                key={t}
                onClick={() => setRoomType(t === 'All' ? undefined : t)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                )}
              >
                {t === 'GROUP' ? 'Groups' : t === 'PAGE' ? 'Pages' : 'All'}
              </button>
            );
          })}
        </div>

        {searching && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        )}

        {!searching && results.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {results.map((room) => (
              <div
                key={room.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{room.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {room.membersCount} members · {!room.isPublic ? 'Private' : 'Public'}
                  </p>
                </div>
                <button
                  onClick={() => handleJoinPublic(room)}
                  disabled={joiningId === room.id || !room.isPublic}
                  className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors shrink-0"
                >
                  {joiningId === room.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : !room.isPublic ? (
                    'Private'
                  ) : (
                    'Join'
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {!searching && query.trim() && results.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No circles found.</p>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── FollowingModal ───────────────────────────────────────────────────────────

function FollowingModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [following, setFollowing] = useState<ReflectProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetchUserFollowing(userId, { page, limit: 20 })
      .then((res) => {
        setFollowing((prev) => (page === 1 ? res.data : [...prev, ...res.data]));
        setTotalPages(res.pages);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [userId, page]);

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
          <h3 className="text-base font-serif font-bold text-foreground">People I Follow</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading && page === 1 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : following.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            You are not following anyone yet.
          </p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {following.map((person) => {
              const displayName =
                [person.firstName, person.lastName].filter(Boolean).join(' ') ||
                person.username ||
                'Unknown';
              const avatarUrl = (person as ReflectProfile & { avatarUrls?: { thumb?: string } })
                .avatarUrls?.thumb;
              return (
                <div
                  key={person.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/50 transition-colors"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {displayName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                    {person.username && (
                      <p className="text-xs text-muted-foreground truncate">@{person.username}</p>
                    )}
                  </div>
                </div>
              );
            })}
            {page < totalPages && (
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                className="w-full py-2 text-xs text-primary font-semibold hover:underline disabled:opacity-40"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Load more'}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function RecitationRooms() {
  const { reflectProfile } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [scopeError, setScopeError] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const loadRooms = useCallback(() => {
    setLoading(true);
    setScopeError(false);
    Promise.all([fetchJoinedRooms().catch(() => null), fetchManagedRooms().catch(() => null)])
      .then(([joined, managed]) => {
        const all = [...(joined?.data ?? []), ...(managed?.data ?? [])];
        const seen = new Set<number>();
        setRooms(all.filter((r) => (seen.has(r.id) ? false : seen.add(r.id) && true)));
      })
      .catch((err) => {
        const status = err?.response?.status;
        const type = err?.response?.data?.type;
        if (status === 403 && type === 'insufficient_scope') {
          setScopeError(true);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  if (selectedRoom) {
    return (
      <AnimatePresence mode="wait">
        <RoomDetail
          key={selectedRoom.id}
          room={rooms.find((r) => r.id === selectedRoom.id) ?? selectedRoom}
          onBack={() => setSelectedRoom(null)}
          onLeft={(id) => {
            setRooms((prev) => prev.filter((r) => r.id !== id));
            setSelectedRoom(null);
          }}
        />
      </AnimatePresence>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Circle
          </button>
          {/* <button
            onClick={() => setShowJoin(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            <Hash className="w-4 h-4" />
            Join with Token
          </button> */}
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            <Search className="w-4 h-4" />
            Find Circles
          </button>
          {reflectProfile && (
            <button
              onClick={() => setShowFollowing(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Following
            </button>
          )}
        </div>

        {/* Rooms list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : scopeError ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7 text-amber-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Permission needed</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Your session doesn&apos;t have access to Circles. Sign out and sign back in to
                enable it.
              </p>
            </div>
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('qf:session-expired'));
              }}
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Sign in again
            </button>
          </div>
        ) : rooms.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">No circles yet</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              Create a circle with friends or family to read the Quran together and stay consistent.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map((room, i) => (
              <motion.button
                key={room.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setSelectedRoom(room)}
                className="w-full text-left p-4 rounded-2xl bg-card border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{room.name}</p>
                      <span
                        className={cn(
                          'flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                          !room.isPublic
                            ? 'bg-secondary text-muted-foreground'
                            : 'bg-primary/10 text-primary'
                        )}
                      >
                        {!room.isPublic ? (
                          <Lock className="w-2.5 h-2.5" />
                        ) : (
                          <Globe className="w-2.5 h-2.5" />
                        )}
                        {!room.isPublic ? 'Private' : 'Public'}
                      </span>
                    </div>
                    {room.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {room.description}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                </div>

                <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  <span>{room.membersCount} members</span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateRoomModal
            onClose={() => setShowCreate(false)}
            onCreate={() => {
              setShowCreate(false);
              loadRooms();
            }}
          />
        )}
        {showJoin && (
          <JoinRoomModal
            onClose={() => setShowJoin(false)}
            onJoined={() => {
              loadRooms();
            }}
          />
        )}
        {showSearch && (
          <SearchRoomsModal
            onClose={() => setShowSearch(false)}
            onJoined={() => {
              loadRooms();
            }}
          />
        )}
        {showFollowing && reflectProfile && (
          <FollowingModal userId={reflectProfile.id} onClose={() => setShowFollowing(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
