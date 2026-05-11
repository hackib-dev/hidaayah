// ─── OAuth ──────────────────────────────────────────────────────────────────────
export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
  scope: string;
  expires_at?: string;
}

// ─── Pagination ─────────────────────────────────────────────────────────────────
export interface ContentPagination {
  per_page: number;
  current_page: number;
  next_page: number | null;
  total_pages: number;
  total_records: number;
}

export interface CursorPagination {
  startCursor: string | null;
  endCursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
