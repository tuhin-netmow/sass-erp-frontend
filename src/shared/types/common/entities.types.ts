/* =======================
   Common Entity Types
   ======================= */

export type Department = {
  _id: string;
  name: string;
  description: string;
};

export type Category = {
  _id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  isActive: boolean;
};

export type Unit = {
  _id: string;
  name: string;
  symbol: string;
  isActive: boolean;
};

export type Product = {
  _id: string;
  publicId: string;
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  unitId: string;
  price: number;
  cost: number;
  initialStock: number;
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  purchaseTax: number;
  salesTax: number;
  weight: number;
  width: number;
  height: number;
  length: number;
  barcode: string | null;
  thumbUrl: string;
  galleryItems: string[];
  specification?: string;
  isActive: boolean;
  category: Category;
  unit: Unit;
};

export type Stock = {
  operation: string;
  quantity: number;
  productId: string;
};

export type StockMovement = {
  _id: string;
  name: string;
  productId: string;
  movementType: string;
  quantity: number;
  referenceType: string;
  referenceId: string | null;
  date: string;
  notes: string | null;
  product?: Product;
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  _id: string;
  orderNumber: string;
  customer: string;
  customerId: string;
  date: string;
  dueDate: string | "-";
  status:
    | "Pending"
    | "Delivered"
    | "Confirmed"
    | "Processing"
    | "Draft"
    | "Shipped";
  amount: number;
  staff: string | "-";
};

export type Payment = {
  _id: string;
  amount: number;
  invoiceId: string | null;
  orderId: string;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string;
  status: string;
  createdBy: string;
  creator: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type WarehouseOrder = {
  orderId: string;
  customer: string;
  total: number;
  date: string;
  status: "confirmed";
};

export interface BankDetails {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
}

export interface AllowanceDeduction {
  name: string;
  amount: number;
}
import type { Role } from "../auth";

export interface Staff {
  _id: string;
  id?: string;
  employeeId?: string;
  publicId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  departmentId?: string | number;
  department?: string | { _id?: string; name?: string } | null;
  position?: string;
  roleId?: string | number;
  status?: "active" | "inactive" | "on_leave" | "terminated";
  hireDate?: string;
  salary?: number;
  basicSalary?: number;
  bankDetails?: BankDetails;
  allowances?: AllowanceDeduction[];
  deductions?: AllowanceDeduction[];
  role?: Role;
  thumbUrl?: string;
  galleryItems?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type Settings = {
  companyName: string;
  email: string;
  phone: string;
  description: string;
  address: string;
  currency: string;
  logoUrl: string;
};
