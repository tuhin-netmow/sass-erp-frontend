

export type Supplier = {
  postalCode: string | undefined;
  state: string | undefined;
  code: string | undefined;
  _id: string; // MongoDB _id
  id?: string;
  publicId?: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  paymentTerms: string;
  isActive: boolean;
  createdAt?: string; // optional, usually returned from API
  updatedAt?: string; // optional
  longitude?: number; // optional
  latitude?: number; // optional
  totalPurchaseAmount?: string | number;
  totalPaidAmount?: string | number;
  totalDueAmount?: string | number;
  thumbUrl?: string;
  galleryItems?: string | string[]; // Can be string (JSON) or array

};
