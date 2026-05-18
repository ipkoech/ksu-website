export type Service = "main" | "research" | "library";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  roles: string[];
  permissions: string[];
  services: ServiceAccess[];
}

export interface ServiceAccess {
  service: Service;
  roles: string[];
  scopes: string[];
}

export interface TokenPayload {
  sub: string;
  jti: string;
  email: string;
  name: string;
  roles: string[];
  services: ServiceAccess[];
  iat: number;
  exp: number;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  activeService: Service | null;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken?: string;
  refreshToken?: string;
}

export interface Session {
  id: string;
  deviceName?: string;
  deviceType?: string;
  ipAddress?: string;
  lastUsedAt: string;
  createdAt: string;
  isCurrent: boolean;
}
