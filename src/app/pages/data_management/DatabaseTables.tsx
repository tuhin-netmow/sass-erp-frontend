"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { DataTable } from "@/app/components/dashboard/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { useGetAllTablesQuery, useGetTableDataQuery } from "@/store/features/admin/databaseApiService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Loader2 } from "lucide-react";

export default function DatabaseTables() {
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: tablesData, isLoading: tablesLoading } = useGetAllTablesQuery();
  // Fetch data only if a table is selected
  const { data: tableContent, isFetching: contentFetching } = useGetTableDataQuery(
    { tableName: selectedTable, page, limit },
    { skip: !selectedTable }
  );

  const tables = tablesData?.data || [];
  const rows = tableContent?.data?.data || [];
  const totalCount = tableContent?.data?.pagination?.total || 0;

  // Dynamically generate columns based on the first row of data
  const columns: ColumnDef<any>[] = React.useMemo(() => {
    if (rows.length === 0) return [];

    // Sort keys alphabetically or in some predictable order if needed
    const keys = Object.keys(rows[0]);

    return keys.map((key) => ({
      accessorKey: key,
      header: key,
      cell: ({ row }) => {
        const val = row.getValue(key);
        // Render objects/arrays as JSON string
        if (typeof val === 'object' && val !== null) {
          return <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px] block" title={JSON.stringify(val)}>{JSON.stringify(val)}</span>
        }
        return <span className="font-medium text-sm truncate max-w-[200px] block" title={String(val)}>{String(val)}</span>;
      },
    }));
  }, [rows]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Database Viewer</h1>
          <p className="text-muted-foreground text-sm">Select a table to view its contents.</p>
        </div>

        <div className="w-full md:w-[300px]">
          {tablesLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading tables...
            </div>
          ) : (
            <Select value={selectedTable} onValueChange={(val) => { setSelectedTable(val); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a Table" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {Array.isArray(tables) && tables.map((t: any) => {
                  const tName = typeof t === 'string' ? t : t.tableName;
                  return (
                    <SelectItem key={tName} value={tName}>
                      {tName}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <Card className="shadow-sm border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">
            {selectedTable ? `Table: ${selectedTable}` : "No Table Selected"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedTable ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
              Please select a table from the dropdown above.
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={rows}
              pageIndex={page - 1}
              pageSize={limit}
              onPageChange={(newPage) => setPage(newPage + 1)}
              totalCount={totalCount}
              isFetching={contentFetching}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
