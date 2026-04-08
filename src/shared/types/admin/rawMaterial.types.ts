/* =======================
   Raw Material Types
   ======================= */

export interface RawMaterialCategory {
  id: number;
  publicId?: string;
  name: string;
  description?: string;
  isActive: boolean;
  parentId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RawMaterial {
  id: number;
  name: string;
  sku?: string;
  categoryId: number;
  category?: RawMaterialCategory;
  supplier?: string;
  unitId: number;
  unit?: string;
  cost: number;
  initialStock: number;
  minStock: number;
  description?: string;
  isActive: boolean;
  thumbUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RawMaterialSupplier {
  id?: string | number;
  name: string;
  code?: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  paymentTerms?: string;
  isActive?: boolean;
  thumbUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RawMaterialPurchaseOrderItem {
  id?: number;
  productId: number;
  product?: {
    id: number;
    name: string;
  };
  quantity: number;
  unitCost: number;
  total?: number;
  totalPrice?: number;
  discount?: number;
  lineTotal?: number;
}

export interface RawMaterialPurchaseOrder {
  id?: number;
  poNumber: string;
  supplierId: number;
  supplier: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  orderDate: string;
  expectedDeliveryDate: string;
  notes: string;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  netAmount?: number;
  totalPayableAmount?: number;
  status?: string;
  items?: RawMaterialPurchaseOrderItem[];
  invoice?: RawMaterialInvoice;
  createdAt?: string;
  updatedAt?: string;
}

export interface RawMaterialPayment {
  id?: number;
  purchaseOrderId: number;
  invoiceId: number;
  invoice?: RawMaterialInvoice;
  purchaseOrder?: RawMaterialPurchaseOrder;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RawMaterialInvoice {
  id?: number;
  invoiceNumber: string;
  purchaseOrderId: number;
  purchaseOrder?: RawMaterialPurchaseOrder;
  invoiceDate: string;
  dueDate: string;
  totalAmount?: number;
  totalPayableAmount?: number;
  paidAmount?: number;
  dueAmount?: number;
  status?: "pending" | "paid";
  creator?: {
    id?: number;
    name: string;
  };
  payments?: Array<{
    id?: number;
    amount: number;
    paymentDate?: string;
    paymentMethod?: string;
    referenceNumber?: string;
    creator?: {
      name: string;
    };
  }>;
  createdAt?: string;
  updatedAt?: string;
}
