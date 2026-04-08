
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

interface RoleDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function RoleDeleteDialog({ open, onOpenChange, onConfirm, isLoading }: RoleDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[400px]">
        <AlertDialogHeader>
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mx-auto mb-4 border border-red-100">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <AlertDialogTitle className="text-center font-bold text-gray-900">
            Delete Role
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-gray-500 leading-relaxed px-4">
            Are you absolutely sure? This action will permanently remove this role and its access rights.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl my-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-[11px] text-amber-800 leading-tight">
            Users assigned to this role will lose their current permissions.
          </p>
        </div>
        <AlertDialogFooter className="sm:justify-center gap-3">
          <AlertDialogCancel disabled={isLoading} className="rounded-xl px-6">
            Keep Role
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 rounded-xl px-8 shadow-lg shadow-red-500/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Confirm Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
