
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import { generateAvailablePermissions } from "@/app/config/permissions";


interface RolePermissionsMatrixProps {
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
}

const availablePermissions = generateAvailablePermissions();

// Group permissions by category
const permissionsByCategory = availablePermissions.reduce((acc, perm) => {
  if (!acc[perm.category]) {
    acc[perm.category] = [];
  }
  acc[perm.category].push(perm);
  return acc;
}, {} as Record<string, typeof availablePermissions>);

export function RolePermissionsMatrix({ selectedPermissions, onChange }: RolePermissionsMatrixProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(Object.keys(permissionsByCategory)[0] || "Dashboard");

  const togglePermission = (permission: string) => {
    if (selectedPermissions.includes(permission)) {
      onChange(selectedPermissions.filter((p) => p !== permission));
    } else {
      onChange([...selectedPermissions, permission]);
    }
  };

  const selectAllInCategory = (category: string) => {
    const categoryPermissions = permissionsByCategory[category]?.map(p => p.value) || [];
    const allSelected = categoryPermissions.every(p => selectedPermissions.includes(p));

    if (allSelected) {
      onChange(selectedPermissions.filter(p => !categoryPermissions.includes(p)));
    } else {
      onChange([...selectedPermissions, ...categoryPermissions.filter(p => !selectedPermissions.includes(p))]);
    }
  };

  const isCategoryFullySelected = (category: string) => {
    const categoryPermissions = permissionsByCategory[category]?.map(p => p.value) || [];
    return categoryPermissions.length > 0 && categoryPermissions.every(p => selectedPermissions.includes(p));
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Categories List */}
      <div className="w-full md:w-1/4 space-y-1">
        {Object.keys(permissionsByCategory).map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`
              w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-all
              ${selectedCategory === category
                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                : "text-gray-600 hover:bg-gray-100"
              }
            `}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Permissions Grid */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{selectedCategory} Actions</h3>
            <Badge variant="outline" className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50">
              {permissionsByCategory[selectedCategory]?.length || 0} Total
            </Badge>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => selectAllInCategory(selectedCategory)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8"
          >
            {isCategoryFullySelected(selectedCategory) ? "Deselect All" : "Select Category"}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {permissionsByCategory[selectedCategory]?.map((permission) => {
            const isSelected = selectedPermissions.includes(permission.value);
            return (
              <label
                key={permission.value}
                className={`
                  flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer group
                  ${isSelected
                    ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                  }
                `}
              >
                <div className="mt-1">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => togglePermission(permission.value)}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                    {permission.label}
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono mt-0.5 truncate uppercase">
                    {permission.value}
                  </p>
                </div>
                <Check className={`w-4 h-4 text-blue-600 transition-opacity ${isSelected ? "opacity-100" : "opacity-0"}`} />
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
