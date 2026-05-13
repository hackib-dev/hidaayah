// ─── Pagination ───────────────────────────────────────────────────────────────

export interface OffsetPagination {
  total: number;
  currentPage: number;
  limit: number;
  pages: number;
}

// ─── Room ─────────────────────────────────────────────────────────────────────

export type RoomType = 'group' | 'page';

export interface Room {
  id: number;
  name: string;
  url: string;
  subdomain: string;
  description: string | null;
  isPublic: boolean;
  roomType: RoomType;
  isActive: boolean;
  isVerified: boolean;
  hideFollowJoinButton: boolean;
  membersCount: number;
  postsCount: number;
  ownerId: string;
  createdAt: string;
  avatarUrls: { thumb: string; original: string };
  metadata?: Record<string, unknown>;
}

export interface RoomMember {
  id: string;
  username: string;
  name: string | null;
  role: 'admin' | 'member';
  joinedAt: string;
}

export interface RoomPost {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    name: string | null;
  };
  references: RoomPostReference[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

export interface RoomPostReference {
  chapterId: number;
  from: number;
  to: number;
}

// ─── Params ───────────────────────────────────────────────────────────────────

export interface GetJoinedRoomsParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: 'NAME_ASC' | 'NAME_DESC' | 'LATEST_ACTIVITY';
}

export interface SearchRoomsParams {
  query?: string;
  page?: number;
  limit?: number;
  roomType?: 'GROUP' | 'PAGE';
}

export interface CreateGroupParams {
  name: string;
  url: string;
  description?: string;
  public?: boolean;
  hideFollowJoinButton?: boolean;
}

export interface UpdateGroupParams {
  id: number;
  name?: string;
  description?: string;
  url?: string;
  public?: boolean | null;
  hideFollowJoinButton?: boolean | null;
  removeAvatar?: boolean;
  avatar?: string;
  country?: string | null;
}

export interface CreatePageParams {
  name: string;
  url: string;
  jobTitle: string;
  contactNumber: string;
  organizationName: string;
  purpose: string;
  description?: string;
  organizationWebsite?: string;
  additionalDetails?: string;
  country?: string;
  public?: boolean;
  hideFollowJoinButton?: boolean;
}

export interface UpdatePageParams {
  id: number;
  name?: string;
  description?: string;
  url?: string;
  public?: boolean | null;
  hideFollowJoinButton?: boolean | null;
  removeAvatar?: boolean;
  avatar?: string;
  country?: string | null;
  organizationWebsite?: string;
}

export interface InviteUsersParams {
  userIds?: string[];
  emails?: string[];
}

export interface UpdateAdminAccessParams {
  roomId: number;
  userId: string;
  admin: boolean;
}

export interface GetRoomPostsParams {
  page?: number;
  limit?: number;
}

// ─── Responses ────────────────────────────────────────────────────────────────

export interface RoomListResponse extends OffsetPagination {
  data: Room[];
}

export interface RoomMembersResponse extends OffsetPagination {
  data: RoomMember[];
}

export interface RoomPostsResponse extends OffsetPagination {
  data: RoomPost[];
}

export interface InviteResponse {
  invited: boolean;
  inviteStatus: Record<string, unknown>;
}

export interface AcceptInviteResponse {
  accepted: boolean;
}

export interface RejectInviteResponse {
  rejected: boolean;
}

export interface JoinResponse {
  joined: boolean;
}

export interface LeaveResponse {
  left: boolean;
}

export interface FollowResponse {
  followed: boolean;
}

export interface UnfollowResponse {
  unfollowed: boolean;
}

export interface GenericSuccessResponse {
  success: boolean;
  message?: string;
}
