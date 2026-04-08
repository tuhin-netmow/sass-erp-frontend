/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/shared/components/ui/form";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router";
import { Building2, MapPin, User, CheckCircle2, ImageIcon } from "lucide-react";
import { AddressAutocomplete } from "@/shared/components/form/AddressAutocomplete";
import {
  useGetSupplierByIdQuery,
  useUpdateSupplierMutation
} from "@/store/features/app/suppliers/supplierApiService";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { BackButton } from "@/shared/components/common/BackButton";
import ImageUploaderPro from "@/shared/components/form/ImageUploaderPro";
import { Button } from "@/shared/components/ui/button";

/* ------------------ ZOD SCHEMA ------------------ */
const supplierSchema = z.object({
  name: z.string().min(1, "Required"),
  code: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  phone: z.string().optional(),
  contactPerson: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1, "Required"),
  paymentTerms: z.string().optional(),
  status: z.enum(["Active", "Inactive"]),
  thumbUrl: z.string().optional(),
  galleryItems: z.array(z.string()).optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

/* ------------------ PAGE ------------------ */
export default function EditSupplierPage() {
  const navigate = useNavigate();
  const { supplierId } = useParams();
  const { data: supplierData, isLoading: isFetching } = useGetSupplierByIdQuery(supplierId as string);
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      code: "",
      email: "",
      phone: "",
      contactPerson: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Malaysia",
      paymentTerms: "",
      status: "Active",
      latitude: 0,
      longitude: 0,
      thumbUrl: "",
      galleryItems: [],
    },
  });

  const { reset } = form;

  // Prefill form
  useEffect(() => {
    if (supplierData?.data && !Array.isArray(supplierData.data)) {
      const s = supplierData.data;
      reset({
        name: s.name,
        code: s.code,
        email: s.email,
        phone: s.phone,
        contactPerson: s.contactPerson,
        address: s.address,
        city: s.city,
        state: s.state,
        postalCode: s.postalCode,
        country: s.country,
        paymentTerms: s.paymentTerms,
        status: s.isActive ? "Active" : "Inactive",
        latitude: s.latitude || 0,
        longitude: s.longitude || 0,
        thumbUrl: s.thumbUrl || "",
        galleryItems: s.galleryItems ? (typeof s.galleryItems === 'string' ? JSON.parse(s.galleryItems) : s.galleryItems) : [],
      });
    }
  }, [supplierData, reset]);

  const onSubmit: SubmitHandler<SupplierFormValues> = async (values) => {
    try {
      const payload = {
        name: values.name,
        code: values.code,
        contactPerson: values.contactPerson,
        email: values.email,
        phone: values.phone,
        address: values.address,
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
        country: values.country,
        paymentTerms: values.paymentTerms,
        latitude: values.latitude,
        longitude: values.longitude,
        isActive: values.status === "Active",
        thumbUrl: values.thumbUrl || "",
        galleryItems: values.galleryItems || [],
      };

      const res = await updateSupplier({ id: supplierId as string, body: payload }).unwrap();

      // Show success toast with message from API or default message
      const successMessage = res?.message || "Supplier updated successfully";
      toast.success(successMessage);

      // Small delay to show the toast before navigating
      setTimeout(() => {
        navigate("/dashboard/suppliers");
      }, 500);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.data?.message || error?.message || "Failed to update supplier";
      toast.error(errorMessage);
    }
  };

  if (isFetching) return <p>Loading supplier data...</p>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-6">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Update Supplier
          </h1>
          <p className="text-muted-foreground mt-2">Update supplier profile and contact information</p>
        </div>
        <BackButton />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* BASIC INFORMATION */}
          <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b-1 border-blue-100 dark:border-blue-900 py-3 gap-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Basic Information</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Essential supplier details and contact information</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                {/* Left side: Form fields */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Supplier Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supplier Code (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., SUP001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="supplier@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="+60 123-456-7890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="paymentTerms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Terms</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Net 30" {...field} />
                          </FormControl>
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
                      name="thumbUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supplier Logo</FormLabel>
                          <ImageUploaderPro
                            value={field.value}
                            onChange={field.onChange}
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

          {/* SUPPLIER GALLERY */}
          <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b-1 border-blue-100 dark:border-blue-900 py-3 gap-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Supplier Gallery</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Upload images of products or premises</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <FormField
                control={form.control}
                name="galleryItems"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Gallery</FormLabel>
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

          {/* ADDRESS */}
          <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b-1 border-blue-100 dark:border-blue-900 py-3 gap-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Address Details</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Location and geographical information</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 pb-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <AddressAutocomplete
                        {...field}
                        placeholder="Search address"
                        onAddressSelect={(details) => {
                          field.onChange(details.address);
                          form.setValue("city", details.city);
                          form.setValue("state", details.state);
                          form.setValue("postalCode", details.postalCode);
                          form.setValue("country", details.country);
                          form.setValue("latitude", details.latitude);
                          form.setValue("longitude", details.longitude);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State / Province</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Postal code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="e.g. 40.7128"
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="e.g. -74.0060"
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* STATUS */}
          <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b-1 border-blue-100 dark:border-blue-900 py-3 gap-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Status</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Set supplier availability status</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-6">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* SUBMIT */}
          <div className="flex justify-end gap-3 pb-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/suppliers')}
              className="flex items-center gap-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Save Supplier</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}











