import { Settings as SettingsIcon, Building2, Wrench, UserCog, FileCode, Hash } from 'lucide-react';
import { Card, CardHeader } from "@/shared/components/ui/card";
import { SettingsSidebar } from './SettingsSidebar';
import { Outlet } from 'react-router';

const sidebarNavItems = [
  {
    title: 'Company Profile',
    href: '/dashboard/settings',
    icon: <Building2 size={18} />,
  },
  {
    title: 'Profile',
    href: '/dashboard/settings/profile',
    icon: <UserCog size={18} />,
  },
  {
    title: 'Layout Settings',
    href: '/dashboard/settings/layout',
    icon: <Wrench size={18} />,
  },
  {
    title: 'E-Invoice Config',
    href: '/dashboard/settings/einvoice',
    icon: <FileCode size={18} />,
  },
  {
    title: 'Google API Settings',
    href: '/dashboard/settings/google-api',
    icon: <SettingsIcon size={18} />,
  },
  {
    title: 'Prefix Settings',
    href: '/dashboard/settings/prefixes',
    icon: <Hash size={18} />,
  },
]

export default function Settings() {
  return (
    <div className="space-y-6">
      {/* Enhanced Header Card */}
      <Card className="overflow-hidden border-2 transition-all duration-300 hover:border-blue-200 hover:shadow-lg">
        <CardHeader className="bg-linear-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border-b-1 border-blue-100 dark:border-blue-900 py-3 gap-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-linear-to-br from-blue-600 to-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                Settings
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Manage account settings and set e-mail preferences
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content */}
      <div className="flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12 max-w-[1000px]">
        <div className="w-full lg:w-1/4">
          <SettingsSidebar items={sidebarNavItems || []} />
        </div>
        <div className="w-full lg:w-3/4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
