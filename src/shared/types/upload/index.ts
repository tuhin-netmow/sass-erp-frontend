/* =======================
   Upload Types
   ======================= */

export interface UploadResponse {
  id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  url: string;
  path: string;
  subdomain: string;
  module: string;
  companyId: string;
  meta?: {
    caption?: string | null;
    description?: string | null;
    altText?: string | null;
  };
}

export interface UploadListResponse {
  data: UploadResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    filters: {
      subdomain: string;
      module?: string | null;
    };
  };
}

export interface UploadMultipleResponse {
  count: number;
  files: UploadResponse[];
}
