import React from 'react';
import { Label } from '@/components/ui/label';
import { CreditCard, Wallet, Building2, Smartphone, Loader2 } from 'lucide-react';
import { useFormasPagamento } from '@/components/lib/useFormasPagamento';

const ICONE_POR_TIPO = {
  'PIX': Smartphone, 'Dinheiro': Wallet, 'Boleto': Building2,
  'Cartão Crédito': CreditCard, 'Cartão de Crédito': CreditCard,
  'Cartão Débito': CreditCard, 'Cartão de Débito': CreditCard,
  'Transferência': Building2, 'Transferencia': Building2,
  'Cheque': Building2,
};
const COR_POR_TIPO = {
  'PIX': 'text-cyan-600', 'Dinheiro': 'text-green-600',
  'Cartão Crédito': 'text-blue-600', 'Cartão de Crédito': 'text-blue-600',
  'Cartão Débito': 'text-purple-600', 'Cartão de Débito': 'text-purple-600',
  'Boleto': 'text-orange-600', 'Transferência': 'text-indigo-600',
  'Cheque': 'text-slate-600',
};

/**
 * V22.0 ETAPA 4 - Seletor de Forma de Pagamento Reutilizável
 * Componente modular para seleção de forma de pagamento com ícones
 * Busca formas reais de Cadastros Gerais via useFormasPagamento
 */
export default function SeletorFormaPagamento({ value, onChange, label = "Forma de Pagamento", required = false }) {
  const { formasPagamento = [], isLoading } = useFormasPagamento();

  const formas = formasPagamento.map(f => ({
    value: f.tipo || f.descricao,
    label: f.descricao || f.tipo,
    icon: ICONE_POR_TIPO[f.tipo] || Building2,
    cor: COR_POR_TIPO[f.tipo] || 'text-slate-600',
  }));

  return (
    <div className="w-full">
      <Label>{label} {required && <span className="text-red-600">*</span>}</Label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
        {formas.map((forma) => {
          const Icone = forma.icon;
          const selecionado = value === forma.value;
          return (
            <button
              key={forma.value}
              type="button"
              onClick={() => onChange(forma.value)}
              className={`p-3 border-2 rounded-lg transition-all ${
                selecionado
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icone className={`w-5 h-5 mx-auto mb-1 ${selecionado ? 'text-blue-600' : forma.cor}`} />
              <p className={`text-xs font-semibold ${selecionado ? 'text-blue-900' : 'text-slate-700'}`}>
                {forma.label}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}