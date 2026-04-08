"use client";

import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardHeader, CardTitle, CardContent } from "@/shared/components/ui/card";
import { Field, FieldLabel, FieldError } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import {
    useAddExpenseHeadwiseMutation,
    useGetExpenseHeadsQuery,
    useGetAccountingAccountsQuery,
} from "@/store/features/app/accounting/accoutntingApiService";
import { toast } from "sonner";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Check, ChevronDown, FileText, CreditCard, TrendingDown, CornerDownRight } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/shared/components/ui/command";
import { cn } from "@/shared/utils/utils";
import { useState } from "react";
import type { DebitHead } from "@/shared/types/app/accounting.types";
import { useAppSelector } from "@/store/store";

/* ------------------ ZOD SCHEMA ------------------ */
const expenseSchema = z.object({
    title: z.string().min(1, "Required"),
    expense_date: z.string().min(1, "Required"),
    debit_head_id: z.string().min(1, "Required"),
    description: z.string().optional(),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    paidVia: z.string().optional(),
    reference: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface AddExpenseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/* ------------------ MODAL COMPONENT ------------------ */
export default function AddExpenseModal({ open, onOpenChange }: AddExpenseModalProps) {
    const [openDebitHead, setOpenDebitHead] = useState(false);
    const [openPaidVia, setOpenPaidVia] = useState(false);
    const [search, setSearch] = useState("");
    const [addExpense, { isLoading }] = useAddExpenseHeadwiseMutation();

    const form = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            title: "",
            expense_date: "",
            debit_head_id: "",
            description: "",
            amount: 0,
            paidVia: "",
            reference: "",
        },
    });

    const { control, handleSubmit, reset } = form;

    const { data: expenseHeadsData } = useGetExpenseHeadsQuery({
        search: search,
    });
    const debitHeads: DebitHead[] = expenseHeadsData?.data || [];

    const { data: accountsData } = useGetAccountingAccountsQuery({ limit: 1000 });
    const assetAccounts = (accountsData?.data || []).filter(acc => acc.type === "Asset");

    const currency = useAppSelector((state) => state.currency.value);

    const onSubmit: SubmitHandler<ExpenseFormValues> = async (values) => {
        console.log("Expense Form Values", values);
        const payload = {
            title: values.title,
            expense_date: values.expense_date,
            debit_head_id: values.debit_head_id,
            description: values.description,
            amount: values.amount,
            payment_method: values.paidVia,
            reference_number: values.reference,
        }
        try {
            const res = await addExpense(payload).unwrap();
            if (res.status) {
                toast.success("Expense added successfully");
                reset(); // Clear the form
                onOpenChange(false); // Close the modal
            }
        } catch (err) {
            console.error(err);
            const error = err as {
                data: {
                    message: string;
                }
            }
            toast.error(error.data.message || "Failed to add expense");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-400 bg-clip-text text-transparent">
                        Add Expense
                    </DialogTitle>
                    <p className="text-muted-foreground mt-2">Record a new expense transaction</p>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* BASIC INFO */}
                    <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-red-200 hover:shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-red-50 via-orange-50 to-red-50 dark:from-red-950/30 dark:via-orange-950/30 dark:to-red-950/30 border-b-1 border-red-100 dark:border-red-900 py-3 gap-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-red-600 to-orange-500 rounded-xl shadow-lg shadow-red-500/30">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Basic Information</CardTitle>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Expense title, category, and description</p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="grid gap-4 md:grid-cols-2 pb-6">
                            {/* TITLE */}
                            <Controller
                                control={control}
                                name="title"
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Title</FieldLabel>
                                        <Input placeholder="Expense Title" {...field} />
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />

                            <Controller
                                control={control}
                                name="debit_head_id"
                                render={({ field, fieldState }) => {
                                    const selected = debitHeads?.find(
                                        (item) => item._id === field.value
                                    );

                                    return (
                                        <Field>
                                            <FieldLabel>Debit Head</FieldLabel>

                                            <Popover open={openDebitHead} onOpenChange={setOpenDebitHead} modal={true}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={openDebitHead}
                                                        className="w-full justify-between"
                                                    >
                                                        {selected ? selected.name : "Select debit head..."}
                                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>

                                                <PopoverContent className="w-[450px] p-0" align="start">
                                                    <Command>
                                                        <CommandInput
                                                            placeholder="Search debit head..."
                                                            className="h-9"
                                                            value={search}
                                                            onValueChange={setSearch}
                                                        />

                                                        <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                                                            <CommandEmpty>No debit head found.</CommandEmpty>

                                                            <CommandGroup>
                                                                {debitHeads?.map((item) => {
                                                                    // Determine hierarchy level based on parent_id or level property
                                                                    // @ts-expect-error - level might exist on the API object but not the type
                                                                    const level = item.level || (item.parent_id ? 1 : 0);

                                                                    return (
                                                                        <CommandItem
                                                                            key={item._id}
                                                                            value={`${item.name}-${item._id}`}
                                                                            onSelect={() => {
                                                                                field.onChange(item._id);
                                                                                setOpenDebitHead(false);
                                                                            }}
                                                                            className="flex items-center gap-2"
                                                                            style={{ paddingLeft: `${level === 0 ? 12 : (level * 20) + 12}px` }}
                                                                        >
                                                                            <div className="flex items-center flex-1 gap-2">
                                                                                <div className="flex items-center gap-1">
                                                                                    {level > 0 && (
                                                                                        <CornerDownRight className="h-3 w-3 text-muted-foreground stroke-[1.5]" />
                                                                                    )}

                                                                                    <div className="flex flex-col">
                                                                                        <span className={cn(
                                                                                            level === 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                                                                                        )}>
                                                                                            {item.name}
                                                                                        </span>
                                                                                        <span className="text-[10px] text-muted-foreground/70">{item.code}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <Check
                                                                                className={cn(
                                                                                    "ml-auto h-4 w-4",
                                                                                    field.value === item._id
                                                                                        ? "opacity-100"
                                                                                        : "opacity-0"
                                                                                )}
                                                                            />
                                                                        </CommandItem>
                                                                    );
                                                                })}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>

                                            {fieldState.error && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {fieldState.error.message}
                                                </p>
                                            )}
                                        </Field>
                                    );
                                }}
                            />
                            {/* DATE */}
                            <div className="md:col-span-2">
                                <Controller
                                    control={control}
                                    name="expense_date"
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Date</FieldLabel>
                                            <Input type="date" {...field} className="block" />
                                            <FieldError>{fieldState.error?.message}</FieldError>
                                        </Field>
                                    )}
                                />
                            </div>

                            {/* DESCRIPTION */}
                            <div className="md:col-span-2">
                                <Controller
                                    control={control}
                                    name="description"
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Description</FieldLabel>
                                            <Textarea
                                                rows={4}
                                                placeholder="Describe expense..."
                                                {...field}
                                            />
                                            <FieldError>{fieldState.error?.message}</FieldError>
                                        </Field>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* PAYMENT INFO */}
                    <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-red-200 hover:shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-red-50 via-orange-50 to-red-50 dark:from-red-950/30 dark:via-orange-950/30 dark:to-red-950/30 border-b-1 border-red-100 dark:border-red-900 py-3 gap-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-red-600 to-orange-500 rounded-xl shadow-lg shadow-red-500/30">
                                    <CreditCard className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">Payment Details</CardTitle>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Amount, payment method, and reference</p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="grid gap-4 md:grid-cols-2 pb-6">
                            {/* AMOUNT */}
                            <Controller
                                control={control}
                                name="amount"
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Amount ({currency})</FieldLabel>
                                        <Input
                                            type="number"
                                            value={field.value ?? ""}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === "" ? "" : Number(e.target.value)
                                                )
                                            }
                                        />
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />

                            {/* PAID VIA */}
                            <Controller
                                control={control}
                                name="paidVia"
                                render={({ field, fieldState }) => {
                                    const selected = assetAccounts?.find(
                                        (item) => item.name === field.value || item._id === field.value
                                    );

                                    return (
                                        <Field>
                                            <FieldLabel>Paid Via</FieldLabel>

                                            <Popover open={openPaidVia} onOpenChange={setOpenPaidVia}>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={openPaidVia}
                                                        className="w-full justify-between"
                                                    >
                                                        {selected ? selected.name : "Select payment account..."}
                                                        <ChevronDown className="opacity-50 h-4 w-4" />
                                                    </Button>
                                                </PopoverTrigger>

                                                <PopoverContent className="w-[450px] p-0" align="start">
                                                    <Command>
                                                        <CommandInput
                                                            placeholder="Search payment account..."
                                                            className="h-9"
                                                        />
                                                        <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                                                            <CommandEmpty>No account found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {assetAccounts?.map((acc) => {
                                                                    const level = acc.level || 0;
                                                                    return (
                                                                        <CommandItem
                                                                            key={acc._id}
                                                                            value={`${acc.name}-${acc._id}`}
                                                                            onSelect={() => {
                                                                                field.onChange(acc.name); // Using name for now as existing schema is string
                                                                                setOpenPaidVia(false);
                                                                            }}
                                                                            className="flex items-center gap-2"
                                                                            style={{ paddingLeft: `${level === 0 ? 12 : (level * 20) + 12}px` }}
                                                                        >
                                                                            <div className="flex items-center flex-1 gap-2">
                                                                                <div className="flex items-center gap-1">
                                                                                    {level > 0 && (
                                                                                        <CornerDownRight className="h-3 w-3 text-muted-foreground stroke-[1.5]" />
                                                                                    )}
                                                                                    <div className="flex flex-col">
                                                                                        <span className={cn(
                                                                                            level === 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                                                                                        )}>
                                                                                            {acc.name}
                                                                                        </span>
                                                                                        <span className="text-[10px] text-muted-foreground/70">{acc.code}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <Check
                                                                                className={cn(
                                                                                    "ml-auto h-4 w-4",
                                                                                    field.value === acc.name
                                                                                        ? "opacity-100"
                                                                                        : "opacity-0"
                                                                                )}
                                                                            />
                                                                        </CommandItem>
                                                                    );
                                                                })}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FieldError>{fieldState.error?.message}</FieldError>
                                        </Field>
                                    );
                                }}
                            />

                            {/* REFERENCE */}
                            <Controller
                                control={control}
                                name="reference"
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Reference</FieldLabel>
                                        <Input placeholder="Bill #, Txn ID, etc." {...field} />
                                        <FieldError>{fieldState.error?.message}</FieldError>
                                    </Field>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* SUBMIT BUTTON */}
                    <div className="flex justify-end gap-4 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-8 py-3 font-semibold text-white shadow-lg shadow-red-500/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-500/50 active:translate-y-0 active:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <TrendingDown className="w-5 h-5" />
                                    <span>Save Expense</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
