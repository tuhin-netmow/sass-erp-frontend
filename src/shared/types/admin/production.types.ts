/* =======================
   Production Types
   ======================= */



export interface ProductionBatch {
  id: number;
  product?: {
    _id: string;
    name: string;
  };
  quantity: number;
  bomId?: string;
  bom?: BillOfMaterial;
  startDate?: string;
  endDate?: string;
  notes?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  supervisorId?: string;
  lineId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BillOfMaterialItem {
  id?: number;
  bomId?: number;

  rawMaterial?: {
    id: number;
    name: string;
    unit?: string;
    cost: number;
  };
  quantity: number;
  wastagePercent?: number;
  cost?: number;
}

export interface BillOfMaterial {
  _id?: string;
  name: string;
  product?: {
    id: string;
    name: string;
  };
  items?: BillOfMaterialItem[];
  description?: string;
  isActive: boolean;
  totalCost?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinishedGood {
  _id?: string;
  batchId?: string;
  batch?: ProductionBatch;

  product?: {
    _id: string;
    name: string;
  };
  quantity: number;
  producedDate: string;
  notes?: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CommonResponse<T> = {
  status: boolean;
  message: string;
  data: T;
};

// Re-export ListResponse from api types for convenience
export type { ListResponse } from "../api/app-api.types";
