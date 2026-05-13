import { reflectApi } from '@/app/apiService/quranFoundationService';
import type {
  Room,
  RoomListResponse,
  RoomMembersResponse,
  RoomPostsResponse,
  InviteResponse,
  AcceptInviteResponse,
  RejectInviteResponse,
  JoinResponse,
  LeaveResponse,
  FollowResponse,
  UnfollowResponse,
  GenericSuccessResponse,
  GetJoinedRoomsParams,
  SearchRoomsParams,
  CreateGroupParams,
  UpdateGroupParams,
  CreatePageParams,
  UpdatePageParams,
  InviteUsersParams,
  UpdateAdminAccessParams,
  GetRoomPostsParams
} from '@/app/(app)/dashboard/circles/types';
import type { ReflectPost } from '@/app/(app)/dashboard/reflections/types/reflect-posts';

// ─── Get joined rooms ─────────────────────────────────────────────────────────
// GET /v1/rooms/joined-rooms
export const fetchJoinedRooms = async (
  params: GetJoinedRoomsParams = {}
): Promise<RoomListResponse> => {
  const response = await reflectApi.get<RoomListResponse>('/v1/rooms/joined-rooms', { params });
  return response.data;
};

// GET /v1/rooms/managed-rooms  — rooms the user owns/admins
export const fetchManagedRooms = async (
  params: GetJoinedRoomsParams = {}
): Promise<RoomListResponse> => {
  const response = await reflectApi.get<RoomListResponse>('/v1/rooms/managed-rooms', { params });
  return response.data;
};

// ─── Search rooms ─────────────────────────────────────────────────────────────
// GET /v1/rooms/search
export const searchRooms = async (params: SearchRoomsParams): Promise<RoomListResponse> => {
  const response = await reflectApi.get<RoomListResponse>('/v1/rooms/search', { params });
  return response.data;
};

// ─── Get room profile by ID ───────────────────────────────────────────────────
// GET /v1/rooms/:id
export const fetchRoomById = async (id: number): Promise<Room> => {
  const response = await reflectApi.get<{ success: boolean; data: Room }>(`/v1/rooms/${id}`);
  return response.data.data;
};

// ─── Get room profile by URL / subdomain ─────────────────────────────────────
// GET /v1/rooms/by-url/:url
export const fetchRoomBySlug = async (slug: string): Promise<Room> => {
  const response = await reflectApi.get<{ success: boolean; data: Room }>(
    `/v1/rooms/by-url/${slug}`
  );
  return response.data.data;
};

// ─── Get room members ─────────────────────────────────────────────────────────
// GET /v1/rooms/:id/members
export const fetchRoomMembers = async (
  id: number,
  params: { page?: number; limit?: number } = {}
): Promise<RoomMembersResponse> => {
  const response = await reflectApi.get<RoomMembersResponse>(`/v1/rooms/${id}/members`, {
    params
  });
  return response.data;
};

// ─── Get room posts ───────────────────────────────────────────────────────────
// GET /v1/rooms/:id/posts
export const fetchRoomPosts = async (
  id: number,
  params: GetRoomPostsParams = {}
): Promise<RoomPostsResponse> => {
  const response = await reflectApi.get<RoomPostsResponse>(`/v1/rooms/${id}/posts`, { params });
  return response.data;
};

// ─── Create a group ───────────────────────────────────────────────────────────
// POST /v1/rooms/groups
export const createGroup = async (
  params: CreateGroupParams
): Promise<{ success: boolean; data: Room }> => {
  const response = await reflectApi.post<{ success: boolean; data: Room }>(
    '/v1/rooms/groups',
    params
  );
  return response.data;
};

// ─── Update a group ───────────────────────────────────────────────────────────
// PATCH /v1/rooms/groups
export const updateGroup = async (
  params: UpdateGroupParams
): Promise<GenericSuccessResponse & { room?: Room }> => {
  const response = await reflectApi.patch<GenericSuccessResponse & { room?: Room }>(
    '/v1/rooms/groups',
    params
  );
  return response.data;
};

// ─── Create a page ────────────────────────────────────────────────────────────
// POST /v1/rooms/pages
export const createPage = async (
  params: CreatePageParams
): Promise<{ success: boolean; data?: Room; message?: string }> => {
  const response = await reflectApi.post<{ success: boolean; data?: Room; message?: string }>(
    '/v1/rooms/pages',
    params
  );
  return response.data;
};

// ─── Update a page ────────────────────────────────────────────────────────────
// PATCH /v1/rooms/pages
export const updatePage = async (
  params: UpdatePageParams
): Promise<GenericSuccessResponse & { room?: Room }> => {
  const response = await reflectApi.patch<GenericSuccessResponse & { room?: Room }>(
    '/v1/rooms/pages',
    params
  );
  return response.data;
};

// ─── Invite users to room ─────────────────────────────────────────────────────
// POST /v1/rooms/:id/invite  — accepts userIds[] and/or emails[]
export const inviteUsersToRoom = async (
  id: number,
  params: InviteUsersParams
): Promise<InviteResponse> => {
  const response = await reflectApi.post<InviteResponse>(`/v1/rooms/${id}/invite`, params);
  return response.data;
};

// ─── Accept room invite ───────────────────────────────────────────────────────
// GET /v1/rooms/:id/accept-invite?token=...
export const acceptRoomInvite = async (
  id: number,
  token: string
): Promise<AcceptInviteResponse> => {
  const response = await reflectApi.get<AcceptInviteResponse>(
    `/v1/rooms/${id}/accept-invite`,
    { params: { token } }
  );
  return response.data;
};

// ─── Reject room invite ───────────────────────────────────────────────────────
// GET /v1/rooms/:id/reject-invite?token=...
export const rejectRoomInvite = async (
  id: number,
  token: string
): Promise<RejectInviteResponse> => {
  const response = await reflectApi.get<RejectInviteResponse>(
    `/v1/rooms/${id}/reject-invite`,
    { params: { token } }
  );
  return response.data;
};

// ─── Remove member from room ──────────────────────────────────────────────────
// DELETE /v1/rooms/:id/members/:userId
export const removeMemberFromRoom = async (
  id: number,
  userId: string
): Promise<GenericSuccessResponse> => {
  const response = await reflectApi.delete<GenericSuccessResponse>(
    `/v1/rooms/${id}/members/${userId}`
  );
  return response.data;
};

// ─── Update admin access ──────────────────────────────────────────────────────
// POST /v1/rooms/admins-access  — body: { roomId, userId, admin }
export const updateAdminAccess = async (
  params: UpdateAdminAccessParams
): Promise<GenericSuccessResponse> => {
  const response = await reflectApi.post<GenericSuccessResponse>(
    '/v1/rooms/admins-access',
    params
  );
  return response.data;
};

// ─── Join a group ─────────────────────────────────────────────────────────────
// POST /v1/rooms/:groupId/join
export const joinGroup = async (groupId: number): Promise<JoinResponse> => {
  const response = await reflectApi.post<JoinResponse>(`/v1/rooms/${groupId}/join`);
  return response.data;
};

// ─── Leave a group ────────────────────────────────────────────────────────────
// POST /v1/rooms/:groupId/leave
export const leaveGroup = async (groupId: number): Promise<LeaveResponse> => {
  const response = await reflectApi.post<LeaveResponse>(`/v1/rooms/${groupId}/leave`);
  return response.data;
};

// ─── Follow a page ────────────────────────────────────────────────────────────
// POST /v1/rooms/:pageId/follow
export const followPage = async (pageId: number): Promise<FollowResponse> => {
  const response = await reflectApi.post<FollowResponse>(`/v1/rooms/${pageId}/follow`);
  return response.data;
};

// ─── Unfollow a page ─────────────────────────────────────────────────────────
// DELETE /v1/rooms/:pageId/unfollow
export const unfollowPage = async (pageId: number): Promise<UnfollowResponse> => {
  const response = await reflectApi.delete<UnfollowResponse>(`/v1/rooms/${pageId}/unfollow`);
  return response.data;
};

// ─── Update post privacy in room ─────────────────────────────────────────────
// PATCH /v1/rooms/:id/posts/:postId
export const updatePostPrivacy = async (
  id: number,
  postId: string,
  isPrivate: boolean
): Promise<GenericSuccessResponse> => {
  const response = await reflectApi.patch<GenericSuccessResponse>(
    `/v1/rooms/${id}/posts/${postId}`,
    { isPrivate }
  );
  return response.data;
};

// ─── Posts ────────────────────────────────────────────────────────────────────

export interface CreatePostParams {
  body: string;
  roomId: number;
  roomPostStatus?: 0 | 1 | 2; // 0=OnlyMembers, 1=Publicly, 2=AsRoom
  draft?: boolean;
  references?: { chapterId: number; from: number; to: number }[];
}

// POST /v1/posts
export const createRoomPost = async (
  params: CreatePostParams
): Promise<{ success: boolean; data: ReflectPost }> => {
  const response = await reflectApi.post<{ success: boolean; data: ReflectPost }>('/v1/posts', {
    post: {
      ...params,
      draft: false,
      roomPostStatus: params.roomPostStatus ?? 0,
      mentions: []
    }
  });
  return response.data;
};

// PATCH /v1/posts/:id
export const editPost = async (
  postId: number,
  params: Partial<CreatePostParams>
): Promise<{ success: boolean; data: ReflectPost }> => {
  const response = await reflectApi.patch<{ success: boolean; data: ReflectPost }>(
    `/v1/posts/${postId}`,
    params
  );
  return response.data;
};

// DELETE /v1/posts/:id
export const deletePost = async (postId: number): Promise<GenericSuccessResponse> => {
  const response = await reflectApi.delete<GenericSuccessResponse>(`/v1/posts/${postId}`);
  return response.data;
};

// POST /v1/posts/:id/toggle-like
export const togglePostLike = async (postId: number): Promise<{ liked: boolean }> => {
  const response = await reflectApi.post<{ liked: boolean }>(`/v1/posts/${postId}/toggle-like`);
  return response.data;
};

// GET /v1/posts/:id/comments
export const fetchPostComments = async (
  postId: number,
  params: { page?: number; limit?: number } = {}
): Promise<{
  total: number;
  currentPage: number;
  limit: number;
  pages: number;
  data: Comment[];
}> => {
  const response = await reflectApi.get(`/v1/posts/${postId}/comments`, { params });
  return response.data;
};

// ─── Comments ─────────────────────────────────────────────────────────────────

export interface Comment {
  id: number;
  body: string;
  postId: number;
  parentId?: number | null;
  isPrivate?: boolean;
  likesCount?: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    avatarUrls?: { small?: string };
  };
}

// POST /v1/comments
export const createComment = async (params: {
  body: string;
  postId: number;
  parentId?: number;
  isPrivate?: boolean;
}): Promise<{ success: boolean; comment: Comment }> => {
  const response = await reflectApi.post<{ success: boolean; comment: Comment }>('/v1/comments', {
    comment: { ...params, mentions: [] }
  });
  return response.data;
};

// GET /v1/comments/:id/delete  — despite the name, this is a GET per the API spec
export const deleteComment = async (commentId: number): Promise<{ removed: boolean }> => {
  const response = await reflectApi.get<{ removed: boolean }>(
    `/v1/comments/${commentId}/delete`
  );
  return response.data;
};

// POST /v1/comments/:id/toggle-like
export const toggleCommentLike = async (commentId: number): Promise<{ liked: boolean }> => {
  const response = await reflectApi.post<{ liked: boolean }>(
    `/v1/comments/${commentId}/toggle-like`
  );
  return response.data;
};

// GET /v1/comments/:id/replies
export const fetchCommentReplies = async (
  commentId: number,
  params: { page?: number; limit?: number } = {}
): Promise<{
  total: number;
  currentPage: number;
  limit: number;
  pages: number;
  replies: Comment[];
  comment: Comment;
}> => {
  const response = await reflectApi.get(`/v1/comments/${commentId}/replies`, { params });
  return response.data;
};
