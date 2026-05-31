import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Volume2, CheckCircle2, Zap } from 'lucide-react';

export default function VoiceCommandCenter() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const comandos = [
    { voz: 'Criar novo pedido', acao: 'Abre formulário de pedido', confianca: 98, status: 'ativo' },
    { voz: 'Consultar estoque de aço', acao: 'Exibe estoque de bitolas', confianca: 95, status: 'ativo' },
    { voz: 'Faturar último pedido', acao: 'Gera NF-e do último pedido', confianca: 92, status: 'ativo' },
    { voz: 'Relatório de vendas hoje', acao: 'Dashboard de vendas diárias', confianca: 94, status: 'ativo' },
    { voz: 'Próxima manutenção máquina 001', acao: 'Consulta agenda manutenção', confianca: 88, status: 'ativo' },
    { voz: 'Reativar cliente XYZ', acao: 'CRM - reativar cliente', confianca: 85, status: 'novo' },
  ];

  const transcriptions = [
    { texto: 'Crie um novo pedido para o cliente Zuccaro Aço', confianca: 97, acao: 'Criar pedido', resultado: 'Sucesso' },
    { texto: 'Consulte o saldo de estoque de bitola 16mm', confianca: 94, acao: 'Consultar estoque', resultado: 'Executada' },
    { texto: 'Me mostre as vendas de hoje', confianca: 91, acao: 'Dashboard vendas', resultado: 'Aberto' },
  ];

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Microfone Principal */}
      <Card className="bg-gradient-to-br from-purple-900/30 to-slate-800 border-purple-700">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => setIsListening(!isListening)}
              className={`p-6 rounded-full transition-all transform ${
                isListening 
                  ? 'bg-purple-600 scale-110 animate-pulse shadow-lg shadow-purple-500' 
                  : 'bg-purple-900 hover:bg-purple-800'
              }`}
            >
              <Mic className="w-12 h-12 text-white" />
            </button>
            <p className="text-center text-white font-semibold">
              {isListening ? 'Ouvindo...' : 'Clique para falar'}
            </p>
            {transcript && (
              <p className="text-center text-slate-200 text-sm italic">"{transcript}"</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Comandos Registrados */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase">Comandos Disponíveis</h3>
        {comandos.map((cmd, idx) => (
          <Card key={idx} className="bg-slate-800 border-slate-700 hover:border-purple-600 transition-colors">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <Volume2 className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm">"{cmd.voz}"</p>
                    <p className="text-xs text-slate-400 mt-0.5">{cmd.acao}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs text-purple-400 font-bold">{cmd.confianca}%</span>
                  <Badge className="text-xs bg-emerald-900 text-emerald-200">{cmd.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Histórico Transcrito */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase">Últimas Transcrições</h3>
        {transcriptions.map((t, idx) => (
          <Card key={idx} className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <div className="space-y-2">
                <p className="text-white text-sm">"{t.texto}"</p>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex gap-2">
                    <span className="px-2 py-1 rounded bg-purple-900 text-purple-200">{t.confianca}%</span>
                    <span className="px-2 py-1 rounded bg-slate-700 text-slate-300">{t.acao}</span>
                  </div>
                  <span className={`px-2 py-1 rounded font-semibold ${
                    t.resultado === 'Sucesso' ? 'bg-emerald-900 text-emerald-200' : 'bg-blue-900 text-blue-200'
                  }`}>
                    {t.resultado}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}