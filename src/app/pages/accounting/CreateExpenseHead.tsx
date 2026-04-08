import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PlusCircle, Loader, ShieldAlert } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";

import { ACTIONS, MODULES } from "@/app/config/permissions";
import { perm, usePermissions } from "@/shared/hooks/usePermissions";
import { useCreateExpanseHeadMutation } from "@/store/features/app/accounting/accoutntingApiService";

/* ------------------ ZOD SCHEMA ------------------ */
const expenseHeadSchema = z.object({
  code: z.string().min(1, "Account code is required"),
  name: z.string().min(1, "Expense head name is required"),
});

type ExpenseHeadFormValues = z.infer<typeof expenseHeadSchema>;

/* ------------------ COMPONENT ------------------ */
export default function CreateExpenseHeadForm() {
  const [open, setOpen] = useState(false);

  // --- Permissions ---
  const { hasPermission, isAdmin } = usePermissions();
  const canCreateExpenseHead = isAdmin || hasPermission(perm(MODULES.ACCOUNTING, ACTIONS.CREATE));

  const form = useForm<ExpenseHeadFormValues>({
    resolver: zodResolver(expenseHeadSchema),
    defaultValues: {
      code: "",
      name: "",
    },
  });

  const [addExpenseHead, { isLoading }] = useCreateExpanseHeadMutation();

  /* ------------------ SUBMIT HANDLER ------------------ */
  const handleSubmit = async (values: ExpenseHeadFormValues) => {
    const payload = {
      code: values.code,
      name: values.name,
      type: "EXPENSE", //  mandatory & fixed
    };

    try {
      const res = await addExpenseHead(payload).unwrap();

      if (res?.status) {
        toast.success(res.message || "Expense Head created successfully");
        form.reset();
        setOpen(false);
      } else {
        toast.error(res?.message || "Failed to create Expense Head");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
        "Something went wrong while creating Expense Head"
      );
    }
  };

  /* ------------------ UI ------------------ */
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white">
          <PlusCircle className="h-4 w-4" />
          Add Expense Head
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full max-w-[400px]">
        <SheetHeader>
          <SheetTitle>Add Expense Head</SheetTitle>
        </SheetHeader>

        <div className="px-4 pt-6">
          {!canCreateExpenseHead ? (
            /* -------- ACCESS DENIED -------- */
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                <ShieldAlert className="h-10 w-10 text-destructive" />
              </div>
              <h2 className="text-lg font-semibold">Access Denied</h2>
              <p className="text-sm text-muted-foreground">
                You do not have permission to create an Expense Head.
                <br />
                Please contact your administrator.
              </p>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          ) : (
            /* -------- FORM -------- */
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-5"
              >
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 5500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expense Head Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Travel Expense"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* INFO */}
                <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                  Account Type: <strong>EXPENSE</strong>
                </div>

                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      Adding...
                    </span>
                  ) : (
                    "Add Expense Head"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
