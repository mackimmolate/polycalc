export interface MaterialOption {
  id: string;
  label: string;
  normalizedKey: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MaterialOptionUpsertStatus = 'created' | 'existing' | 'reactivated';

export interface MaterialOptionUpsertResult {
  option: MaterialOption;
  status: MaterialOptionUpsertStatus;
}
