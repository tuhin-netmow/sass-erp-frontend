import { useState } from "react";
import { useGetAllCompaniesQuery, useUpdateCompanyStatusMutation, useUpdateCompanyPlanMutation } from "@/store/features/admin/adminApiService";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Building2, Database } from "lucide-react";
import { toast } from "sonner";
import { AdminDataTable } from "../components/shared/AdminDataTable";
import { createColumnHelper } from "@tanstack/react-table";

type TenantCompany = {
  _id: string;
  name: string;
  admin_email: string;
  domain: string;
  subscription_plan_id?: string | number;
  db_type: string;
  is_active: boolean;
};

type Plan = {
  _id: string;
  name: string;
  price?: {
    monthly?: number;
  };
};

const columnHelper = createColumnHelper<TenantCompany>();

export default function AdminCompaniesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { data, isLoading, refetch } = useGetAllCompaniesQuery({ search, page, limit: pageSize });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateCompanyStatusMutation();
  const [updatePlan, { isLoading: isUpdatingPlan }] = useUpdateCompanyPlanMutation();

  const companies = data?.data?.companies || [];
  const totalCount = data?.data?.totalCount || companies.length || 0;
  const plans = data?.data?.plans || [];

  const handleToggleStatus = async (companyId: string, currentStatus: boolean) => {
    try {
      await updateStatus({ companyId, isActive: !currentStatus }).unwrap();
      toast.success(`Company ${!currentStatus ? "activated" : "deactivated"} successfully`);
      refetch();
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to update company status");
    }
  };

  const handleChangePlan = async (companyId: string, planId: string) => {
    try {
      await updatePlan({ companyId, planId: parseInt(planId) }).unwrap();
      toast.success("Company plan updated successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to update company plan");
    }
  };

  const getDatabaseTypeBadge = (dbType: string) => {
    if (dbType === "dedicated") {
      return <Badge variant="default" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Dedicated</Badge>;
    }
    return <Badge variant="outline">Shared</Badge>;
  };

  const columns = [
    columnHelper.accessor("name", {
      header: "Company",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor("admin_email", {
      header: "Admin Email",
    }),
    columnHelper.accessor("domain", {
      header: "Domain",
      cell: (info) => (
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
          {info.getValue()}
        </code>
      ),
    }),
    columnHelper.display({
      id: "plan",
      header: "Plan",
      cell: (props) => (
        <Select
          defaultValue={props.row.original.subscription_plan_id?.toString()}
          onValueChange={(value) => handleChangePlan(props.row.original._id.toString(), value)}
          disabled={isUpdatingPlan}
        >
          <SelectTrigger className="w-40 h-8">
            <SelectValue placeholder="Select plan" />
          </SelectTrigger>
          <SelectContent>
            {plans.map((plan: Plan) => (
              <SelectItem key={plan._id.toString()} value={plan._id.toString()}>
                {plan.name} (${plan.price?.monthly || 0})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    }),
    columnHelper.accessor("db_type", {
      header: "Database",
      cell: (info) => (
        <div className="flex items-center gap-1">
          <Database className="h-3 w-3 text-muted-foreground" />
          {getDatabaseTypeBadge(info.getValue())}
        </div>
      ),
    }),
    columnHelper.accessor("is_active", {
      header: "Status",
      cell: (info) => (
        <Badge
          variant={info.getValue() ? "default" : "secondary"}
          className={
            info.getValue()
              ? "bg-green-100 text-green-800 hover:bg-green-100"
              : ""
          }
        >
          {info.getValue() ? "Active" : "Inactive"}
        </Badge>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (props) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleToggleStatus(props.row.original._id.toString(), props.row.original.is_active)}
          disabled={isUpdating}
          className="h-8"
        >
          {props.row.original.is_active ? "Deactivate" : "Activate"}
        </Button>
      ),
    }),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            Manage all tenant companies and their subscriptions
          </p>
        </div>
      </div>

      <AdminDataTable
        columns={columns as any}
        data={companies}
        totalCount={totalCount}
        pageIndex={page - 1}
        pageSize={pageSize}
        onPageChange={(newPage) => setPage(newPage + 1)}
        onPageSizeChange={setPageSize}
        search={search}
        onSearch={setSearch}
        isFetching={isLoading}
      />
    </div>
  );
}
