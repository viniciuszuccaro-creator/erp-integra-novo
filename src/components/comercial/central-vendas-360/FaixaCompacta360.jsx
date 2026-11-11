// Faixa compacta da Central 360° — atendimento, bot, entregas do dia e aprovações, cada um em janela própria
import React from 'react';
import { Bot, MessageCircle, ShieldCheck, Truck } from 'lucide-react';
import { useWindow } from '@/components/lib/useWindow';
import usePermissions from '@/components/lib/usePermissions';
import CentralAprovacoesManager from '../CentralAprovacoesManager';
import ValidarPedidosExternos from '../ValidarPedidosExternos';
import useContadores360 from './useContadores360';

// Janela própria do módulo já existente (funciona também no segundo monitor)
function abrirEmJanela(rota) {
  try {
    window.open(rota, `central360-${rota.replace(/[^\w]/g, '-')}`, 'width=1400,height=900,noopener');
  } catch (_) {
    window.location.href = rota;
  }
}

function Item({ icon: Icone, titulo, valor, cor, onClick, rotulo }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={rotulo}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    >
      <Icone className={`w-3.5 h-3.5 ${cor}`} />
      <span className="hidden sm:inline">{titulo}</span>
      <span
        className={`rounded-full px-1.5 text-[10px] font-bold ${
          valor > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
        }`}
      >
        {valor > 99 ? '99+' : valor}
      </span>
    </button>
  );
}

export default function FaixaCompacta360({ pendentesExternos = 0 }) {
  const contadores = useContadores360();
  const { openWindow } = useWindow();
  const { hasPermission } = usePermissions();

  const podeAtender = hasPermission('HubAtendimento', null, 'ver')
    || hasPermission('Chatbot', null, 'visualizar')
    || hasPermission('CRM', null, 'ver');
  const podeEntregas = hasPermission('Expedicao', null, 'ver');
  const podeAprovar = hasPermission('Comercial', 'Pedidos', 'aprovar')
    || hasPermission('Comercial', 'Pedidos', 'aprovar_desconto');
  const podeValidarExternos = hasPermission('Comercial', 'Pedidos', 'ver');

  const abrirAprovacoes = () => openWindow(
    CentralAprovacoesManager,
    { windowMode: true },
    { title: 'Central de Aprovações', width: 1240, height: 780 }
  );
  const abrirExternos = () => openWindow(
    ValidarPedidosExternos,
    { windowMode: true },
    { title: 'Pedidos externos — fila de validação', width: 1200, height: 700 }
  );

  const itens = [
    podeAtender && { id: 'atendimento', icon: MessageCircle, titulo: 'Atendimento', valor: contadores.atendimento, cor: 'text-blue-600', rotulo: 'Atendimento Unificado — conversas em andamento', onClick: () => abrirEmJanela('/HubAtendimento') },
    podeAtender && { id: 'bot', icon: Bot, titulo: 'Bot Vendas', valor: contadores.bot, cor: 'text-indigo-600', rotulo: 'Bot de Vendas — exceções aguardando intervenção humana', onClick: () => abrirEmJanela('/HubAtendimento?status=Aguardando') },
    podeEntregas && { id: 'entregas', icon: Truck, titulo: 'Entregas do Dia', valor: contadores.entregas, cor: 'text-sky-600', rotulo: 'Entregas previstas para hoje — mapa e status', onClick: () => abrirEmJanela('/Expedicao') },
    podeAprovar && { id: 'aprovacoes', icon: ShieldCheck, titulo: 'Aprovações', valor: contadores.aprovacoes, cor: 'text-purple-600', rotulo: 'Fila de aprovações comerciais (desconto, limite e condição)', onClick: abrirAprovacoes },
    podeValidarExternos && { id: 'externos', icon: ShieldCheck, titulo: 'Pedidos externos', valor: pendentesExternos, cor: 'text-orange-600', rotulo: 'Fila de validação dos pedidos recebidos dos canais externos', onClick: abrirExternos },
  ].filter(Boolean);

  if (itens.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 px-2 py-1 border-b border-slate-100 bg-white">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 px-1">Atalhos</span>
      {itens.map(({ id, ...item }, indice) => (
        <React.Fragment key={id}>
          {indice > 0 && <span className="h-4 w-px bg-slate-200" />}
          <Item {...item} />
        </React.Fragment>
      ))}
    </div>
  );
}