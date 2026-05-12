import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gauge, Zap, TrendingUp, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";

function getWebVitals() {
  const metrics = {};
  try {
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav) {
      metrics.ttfb = Math.round(nav.responseStart - nav.requestStart);
      metrics.domLoad = Math.round(nav.domContentLoadedEventEnd - nav.startTime);
      metrics.load = Math.round(nav.loadEventEnd - nav.startTime);
    }
    const paint = performance.getEntriesByType('paint');
    paint.forEach(p => {
      if (p.name === 'first-contentful-paint') metrics.fcp = Math.round(p.startTime);
    });
  } catch {}
  return metrics;
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState({});
  const [queryCount, setQueryCount] = useState(0);

  useEffect(() => {
    const m = getWebVitals();
    setMetrics(m);
    // Count cached queries (approximate from localStorage)
    try {
      const keys = JSON.parse(localStorage.getItem('rq_index_keys') || '[]');
      setQueryCount(keys.length);
    } catch {}
  }, []);

  const refresh = () => setMetrics(getWebVitals());

  const getColor = (val, good, warn) => {
    if (!val) return "text-slate-400";
    if (val <= good) return "text-green-600";
    if (val <= warn) return "text-yellow-600";
    return "text-red-600";
  };

  const items = [
    { label: "TTFB", value: metrics.ttfb, unit: "ms", good: 200, warn: 500 },
    { label: "FCP", value: metrics.fcp, unit: "ms", good: 1800, warn: 3000 },
    { label: "DOM Load", value: metrics.domLoad, unit: "ms", good: 1500, warn: 3000 },
    { label: "Page Load", value: metrics.load, unit: "ms", good: 2500, warn: 5000 },
  ];

  return (
    <Card className="w-full border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="w-5 h-5 text-emerald-600" />
          Performance do Sistema
          <Button size="icon" variant="ghost" className="ml-auto h-6 w-6" onClick={refresh}>
            <RefreshCw className="w-3 h-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {items.map(item => (
            <div key={item.label} className="bg-white/70 rounded-lg p-2 text-center">
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className={`text-lg font-bold ${getColor(item.value, item.good, item.warn)}`}>
                {item.value ? `${item.value}${item.unit}` : '—'}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs bg-white/60 rounded-lg p-2">
          <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> Queries em cache</span>
          <Badge className="bg-amber-100 text-amber-700">{queryCount}</Badge>
        </div>
        <div className="text-xs text-slate-500 text-center">
          React Query + IDB cache ativos • Prefetch preditivo habilitado
        </div>
      </CardContent>
    </Card>
  );
}