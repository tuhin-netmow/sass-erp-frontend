/* eslint-disable @typescript-eslint/no-explicit-any */


import {
  Controller,
  useForm,
  type SubmitHandler,
  useFieldArray,
  type Resolver,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/shared/components/ui/field";

import { Input } from "@/shared/components/ui/input";

import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";

import { useNavigate, useParams } from "react-router";
import { useGetCustomerByIdQuery, useUpdateCustomerMutation } from "@/store/features/app/customers/customersApi";
import { toast } from "sonner";
import { User, CheckCircle2, Phone, MapPin, Briefcase, Plus, Trash2, Edit2, Mail, BadgeCheck, Image as ImageIcon } from "lucide-react";

import { AddressAutocomplete } from "@/shared/components/form/AddressAutocomplete";
import { SalesRouteSelectField } from "@/app/components/salesRoute/RouteSelectField";
import { BackButton } from "@/shared/components/common/BackButton";
import { useEffect } from "react";
import { useAppSelector } from "@/store/store";
import ImageUploaderPro from "@/shared/components/form/ImageUploaderPro";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
// import { ACTIONS, MODULES } from "@/app/config/permissions";
// import { perm, usePermissions } from "@/shared/hooks/usePermissions";


/* ------------------ ZOD SCHEMA ------------------ */

const customerSchema = z.object({
  name: z.string().min(1, "Required"),
  company: z.string().optional(),
  customerType: z.enum(["individual", "business", "retail"]),
  taxId: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  creditLimit: z.number().min(0, "Credit limit must be 0 or more"),
  notes: z.string().optional(),
  isActive: z.boolean(),
  thumbUrl: z.string().optional(),
  galleryItems: z.array(z.string()).optional(),
  salesRouteId: z.string().optional(), // <-- string now
  contacts: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().optional().or(z.literal('')),
    role: z.string().optional().or(z.literal('')),
    email: z.string().email("Invalid email").optional().or(z.literal('')),
    isPrimary: z.boolean().default(false)
  })).default([]),
});


type CustomerFormValues = z.infer<typeof customerSchema>;

/* ------------------ PAGE ------------------ */
export default function EditCustomerByStaffPage() {


  // permissions
  // const { hasPermission, isAdmin } = usePermissions();
  // const canViewCustomer = isAdmin || hasPermission(perm(MODULES.CUSTOMERS, ACTIONS.VIEW));
  // const canCreateCustomer = isAdmin || hasPermission(perm(MODULES.CUSTOMERS, ACTIONS.CREATE));
  // const canEditCustomer = isAdmin || hasPermission(perm(MODULES.CUSTOMERS, ACTIONS.UPDATE));
  // const canDeleteCustomer = isAdmin || hasPermission(perm(MODULES.CUSTOMERS, ACTIONS.DELETE));

  const { customerId } = useParams();
  const navigate = useNavigate();





  const currency = useAppSelector((state) => state.currency.value);
  const { data, isLoading: isFetching } = useGetCustomerByIdQuery(
    customerId!
  );
  const [updateCustomer, { isLoading }] =
    useUpdateCustomerMutation();


  const customer = data?.data;

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema) as Resolver<CustomerFormValues>,
    defaultValues: {
      name: "",
      company: "",
      customerType: "individual",
      taxId: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      thumbUrl: "",
      galleryItems: [],
      creditLimit: 0,
      notes: "",
      isActive: true,
      salesRouteId: '',
      contacts: [],
    },
  });

  const { control, handleSubmit, reset, setValue } = form;
  const { fields: contactFields, append: appendContact, remove: removeContact, update: updateContact } = useFieldArray({
    control,
    name: "contacts",
  });

  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);
  const [contactFormValues, setContactFormValues] = useState({
    name: "",
    phone: "",
    role: "",
    email: "",
    isPrimary: false,
  });

  /* ------------------ LOAD CUSTOMER DATA ------------------ */
  useEffect(() => {
    if (customer) {
      // Normalize image fields: support both legacy `thumb_url`/`gallery_items` (strings)
      // and `images` array of objects { image_url, is_primary }
      const primaryFromImages =
        Array.isArray((customer as any).images) &&
        (customer as any).images.find((i: any) => i?.is_primary)?.imageUrl;

      const imagesFromObjects =
        Array.isArray((customer as any).images) &&
        (customer as any).images.map((i: any) =>
          typeof i === "string" ? i : i?.imageUrl
        );

      const thumbVal =
        customer.thumbUrl || primaryFromImages || (imagesFromObjects && imagesFromObjects[0]) || "";

      const galleryVal =
        customer.galleryItems ||
        (imagesFromObjects ? imagesFromObjects.filter((u: string) => u !== thumbVal) : []);

      reset({
        name: customer.name,
        company: customer.company || "",
        customerType: customer.customerType,
        taxId: customer.taxId || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        city: customer.city || "",
        state: customer.state || "",
        country: customer.country || "",
        postalCode: customer.postalCode || "",
        latitude: customer.latitude ?? undefined,
        longitude: customer.longitude ?? undefined,
        creditLimit: customer.creditLimit || 0,
        notes: customer.notes || "",
        isActive: customer.isActive,
        thumbUrl: thumbVal,
        galleryItems: galleryVal || [],
        salesRouteId: String(customer.salesRouteId),
        contacts: customer.contacts || []
      });
    }
  }, [customer, reset]);

  /* ------------------ SUBMIT ------------------ */
  const onSubmit: SubmitHandler<CustomerFormValues> = async (values) => {
    try {
      const payload = {
        ...values,
        salesRouteId: Number(values.salesRouteId)

      }


      const res = await updateCustomer({
        id: customerId!,
        data: payload,
      }).unwrap();
      if (res.status) {

        toast.success(res.message || "Customer updated successfully");
        navigate("/dashboard/customers/inactive");

      }
    } catch (error) {
      toast.error("Failed to update customer");
      console.error("Failed to update customer:", error);
    }
  };

  if (isFetching) {
    return <div className="p-6">Loading customer...</div>;
  }

  if (!customer) {
    return <div className="p-6 text-red-600">Customer not found</div>;
  }


  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Edit Customer
          </h1>
          <p className="text-muted-foreground mt-2">Update customer profile information</p>
        </div>
        <BackButton />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* BASIC INFORMATION */}
        <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b-1 border-blue-100 dark:border-blue-900 py-3 gap-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Basic Information</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Customer name, type, and images</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pb-6">
            <div className="flex flex-col md:flex-row gap-6 md:gap-12">
              {/* Left side: Name, Company, Type, Tax ID in a grid */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  control={control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Customer Name *</FieldLabel>
                      <Input placeholder="e.g. John Doe" {...field} />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="company"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Company Name</FieldLabel>
                      <Input placeholder="e.g. Acme Corp" {...field} />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="customerType"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Customer Type</FieldLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="taxId"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel>Tax ID / Registration Number</FieldLabel>
                      <Input placeholder="GST / VAT / Company Reg." {...field} />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
              </div>

              {/* Right side: Primary Image */}
              <div className="flex md:justify-end">
                <div>
                  <Controller
                    control={control}
                    name="thumbUrl"
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel>Primary Image</FieldLabel>
                        <ImageUploaderPro
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <FieldError>{fieldState?.error?.message}</FieldError>
                      </Field>
                    )}
                  />
                  {/* <p className="text-sm text-muted-foreground">
                    Optional. Recommended size: 400×400 px.
                  </p> */}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CONTACT DETAILS */}
        <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b-1 border-blue-100 dark:border-blue-900 py-3 gap-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Contact Details</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Email and phone information</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <Controller
                control={control}
                name="email"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input type="email" placeholder="Enter email" {...field} />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Phone</FieldLabel>
                    <Input placeholder="Enter phone" {...field} />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Multiple Contacts Section */}
        <div className="mt-8 pt-8 border-t-2 border-dashed border-blue-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                Additional Contacts
              </h3>
              <p className="text-sm text-gray-500">Manage multiple contact persons for this customer</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-bold transition-all"
              onClick={() => {
                setEditingContactIndex(null);
                setContactFormValues({ name: "", phone: "", role: "", email: "", isPrimary: false });
                setIsContactModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add New Contact
            </Button>
          </div>

          {contactFields.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-3">
                <User className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No contacts added yet</p>
              <p className="text-xs text-gray-400 mt-1">Click the button above to add a contact person</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contactFields.map((field: any, index: number) => (
                <div
                  key={field.id}
                  className="group relative bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-4 transition-all hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-800 dark:text-gray-100">{field.name}</h4>
                      {field.is_primary && (
                        <span className="flex items-center gap-1 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          <BadgeCheck className="w-3 h-3" />
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        onClick={() => {
                          setEditingContactIndex(index);
                          setContactFormValues({
                            name: field.name,
                            phone: field.phone || "",
                            role: field.role || "",
                            email: field.email || "",
                            isPrimary: field.is_primary,
                          });
                          setIsContactModalOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => removeContact(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {field.role && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Briefcase className="w-3.5 h-3.5" />
                        {field.role}
                      </div>
                    )}
                    {field.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone className="w-3.5 h-3.5" />
                        {field.phone}
                      </div>
                    )}
                    {field.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="w-3.5 h-3.5" />
                        {field.email}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent italic">
                {editingContactIndex !== null ? "Edit Contact" : "Add New Contact"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <FieldLabel>Contact Name *</FieldLabel>
                <Input
                  value={contactFormValues.name}
                  onChange={(e) => setContactFormValues({ ...contactFormValues, name: e.target.value })}
                  placeholder="Full name"
                  className="rounded-xl border-gray-200 focus:border-blue-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <FieldLabel>Role / Position</FieldLabel>
                  <Input
                    value={contactFormValues.role}
                    onChange={(e) => setContactFormValues({ ...contactFormValues, role: e.target.value })}
                    placeholder="e.g. Manager"
                    className="rounded-xl border-gray-200"
                  />
                </div>
                <div className="grid gap-2">
                  <FieldLabel>Phone Number</FieldLabel>
                  <Input
                    value={contactFormValues.phone}
                    onChange={(e) => setContactFormValues({ ...contactFormValues, phone: e.target.value })}
                    placeholder="Phone"
                    className="rounded-xl border-gray-200"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <FieldLabel>Email Address</FieldLabel>
                <Input
                  value={contactFormValues.email}
                  onChange={(e) => setContactFormValues({ ...contactFormValues, email: e.target.value })}
                  placeholder="email@example.com"
                  className="rounded-xl border-gray-200"
                />
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={contactFormValues.isPrimary}
                  onChange={(e) => setContactFormValues({ ...contactFormValues, isPrimary: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label
                  htmlFor="is_primary"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
                >
                  Set as Primary Contact
                </label>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                type="button"
                className="rounded-xl"
                onClick={() => setIsContactModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="rounded-xl bg-blue-600 hover:bg-blue-700 font-bold"
                onClick={() => {
                  if (!contactFormValues.name) {
                    toast.error("Contact name is required");
                    return;
                  }
                  if (editingContactIndex !== null) {
                    updateContact(editingContactIndex, contactFormValues);
                  } else {
                    appendContact(contactFormValues);
                  }
                  setIsContactModalOpen(false);
                }}
              >
                {editingContactIndex !== null ? "Update Contact" : "Add Contact"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ADDRESS DETAILS */}
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
          <CardContent className="pb-6">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <Controller
                control={control}
                name="address"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Address</FieldLabel>
                    <AddressAutocomplete
                      {...field}
                      placeholder="Search address"
                      onAddressSelect={(details) => {
                        field.onChange(details.address);
                        setValue("city", details.city);
                        setValue("state", details.state);
                        setValue("postalCode", details.postalCode);
                        setValue("country", details.country);
                        setValue("latitude", details.latitude);
                        setValue("longitude", details.longitude);
                      }}
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="city"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>City</FieldLabel>
                    <Input placeholder="City" {...field} />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="state"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>State / Province</FieldLabel>
                    <Input placeholder="State" {...field} />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="postalCode"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Postal Code</FieldLabel>
                    <Input placeholder="Postal code" {...field} />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="country"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Country</FieldLabel>
                    <Input placeholder="Country" {...field} />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="latitude"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Latitude (Optional)</FieldLabel>
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
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="longitude"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Longitude (Optional)</FieldLabel>
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
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* BUSINESS SETTINGS */}
        <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b-1 border-blue-100 dark:border-blue-900 py-3 gap-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Business Settings</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Credit limit, status, and sales route</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={control}
                name="creditLimit"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>
                      Credit Limit {currency ? `(${currency})` : ""}
                    </FieldLabel>
                    <Input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="isActive"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Status</FieldLabel>
                    <Select
                      disabled={true}
                      value={field.value ? "active" : "inactive"}
                      onValueChange={(val) => field.onChange(val === "active")}
                    >
                      <SelectTrigger className={"bg-muted cursor-not-allowed opacity-70"}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="notes"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Notes</FieldLabel>
                    <Textarea placeholder="Additional notes..." {...field} />
                    <FieldError>{fieldState.error?.message}</FieldError>
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="salesRouteId"
                rules={{ required: "Select a sales route" }}
                render={({ field, fieldState }) => (
                  <SalesRouteSelectField
                    field={field}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* CUSTOMER GALLERY */}
        <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b-1 border-blue-100 dark:border-blue-900 py-3 gap-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Customer Gallery</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Upload additional customer images</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <Controller
              control={control}
              name="galleryItems"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Gallery (max 10)</FieldLabel>
                  <ImageUploaderPro
                    multiple
                    value={field.value || []}
                    onChange={(v) => {
                      const arr = Array.isArray(v) ? v : v ? [v] : [];
                      if (arr.length > 10) {
                        toast.error("You can upload up to 10 images only");
                        arr.splice(10);
                      }
                      field.onChange(arr);
                    }}
                  />
                  <p className="text-sm text-muted-foreground">
                    Optional. Upload up to 10 additional images for the customer.
                  </p>
                  <FieldError>{fieldState?.error?.message}</FieldError>
                </Field>
              )}
            />
          </CardContent>
        </Card>

        {/* SUBMIT */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/customers')}
            className="px-6 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3 font-semibold text-white shadow-lg shadow-blue-500/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/50 active:translate-y-0 active:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Save Customer</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}







