import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";

import { UserPlus, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useGetAllRolesQuery } from "@/store/features/app/role/roleApiService";
import { useAddUserMutation } from "@/store/features/app/users/usersApiService";
import { toast } from "sonner";
import { useState } from "react";
import { RoleSelectField } from "@/app/components/roles/RoleSelectField";
import { Textarea } from "@/shared/components/ui/textarea";

// -------------------- ZOD SCHEMA --------------------
const userSchema = z.object({
  name: z.string().min(1, "Required"),
  email: z.email("Invalid email"),
  password: z.string().min(4, "Password must be at least 4 characters"),
  roleId: z.string().min(1, "Required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function AddUserPage() {
  const navigate = useNavigate();
  const [page] = useState(1);
  const [search] = useState("");
  const limit = 100; // Get all roles
  const { data: rolesData, isLoading } = useGetAllRolesQuery({
    page,
    limit,
    search,
  });
  const [addUser, { isLoading: isAdding }] = useAddUserMutation();

  console.log("rolesData", rolesData);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      roleId: "",
      phone: "",
      address: "",
      status: "active",
    },
  });

  const { control, handleSubmit } = form;

  const onSubmit: SubmitHandler<UserFormValues> = async (values) => {
    try {
      const result = await addUser(values).unwrap();
      if (result.success) {
        toast.success(result.message || "User added successfully");
        form.reset();
        navigate("/dashboard/users/list");
      } else {
        toast.error(result.message || "Failed to add user");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      const err = error as {
        data: {
          message: string;
        };
      };
      toast.error(err.data.message || "An error occurred while adding the user");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Add User
          </h1>
          <p className="text-muted-foreground mt-2">Create a new user account with role assignment</p>
        </div>
        <Link to="/dashboard/users/list">
          <button className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Users
          </button>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b-1 border-blue-100 dark:border-blue-900 py-3 gap-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">User Details</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Name, email, password, and role</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2 pb-6">
            {/* NAME */}
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Full Name</FieldLabel>
                  <Input placeholder="John Doe" {...field} />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            {/* EMAIL */}
            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input placeholder="john@example.com" type="email" {...field} />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            {/* PASSWORD */}
            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <Input placeholder="******" type="password" {...field} />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            {/* PHONE */}
            <Controller
              control={control}
              name="phone"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Phone (Optional)</FieldLabel>
                  <Input placeholder="+1 234 567 8900" {...field} />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            {/* ROLE */}
            <Controller
              name="roleId"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Role</FieldLabel>
                  <RoleSelectField
                    field={field}
                    disabled={isLoading}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            {/* STATUS */}
            <Controller
              control={control}
              name="status"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    defaultValue="active"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            {/* ADDRESS - Full Width */}
            <Controller
              control={control}
              name="address"
              render={({ field, fieldState }) => (
                <Field className="md:col-span-2">
                  <FieldLabel>Address (Optional)</FieldLabel>
                  <Textarea
                    placeholder="Enter full address"
                    rows={2}
                    {...field}
                  />
                  <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-4">
          <button
            type="submit"
            disabled={isAdding}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3 font-semibold text-white shadow-lg shadow-blue-500/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/50 active:translate-y-0 active:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
          >
            {isAdding ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Create User</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
