"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { CalendarIcon, ChevronDown, Check, UserCog, Info, CheckCircle2, Eye, EyeOff, ImageIcon } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/shared/components/ui/popover";
import { Calendar } from "@/shared/components/ui/calendar";
import { cn } from "@/shared/utils/utils";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router";
import {
  useGetStaffByIdQuery,
  useUpdateStaffMutation,
} from "@/store/features/app/staffs/staffApiService";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import ImageUploaderPro from "@/shared/components/form/ImageUploaderPro";
import type { Staff } from "@/shared/types/common/entities.types";
import { useGetAllDepartmentsQuery } from "@/store/features/admin/departmentApiService";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import { useAppSelector } from "@/store/store";
import { BackButton } from "@/shared/components/common/BackButton";
import { useGetAllRolesQuery } from "@/store/features/app/role/roleApiService";

// =====================================================
//  FORM SCHEMA
// =====================================================
const StaffSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  address: z.string().optional(),
  department: z.number().min(1, "Required"),
  position: z.string().optional(),
  hireDate: z.string().optional(),
  salary: z.number().optional(),
  status: z.enum(["active", "terminated", "on_leave"]),
  image: z.string().optional(),
  galleryItems: z.array(z.string()).optional().nullable(),
  password: z.string().min(4, "Password must be at least 4 characters").optional().or(z.literal("")),
  roleId: z.number().optional(),
});

type StaffFormValues = z.infer<typeof StaffSchema>;

// =====================================================
//  EDIT PAGE
// =====================================================
export default function EditStaffPage() {
  const [open, setOpen] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [page] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const limit = 10;
  const { staffId } = useParams<{ staffId: string }>();
  const { data, isLoading: isFetching } = useGetStaffByIdQuery(staffId!);
  const [updateStaff, { isLoading: isUpdating }] = useUpdateStaffMutation();

  const [rolePage] = useState(1);
  const [roleSearch] = useState("");
  const roleLimit = 100;

  const { data: rolesData } = useGetAllRolesQuery({
    page: rolePage,
    limit: roleLimit,
    search: roleSearch,
  });

  const currency = useAppSelector((state) => state.currency.value);

  const navigate = useNavigate();

  const { data: fetchedDepartments } = useGetAllDepartmentsQuery({
    page,
    limit,
    search,
  });

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(StaffSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      department: 0,
      position: "",
      hireDate: "",
      salary: 0,
      status: "active",
      image: "",
      galleryItems: [],
      password: "",
      roleId: undefined,
    },
  });

  const staff: Staff | undefined = Array.isArray(data?.data)
    ? data?.data[0]
    : data?.data;

  // Reset initialization when staffId changes (e.g. navigating to another staff)
  useEffect(() => {
    setIsInitialized(false);
  }, [staffId]);

  useEffect(() => {
    if (staff && !isInitialized) {
      form.reset({
        firstName: staff?.firstName,
        lastName: staff?.lastName,
        email: staff?.email,
        phone: staff?.phone || "",
        address: staff?.address || "",
        department: Number(staff?.departmentId) || 0,
        position: staff?.position || "",
        hireDate: staff?.hireDate || "",
        salary: staff?.salary || 0,
        status: staff.status === "inactive" ? "terminated" : staff.status,
        image: staff?.thumbUrl || "",
        galleryItems: staff?.galleryItems || [],
        password: "", // Usually we don't load the password from backend for security
        roleId: staff?.roleId !== null && staff?.roleId !== undefined
          ? Number(staff.roleId)
          : (staff?.role?._id ? Number(staff.role._id) : undefined),
      });
      setIsInitialized(true);
    }
  }, [staff, form, isInitialized]);

  // =====================================================
  //  SUBMIT HANDLER
  // =====================================================
  const onSubmit = async (values: StaffFormValues) => {
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone || "",
      address: values.address || "",
      departmentId: String(values.department || 0),
      position: values.position || "",
      hireDate: values.hireDate || "",
      salary: values.salary || 0,
      status: values.status,
      thumbUrl: values.image,
      galleryItems: values.galleryItems || [],
      password: values.password || undefined,
      roleId: values.roleId ?? undefined,
    };
    try {
      // const fd = new FormData();

      // Object.entries(values).forEach(([key, val]) => {
      //   if (val !== null && val !== undefined) {
      //     if (key === "image") {
      //       if (val) fd.append("image", val);
      //     } else fd.append(key, String(val));
      //   }
      // });

      // const res = await updateStaff({ id, data: fd }).unwrap();
      const res = await updateStaff({ id: staffId!, body: payload }).unwrap();

      if (res.status) {
        toast.success("Staff updated successfully!");
        navigate("/dashboard/staffs");
      }
    } catch (err) {
      toast.error("Failed to update staff.");
      console.log(err);
    }
  };

  if (isFetching) return <p>Loading...</p>;

  return (
    <div className="w-full max-w-7xl mx-auto pb-6">
      {/* PAGE TITLE */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Edit Staff Member
          </h1>
          <p className="text-muted-foreground mt-2">Update staff profile and employment details</p>
        </div>
        <BackButton />
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
              e.preventDefault();
            }
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COLUMN 1: STAFF INFO + GALLERY */}
            <div className="space-y-6 lg:col-span-2">
              <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b-1 border-blue-100 dark:border-blue-900 py-3 gap-0">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
                      <UserCog className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Staff Information</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Personal and employment details</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-6">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                    {/* Left side: Form fields */}
                    <div className="flex-1">
                      <div className="space-y-4">

                        {/* FIRST + LAST NAME */}
                        <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-6">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name *</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="First name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name *</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Last name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* ROW 2: EMAIL + PASSWORD */}
                        <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-6">
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email *</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="email@example.com" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      type={showPassword ? "text" : "password"}
                                      placeholder="••••••••"
                                      className="pr-10"
                                      {...field}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowPassword(!showPassword)}
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                                    >
                                      {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                      ) : (
                                        <Eye className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* ROW 3: PHONE + DEPARTMENT */}
                        <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-6">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="+60123456789" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => {
                              const selected = fetchedDepartments?.data?.find(
                                (dept) => Number(dept._id) === Number(field.value)
                              );

                              return (
                                <FormItem>
                                  <FormLabel>Department</FormLabel>
                                  <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        type="button"
                                        aria-expanded={open}
                                        className="w-full justify-between font-medium"
                                      >
                                        {selected
                                          ? selected?.name
                                          : "Select department..."}
                                        <ChevronDown className="opacity-50 h-4 w-4" />
                                      </Button>
                                    </PopoverTrigger>

                                    <PopoverContent className="w-full p-0">
                                      <Command>
                                        {/* Search input */}
                                        <CommandInput
                                          placeholder="Search category..."
                                          className="h-9"
                                          value={search}
                                          onValueChange={setSearch}
                                        />

                                        <CommandList>
                                          <CommandEmpty>
                                            No department found.
                                          </CommandEmpty>

                                          <CommandGroup>
                                            {fetchedDepartments?.data?.map((dept) => (
                                              <CommandItem
                                                key={dept?._id}
                                                value={`${dept?.name}-${dept?._id}`} // unique, string
                                                onSelect={() => {
                                                  field.onChange(dept?._id); // convert back to number
                                                  setOpen(false);
                                                }}
                                              >
                                                {dept?.name}
                                                <Check
                                                  className={cn(
                                                    "ml-auto h-4 w-4",
                                                    Number(field.value) ===
                                                      Number(dept?._id)
                                                      ? "opacity-100"
                                                      : "opacity-0"
                                                  )}
                                                />
                                              </CommandItem>
                                            ))}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />

                        </div>

                        {/* ROW 3.5: ADDRESS (Full Width) */}
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Street address" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* ROW 4: POSITION + HIRE DATE */}
                        <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-6">
                          <FormField
                            control={form.control}
                            name="position"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Position *</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Position" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="hireDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Hire Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        type="button"
                                        className={cn(
                                          "w-full justify-start text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value
                                          ? new Date(field.value).toLocaleDateString()
                                          : "Pick date"}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="p-0">
                                    <Calendar
                                      mode="single"
                                      selected={
                                        field.value ? new Date(field.value) : undefined
                                      }
                                      onSelect={(date: Date | undefined) => {
                                        if (date) {
                                          field.onChange(date.toISOString());
                                        }
                                      }}

                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* ROW 5: SALARY + STATUS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-6">
                          <FormField
                            control={form.control}
                            name="salary"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Salary {`${currency ? `(${currency})` : ""}`}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(e.target.valueAsNumber)
                                    }
                                    placeholder="1000"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Status <span className="text-red-600">*</span>
                                </FormLabel>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <FormControl>
                                    <SelectTrigger className="w-full">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="terminated">Terminated</SelectItem>
                                    <SelectItem value="on_leave">On Leave</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="roleId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role</FormLabel>

                              <Select
                                key={rolesData?.data ? `role-loaded-${field.value}` : `role-loading-${field.value}`}
                                value={field.value !== undefined && field.value !== null ? String(field.value) : ""}
                                onValueChange={(val) => field.onChange(Number(val))}
                                disabled={isUpdating}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Role" />
                                  </SelectTrigger>
                                </FormControl>

                                <SelectContent>
                                  {/* Always include assigned roleId as an option to prevent it being "missing" */}
                                  {(staff?.roleId || staff?.role?._id) && (
                                    <SelectItem value={String(staff?.roleId || staff?.role?._id)}>
                                      {staff?.role?.displayName || `Role ${staff?.roleId || staff?.role?._id}`}
                                    </SelectItem>
                                  )}
                                  {Array.isArray(rolesData?.data) &&
                                    rolesData.data
                                      .filter((r) => Number(r._id) !== Number(staff?.roleId || staff?.role?._id))
                                      .map((role) => (
                                        <SelectItem key={role._id} value={String(role._id)}>
                                          {role?.displayName}
                                        </SelectItem>
                                      ))}
                                </SelectContent>
                              </Select>

                              <FormMessage />
                            </FormItem>
                          )}
                        />

                      </div>
                    </div>

                    {/* Right side: Profile Image */}
                    <div className="flex md:justify-end">
                      <div>
                        <FormField
                          control={form.control}
                          name="image"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Profile Image</FormLabel>
                              <ImageUploaderPro
                                value={field.value}
                                onChange={(file) => field.onChange(file)}
                              />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* STAFF GALLERY */}
              <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b-1 border-blue-100 dark:border-blue-900 py-3 gap-0">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
                      <ImageIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Staff Gallery</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Upload additional staff images</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <FormField
                    control={form.control}
                    name="galleryItems"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Gallery</FormLabel>
                        <ImageUploaderPro
                          value={field.value || []}
                          onChange={(file) => field.onChange(file)}
                          multiple
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* RIGHT INFO BOX */}
            <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg h-fit">
              <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b-2 border-blue-100 dark:border-blue-900 py-3 gap-0">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
                    <Info className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Information</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Important notes</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pb-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">You can update any field of this staff member.</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Email must remain unique.</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Uploading a new image will replace the old one.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SAVE BUTTON */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3 font-semibold text-white shadow-lg shadow-blue-500/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/50 active:translate-y-0 active:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
            >
              {isUpdating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
