import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { DataTable } from "@/app/components/dashboard/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import AddAttributeForm from "./AddAttributeForm";
import EditAttributeForm from "./EditAttributeForm";
// import { ACTIONS, MODULES } from "@/app/config/permissions";
// import { perm, usePermissions } from "@/shared/hooks/usePermissions";

export interface Attribute {
  id: number;
  name: string;
  values: string[];
  variant: string;
}

const attributes: Attribute[] = [
  {
    id: 1,
    name: "Size",
    values: ["Small", "Medium", "Large"],
    variant: "Yes",
  },
  {
    id: 2,
    name: "Color",
    values: ["Red", "Blue", "Green"],
    variant: "Yes",
  },
];

export default function Attributes() {
  // --- Permissions (uncomment to activate) ---
  // const { hasPermission, isAdmin } = usePermissions();
  // const canViewProduct = isAdmin || hasPermission(perm(MODULES.PRODUCTS, ACTIONS.VIEW));
  // const canCreateProduct = isAdmin || hasPermission(perm(MODULES.PRODUCTS, ACTIONS.CREATE));
  // const canEditProduct = isAdmin || hasPermission(perm(MODULES.PRODUCTS, ACTIONS.UPDATE));
  // const canDeleteProduct = isAdmin || hasPermission(perm(MODULES.PRODUCTS, ACTIONS.DELETE));

  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const columns: ColumnDef<Attribute>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Attribute Name" },
    {
      accessorKey: "values", header: "Values", cell: ({ row }) => {
        const values = row.original.values as string[];
        return (
          <div className="flex flex-wrap gap-2">
            {values.map((value) => (
              <span
                key={value}
                className="py-1 px-2 rounded-full text-xs text-white font-medium bg-gray-500"
              >
                {value}
              </span>
            ))}
          </div>
        );
      }
    },
    {
      accessorKey: "variant",
      header: "Variant?",
      cell: ({ row }) => {
        const status = row.original.variant as string;
        const bgColor =
          status.toLowerCase() === "yes" ? "bg-green-500" : "bg-gray-500";
        return (
          <span
            className={`py-1 px-3 rounded-full text-xs text-white font-medium ${bgColor}`}
          >
            {status}
          </span>
        );
      },
    },

    {
      header: "Actions",
      cell: ({ row }) => {
        const attribute = row.original as Attribute;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditSheetOpen(true);
              }}
            >
              Edit
            </Button>

            <Button
              variant="destructive"
              onClick={() => alert("Delete" + attribute.id)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Attributes</h1>

        <Button onClick={() => setAddSheetOpen(true)}>+ Add new attribute</Button>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={attributes} />

      {/* Add Form */}
      <AddAttributeForm open={addSheetOpen} onOpenChange={setAddSheetOpen} />

      {/* Edit Form */}
      <EditAttributeForm open={editSheetOpen} onOpenChange={setEditSheetOpen} />
    </div>
  );
}
