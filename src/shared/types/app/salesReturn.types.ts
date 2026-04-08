import type { Customer } from "@/shared/types/app/customers";
import type { Product } from "../common";


export interface SalesReturnItem {
  _id: string;
  id?: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  unit_price?: number;
  lineTotal: number;
  discount: number;
  taxAmount: number;
  remark?: string;
}

export interface SalesReturn {
  _id: string;
  id?: string;
  publicId?: string;
  returnNumber: string;
  return_number?: string;
  customerId: string;
  customer: Customer;
  orderId?: string;
  orderNumber?: string;
  returnDate: string;
  status: string;
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  totalPayableAmount: number;
  totalRefundedAmount?: number;
  dueRefundAmount?: number;
  notes?: string;
  items: SalesReturnItem[];
  createdAt: string;
  updatedAt: string;
}
