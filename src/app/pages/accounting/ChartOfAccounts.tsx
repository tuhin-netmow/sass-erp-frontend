/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, ChevronsUpDown, Check, ShieldAlert, FileText, Printer } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/shared/components/ui/select";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";

import CreateExpenseHeadForm from "./CreateExpenseHead";
import CreateIncomeHeadForm from "./CreateIncomeHead";

import { DataTable } from "@/app/components/dashboard/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { useForm, Controller } from "react-hook-form";
import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/shared/components/ui/command";
import { cn } from "@/shared/utils/utils";
import { Link, useNavigate } from "react-router";
import { format } from "date-fns";


import {
    type ChartOfAccount,
    useGetAccountingAccountsQuery,
    useLazyGetAccountingAccountsQuery,
    useAddAccountingAccountMutation,
    useUpdateAccountingAccountMutation
} from "@/store/features/app/accounting/accoutntingApiService";
import { toast } from "sonner";
import { ACTIONS, MODULES } from "@/app/config/permissions";
import { perm, usePermissions } from "@/shared/hooks/usePermissions";

type CreateAccountFormValues = {
    name: string;
    code: string;
    type: "ASSET" | "LIABILITY" | "EQUITY" | "INCOME" | "EXPENSE";
    parentId?: string;
};

export default function ChartOfAccounts() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const [page, setPage] = useState(1);
    const [limit] = useState(200);
    const [search, setSearch] = useState("");
    const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(null);

    // --- Permissions ---
    const { hasPermission, isAdmin } = usePermissions();
    const canCreateAccount = isAdmin || hasPermission(perm(MODULES.ACCOUNTING, ACTIONS.CREATE));
    const canEditAccount = isAdmin || hasPermission(perm(MODULES.ACCOUNTING, ACTIONS.UPDATE));


    const { data, isFetching, refetch } = useGetAccountingAccountsQuery({ page, limit, search });

    const [addAccountingAccount, { isLoading }] = useAddAccountingAccountMutation();
    const [updateAccountingAccount] = useUpdateAccountingAccountMutation();


    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateAccountFormValues>({
        defaultValues: { name: "", code: "", type: undefined, parentId: undefined },
    });

    const onSubmit = async (values: CreateAccountFormValues) => {
        const payload: any = { name: values.name, code: values.code, type: values.type };
        if (values.parentId) payload.parentId = values.parentId;

        try {
            if (editingAccount) {
                if (!canEditAccount) {
                    toast.error("You do not have permission to edit this account");
                    return;
                }
                const res = await updateAccountingAccount({ id: editingAccount._id, body: payload }).unwrap();
                if (res.status) {
                    toast.success(res.message || "Account updated successfully");
                }
            } else {
                const res = await addAccountingAccount(payload).unwrap();
                if (res.status) {
                    toast.success(res.message || "Account created successfully");
                }
            }
            reset();
            setEditingAccount(null);
            setIsOpen(false);
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || "Account operation failed");
            console.error("Account operation failed", error);
        }
    };

    const onEdit = (account: ChartOfAccount) => {
        setEditingAccount(account);
        setValue("name", account.name);
        setValue("code", account.code);
        setValue("type", account.type.toUpperCase() as any);
        setValue("parentId", account.parent ? String(account.parent) : undefined);
        setIsOpen(true);
    };

    // const onDelete = async (id: number) => {
    //     if (confirm("Are you sure you want to delete this account?")) {
    //         await deleteAccountingAccount(id).unwrap();
    //         refetch();
    //     }
    // };

    const ParentAccountSelect = ({ control }: { control: any }) => {
        const [query, setQuery] = useState("");
        const [searchAccounts, setSearchAccounts] = useState<any[]>([]);
        const [open, setOpen] = useState(false); // control Popover open state
        // RTK Query lazy fetch
        const [fetchAccounts, { isFetching }] = useLazyGetAccountingAccountsQuery();

        useEffect(() => {
            const timeout = setTimeout(() => {
                fetchAccounts({ page: 1, limit: 10, search: query })
                    .unwrap()
                    .then(res => setSearchAccounts(res?.data || []));
            }, 300);
            return () => clearTimeout(timeout);
        }, [query, fetchAccounts]);











        return (
            <Controller
                name="parentId"
                control={control}
                render={({ field }) => (
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between">
                                {field.value ? searchAccounts.find(acc => acc._id === field.value)?.name : "Root account"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-full p-0">
                            <Command>
                                <CommandInput placeholder="Search parent account..." value={query} onValueChange={setQuery} />
                                <CommandEmpty>No account found.</CommandEmpty>
                                <CommandGroup>
                                    {isFetching ? <CommandItem disabled>Loading...</CommandItem> :
                                        searchAccounts.map(acc => (
                                            <CommandItem
                                                key={acc._id}
                                                value={`${acc.code} ${acc.name}`}
                                                onSelect={() => { setOpen(false); field.onChange(acc._id); }}
                                            >
                                                <Check className={cn("mr-2 h-4 w-4", field.value === acc._id ? "opacity-100" : "opacity-0")} />
                                                {acc.code} — {acc.name}
                                            </CommandItem>
                                        ))
                                    }
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )}
            />
        );
    };

    const accountColumns: ColumnDef<ChartOfAccount>[] = [
        { accessorKey: "code", header: "Code", cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.code}</span> },
        {
            accessorKey: "name",
            header: "Account Name",
            cell: ({ row }) => (
                <div className="flex items-center" style={{ paddingLeft: `${row.original.level * 20}px` }}>
                    {row.original.level > 0 && <span className="mr-2 text-muted-foreground">└─</span>}
                    <Link
                        to={`/dashboard/accounting/reports/ledger?accountId=${row.original._id}`}
                        className={cn(
                            "hover:underline hover:text-primary transition-colors",
                            row.original.level === 0 ? "font-semibold text-foreground" : "text-muted-foreground"
                        )}
                    >
                        {row.original.name}
                    </Link>
                </div>
            ),

        },
        {
            accessorKey: "type",
            header: "Type",
            cell: ({ row }) => {
                const originalType = row.original.type || "";
                const type = originalType.toUpperCase();
                let colorClass = "";

                switch (type) {
                    case "ASSET":
                        colorClass = "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 shadow-xs shadow-blue-100";
                        break;
                    case "LIABILITY":
                        colorClass = "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200 shadow-xs shadow-orange-100";
                        break;
                    case "EQUITY":
                        colorClass = "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 shadow-xs shadow-purple-100";
                        break;
                    case "INCOME":
                        colorClass = "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 shadow-xs shadow-emerald-100";
                        break;
                    case "EXPENSE":
                        colorClass = "bg-rose-100 text-rose-800 border-rose-200 hover:bg-rose-200 shadow-xs shadow-rose-100";
                        break;
                    default:
                        colorClass = "bg-gray-100 text-gray-800 border-gray-200";
                }

                return <Badge className={cn("border px-2.5 py-0.5 rounded-full font-semibold transition-colors", colorClass)} variant="secondary">{originalType}</Badge>;
            }
        },
        {
            accessorKey: "debit",
            header: () => <div className="text-right">Debit (RM)</div>,
            cell: ({ row }) => (
                <div className="text-right font-medium text-emerald-600">
                    {Number(row.original.debit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            )
        },
        {
            accessorKey: "credit",
            header: () => <div className="text-right">Credit (RM)</div>,
            cell: ({ row }) => (
                <div className="text-right font-medium text-rose-600">
                    {Number(row.original.credit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            )
        },
        {
            id: "balance",
            header: () => <div className="text-right">Balance (RM)</div>,
            cell: ({ row }) => {
                const debit = Number(row.original.debit || 0);
                const credit = Number(row.original.credit || 0);
                const type = row.original.type.toLowerCase();

                let balance = 0;
                if (["asset", "expense"].includes(type)) {
                    balance = debit - credit;
                } else {
                    balance = credit - debit;
                }

                return (
                    <div className={cn("text-right font-bold", balance >= 0 ? "text-slate-900" : "text-amber-600")}>
                        {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                );
            }
        },
        {
            id: "actions",
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:text-primary hover:bg-primary/10"
                        title="View Ledger"
                        onClick={() => navigate(`/dashboard/accounting/reports/ledger?accountId=${row.original._id}`)}
                    >
                        <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Edit Account"
                        onClick={() => onEdit(row.original)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    {/* <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(row.original.id)}><Trash2 className="h-4 w-4" /></Button> */}
                </div>
            ),

        },
    ];







    const hasDialogPermission = editingAccount ? canEditAccount : canCreateAccount;




    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Chart of Accounts</h2>
                    <p className="text-muted-foreground">Manage your financial head hierarchy.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => window.print()}
                        className="flex items-center gap-2"
                    >
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>

                    <CreateIncomeHeadForm />
                    <CreateExpenseHeadForm />

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger onClick={() => {
                            reset();
                            setEditingAccount(null);
                        }} asChild>
                            <Button className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white">
                                <Plus className="h-4 w-4" />
                                Add Account
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            {
                                !hasDialogPermission ? (
                                    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                                            <ShieldAlert className="h-10 w-10 text-destructive" />
                                        </div>
                                        <h2 className="text-lg font-semibold">Access Denied</h2>
                                        <p className="text-sm text-muted-foreground">
                                            You do not have permission to{" "}
                                            {editingAccount ? "edit" : "create"} an account.
                                            <br />
                                            Please contact your administrator.
                                        </p>
                                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                                            Close
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <DialogHeader>
                                            <DialogTitle>{editingAccount ? "Edit Account" : "Add New Account"}</DialogTitle>
                                            <DialogDescription>Create or update an account head.</DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label>Account Name</Label>
                                                <Controller name="name" control={control} rules={{ required: "Account name is required" }} render={({ field }) => <Input {...field} />} />
                                                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label>Code</Label>
                                                    <Controller name="code" control={control} rules={{ required: "Code is required" }} render={({ field }) => <Input {...field} />} />
                                                    {errors.code && <p className="text-sm text-destructive">{errors.code.message}</p>}
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Type</Label>
                                                    <Controller name="type" control={control} rules={{ required: "Type is required" }} render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="ASSET">Asset</SelectItem>
                                                                <SelectItem value="LIABILITY">Liability</SelectItem>
                                                                <SelectItem value="EQUITY">Equity</SelectItem>
                                                                <SelectItem value="INCOME">Income</SelectItem>
                                                                <SelectItem value="EXPENSE">Expense</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )} />
                                                    {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
                                                </div>

                                                {/* PARENT ACCOUNT */}
                                                <div className="grid gap-2">
                                                    <Label>Parent Account (Optional)</Label>
                                                    <ParentAccountSelect control={control} />
                                                </div>


                                            </div>
                                            <DialogFooter>
                                                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); setEditingAccount(null); }}>Cancel</Button>
                                                <Button type="submit" disabled={isLoading}>{editingAccount ? "Update" : "Create"}</Button>
                                            </DialogFooter>
                                        </form>
                                    </>)
                            }

                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="hidden print:block text-center mb-[15px] pb-1">
                <h1 className="text-4xl font-extrabold uppercase tracking-tight">CHART OF ACCOUNTS</h1>
                <div className="mt-1 text-sm text-gray-700 font-semibold italic">
                    Report Generated On: {format(new Date(), 'd MMMM yyyy')}
                </div>
            </div>

            <Card className="py-6 border-none shadow-none print:shadow-none print:border-none">
                <CardContent>
                    <DataTable
                        columns={accountColumns}
                        data={data?.data || []}
                        pageIndex={page - 1}
                        pageSize={limit}
                        totalCount={data?.pagination?.total || 0}
                        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
                        onSearch={(value) => { setSearch(value); setPage(1); }}
                        isFetching={isFetching}
                    />
                </CardContent>
            </Card>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    .no-print, 
                    header, 
                    nav, 
                    aside, 
                    button,
                    .print\\:hidden {
                        display: none !important;
                    }
                    .text-4xl {
                        font-size: 18px !important;
                        margin-bottom: 10px !important;
                    }
                    .border {
                        border: none !important;
                    }
                    .shadow-lg, .shadow-md, .shadow-sm {
                        box-shadow: none !important;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                    }
                    th, td {
                        border-bottom: 1px solid #eee !important;
                        padding: 3px 6px !important;
                        font-size: 9px !important;
                    }
                    th {
                        line-height: 2 !important;
                        padding: 8px 6px !important;
                        text-transform: uppercase !important;
                    }
                    /* Aggressively remove unnecessary gaps but keep requested heading margin */
                    .mb-8, .mb-6, .pb-2, .pb-4 {
                        margin-bottom: 0 !important;
                        padding-bottom: 0 !important;
                    }
                    .mt-2, .mt-1 {
                        margin-top: 0 !important;
                    }
                    /* Ensure heading section has exactly 15px margin */
                    .hidden.print\\:block.mb-\\[15px\\] {
                        margin-bottom: 15px !important;
                    }
                    /* Ensure table container has no top padding */
                    div:has(> table), .rounded-md.border {
                        margin-top: 0 !important;
                        padding-top: 0 !important;
                        border: none !important;
                    }
                    /* Hide Actions column when printing */
                    th:last-child, 
                    td:last-child {
                        display: none !important;
                    }
                    /* Hide search input in DataTable when printing */
                    [placeholder="Search..."], 
                    .flex.items-center.justify-between.py-4 {
                        display: none !important;
                    }
                }
            `}} />
        </div>
    );
}
