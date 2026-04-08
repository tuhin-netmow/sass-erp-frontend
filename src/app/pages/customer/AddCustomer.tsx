
import {
  Controller,
  useForm,
  type SubmitHandler,
  type Resolver,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray } from "react-hook-form";

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

//import { Button } from "@/shared/components/ui/button";
import { useNavigate } from "react-router";
import { useCreateCustomerMutation } from "@/store/features/app/customers/customersApi";
import { toast } from "sonner";
import { useAppSelector } from "@/store/store";
import { AddressAutocomplete } from "@/shared/components/form/AddressAutocomplete";
import { SalesRouteSelectField } from "@/app/components/salesRoute/RouteSelectField";
import { BackButton } from "@/shared/components/common/BackButton";
import ImageUploaderPro from "@/shared/components/form/ImageUploaderPro";
import { User, CheckCircle2, Phone, MapPin, Briefcase, Image as ImageIcon, Plus, Trash2, Edit2, Mail, BadgeCheck } from "lucide-react";
import { ACTIONS, MODULES } from "@/app/config/permissions";
import { perm, usePermissions } from "@/shared/hooks/usePermissions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";


/* ------------------ ZOD SCHEMA ------------------ */
const customerSchema = z.object({
  name: z.string().min(1, "Required"),
  company: z.string().optional(),
  customerType: z.enum(["individual", "business", "retail"]).default("individual"),
  taxId: z.string().optional(),
  email: z.string()
    .email("Invalid email")
    .optional()
    .or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  creditLimit: z.number().min(0, "Credit limit must be 0 or more").default(0),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
  thumbUrl: z.string().optional(),
  galleryItems: z.array(z.string()).max(10, "Maximum 10 images").optional(),
  salesRouteId: z.string().optional(),
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
import { useState } from "react";

export default function AddCustomerPage() {
  const navigate = useNavigate();

  // permissions
  const { hasPermission, isAdmin } = usePermissions();
  // const canCreateCustomer = isAdmin || hasPermission(perm(MODULES.CUSTOMERS, ACTIONS.CREATE));
  // const canEditCustomer = isAdmin || hasPermission(perm(MODULES.CUSTOMERS, ACTIONS.UPDATE));
  const canActivePermsion = isAdmin || hasPermission(perm(MODULES.CUSTOMERS, ACTIONS.ACTIVE));

  const [createCustomer, { isLoading }] = useCreateCustomerMutation();

  const currency = useAppSelector((state) => state.currency.value);

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
    },
  });

  const { control, handleSubmit, setValue } = form;
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

  const onSubmit: SubmitHandler<CustomerFormValues> = async (values) => {
    try {
      const payload = {
        ...values,
        salesRouteId: values.salesRouteId ? Number(values.salesRouteId) : undefined,
      };

      const res = await createCustomer(payload).unwrap();
      if (res.status) {
        toast.success(res.message || "Customer created successfully");
      }
      navigate("/dashboard/customers");
    } catch (error) {
      const err = error as { data: { message: string } };
      toast.error(err?.data?.message || "Failed to create customer");
      console.error("Failed to create customer:", error);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-6">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Add Customer
          </h1>
          <p className="text-muted-foreground mt-2">Create a new customer profile</p>
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
                    <Input type="email" placeholder="Enter email (optional)" {...field} />
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
              className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={() => {
                setEditingContactIndex(null);
                setContactFormValues({ name: "", phone: "", role: "", email: "", isPrimary: false });
                setIsContactModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
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
              {contactFields.map((field, index) => (
                <div
                  key={field.id}
                  className="group relative bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl p-4 transition-all hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-800 dark:text-gray-100">{field.name}</h4>
                      {field.isPrimary && (
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
                            isPrimary: field.isPrimary,
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
                  id="isPrimary"
                  checked={contactFormValues.isPrimary}
                  onChange={(e) => setContactFormValues({ ...contactFormValues, isPrimary: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label
                  htmlFor="isPrimary"
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
        <Card className="border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
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
                      disabled={!canActivePermsion}
                      value={field.value ? "active" : "inactive"}
                      onValueChange={(val) => field.onChange(val === "active")}
                    >
                      <SelectTrigger className={!canActivePermsion ? "bg-muted cursor-not-allowed opacity-70" : ""}>
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
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/customers')}
            className="flex items-center gap-2"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Save Customer</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
