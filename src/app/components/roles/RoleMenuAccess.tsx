
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Badge } from "@/shared/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { sidebarItemLink } from "@/app/config/sidebar.config";


interface MenuItem {
  menuId: string;
  label: string;
  actions: string[];
}

interface RoleMenuAccessProps {
  selectedMenus: MenuItem[];
  onChange: (menus: MenuItem[]) => void;
}

const availableActions = ['view', 'create', 'edit', 'delete', 'export', 'approve', 'manage'];

export function RoleMenuAccess({ selectedMenus, onChange }: RoleMenuAccessProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const toggleMenu = (menuId: string, label: string) => {
    const exists = selectedMenus.find(m => m.menuId === menuId);
    if (exists) {
      onChange(selectedMenus.filter(m => m.menuId !== menuId));
    } else {
      onChange([...selectedMenus, { menuId, label, actions: ['view'] }]);
    }
  };

  const toggleAction = (menuId: string, action: string) => {
    onChange(selectedMenus.map(m => {
      if (m.menuId === menuId) {
        const hasAction = m.actions.includes(action);
        return {
          ...m,
          actions: hasAction ? m.actions.filter(a => a !== action) : [...m.actions, action]
        };
      }
      return m;
    }));
  };

  return (
    <div className="space-y-4">
      {sidebarItemLink.map((group, groupIdx) => {
        const isSelected = selectedMenus.some(m => m.menuId === group.url);
        const hasSubItems = group.items && group.items.length > 0;
        const isExpanded = expandedGroups[group.title];

        return (
          <div key={groupIdx} className="border rounded-xl overflow-hidden shadow-sm">
            {/* Group Header */}
            <div className={`flex items-center justify-between p-3 transition-colors ${isSelected ? "bg-blue-50/50" : "bg-gray-50/30"}`}>
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`menu-${group.title}`}
                  checked={isSelected}
                  onCheckedChange={() => toggleMenu(group.url || group.title, group.title)}
                />
                <label htmlFor={`menu-${group.title}`} className="text-sm font-semibold cursor-pointer">
                  {group.title}
                </label>
              </div>
              {hasSubItems && (
                <button type="button" onClick={() => toggleGroup(group.title)} className="p-1 hover:bg-gray-200 rounded">
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              )}
            </div>

            {/* Sub Items */}
            {isSelected && isExpanded && hasSubItems && (
              <div className="p-4 border-t bg-white space-y-4">
                {group.items?.map((sub: { url: string; title: string }, subIdx: number) => {
                  const isSubSelected = selectedMenus.some(m => m.menuId === sub.url);
                  return (
                    <div key={subIdx} className="space-y-3">
                      <div className="flex items-center gap-3 ml-4">
                        <Checkbox
                          id={`submenu-${sub.title}`}
                          checked={isSubSelected}
                          onCheckedChange={() => toggleMenu(sub.url, sub.title)}
                        />
                        <label htmlFor={`submenu-${sub.title}`} className="text-sm font-medium cursor-pointer">
                          {sub.title}
                        </label>
                      </div>

                      {/* Actions for Sub Item */}
                      {isSubSelected && (
                        <div className="ml-10 flex flex-wrap gap-2">
                          {availableActions.map(action => {
                            const subItem = selectedMenus.find(m => m.menuId === sub.url);
                            const hasAction = subItem?.actions.includes(action);
                            return (
                              <Badge
                                key={action}
                                variant={hasAction ? "default" : "outline"}
                                className={`
                                  cursor-pointer transition-all px-2 py-0.5 text-[10px] uppercase
                                  ${hasAction ? "bg-blue-600 shadow-sm" : "text-gray-400 border-gray-200 hover:border-gray-400"}
                                `}
                                onClick={() => toggleAction(sub.url, action)}
                              >
                                {action}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
