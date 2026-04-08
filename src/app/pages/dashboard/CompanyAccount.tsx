import { useAppSelector } from "@/store/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Building2, Globe, Users, Shield, Mail, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function CompanyAccount() {
  const { user, company } = useAppSelector((state) => state.auth);
  const [copied, setCopied] = useState(false);

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No company information found.</p>
      </div>
    );
  }

  // Build the company subdomain URL
  const companySubdomain = `http://${company.domain}:5173`;
  const companyLoginUrl = `${companySubdomain}/login`;
  const companyDashboardUrl = `${companySubdomain}/dashboard`;

  // Copy to clipboard function with fallback
  const copyToClipboard = async (text: string, label: string) => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(`${label} copied to clipboard!`);
        setTimeout(() => setCopied(false), 2000);
        return;
      }

      // Fallback: Use textarea method
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        if (successful) {
          setCopied(true);
          toast.success(`${label} copied to clipboard!`);
          setTimeout(() => setCopied(false), 2000);
        } else {
          throw new Error('Copy command failed');
        }
      } catch (err) {
        console.error('Fallback copy failed:', err);
        toast.error('Failed to copy. Please select and copy manually.');
        // Still show the text in a modal/alert as last resort
        alert(`Copy this ${label}:\n\n${text}`);
      } finally {
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error('Failed to copy to clipboard');
      // Last resort: show alert
      alert(`Copy this ${label}:\n\n${text}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Company Account</h1>
        <p className="text-gray-600">Your company workspace information and team login details</p>
      </div>

      {/* Company Overview Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Your Company Workspace</CardTitle>
              <CardDescription>Manage your team's access to ERP SAAS</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Name */}
          <div className="bg-white p-4 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Company Name</p>
                <p className="text-2xl font-black text-gray-900">{company.name || 'Your Company'}</p>
              </div>
              <Building2 className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          {/* Company ID */}
          <div className="bg-white p-4 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Company ID</p>
                <p className="text-2xl font-black text-gray-900">#{company.id}</p>
              </div>
              <div className="bg-blue-100 px-4 py-2 rounded-lg">
                <p className="text-sm font-bold text-blue-700">Internal ID</p>
              </div>
            </div>
          </div>

          {/* Subdomain Information */}
          <div className="bg-white p-4 rounded-xl border border-blue-100">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Company Subdomain</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-50 px-4 py-3 rounded-lg font-mono text-lg font-bold text-gray-900">
                {company.domain}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(company.domain as string, 'Subdomain')}
                className="gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Team Login URLs */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Share with Your Team</p>

            {/* Login URL */}
            <div className="bg-white p-4 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-gray-900">Team Login URL</span>
                </div>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">SHARE THIS</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-900 text-green-400 px-3 py-2 rounded text-sm">
                  {companyLoginUrl}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(companyLoginUrl, 'Login URL')}
                  className="gap-2 flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.open(companyLoginUrl, '_blank')}
                  className="gap-2 flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </Button>
              </div>
            </div>

            {/* Dashboard URL */}
            <div className="bg-white p-4 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-gray-900">Company Dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-900 text-blue-400 px-3 py-2 rounded text-sm">
                  {companyDashboardUrl}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(companyDashboardUrl, 'Dashboard URL')}
                  className="gap-2 flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.open(companyDashboardUrl, '_blank')}
                  className="gap-2 flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <p className="font-bold text-blue-900 mb-2">📋 How to Add Team Members:</p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Share the <strong>Team Login URL</strong> above with your team members</li>
              <li>Each team member can sign up or login with their email</li>
              <li>They will automatically join your company workspace</li>
              <li>Manage their permissions from the Users section</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Account Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Admin Account */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-600" />
              <CardTitle>Your Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-bold text-gray-900">{user?.name || 'Admin User'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-bold text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-bold text-gray-900 capitalize">{user?.role?.name || 'Admin'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => window.open(companyLoginUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
              Go to Company Login
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => window.open(companyDashboardUrl, '_blank')}
            >
              <Globe className="w-4 h-4" />
              Open Company Dashboard
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => copyToClipboard(`${companyLoginUrl}\n\nLogin to your company workspace!`, 'Login info')}
            >
              <Mail className="w-4 h-4" />
              Copy Login Info for Email
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Important Notice */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Important Security Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-800">
            Your company has a dedicated subdomain: <strong>{company.domain}</strong>. All team members should use the company-specific login URL ({companyLoginUrl}) to access your workspace. This ensures data isolation and security for your company.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
