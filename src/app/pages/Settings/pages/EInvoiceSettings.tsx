"use client";

import { useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { useGetEInvoiceSettingsQuery, useUpdateEInvoiceSettingsMutation } from "@/store/features/admin/settingsApiService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

export default function EInvoiceSettings() {
    const { data: settingsData, isLoading } = useGetEInvoiceSettingsQuery();
    const [updateSettings, { isLoading: isUpdating }] = useUpdateEInvoiceSettingsMutation();

    const { register, handleSubmit, setValue, reset, watch } = useForm({
        defaultValues: {
            environment: "sandbox",
            client_id: "",
            client_secret: "",
            tin: "",
            msic_code: "",
            contact_number: "",
            id_client_id: "",
            id_client_secret: "",
            certificate: "",
            certificate_password: ""
        }
    });

    useEffect(() => {
        if (settingsData) {
            reset(settingsData);
        }
    }, [settingsData, reset]);

    const onSubmit = async (data: any) => {
        try {
            await updateSettings(data).unwrap();
            toast.success("E-Invoice settings updated successfully");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update settings");
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <Card className="py-6">
                <CardHeader>
                    <CardTitle>E-Invoice Configuration (LHDN)</CardTitle>
                    <CardDescription>
                        Configure your connection to the LHDN MyInvois System.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="environment">Environment</Label>
                                <Select
                                    value={watch("environment")}
                                    onValueChange={(val) => setValue("environment", val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Environment" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sandbox">Sandbox (Test)</SelectItem>
                                        <SelectItem value="production">Production</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="client_id">Client ID</Label>
                                    <Input id="client_id" {...register("client_id")} placeholder="Enter Client ID" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="client_secret">Client Secret</Label>
                                    <Input id="client_secret" type="password" {...register("client_secret")} placeholder="Enter Client Secret" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="tin">Tax Identification Number (TIN)</Label>
                                    <Input id="tin" {...register("tin")} placeholder="e.g. C1234567890" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="msic_code">Default MSIC Code</Label>
                                    <Input id="msic_code" {...register("msic_code")} placeholder="e.g. 62010" />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-muted-foreground font-semibold mt-4">Intermediary Details (Optional)</Label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="id_client_id">Intermediary Client ID</Label>
                                    <Input id="id_client_id" {...register("id_client_id")} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="id_client_secret">Intermediary Client Secret</Label>
                                    <Input id="id_client_secret" type="password" {...register("id_client_secret")} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-muted-foreground font-semibold mt-4">Digital Certificate</Label>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="certificate">Certificate Path / Content</Label>
                                <Textarea id="certificate" {...register("certificate")} placeholder="Path to .p12 file or Base64 content" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="certificate_password">Certificate Password</Label>
                                <Input id="certificate_password" type="password" {...register("certificate_password")} />
                            </div>

                        </div>

                        <div className="flex justify-end mt-6">
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Configuration
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
