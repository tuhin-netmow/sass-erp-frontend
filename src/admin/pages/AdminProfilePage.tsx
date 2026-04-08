import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { User, Key, Mail, Shield, Save, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGetAdminProfileQuery, useUpdateAdminProfileMutation, useChangeAdminPasswordMutation } from "@/store/features/admin/adminApiService";
import { setAdmin } from "@/store/features/admin/adminSlice";
import { useDispatch } from "react-redux";

export default function AdminProfilePage() {
  const dispatch = useDispatch();
  const { data: profileData, isLoading: isLoadingProfile, refetch } = useGetAdminProfileQuery({});
  const [updateProfile, { isLoading: isUpdating }] = useUpdateAdminProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangeAdminPasswordMutation();

  const admin = profileData?.data?.admin;

  const [profileForm, setProfileForm] = useState({
    name: admin?.name || "",
    email: admin?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Update profile form when admin data loads
  if (admin && (profileForm.name !== admin.name || profileForm.email !== admin.email)) {
    setProfileForm({
      name: admin.name,
      email: admin.email,
    });
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileForm.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!profileForm.email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      const result = await updateProfile({
        name: profileForm.name,
        email: profileForm.email,
      }).unwrap();

      toast.success(result.message || "Profile updated successfully");

      // Update Redux store with new profile data
      if (result.data?.admin) {
        dispatch(setAdmin(result.data.admin));
      }

      // Refetch profile to get latest data
      refetch();
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to update profile");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (!passwordForm.newPassword) {
      toast.error("New password is required");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      const result = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }).unwrap();

      toast.success(result.message || "Password changed successfully");

      // Clear password form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to change password");
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Profile Overview Card */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-24"></div>
            <CardContent className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
                <div className="h-24 w-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                  {admin?.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="flex-1 text-center sm:text-left pb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{admin?.name}</h2>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                    <Badge role={admin?.role} />
                    <span className="text-sm text-gray-500">{admin?.email}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Information Card */}
            <Card>
              <CardHeader className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                    <CardDescription className="text-sm">
                      Update your name
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                      placeholder="Enter your full name"
                      className="h-10"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={isUpdating}
                      className="gap-2"
                      size="sm"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Name
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Email Address Card */}
            <Card>
              <CardHeader className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Email Address</CardTitle>
                    <CardDescription className="text-sm">
                      Change your email address
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">New Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, email: e.target.value })
                        }
                        placeholder="Enter your new email"
                        className="pl-10 h-10"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      You will receive a verification email at the new address
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={isUpdating}
                      className="gap-2"
                      size="sm"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Update Email
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="max-w-2xl">
            <CardHeader className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Key className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Change Password</CardTitle>
                  <CardDescription className="text-sm">
                    Update your password to keep your account secure
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            currentPassword: e.target.value,
                          })
                        }
                        placeholder="Enter your current password"
                        className="pr-10 h-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility("current")}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder="Enter new password (min 6 characters)"
                        className="pr-10 h-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility("new")}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Confirm your new password"
                        className="pr-10 h-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility("confirm")}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900">Password Requirements</h4>
                      <ul className="mt-2 space-y-1 text-sm text-blue-700">
                        <li>• At least 6 characters long</li>
                        <li>• Different from your current password</li>
                        <li>• Should not be easily guessable</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isChangingPassword}
                    className="gap-2"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4" />
                        Change Password
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Badge component for role display
function Badge({ role }: { role?: string }) {
  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "superadmin":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Shield className="h-3 w-3" />
            Super Admin
          </span>
        );
      case "admin":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Shield className="h-3 w-3" />
            Admin
          </span>
        );
      default:
        return null;
    }
  };

  return getRoleBadge(role);
}
