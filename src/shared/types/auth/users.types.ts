import type { TPermissions } from "@/app/config/permissions";

export interface Role {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  status: 'active' | 'inactive';
  permissions: TPermissions; // Structured format in DB, sometimes flattened by API, sometimes not
  dashboards?: Array<{
    widgetId: string;
    position: { x: number; y: number; w: number; h: number };
    config: Record<string, unknown>;
  }>;
  menus?: Array<{
    menuId: string;
    label: string;
    actions: string[];
  }>;
  customSettings?: Record<string, unknown>;
  custom?: unknown; // For backward compatibility
  publicId?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
}

export type User = {
  _id: string;
  publicId?: string;
  name: string;
  email: string;
  roleId: string; // MongoDB ObjectId
  role?: Role;
  phone?: string;
  address?: string;
  thumbUrl?: string;
  password?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
};

// For backward compatibility with old SQL-based data
export type LegacyUser = {
  id: number;
  publicId?: string;
  name: string;
  email: string;
  roleId: number;
  role: Role;
  phone: string;
  thumbUrl: string;
  password?: string;
  status: string;
  createdAt?: string;
};
