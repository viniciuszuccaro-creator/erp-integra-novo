import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bolt } from 'lucide-react';

export default function CanaisInsightsPanel({ insights }) {
  if (!insights.length) return null;

  return (
    <Card className="mt-6 border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-base font-semibold mb-2">
          <Bolt className="w-5 h-5 text-purple-600" />🤖 Insights Inteligentes de Configuração
        </div>
        {insights.map((insight, idx) => (
          <Alert key={idx} className={
            insight.tipo === 'success' ? 'border-green-300 bg-green-50' :
            insight.tipo === 'warning' ? 'border-orange-300 bg-orange-50' :
            'border-blue-300 bg-blue-50'
          }>
            <AlertDescription className="text-sm">{insight.texto}</AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}