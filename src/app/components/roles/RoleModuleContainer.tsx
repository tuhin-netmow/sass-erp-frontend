
import { useState } from "react";
import { RoleListTable } from "./RoleListTable";
import AddNewRoleForm from "./AddRoleForm";
import { Shield, Settings, Info, LayoutDashboard } from "lucide-react";

export function RoleModuleContainer() {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Header Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-linear-to-br from-blue-900 to-blue-800 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 -mr-12 -mt-12 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Shield className="w-7 h-7 text-blue-200" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-extrabold tracking-tight">Identity & Access</h1>
              <p className="text-blue-100/70 font-medium">RBAC Engine • SaaS Edition v2.0</p>
            </div>
          </div>
          <p className="max-w-[450px] text-sm text-blue-100 leading-relaxed font-medium">
            Define security boundaries, menu visibility, and real-time dashboard widgets for your organization's hierarchy. 
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
              <Settings className="w-4 h-4 text-blue-300" />
              <span className="text-xs font-bold uppercase tracking-wider">Granular Control</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/10">
              <LayoutDashboard className="w-4 h-4 text-blue-300" />
              <span className="text-xs font-bold uppercase tracking-wider">Widget Layouts</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center shrink-0">
          <AddNewRoleForm open={isAddOpen} setOpen={setIsAddOpen} />
        </div>
      </div>

      {/* Main List Table Container */}
      <div className="relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-linear-to-b from-blue-600/50 to-transparent rounded-full shadow-[0_0_15px_rgba(37,99,235,0.2)]"></div>
        <RoleListTable />
      </div>

      {/* Security Context Info Footnote */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl shadow-inner-sm">
        <div className="mt-0.5 p-1.5 bg-blue-100 rounded-lg shrink-0">
          <Info className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-[13px] text-gray-900 font-bold">Standardized Role Propagation</p>
          <p className="text-xs text-gray-500 leading-loose">
            Changes to role permissions are synchronized immediately across all active tenant users. 
            Ensure you audit dashboard widget visibility specifically for mobile compatibility before publishing production-grade roles.
          </p>
        </div>
      </div>
    </div>
  );
}
