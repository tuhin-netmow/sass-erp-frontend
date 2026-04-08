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
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = "danger",
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[400px]">
        <AlertDialogHeader>
          {variant === "danger" && (
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mx-auto mb-4 border border-red-100">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          )}
          <AlertDialogTitle className="text-center font-bold text-gray-900">
            {title || (variant === "danger" ? "Confirm Action" : "Warning")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-gray-500 leading-relaxed px-4">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-3">
          <AlertDialogCancel disabled={isLoading} className="rounded-xl px-6">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700 rounded-xl px-8 shadow-lg shadow-red-500/20"
                : "rounded-xl px-8"
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
