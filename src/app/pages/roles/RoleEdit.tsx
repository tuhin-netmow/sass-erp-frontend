
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  useGetRoleByIdQuery,
  useUpdateRoleMutation,
} from "@/store/features/app/role/roleApiService";
import { ArrowLeft, Shield } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { RoleForm, type RoleFormValues } from "@/app/components/roles/RoleForm";

export default function RoleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: roleData, isLoading: isFetching } = useGetRoleByIdQuery(id as string, { skip: !id });
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

  const handleUpdate = async (values: RoleFormValues) => {
    try {
      await updateRole({ roleId: id as string, role: values }).unwrap();
      toast.success("Role permissions & configuration updated successfully");
      navigate("/dashboard/roles/list");
    } catch (error) {
      const err = error as any;
      toast.error(err?.data?.message || "Critical: Configuration Update Failed");
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col h-[500px] items-center justify-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-gray-400 font-mono tracking-widest uppercase animate-pulse">FETCHING SECURITY BINDINGS...</p>
      </div>
    );
  }

  const role = roleData?.data;

  return (
    <div className="max-w-[1000px] mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-blue-500/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 -mr-8 -mt-8 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors"></div>
        <div className="flex items-center gap-6 relative z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-2xl w-12 h-12 bg-gray-50 hover:bg-gray-100 border border-gray-100"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div className="space-y-1">
            <Badge  className="bg-blue-50 text-blue-600 border-blue-100 mb-1">Editing Node: {role?.name}</Badge>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Modify Role Assets</h1>
            <p className="text-sm text-gray-500 font-medium">Updated internal authorization context for {role?.displayName}</p>
          </div>
        </div>
        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl relative z-10 shrink-0 hidden md:block">
          <Shield className="w-8 h-8 text-blue-600 mb-1" />
          <p className="text-[10px] font-bold text-blue-800 uppercase leading-none">Security Protected Access</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-2xl shadow-blue-500/5 p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-600 to-transparent"></div>
        <RoleForm
          initialValues={{
            name: role?.name,
            displayName: role?.displayName,
            description: role?.description,
            status: role?.status,
            permissions: role?.permissions,
            menus: role?.menus,
            dashboards: role?.dashboards,
          }}
          onSubmit={handleUpdate}
          isLoading={isUpdating}
          submitLabel="Commit Configuration"
        />
      </div>
    </div>
  );
}

// Helper Badge component since I used it above
function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${className || ""}`}>
      {children}
    </span>
  );
}
