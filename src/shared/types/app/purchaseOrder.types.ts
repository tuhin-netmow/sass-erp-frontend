/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PurchaseInvoice } from "./PurchaseInvoice.types";
import type { Supplier } from "./supplier.types";

import type { User } from "../auth/users.types";
import type { Payment, Product, StockMovement } from "../common";



export interface POItem {
  _id: string;
  id?: string;
  purchaseOrderId: string;
  productId: string;
  quantity: number;
  unitCost: number;
  lineTotal?: number;
  product: Product;
  discount: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  taxAmount: number;
  purchaseTax: number
}



//   -------------  previous data model type -------------------------
// export interface PurchaseOrder {
//   created_by: number;
//   updated_at: string;
//   notes: string | undefined;
//   order_date: string | undefined;
//   expected_delivery_date: string | undefined;
//   id: number;
//   po_number: string;
//   supplier_id: number;
//   supplier: Supplier;
//   total_amount: number;
//   tax_amount: number;
//   discount_amount: number;
//   net_amount: number;
//   total_payable_amount: number;
//   paid_amount: number;
//   status: "pending" | "approved" | "rejected" | "delivered";
//   created_at: string;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   items: POItem |any ;
// }

// ===== Purchase Order =====
export type PurchaseOrderStatus = "pending" | "draft" | "approved" | "rejected" | "returned";
export type PurchasePaymentStatus = "paid" | "unpaid" | "partial";

export interface PurchaseOrder {
  _id: string;
  id?: string;
  publicId?: string;
  poNumber: string;
  returnNumber?: string;

  supplierId: string;
  orderDate: string;
  expectedDeliveryDate: string;

  status: PurchaseOrderStatus;
  paymentStatus: PurchasePaymentStatus;
  notes: string;

  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  netAmount: number;
  totalPayableAmount: number;
  totalPaidAmount: number;
  totalDueAmount: number;

  totalRefundedAmount?: number;
  dueRefundAmount?: number;

  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;

  supplier: Supplier;
  items?: POItem[] | any;
  invoice?: PurchaseInvoice;
  payments?: Payment[];
  creator?: User;
  stockMovements?: StockMovement[];
}

// ===== Purchase Return =====
export interface PurchaseReturn {
  _id: string;
  id?: string;
  publicId?: string;
  returnNumber: string;
  poNumber?: string;
  purchaseOrderId?: string;
  supplierId: string;
  returnDate: string;
  orderDate?: string;
  status: "pending" | "approved" | "returned" | "cancelled" | "rejected";
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  totalPayableAmount?: number;
  paymentStatus: "pending" | "partial" | "refunded";
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;

  supplier: Supplier;
  items?: any[];
  invoice?: any;
  payments?: any[];
  creator?: User;
  purchaseOrder?: PurchaseOrder;
  totalRefundedAmount?: number;
  dueRefundAmount?: number;
}




export interface Coordinates {
  lat: number | null;
  lng: number | null;
}

export interface PurchaseOrderLocation {
  _id: string;
  id?: string;
  poNumber: string;
  status: "pending" | "approved" | "received" | "delivered" | "rejected";
  totalAmount: number;
  orderDate: string; // ISO string
  expectedDeliveryDate: string; // ISO string
  supplier: Supplier;
  coordinates: Coordinates;
}


