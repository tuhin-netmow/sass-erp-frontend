/* =======================
   Settings Types
   ======================= */

export interface PosLayoutSettings {
  columns: {
    mobile: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  gap: number;
  showImages: boolean;
  cardStyle: "standard" | "compact" | "bordered";
}

export interface LayoutData {
  pos: PosLayoutSettings;
}

export interface LayoutSettingsResponse {
  status: boolean;
  message: string;
  data: LayoutData;
}

export type ProductOrder = {
  id: number;
  orderNumber: string;
  status: string;
  orderDate: string;
  customer: {
    id: number;
    name: string;
  };
};

export type ProductOrdersResponse = {
  success: boolean;
  message: string;
  pagination: {
    total: number;
    page: string;
    limit: string;
    totalPages: number;
  };
  data: ProductOrder[];
};
