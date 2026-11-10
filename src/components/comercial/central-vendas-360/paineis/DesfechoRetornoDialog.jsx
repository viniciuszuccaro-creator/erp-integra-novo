// Registro do desfecho de um retorno (follow-up) direto na Central 360°
import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORIAS_RETORNO } from './usePainelRetornos';

const RESULTADOS = [
  { valor: 'Positivo', descricao: 'Cliente aprovou / respondeu' },
  { valor: 'Neutro', descricao: 'Respondeu, mas sem definição' },
  { valor: 'Negativo', descricao: 'Cliente recusou / perdeu interesse' },
  { valor: 'Sem Resposta', descricao: 'Sem contato — reagendar' },
];

const CLASSES_BOTAO = 'border rounded-md px-2.5 py-1.5 text-left text-xs transition-colors';

export default function DesfechoRetornoDialog({ retorno, aberto, onFechar, onSalvar, salvando, permitido }) {
  const [resultado, setResultado] = useState('Positivo');
  const [categoria, setCategoria] = useState('Negociação');
  const [observacao, setObservacao] = useState('');
  const [novaData, setNovaData] = useState('');
  const [proximaAcao, setProximaAcao] = useState('');

  useEffect(() => {
    if (!aberto) return;
    setResultado('Positivo');
    setCategoria(retorno?.categoria || 'Negociação');
    setObservacao('');
    setNovaData('');
    setProximaAcao(retorno?.proxima_acao || '');
  }, [aberto, retorno?.id]);

  const encerra = resultado === 'Positivo' || resultado === 'Negativo';

  const salvar = async () => {
    const ok = await onSalvar(retorno, { resultado, categoria, observacao, novaData, proximaAcao });
    if (ok) onFechar?.();
  };

  return (
    <Dialog open={aberto} onOpenChange={(valor) => { if (!valor) onFechar?.(); }}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="text-base">Registrar desfecho do retorno</DialogTitle>
          <DialogDescription className="text-xs">
            {retorno?.titulo || 'Retorno'} · {retorno?.cliente_nome || 'Cliente'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Desfecho</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {RESULTADOS.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  onClick={() => setResultado(opcao.valor)}
                  title={opcao.descricao}
                  className={`${CLASSES_BOTAO} ${
                    resultado === opcao.valor
                      ? 'border-blue-500 bg-blue-50 text-blue-800 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opcao.valor}
                  <span className="block text-[10px] font-normal text-slate-500">{opcao.descricao}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Tipo de retorno</Label>
            <select
              value={categoria}
              onChange={(evento) => setCategoria(evento.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-800"
            >
              {CATEGORIAS_RETORNO.map((opcao) => (
                <option key={opcao} value={opcao}>{opcao}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Observação do contato</Label>
            <Textarea
              value={observacao}
              onChange={(evento) => setObservacao(evento.target.value)}
              rows={3}
              placeholder="O que o cliente respondeu, condições combinadas, pendências…"
              className="text-sm"
            />
          </div>

          {!encerra && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Novo retorno</Label>
                <Input type="date" value={novaData} onChange={(evento) => setNovaData(evento.target.value)} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Próxima ação</Label>
                <Input
                  value={proximaAcao}
                  onChange={(evento) => setProximaAcao(evento.target.value)}
                  placeholder="Ex.: ligar novamente"
                  className="h-9"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="button" onClick={salvar} disabled={salvando || !permitido}>
            {salvando ? 'Registrando…' : 'Registrar desfecho'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}