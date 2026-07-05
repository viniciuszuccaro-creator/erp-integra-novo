import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HistoricoListaCard({ icon: Icon, title, items, bgColor, badgeColors, getPrimaryText, getSecondaryText, getBadgeValue, emptyMessage }) {
  return (
    <Card>
      <CardHeader className={bgColor + ' border-b'}>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          {title} ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.slice(0, 10).map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-semibold text-sm">{getPrimaryText(item)}</p>
                  <p className="text-xs text-slate-600">{getSecondaryText(item)}</p>
                </div>
                <Badge className={badgeColors[getBadgeValue(item)] || 'bg-orange-600'}>
                  {getBadgeValue(item)}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-4">{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}