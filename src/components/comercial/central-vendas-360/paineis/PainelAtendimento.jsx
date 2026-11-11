// Painel de atendimento do Cliente 360° — atalhos de atendimento, resumo e últimas interações
import React, { useState } from 'react';
import {
  CalendarClock, Headset, Mail, MessageCircle, MessageSquare, Phone, Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import usePermissions from '@/components/lib/usePermissions';
import { useWindow } from '@/components/lib/useWindow';
import { useUser } from '@/components/lib/UserContext';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import InteracaoForm from '@/components/crm/InteracaoForm';
import EventoForm from '@/components/agenda/EventoForm';
import { useRegistrarEvento } from '@/components/cliente/timeline-cliente/useTimelineCliente';
import PainelResumo from './PainelResumo';
import PainelRegistros from './PainelRegistros';
import { FILTRO_RELACIONADO } from './paineisConfig';
import { proximaAcao, dataCurta } from '../negociacaoUtils';

const hoje = () => new Date().toISOString().slice(0, 10);

function apenasDigitos(valor) {
  return String(valor || '').replace(/\D/g, '');
}

// §4 do dossiê: quando o cliente tem mais de um contato do mesmo tipo, o vendedor escolhe qual usar.
function contatosDoTipo(cliente, tipos) {
  const lista = Array.isArray(cliente?.contatos) ? cliente.contatos : [];
  return lista
    .filter((contato) => tipos.includes(String(contato?.tipo || '').trim().toLowerCase())
      && String(contato?.valor || '').trim())
    .map((contato, indice) => ({
      id: contato.id || `${indice}-${contato.valor}`,
      valor: String(contato.valor).trim(),
      rotulo: contato.nome || contato.descricao || contato.tipo || '',
    }));
}

function Atalho({ icone: Icone, label, onClick, href, cor = 'text-slate-600', rotulo }) {
  const classe = `flex flex-col items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-2 text-[10px] font-medium ${cor} hover:border-blue-300 hover:bg-blue-50`;
  if (href) {
    return (
      <a href={href} className={classe} title={rotulo || label}>
        <Icone className="w-4 h-4" />
        <span className="leading-none text-center">{label}</span>
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classe} title={rotulo || label}>
      <Icone className="w-4 h-4" />
      <span className="leading-none text-center">{label}</span>
    </button>
  );
}

export default function PainelAtendimento({ negociacao, cliente }) {
  const { openWindow, closeWindow } = useWindow();
  const { user } = useUser();
  const { hasPermission } = usePermissions();
  const { createInContext } = useContextoVisual();
  const registrarHistorico = useRegistrarEvento();
  const queryClient = useQueryClient();
  const [escolhaContato, setEscolhaContato] = useState(null);

  if (!negociacao) return <p className="text-sm text-slate-500">Selecione uma negociação para ver o atendimento.</p>;

  const { pedidoId, clienteId } = FILTRO_RELACIONADO(negociacao);
  const registro = negociacao.registro || {};
  const podeInteragir = hasPermission('CRM', null, 'criar') || hasPermission('Comercial', null, 'editar');
  const telefone = apenasDigitos(cliente?.whatsapp || cliente?.celular || cliente?.telefone);
  const email = cliente?.email || '';

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['Interacao'] });
    queryClient.invalidateQueries({ queryKey: ['Evento'] });
    queryClient.invalidateQueries({ queryKey: ['historico-cliente'] });
  };

  const abrirInteracao = () => {
    if (!podeInteragir) {
      toast.error('Sem permissão para registrar interações.');
      return;
    }
    const janela = openWindow(InteracaoForm, {
      windowMode: true,
      interacao: {
        tipo: 'Ligação',
        titulo: `Atendimento — ${negociacao.numero || negociacao.cliente_nome}`,
        cliente_id: negociacao.cliente_id,
        cliente_nome: negociacao.cliente_nome,
        responsavel: negociacao.vendedor || user?.full_name || '',
        responsavel_id: user?.id || null,
        data_interacao: hoje(),
      },
      onSubmit: async (dados) => {
        try {
          await createInContext('Interacao', dados);
          await registrarHistorico({
            cliente_id: dados.cliente_id,
            cliente_nome: dados.cliente_nome,
            modulo_origem: 'CRM',
            tipo_evento: 'Comunicacao',
            referencia_tipo: 'Interacao',
            referencia_numero: negociacao.numero || null,
            titulo_evento: `${dados.tipo || 'Interação'} registrada`,
            descricao_detalhada: dados.titulo || dados.descricao || '',
            usuario_responsavel: user?.full_name || '',
            usuario_responsavel_id: user?.id || null,
          });
          invalidar();
          toast.success('Interação registrada no histórico do cliente.');
          if (janela) closeWindow(janela);
        } catch (erro) {
          toast.error(`Erro ao registrar interação: ${erro.message}`);
        }
      },
    }, { title: 'Registrar interação', width: 760, height: 720 });
  };

  const abrirFollowUp = () => {
    if (!podeInteragir) {
      toast.error('Sem permissão para agendar follow-ups.');
      return;
    }
    const janela = openWindow(EventoForm, {
      windowMode: true,
      evento: {
        titulo: `Follow-up — ${negociacao.cliente_nome || 'cliente'}`,
        tipo: 'Follow-up',
        data_inicio: hoje(),
        hora_inicio: '09:00',
        data_fim: hoje(),
        hora_fim: '09:30',
        cliente_nome: negociacao.cliente_nome,
        pedido_id: pedidoId || registro.pedido_id || '',
        prioridade: 'Normal',
        status: 'Agendado',
      },
      onSubmit: async (dados) => {
        try {
          await createInContext('Evento', {
            ...dados,
            data_inicio: `${dados.data_inicio}T${dados.hora_inicio || '00:00'}:00`,
            data_fim: `${dados.data_fim}T${dados.hora_fim || '23:59'}:00`,
            responsavel: dados.responsavel || user?.full_name || '',
            responsavel_id: dados.responsavel_id || user?.id || null,
          });
          await registrarHistorico({
            cliente_id: clienteId,
            cliente_nome: negociacao.cliente_nome,
            modulo_origem: 'Comercial',
            tipo_evento: 'Observacao',
            referencia_numero: negociacao.numero || null,
            titulo_evento: `Follow-up agendado para ${dados.data_inicio}`,
            descricao_detalhada: dados.titulo,
            usuario_responsavel: user?.full_name || '',
            usuario_responsavel_id: user?.id || null,
            acao_necessaria: true,
            acao_descricao: dados.titulo,
            resolvido: false,
          });
          invalidar();
          toast.success('Follow-up agendado e registrado no histórico.');
          if (janela) closeWindow(janela);
        } catch (erro) {
          toast.error(`Erro ao agendar follow-up: ${erro.message}`);
        }
      },
    }, { title: 'Agendar follow-up', width: 780, height: 760 });
  };

  // Amarração com o Hub de Atendimento (WhatsApp/omnicanal): abre as conversas já filtradas pelo cliente
  const abrirHub = () => {
    const termo = telefone || cliente?.nome || cliente?.razao_social || negociacao.cliente_nome || '';
    const query = termo ? `?busca=${encodeURIComponent(termo)}` : '';
    window.location.href = `/HubAtendimento${query}`;
  };

  const abrirWhatsApp = (numero) => {
    const limpo = apenasDigitos(numero || telefone);
    if (!limpo) {
      toast.error('Cliente sem telefone cadastrado.');
      return;
    }
    const comPais = limpo.length <= 11 ? `55${limpo}` : limpo;
    window.open(`https://wa.me/${comPais}`, '_blank', 'noopener');
  };

  const ligar = (numero) => {
    const limpo = apenasDigitos(numero || telefone);
    if (!limpo) {
      toast.error('Cliente sem telefone cadastrado.');
      return;
    }
    window.location.href = `tel:${limpo}`;
  };

  const enviarEmail = (endereco) => {
    const alvo = String(endereco || email || '').trim();
    if (!alvo) {
      toast.error('Cliente sem e-mail cadastrado.');
      return;
    }
    window.location.href = `mailto:${alvo}`;
  };

  // Só pergunta quando há mais de um contato do tipo; com um único, executa direto.
  const escolherOuExecutar = (campo, tipos, executar) => {
    const opcoes = contatosDoTipo(cliente, tipos);
    if (opcoes.length > 1) {
      setEscolhaContato({ campo, opcoes, executar });
      return;
    }
    setEscolhaContato(null);
    executar(opcoes[0]?.valor);
  };

  const atalhos = (
    <div className="grid grid-cols-2 gap-1.5">
      <Atalho icone={Plus} label="Registrar interação" onClick={abrirInteracao} cor="text-blue-700" />
      <Atalho icone={CalendarClock} label="Agendar follow-up" onClick={abrirFollowUp} cor="text-indigo-700" />
      <Atalho icone={MessageCircle} label="WhatsApp" onClick={() => escolherOuExecutar('whatsapp', ['whatsapp'], abrirWhatsApp)} cor="text-emerald-700" />
      <Atalho icone={Headset} label="Hub de atendimento" onClick={abrirHub} cor="text-sky-700" />
      <Atalho
        icone={Phone}
        label="Ligar"
        rotulo="Telefonia — abre o discador do dispositivo; GoTo exige integração conectada"
        onClick={() => escolherOuExecutar('telefone', ['telefone', 'celular', 'fixo'], ligar)}
      />
      <Atalho icone={Mail} label="E-mail" onClick={() => escolherOuExecutar('email', ['e-mail', 'email'], enviarEmail)} />
      <Atalho icone={MessageSquare} label="Próxima ação" onClick={() => toast.info(proximaAcao(negociacao))} cor="text-amber-700" />
    </div>
  );

  return (
    <PainelResumo
      linhas={[
        { label: 'Canal', valor: negociacao.canal || '—' },
        { label: 'Responsável', valor: negociacao.vendedor || '—' },
        { label: 'Próxima ação', valor: proximaAcao(negociacao) },
        { label: 'Última atualização', valor: dataCurta(registro.updated_date) },
      ]}
      bloco={(
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Atalhos de atendimento</p>
          {atalhos}
          {escolhaContato && (
            <div className="rounded-md border border-blue-200 bg-blue-50 p-2 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                Escolher {escolhaContato.campo === 'email' ? 'e-mail' : 'telefone'} do cliente
              </p>
              {escolhaContato.opcoes.map((opcao) => (
                <button
                  key={opcao.id}
                  type="button"
                  onClick={() => { escolhaContato.executar(opcao.valor); setEscolhaContato(null); }}
                  className="w-full rounded border border-blue-200 bg-white px-2 py-1 text-left text-[11px] text-slate-700 hover:bg-blue-100"
                >
                  {opcao.valor}{opcao.rotulo ? ` · ${opcao.rotulo}` : ''}
                </button>
              ))}
              <button type="button" onClick={() => setEscolhaContato(null)} className="text-[10px] text-slate-500 underline">
                Cancelar
              </button>
            </div>
          )}
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 pt-1">Últimas interações</p>
          <PainelRegistros
            entity="Interacao"
            filter={{ cliente_id: clienteId }}
            ordenacao="-data_interacao"
            vazio="Nenhuma interação registrada para este cliente."
            campos={[
              { key: 'titulo', destaque: true },
              { key: 'tipo', label: 'Tipo' },
              { key: 'data_interacao', label: 'Data', tipo: 'data' },
              { key: 'resultado', label: 'Resultado' },
            ]}
          />
        </div>
      )}
      nota={registro.observacoes_internas || registro.observacoes || 'Sem resumo registrado nesta negociação.'}
    />
  );
}