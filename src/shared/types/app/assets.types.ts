/* =======================
   Asset Types
   ======================= */

export interface Asset {
  _id: string;
  publicId: string;
  name: string;
  assetId: string;
  category: string;
  type: string;
  status: "active" | "inactive" | "disposed" | "maintenance";
  location: string;
  purchaseDate: string;
  purchaseCost: number;
  currentValue: number;
  depreciationRate: number;
  warrantyExpiry?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  description?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  assignedTo?: {
    id: string;
    name: string;
    type: "staff" | "department";
  };
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetStats {
  totalAssets: number;
  activeAssets: number;
  inactiveAssets: number;
  maintenanceAssets: number;
  disposedAssets: number;
  totalValue: number;
  depreciatedValue: number;
  categoriesCount: Record<string, number>;
}

export interface AssetMovement {
  _id: string;
  publicId: string;
  assetId: string;
  assetName: string;
  fromLocation: string;
  toLocation: string;
  movedBy: {
    id: string;
    name: string;
  };
  movedAt: string;
  reason?: string;
  notes?: string;
}

export interface MaintenanceSchedule {
  _id: string;
  publicId: string;
  assetId: string;
  assetName: string;
  scheduledDate: string;
  completedDate?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  assignedTo?: {
    id: string;
    name: string;
  };
  description: string;
  cost?: number;
  notes?: string;
}

export interface AssetResponse<T> {
  status: boolean;
  message: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AssetQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive" | "disposed" | "maintenance";
  category?: string;
  location?: string;
}
