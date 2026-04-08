/* =======================
   Database Types
   ======================= */

export interface TableDataResponse {
  status: boolean;
  message: string;
  data: {
    data: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface TablesListResponse {
  status: boolean;
  message: string;
  data: { tableName: string }[] | string[];
}
