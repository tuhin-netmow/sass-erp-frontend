// Customer API Types
export interface Contact {
    _id?: number;
    name: string;
    phone?: string;
    role?: string;
    email?: string;
    isPrimary?: boolean;
}

export interface Customer {
    _id: number;
    publicId?: string;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    image?: string | string[];
    images?: string[];
    taxId?: string;
    creditLimit?: number;
    outstandingBalance: number;
    totalSales?: number;
    purchaseAmount?: number;
    paidAmount?: number;
    dueAmount?: number;
    customerType: "individual" | "business" | "retail";
    salesRouteId?: number;
    notes?: string;
    isActive: boolean;
    thumbUrl?: string;
    galleryItems: string[];
    contacts?: Contact[];
    createdAt: string;
    updatedAt?: string;
}

export interface CreateCustomerRequest {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    thumbUrl?: string;
    galleryItems?: string[];
    taxId?: string;
    creditLimit?: number;
    outstandingBalance?: number;
    customerType?: "individual" | "business" | "retail";
    salesRouteId?: number;
    notes?: string;
    isActive?: boolean;
    contacts?: Contact[];
}

export interface UpdateCustomerRequest {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    image?: string | string[];
    images?: string[];
    taxId?: string;
    creditLimit?: number;
    outstandingBalance?: number;
    customerType?: "individual" | "business" | "retail";
    salesRouteId?: number;
    notes?: string;
    isActive?: boolean;
    contacts?: Contact[];
}

export interface GetCustomersParams {
    page?: number;
    limit?: number;
    customerType?: "individual" | "business" | "retail";
    isActive?: boolean;
    search?: string;
    sort?: string;
}

import type { Pagination } from "../api";

export interface GetCustomersResponse {
    success: boolean;
    message: string;
    pagination: Pagination;
    data: Customer[];
}

export interface CustomerResponse {
    status: boolean;
    message?: string;
    data: Customer;
}

export interface DeleteCustomerResponse {
    status: boolean;
    message: string;
}

export interface CustomerMapLocation {
    _id: number;
    name: string;
    company?: string;
    address?: string;
    city?: string;
    phone?: string;
    email?: string;
    coordinates: {
        lat: number;
        lng: number;
    };
}

export interface GetCustomerMapsResponse {
    status: boolean;
    data: {
        total: number;
        locations: CustomerMapLocation[];
    };
}
