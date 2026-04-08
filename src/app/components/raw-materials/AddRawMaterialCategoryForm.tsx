import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Input } from "@/shared/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Textarea } from "@/shared/components/ui/textarea";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { useAddRawMaterialCategoryMutation } from "@/store/features/admin/rawMaterialApiService";

const categorySchema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface AddRawMaterialCategoryFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function AddRawMaterialCategoryForm({ open, setOpen }: AddRawMaterialCategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true,
    },
  });

  const [addCategory, { isLoading }] = useAddRawMaterialCategoryMutation();

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      const res = await addCategory(values).unwrap();

      // Show success toast with message from API or default message
      const successMessage = res?.message || "Raw material category added successfully!";
      toast.success(successMessage);

      setOpen(false);
      form.reset();
    } catch (error: any) {
      console.error("Error adding category:", error);
      const errorMessage = error?.data?.message || error?.message || "Error adding category";
      toast.error(errorMessage);
    }
  };


  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Raw Material Category</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4 py-6">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Category name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Description (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Adding...
                </div>
              ) : (
                "Add Category"
              )}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
