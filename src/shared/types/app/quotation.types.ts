/* eslint-disable @typescript-eslint/no-explicit-any */

export interface QuotationItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  total: number;
  productName?: string;
  productCode?: string;
}

export interface Quotation {
  _id: string;
  id?: string;
  publicId?: string;
  customerId: string;
  quotationNumber: string;
  quotationDate: string;
  validUntil: string;
  items: QuotationItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  terms?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';
  convertedToOrderId?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    _id: string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
  };
  createdBy?: {
    _id: string;
    name: string;
  };
}

export interface CreateQuotationRequest {
  customerId: string;
  quotationDate?: string;
  validUntil?: string;
  items: QuotationItem[];
  discountAmount?: number;
  taxAmount?: number;
  notes?: string;
  terms?: string;
}

export interface UpdateQuotationRequest extends Partial<CreateQuotationRequest> {
  status?: Quotation['status'];
}
