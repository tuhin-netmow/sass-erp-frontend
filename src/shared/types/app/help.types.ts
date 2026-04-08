/* =======================
   Help Types
   ======================= */

export interface HelpArticle {
  _id: string;
  publicId: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  tags: string[];
  order: number;
  isPublished: boolean;
  views: number;
  helpfulCount: number;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FAQ {
  _id: string;
  publicId: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isPublished: boolean;
  views: number;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HelpVideo {
  _id: string;
  publicId: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  duration: number;
  category: string;
  tags: string[];
  order: number;
  isPublished: boolean;
  views: number;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicket {
  _id: string;
  publicId: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "pending" | "resolved" | "closed";
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  rating?: number;
  feedback?: string;
  resolvedAt?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  _id: string;
  publicId: string;
  ticketId: string;
  message: string;
  attachments: string[];
  sentBy: {
    id: string;
    name: string;
    role: string;
  };
  isInternal: boolean;
  createdAt: string;
}

export interface TicketStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  averageResolutionTime: number;
  ticketsByPriority: Record<string, number>;
  ticketsByCategory: Record<string, number>;
}

export interface HelpResponse<T> {
  status: boolean;
  message: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface HelpQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  tags?: string;
}

export interface TicketQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
}
