"use client";

import { useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { useGetGoogleMapsSettingsQuery, useUpdateGoogleMapsSettingsMutation } from "@/store/features/admin/settingsApiService";
import { toast } from "sonner";
import { Loader2, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";

export default function GoogleApiSettings() {
    const { data: settingsData, isLoading } = useGetGoogleMapsSettingsQuery();
    const [updateSettings, { isLoading: isUpdating }] = useUpdateGoogleMapsSettingsMutation();

    const { register, handleSubmit, setValue, reset, watch } = useForm({
        defaultValues: {
            api_key: "",
            status: "disabled"
        }
    });

    useEffect(() => {
        if (settingsData?.data) {
            reset(settingsData.data);
        }
    }, [settingsData, reset]);

    const onSubmit = async (data: any) => {
        try {
            await updateSettings(data).unwrap();
            toast.success("Google Maps settings updated successfully");
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update settings");
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <Card className="py-6 border-2 transition-all duration-300 hover:border-blue-200">
                <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <CardTitle>Google Maps API Settings</CardTitle>
                    </div>
                    <CardDescription>
                        Configure your Google Maps API key for address searching and map visualizations.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="status">API Status</Label>
                                <Select
                                    value={watch("status")}
                                    onValueChange={(val) => setValue("status", val)}
                                >
                                    <SelectTrigger className="w-full md:w-[200px]">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="enabled">Enabled</SelectItem>
                                        <SelectItem value="disabled">Disabled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Turn on/off Google Maps functionality across the system.
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="api_key">Google Maps API Key</Label>
                                <Input
                                    id="api_key"
                                    {...register("api_key")}
                                    placeholder="Enter your Google Maps API Key"
                                    type="password"
                                    className="font-mono"
                                />
                                <p className="text-xs text-muted-foreground">
                                    You can get an API key from the <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a>.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <Button type="submit" disabled={isUpdating} className="min-w-[120px]">
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Settings"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="bg-blue-50/50 border-blue-100">
                <CardContent className="pt-6">
                    <div className="flex gap-3 text-sm text-blue-800">
                        <div className="p-1 px-2.5 bg-blue-100 rounded-full h-fit mt-0.5 font-bold">!</div>
                        <div className="space-y-1">
                            <p className="font-semibold">Important Note:</p>
                            <p>Make sure to enable **Maps JavaScript API**, **Places API**, and **Geocoding API** in your Google Cloud Project for all features to work correctly.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
