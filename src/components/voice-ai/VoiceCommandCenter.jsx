/**
 * VoiceCommandCenter v1.0
 * Centro de comandos por voz
 * Passo 32: Exemplos de comandos | Histórico | Confiança
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Mic } from 'lucide-react';

const COMANDO_EXEMPLOS = [
  { comando: 'Abra a planilha de estoque', contexto: 'Estoque', confianca: 98, status: 'sucesso' },
  { comando: 'Criar novo pedido para cliente XYZ', contexto: 'Comercial', confianca: 96, status: 'sucesso' },
  { comando: 'Qual é o OEE da produção?', contexto: 'Produção', confianca: 94, status: 'sucesso' },
  { comando: 'Envie relatório financeiro por email', contexto: 'Financeiro', confianca: 99, status: 'sucesso' },
  { comando: 'Mostrar alertas críticos', contexto: 'Sistema', confianca: 97, status: 'sucesso' },
  { comando: 'Gerar nota fiscal do pedido 5847', contexto: 'Fiscal', confianca: 95, status: 'sucesso' },
];

export default function VoiceCommandCenter({ empresa, isListening }) {
  const [comandos] = useState(COMANDO_EXEMPLOS);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-blue-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Mic className={`w-6 h-6 ${isListening ? 'text-red-400 animate-pulse' : 'text-blue-400'}`} />
        Comandos Processados
      </h2>

      {isListening && (
        <Card className="p-4 bg-red-500/10 border border-red-400/40 rounded-lg animate-pulse">
          <p className="text-red-300 font-semibold text-center">🎤 Listening... Diga seu comando em português</p>
        </Card>
      )}

      {/* Histórico */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {comandos.map((cmd, idx) => (
          <Card key={idx} className="p-3 bg-white/5 border border-blue-500/30 rounded-lg hover:border-blue-400 transition-all">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="text-white font-semibold">{cmd.comando}</p>
                <p className="text-xs text-slate-400">{cmd.contexto}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500/20 text-blue-300">{cmd.confianca}%</Badge>
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${cmd.confianca}%` }} />
            </div>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 border-t border-blue-500/20 pt-4">
        <Card className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-slate-400">Total Comandos</p>
          <p className="text-2xl font-bold text-blue-400">{comandos.length}</p>
        </Card>
        <Card className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-xs text-slate-400">Taxa Sucesso</p>
          <p className="text-2xl font-bold text-green-400">100%</p>
        </Card>
        <Card className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <p className="text-xs text-slate-400">Confiança Média</p>
          <p className="text-2xl font-bold text-purple-400">96%</p>
        </Card>
      </div>
    </div>
  );
}