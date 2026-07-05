import React from "react";

const COLORS = {
  red: { bg: "bg-red-50", border: "border-red-300", text: "text-red-900", sub: "text-red-700" },
  green: { bg: "bg-green-50", border: "border-green-300", text: "text-green-900", sub: "text-green-700" },
  orange: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-900", sub: "text-orange-700" },
  blue: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-900", sub: "text-blue-700" },
};

export default function BIAssistantInsight({ show, color, icon, title, action }) {
  if (!show) return null;
  const c = COLORS[color] || COLORS.blue;
  return (
    <div className={`p-3 bg-white rounded-lg border-2 ${c.border} shadow-sm`}>
      <div className="flex items-start gap-2">
        <span className="text-lg">{icon}</span>
        <div className="flex-1">
          <p className={`font-semibold text-sm ${c.text}`}>{title}</p>
          <p className={`text-xs ${c.sub} mt-1`}>
            <strong>Ação:</strong> {action}
          </p>
        </div>
      </div>
    </div>
  );
}