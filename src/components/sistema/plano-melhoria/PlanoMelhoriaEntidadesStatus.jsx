import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

const ENTIDADES = [
  { nome: 'Pedido', grupo: 'Comercial', campos: ['group_id', 'empresa_id', 'empresa_dona_id', 'status', 'origem_pedido', 'canal_preferencial'], cobertura: 98 },
  { nome: 'Cliente', grupo: 'Comercial/CRM', campos: ['group_id', 'empresa_id', 'empresa_dona_id', 'empresas_compartilhadas_ids', 'risco_churn', 'score_confianca_ia'], cobertura: 98 },
  { nome: 'Produto', grupo: 'Estoque', campos: ['group_id', 'empresa_id', 'empresa_dona_id', 'compartilhado_grupo', 'classificacao_abc'], cobertura: 97 },
  { nome: 'ContaReceber', grupo: 'Financeiro', campos: ['group_id', 'empresa_id', 'origem', 'origem_tipo', 'canal_origem', 'status_cobranca'], cobertura: 97 },
  { nome: 'ContaPagar', grupo: 'Financeiro', campos: ['group_id', 'empresa_id', 'origem', 'origem_tipo', 'status_pagamento'], cobertura: 97 },
  { nome: 'Entrega', grupo: 'Expedição', campos: ['group_id', 'empresa_id', 'regiao_entrega_id', 'link_rastreamento', 'qr_code'], cobertura: 97 },
  { nome: 'MovimentacaoEstoque', grupo: 'Estoque', campos: ['group_id', 'empresa_id', 'origem_movimento', 'tipo_movimento', 'status_integracao'], cobertura: 98 },
  { nome: 'NotaFiscal', grupo: 'Fiscal', campos: ['group_id', 'empresa_faturamento_id', 'ambiente', 'status', 'validacao_ia_pre_emissao'], cobertura: 96 },
  { nome: 'Fornecedor', grupo: 'Compras', campos: ['group_id', 'empresa_dona_id', 'empresas_compartilhadas_ids', 'status_fornecedor', 'risco_cadastro_ia'], cobertura: 97 },
  { nome: 'Colaborador', grupo: 'RH', campos: ['group_id', 'empresa_alocada_id', 'centro_custo_id', 'pode_apontar_producao'], cobertura: 95 },
  { nome: 'AuditLog', grupo: 'Sistema', campos: ['usuario_id', 'empresa_id', 'modulo', 'tipo_auditoria', 'entidade', 'registro_id'], cobertura: 99 },
  { nome: 'ConfiguracaoSistema', grupo: 'Sistema', campos: ['group_id', 'empresa_id', 'chave', 'categoria', 'ativa', 'dados'], cobertura: 98 },
  { nome: 'CentroCusto', grupo: 'Financeiro', campos: ['group_id', 'empresa_id', 'origem_escopo', 'nivel_hierarquico'], cobertura: 96 },
  { nome: 'OrdemCompra', grupo: 'Compras', campos: ['fornecedor_id', 'status', 'itens', 'lead_time_real', 'avaliacao_fornecedor'], cobertura: 95 },
  { nome: 'PlanoMelhoriaItem', grupo: 'Sistema', campos: ['group_id', 'empresa_id', 'fase', 'modulo', 'status', 'percentual'], cobertura: 97 },
];

export default function PlanoMelhoriaEntidadesStatus() {
  const [expandido, setExpandido] = useState(null);

  const avg = Math.round(ENTIDADES.reduce((s, e) => s + e.cobertura, 0) / ENTIDADES.length);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
            <Database className="h-5 w-5 text-blue-600" />
            Entidades — cobertura multiempresa
          </CardTitle>
          <div className="flex gap-2">
            <Badge className="bg-blue-100 text-blue-700">{ENTIDADES.length} entidades</Badge>
            <Badge className="bg-emerald-100 text-emerald-700">{avg}% média</Badge>
          </div>
        </div>
        <p className="text-sm text-slate-500">Status de group_id, empresa_id e campos de controle por entidade.</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {ENTIDADES.map((entidade) => {
            const isOpen = expandido === entidade.nome;
            return (
              <div key={entidade.nome} className="rounded-xl border border-slate-100 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors text-left"
                  onClick={() => setExpandido(isOpen ? null : entidade.nome)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{entidade.nome}</span>
                      <Badge className={entidade.cobertura >= 97 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}>
                        {entidade.cobertura}%
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">{entidade.grupo}</p>
                  </div>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 bg-slate-50 border-t border-slate-100">
                    <p className="text-xs text-slate-500 font-semibold mb-2 pt-2">Campos de controle:</p>
                    <div className="flex flex-wrap gap-1">
                      {entidade.campos.map((c) => (
                        <div key={c} className="flex items-center gap-1 rounded bg-white border border-emerald-100 px-2 py-0.5 text-xs text-slate-700">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                          {c}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}