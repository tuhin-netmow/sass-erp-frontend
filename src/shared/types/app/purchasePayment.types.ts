

export interface PurchasePayment {
  _id: string;
  id?: string;
  amount: number;
  invoiceId: string;
  purchaseOrderId: string;
totalPaidAmount: number;
  paymentDate: string;
  paymentMethod: "cash" | "bank_transfer" | "card" | "cheque";
  referenceNumber: string;
  status: "pending" | "completed" | "failed";
  notes?: string;

  createdBy: string;
  creator: {
    _id: string;
    name: string;
    email: string;
  }
  createdAt: string;
  updatedAt: string;

  purchaseOrder: {
    _id: string;
    poNumber: string;
    supplierId: string;
    totalAmount: number;
    status: string;
    orderDate: string;
    expectedDeliveryDate: string;
    supplier: {
      _id: string;
      name: string;
      email: string;
      phone: string;
      contactPerson: string;
    };
    netAmount: number;
    totalPayableAmount: number;
  };

  invoice: {
    _id: string;
    invoiceNumber: string;
    totalAmount: number;
    purchaseOrderId: string;
    status: string;
    dueDate: string;
    netAmount: number;
    totalPayableAmount: number;
  };
}
