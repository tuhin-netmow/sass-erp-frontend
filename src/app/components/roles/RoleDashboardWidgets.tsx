
// import { Checkbox } from "@/components/ui/checkbox";
// import { Badge } from "@/components/ui/badge";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { AVAILABLE_DASHBOARD_WIDGETS } from "@/shared/constants/dashboardWidgets";
import { Layout, Star } from "lucide-react";
// import { AVAILABLE_DASHBOARD_WIDGETS } from "@/config/dashboardWidgets";

interface DashboardWidget {
  widgetId: string;
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
}

interface RoleDashboardWidgetsProps {
  selectedWidgets: DashboardWidget[];
  onChange: (widgets: DashboardWidget[]) => void;
}

export function RoleDashboardWidgets({ selectedWidgets, onChange }: RoleDashboardWidgetsProps) {
  const toggleWidget = (widgetId: string) => {
    const exists = selectedWidgets.find((w) => w.widgetId === widgetId);
    if (exists) {
      onChange(selectedWidgets.filter((w) => w.widgetId !== widgetId));
    } else {
      const widget = AVAILABLE_DASHBOARD_WIDGETS.find(w => w.id === widgetId);
      onChange([...selectedWidgets, {
        widgetId: widgetId,
        position: { x: 0, y: 0, w: widget?.defaultPosition.w || 4, h: widget?.defaultPosition.h || 3 },
        config: {}
      }]);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
      {AVAILABLE_DASHBOARD_WIDGETS.map((widget) => {
        const isSelected = selectedWidgets.some(w => w.widgetId === widget.id);
        return (
          <label
            key={widget.id}
            className={`
              flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group
              ${isSelected
                ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-md shadow-blue-100"
                : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
              }
            `}
          >
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors
              ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"}
            `}>
              <Layout className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className={`font-bold ${isSelected ? "text-blue-900" : "text-gray-900"}`}>{widget.label}</h4>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleWidget(widget.id)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {widget.description}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary" className="px-1.5 py-0 text-[9px] font-mono whitespace-nowrap">
                  Default: {widget.defaultPosition.w}x{widget.defaultPosition.h}
                </Badge>
                {isSelected && <Star className="w-3 h-3 text-blue-400 fill-blue-400 animate-pulse" />}
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}
