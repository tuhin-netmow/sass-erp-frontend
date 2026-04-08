/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Staff } from "../common";



export interface SalesRoute {
  endLng: number;
  endLat: number;
  customers: any;
  assignedStaff: any;
  _id: string;
  id?: string;
  routeName: string;
  description: string | null;
  isActive: boolean;

  // Geographic Details
  country: string;
  state: string;
  city: string;
  postalCode: string;

  // Route Path
  startLocation: string;
  endLocation: string;

  // Map & Technical Parameters
  centerLat: number;
  centerLng: number;
  coverageRadius: number;
  zoomLevel: number;

  // Assignments
  assignedSalesRepId: string | null;
  assignedStaffMembers: Staff[]

  // Metadata
  createdAt: string; // ISO 8601 Date String
  updatedAt: string; // ISO 8601 Date String
}
