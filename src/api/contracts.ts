export interface ApiError {
  message: string;
  status?: number;
}

export interface ApiResult<TData> {
  data: TData | null;
  error: ApiError | null;
}
