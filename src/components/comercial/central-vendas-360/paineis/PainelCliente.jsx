// Painel lateral da Central 360 — Cliente 360 (dados do cadastro canônico)
import React from 'react';
import { brl } from '../negociacaoUtils';
import usePermissions from '@/components/lib/usePermissions';

const CAMPOS = [
  ['nome_fantasia', 'Nome fantasia'],
  ['razao_social', 'Razão social'],
  ['cpf', 'CPF'],
  ['cnpj', 'CNPJ'],
  ['email', 'E-mail'],
  ['telefone', 'Telefone'],
  ['celular', 'Celular'],
  ['whatsapp', 'WhatsApp'],
  ['status', 'Situação'],
  ['limite_credito', 'Limite de crédito', 'moeda'],
  ['credito_disponivel', 'Crédito disponível', 'moeda'],
];

export default function PainelCliente({ cliente }) {
  const { hasPermission, isLoading } = usePermissions();
  const podeFinanceiro = !isLoading && hasPermission('Financeiro', 'Contas a Receber', 'visualizar');
  if (!cliente) {
    return <p className="text-sm text-slate-500">Cliente não localizado no cadastro para esta negociação.</p>;
  }

  const preenchidos = CAMPOS.filter(([chave, , tipo]) => (tipo !== 'moeda' || podeFinanceiro) && cliente[chave] !== null && cliente[chave] !== undefined && cliente[chave] !== '');

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
        {(preenchidos.length ? preenchidos : [['nome', 'Nome']]).map(([chave, label, tipo]) => (
          <div key={chave} className="flex items-start justify-between gap-3 px-3 py-2">
            <span className="text-xs text-slate-500">{label}</span>
            <span className="text-xs font-medium text-slate-800 text-right">
              {tipo === 'moeda' ? brl(cliente[chave]) : (cliente[chave] || '—')}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">
        Cadastro único do grupo. Obras, endereços e contatos adicionais são mantidos em Cadastros Gerais.
      </p>
    </div>
  );
}