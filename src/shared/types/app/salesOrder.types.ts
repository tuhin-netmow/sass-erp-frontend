/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Customer } from "@/shared/types/app/customers";
import type { Product } from "@/shared/types/common/entities.types";



export interface SalesOrderItem {
  _id: string;
  id?: string;            // Alternative ID field (sometimes returned by API)
  orderId: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: string;      // decimal return as string
  unit_price?: string;    // snake_case alternative from API
  totalPrice: string;     // decimal return as string
  lineTotal: number;     // decimal
  discount: number;
  salesTax: number;
  salesTaxPercent?: number;
  sales_tax_percent?: number;  // snake_case alternative from API
  taxAmount?: number | string;
  specification?: string;
  createdAt: string;      // ISO date
  updatedAt: string;      // ISO date
}

export interface StatusHistoryEntry {
  _id: string;
  orderId: string;
  status: string;
  deliveryDate: string | null;
  notes: string | null;
  changedBy: string | null;
  createdAt: string;
}

export interface SalesOrder {
  assignedStaff: never[];
  deliveryStatus: any;
  delivery: any;
  deliveryDate: string | number | Date;
  invoice: any;
  invoices?: any[];
  dueDate: string | Date;
  _id: string;
  publicId?: string;
  orderNumber: string;
  customerId: string;
  customer: Customer;
  orderDate: string;          // ISO date
  status: "pending" | "confirmed" | "shipped" | "completed" | "cancelled" | string;
  totalAmount: string;        // decimal
  taxAmount: string;          // decimal
  discountAmount: string;     // decimal
  netAmount: string;          // decimal
  shippingAddress: string;
  billingAddress: string | null;
  paymentStatus: "unpaid" | "partial" | "paid" | string;
  notes: string | null;
  totalInvoiceAmount: number;
  totalDiscount: number,
  totalPayableAmount: number | string;
  totalPaidAmount: number | string;
  grossPaidAmount?: number | string;
  refundedAmount?: number | string;
  createdBy: string;
  creator?: {
    name?: string;
    email?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  totalRefundedAmount?: number;
  dueRefundAmount?: number;
  items: SalesOrderItem[];
  statusHistory?: StatusHistoryEntry[];
}




export interface SalesOrderFormValues {
  orderDate: string;       // e.g., "2025-12-08T04:52:37.000Z"
  dueDate: string;         // e.g., "2025-12-15T00:00:00.000Z"
  customerId: string;
  shippingAddress: string;
  deliveryDate?: string;
  staffId?: string;
  notes?: string;
  items: {
    productId: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    salesTax: number;
    specification?: string;
    unit?: string;
    stockQuantity?: number;
    remark?: string;
  }[];
}


// TypeScript type for update payload
export type UpdateDeliveryPayload = {
  status: "pending" | "in_transit" | "delivered" | "failed" | "returned" | "confirmed" | "cancelled";
  deliveryDate: string | undefined;// ISO date string
  notes: string | undefined;
};





