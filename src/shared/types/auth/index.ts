/* =======================
   Auth Types
   ======================= */

import type { User } from './users.types';

/* =======================
   Role Types
======================= */

// Re-exported from users.types.ts
export type { Role } from './users.types';

/* =======================
   User Types
======================= */

// Re-exported from users.types.ts
export type { User } from './users.types';

/* =======================
   Legacy User Types
======================= */

// Re-exported from users.types.ts
export type { LegacyUser } from './users.types';

/* =======================
   Auth Request/Response Types
======================= */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    company?: {
      id: string;
      name: string;
      subdomain: string;
      domain: string;
      dbType: 'shared' | 'dedicated';
    };
    dashboardType: 'superadmin' | 'company';
    redirectTo: string;
    menus: any[];
    dashboards: any[];
  };
  token: string;
}

export interface OnboardRequest {
  companyName: string;
  adminEmail: string;
  adminPassword?: string;
  planId?: string;
  cycle?: string;
}

export interface OnboardResponse {
  success: boolean;
  message: string;
  data: {
    company?: any;
    user?: User;
    token?: string;
    checkoutUrl?: string;
    freePlan?: boolean;
  };
}

export interface AuthUserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

/* =======================
   Auth State
======================= */

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
