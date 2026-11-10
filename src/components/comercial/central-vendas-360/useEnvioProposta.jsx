// Envio da proposta ao cliente e agendamento de follow-up — usa os canais já existentes do ERP
// WhatsApp: lib integracaoWhatsApp (whatsappSend) • E-mail: função sendEmailProvider
// Follow-up: Interacao (CRM) com próxima ação datada • Contexto multiempresa + auditoria obrigatórios
import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useUser } from '@/components/lib/UserContext';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { enviarWhatsApp } from '@/components/lib/integracaoWhatsApp';
import { brl, dataCurta } from './negociacaoUtils';

const contatoPorTipo = (cliente, tipos) => {
  const lista = Array.isArray(cliente?.contatos) ? cliente.contatos : [];
  const achado = lista.find((c) => tipos.includes(String(c?.tipo || '').toLowerCase()));
  return achado?.valor || null;
};

export const whatsappDoCliente = (cliente) =>
  contatoPorTipo(cliente, ['whatsapp']) || cliente?.celular || cliente?.telefone || '';

export const emailDoCliente = (cliente) =>
  contatoPorTipo(cliente, ['e-mail', 'email']) || cliente?.email || '';

export const somenteDigitos = (valor) => String(valor || '').replace(/\D/g, '');

const primeiroNome = (nome) => String(nome || '').trim().split(/\s+/)[0] || 'tudo bem';

export function montarMensagemProposta(negociacao, contexto = '') {
  const cumprimento = `Olá, ${primeiroNome(negociacao.cliente_nome)}!`;
  const itens = (negociacao.itens || []).slice(0, 12).map((item, i) =>
    `${i + 1}. ${item.descricao} — ${item.quantidade} ${item.unidade} × ${brl(item.valor_unitario)} = ${brl(item.valor_total)}`
  );
  const linhas = [
    `*Proposta ${negociacao.numero}*${contexto ? ` — ${contexto}` : ''}`,
    '',
    cumprimento,
    'Segue nossa proposta comercial:',
    ...itens,
    '',
    `Total: *${brl(negociacao.totais?.total)}*`,
    `Condição de pagamento: ${negociacao.condicao_pagamento}`,
    `Prazo de entrega: ${negociacao.prazo}`,
    `Validade da proposta: ${dataCurta(negociacao.validade)}`,
    '',
    'Qualquer dúvida estou à disposição para ajustar a proposta.',
  ];
  return linhas.join('\n');
}

export function montarAssuntoProposta(negociacao, contexto = '') {
  return `Proposta ${negociacao.numero}${contexto ? ` — ${contexto}` : ''}`;
}

const emDias = (dias) => {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return data.toISOString().slice(0, 10);
};

export default function useEnvioProposta({ negociacao, empresa, grupo, onAtualizar }) {
  const [enviando, setEnviando] = useState(false);
  const { createInContext, updateInContext } = useContextoVisual();
  const { user } = useUser();

  const registrarAuditoria = (acao, descricao) => {
    void base44.entities.AuditLog.create({
      usuario: user?.full_name || user?.email || 'Usuário',
      usuario_id: user?.id || null,
      acao,
      modulo: 'Comercial',
      tipo_auditoria: 'venda',
      entidade: negociacao.origem === 'orcamento' ? 'OrcamentoCliente' : 'Pedido',
      registro_id: negociacao.registro?.id || null,
      descricao,
      empresa_id: empresa?.id || null,
      group_id: grupo?.id || empresa?.group_id || empresa?.grupo_id || null,
      data_hora: new Date().toISOString(),
    }).catch((erro) => { console.error('AuditLog falhou (envio de proposta):', erro); });
  };

  const enviar = async ({ canal, destinatario, mensagem, assunto, followUpAtivo, followUpData, followUpAcao }) => {
    if (!empresa?.id) {
      toast.error('Selecione a empresa antes de enviar a proposta.');
      return false;
    }
    if (!String(destinatario || '').trim()) {
      toast.error(canal === 'whatsapp' ? 'Informe o WhatsApp do cliente.' : 'Informe o e-mail do cliente.');
      return false;
    }

    setEnviando(true);
    try {
      if (canal === 'whatsapp') {
        const retorno = await enviarWhatsApp({
          numero: somenteDigitos(destinatario),
          mensagem,
          empresaId: empresa.id,
          tipo: 'texto',
        });
        const falha = retorno?.error || retorno?.erro || retorno?.message;
        if (retorno?.sucesso === false || (falha && !retorno?.key?.id)) {
          throw new Error(falha || 'Falha no envio pelo WhatsApp.');
        }
      } else {
        const { data } = await base44.functions.invoke('sendEmailProvider', {
          empresaId: empresa.id,
          destinatario: String(destinatario).trim(),
          destinatario_nome: negociacao.cliente_nome,
          assunto: assunto || montarAssuntoProposta(negociacao, empresa?.nome || grupo?.nome || ''),
          mensagem,
          tipo_conteudo: 'texto',
        });
        if (data?.error) throw new Error(data.error);
      }

      if (followUpAtivo && followUpData) {
        await createInContext('Interacao', {
          tipo: canal === 'whatsapp' ? 'WhatsApp' : 'E-mail',
          titulo: `Follow-up da proposta ${negociacao.numero}`,
          descricao: `Proposta enviada por ${canal === 'whatsapp' ? 'WhatsApp' : 'e-mail'} para ${destinatario}.`,
          data_interacao: new Date().toISOString(),
          cliente_id: negociacao.cliente_id || null,
          cliente_nome: negociacao.cliente_nome,
          responsavel: user?.full_name || user?.email || 'Usuário',
          responsavel_id: user?.id || null,
          resultado: 'Sem Resposta',
          proxima_acao: followUpAcao || `Cobrar retorno da proposta ${negociacao.numero}`,
          data_proxima_acao: followUpData,
          observacoes: `Negociação ${negociacao.numero} da Central de Vendas 360.`,
        });
      }

      // Proposta enviada conclui a etapa de montagem: orçamento passa a aguardar o cliente
      if (negociacao.origem === 'orcamento' && negociacao.grupo === 'aberto') {
        await updateInContext('OrcamentoCliente', negociacao.registro.id, { status: 'Aprovado' });
      }

      registrarAuditoria('Envio', `Proposta ${negociacao.numero} enviada por ${canal === 'whatsapp' ? 'WhatsApp' : 'e-mail'} para ${destinatario}`);
      toast.success(
        followUpAtivo && followUpData
          ? `Proposta enviada. Follow-up agendado para ${dataCurta(followUpData)}.`
          : 'Proposta enviada ao cliente.'
      );
      await onAtualizar?.();
      return true;
    } catch (erro) {
      toast.error(`Não foi possível enviar: ${erro.message}`);
      return false;
    } finally {
      setEnviando(false);
    }
  };

  return { enviar, enviando, dataFollowUpPadrao: emDias(3) };
}