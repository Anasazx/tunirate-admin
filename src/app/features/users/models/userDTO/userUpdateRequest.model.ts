export interface UserUpdateRequest {
  name?: string;
  globalRole?: 'USER' | 'ADMIN';
}
