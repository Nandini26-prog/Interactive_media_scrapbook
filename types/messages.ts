export type MessageRow = {
  id: string | number;
  // DB column is `content` (kept `message` optional for backward-compat)
  content?: string | null;
  message?: string | null;
  author: string | null;
  is_chaos?: boolean | null;
  created_at?: string | null;
};

