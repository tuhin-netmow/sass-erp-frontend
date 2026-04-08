import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { CreditCard, Webhook, Key, Save, Eye, EyeOff, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGetSettingsQuery, useUpdateSettingsMutation, useTestStripeConnectionMutation } from "@/store/features/admin/adminApiService";

export default function AdminSettingsPage() {
  const { data: settingsData, isLoading } = useGetSettingsQuery(undefined);
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();
  const [testConnection, { isLoading: isTesting }] = useTestStripeConnectionMutation();

  const [stripeSettings, setStripeSettings] = useState({
    publicKey: "",
    secretKey: "",
    webhookSecret: "",
    publishableKey: "",
    clientId: "",
  });

  const [showSecrets, setShowSecrets] = useState({
    secretKey: false,
    webhookSecret: false,
  });

  // Load settings when data is available
  useEffect(() => {
    if (settingsData?.data?.settings) {
      const settings = settingsData.data.settings;
      if (settings.stripe) {
        const stripeConfig = typeof settings.stripe === 'string'
          ? JSON.parse(settings.stripe)
          : settings.stripe;
        setStripeSettings({
          publicKey: stripeConfig.publicKey || "",
          secretKey: stripeConfig.secretKey || "",
          webhookSecret: stripeConfig.webhookSecret || "",
          publishableKey: stripeConfig.publishableKey || "",
          clientId: stripeConfig.clientId || "",
        });
      }
    }
  }, [settingsData]);

  const handleSaveStripe = async () => {
    try {
      await updateSettings({
        category: 'stripe',
        settings: stripeSettings,
      }).unwrap();
      toast.success("Stripe settings saved successfully");
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to save settings");
    }
  };

  const handleTestConnection = async () => {
    if (!stripeSettings.secretKey) {
      toast.error("Please enter your Stripe Secret Key first");
      return;
    }

    try {
      const result = await testConnection({
        publicKey: stripeSettings.publicKey,
        secretKey: stripeSettings.secretKey,
      }).unwrap();

      toast.success(result.data.message || "Stripe connection successful!");

      // Show more details about the connection
      if (result.data?.account) {
        const { account } = result.data;
        console.log('Stripe Account:', account);
      }
    } catch (error: any) {
      const errorMsg = error.data?.message || "Connection test failed";
      const suggestion = error.data?.data?.suggestion;

      if (suggestion) {
        toast.error(`${errorMsg}. ${suggestion}`, {
          duration: 8000,
        });
      } else {
        toast.error(errorMsg, {
          duration: 5000,
        });
      }
    }
  };

  const toggleVisibility = (field: keyof typeof showSecrets) => {
    setShowSecrets((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and configurations
        </p>
      </div>

      <Tabs defaultValue="stripe" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="stripe">Stripe</TabsTrigger>
          <TabsTrigger value="general" disabled>
            General
          </TabsTrigger>
          <TabsTrigger value="email" disabled>
            Email
          </TabsTrigger>
          <TabsTrigger value="system" disabled>
            System
          </TabsTrigger>
        </TabsList>

        {/* Stripe Settings */}
        <TabsContent value="stripe" className="space-y-6">
          {/* Connection Status Card */}
          <Card className="max-w-4xl">
            <CardHeader className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stripeSettings.secretKey ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <CreditCard className={`h-5 w-5 ${stripeSettings.secretKey ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">Stripe Connection Status</CardTitle>
                  <CardDescription className="text-sm">
                    Test your Stripe API configuration to ensure it's working correctly
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  {stripeSettings.secretKey ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900">API Key Configured</p>
                        <p className="text-sm text-gray-600">
                          {stripeSettings.secretKey?.startsWith('sk_test_')
                            ? 'Using test keys (starts with sk_test_)'
                            : 'Using live keys (starts with sk_live_)'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 text-gray-400" />
                      <div>
                        <p className="font-semibold text-gray-900">Not Configured</p>
                        <p className="text-sm text-gray-600">Enter your Stripe Secret Key below</p>
                      </div>
                    </>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={isTesting || !stripeSettings.secretKey}
                  className="gap-2"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
                <strong>How to check if Stripe is connected:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
                  <li>Click "Test Connection" to verify your API keys are valid</li>
                  <li>If successful, you'll see your Stripe account details</li>
                  <li>Green checkmark means your keys are working correctly</li>
                  <li>Use test keys (sk_test_...) during development</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Stripe Configuration Card */}
            <Card className="lg:col-span-2">
              <CardHeader className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Stripe Configuration</CardTitle>
                    <CardDescription className="text-sm">
                      Configure your Stripe API keys for payment processing
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-5">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Key className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-900">Important Security Note</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Never share your secret keys. These keys should be kept secure and never exposed in client-side code.
                        Always use test mode keys during development.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="publicKey">Public Key</Label>
                    <Input
                      id="publicKey"
                      value={stripeSettings.publicKey}
                      onChange={(e) =>
                        setStripeSettings({ ...stripeSettings, publicKey: e.target.value })
                      }
                      placeholder="pk_test_..."
                      className="font-mono text-sm h-10"
                    />
                    <p className="text-xs text-muted-foreground">
                      Used for client-side operations. Safe to expose.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secretKey">Secret Key</Label>
                    <div className="relative">
                      <Input
                        id="secretKey"
                        type={showSecrets.secretKey ? "text" : "password"}
                        value={stripeSettings.secretKey}
                        onChange={(e) =>
                          setStripeSettings({ ...stripeSettings, secretKey: e.target.value })
                        }
                        placeholder="sk_test_..."
                        className="font-mono text-sm pr-10 h-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => toggleVisibility("secretKey")}
                      >
                        {showSecrets.secretKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Used for server-side operations. Keep this secret!
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhookSecret">Webhook Secret</Label>
                    <div className="relative">
                      <Input
                        id="webhookSecret"
                        type={showSecrets.webhookSecret ? "text" : "password"}
                        value={stripeSettings.webhookSecret}
                        onChange={(e) =>
                          setStripeSettings({ ...stripeSettings, webhookSecret: e.target.value })
                        }
                        placeholder="whsec_..."
                        className="font-mono text-sm pr-10 h-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => toggleVisibility("webhookSecret")}
                      >
                        {showSecrets.webhookSecret ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Used to verify webhook signatures from Stripe.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="publishableKey">Publishable Key (Legacy)</Label>
                    <Input
                      id="publishableKey"
                      value={stripeSettings.publishableKey}
                      onChange={(e) =>
                        setStripeSettings({ ...stripeSettings, publishableKey: e.target.value })
                      }
                      placeholder="pk_test_..."
                      className="font-mono text-sm h-10"
                    />
                    <p className="text-xs text-muted-foreground">
                      Alternative publishable key for older integrations.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientId">Client ID (Stripe Connect)</Label>
                    <Input
                      id="clientId"
                      value={stripeSettings.clientId}
                      onChange={(e) =>
                        setStripeSettings({ ...stripeSettings, clientId: e.target.value })
                      }
                      placeholder="ca_..."
                      className="font-mono text-sm h-10"
                    />
                    <p className="text-xs text-muted-foreground">
                      Required if using Stripe Connect for marketplace functionality.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    {stripeSettings.secretKey ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        Configured
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                        Not Configured
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {stripeSettings.secretKey?.includes('_test_') ? 'Test Mode' : 'Live Mode'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestConnection}
                      disabled={isTesting || !stripeSettings.secretKey}
                      className="gap-2"
                    >
                      {isTesting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Test
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveStripe}
                      disabled={isUpdating}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Webhook Configuration Card */}
            <Card className="lg:col-span-1">
              <CardHeader className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Webhook className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Webhook</CardTitle>
                    <CardDescription className="text-sm">
                      Set up webhooks for real-time updates
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <div className="space-y-3">
                  <Label className="text-sm">Endpoint URL</Label>
                  <div className="flex items-start gap-2">
                    <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-xs break-all">
                      {window.location.origin}/api/v1/stripe/webhook
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/api/v1/stripe/webhook`
                        );
                        toast.success("Webhook URL copied to clipboard");
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add this URL in your Stripe Dashboard → Webhooks → Add endpoint
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm">Required Events</Label>
                  <Textarea
                    readOnly
                    value={`checkout.session.completed
invoice.paid
invoice.payment_failed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
payment_intent.succeeded
payment_intent.payment_failed`}
                    className="font-mono text-xs h-48 resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Select these events when creating the webhook in Stripe
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Other tabs - placeholders */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
