export interface UserRead {
  id: string;
  email: string;
  username: string;
  phone?: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  access_token?: string;
}

export interface UserCreate {
  email: string;
  password: string;
  username: string;
  phone?: string;
}

export interface UserUpdate {
  password?: string;
  email?: string;
  username?: string;
  phone?: string;
}
