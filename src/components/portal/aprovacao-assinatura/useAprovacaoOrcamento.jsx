import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { toast } from "sonner";

/**
 * Hook: queries de orçamentos pendentes + mutations aprovar/rejeitar
 * P2: group_id/empresa_id propagados do cliente para orçamento e pedido
 * P3: data-permission nos botões (Portal.Orcamentos.aprovar/revisar)
 * Substitui prompt() por estado inline (motivoRevisao)
 */
export default function useAprovacaoOrcamento({ clienteId }) {
  const queryClient = useQueryClient();
  const { filterInContext } = useContextoVisual();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [assinaturaModal, setAssinaturaModal] = useState(false);
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState(null);
  const [nomeAssinante, setNomeAssinante] = useState('');
  const [motivoRevisao, setMotivoRevisao] = useState('');
  const [revisaoModal, setRevisaoModal] = useState(false);

  const { data: orcamentos = [] } = useQuery({
    queryKey: ['orcamentos-aprovacao', clienteId],
    queryFn: async () => {
      if (!clienteId) return [];
      return filterInContext('OrcamentoCliente', {
        cliente_id: clienteId,
        status: 'Pendente'
      }, '-created_date');
    },
    enabled: !!clienteId
  });

  // Canvas helpers
  const getCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    setIsDrawing(true);
    ctx.beginPath();
    const { x, y } = getCoords(e);
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const limparAssinatura = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const hasAssinatura = () => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return imageData.data.some(channel => channel !== 0);
  };

  const aprovarMutation = useMutation({
    mutationFn: async ({ orcamento, assinaturaDataUrl }) => {
      const blob = await (await fetch(assinaturaDataUrl)).blob();
      const file = new File([blob], 'assinatura.png', { type: 'image/png' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      await base44.entities.OrcamentoCliente.update(orcamento.id, {
        status: 'Aprovado',
        aprovado_por: nomeAssinante || 'Cliente',
        data_aprovacao: new Date().toISOString(),
        assinatura_url: file_url,
        assinatura_ip: 'Portal',
        assinatura_hash: btoa(assinaturaDataUrl.substring(0, 100))
      });

      const cli = await base44.entities.Cliente.filter({ id: clienteId }).then(r => r?.[0]);
      const pedido = await base44.entities.Pedido.create({
        numero_pedido: `PED${Date.now()}`,
        cliente_id: clienteId,
        cliente_nome: orcamento.cliente_nome,
        data_pedido: new Date().toISOString().split('T')[0],
        valor_total: orcamento.valor_total,
        itens_revenda: orcamento.itens || [],
        status: 'Aguardando Aprovação',
        origem_pedido: 'Portal - Orçamento Aprovado',
        observacoes_publicas: `Pedido gerado a partir do orçamento ${orcamento.numero_orcamento} com assinatura eletrônica`,
        pode_ver_no_portal: true,
        forma_pagamento: orcamento.condicoes_pagamento || 'À Vista',
        empresa_id: cli?.empresa_id || undefined,
        group_id: cli?.group_id || undefined
      });

      try {
        await base44.functions.invoke('solicitacoesAprovacao', {
          entity_name: 'Pedido',
          entity_id: pedido.id,
          valor: pedido.valor_total,
          empresa_id: cli?.empresa_id || undefined,
          group_id: cli?.group_id || undefined
        });
      } catch (_) { console.error('[aprovacao-assinatura] catch:', _); }

      await base44.entities.OrcamentoCliente.update(orcamento.id, {
        pedido_gerado_id: pedido.id,
        status: 'Convertido'
      });

      try {
        await base44.entities.AuditLog.create({
          acao: 'Aprovação', modulo: 'Portal', tipo_auditoria: 'entidade',
          entidade: 'OrcamentoCliente', registro_id: orcamento.id,
          descricao: `Aceite de orçamento ${orcamento.numero_orcamento} com assinatura`,
          dados_novos: { pedido_gerado_id: pedido.id, assinatura_url: file_url },
          data_hora: new Date().toISOString(),
          empresa_id: cli?.empresa_id || undefined,
          group_id: cli?.group_id || undefined
        });
      } catch (_) { console.error('[aprovacao-assinatura] catch:', _); }

      try {
        await base44.functions.invoke('sendEmailProvider', {
          to: orcamento.email_contato || orcamento.cliente_email || 'noreply@invalid.local',
          subject: `Orçamento aprovado • ${orcamento.numero_orcamento}`,
          body: `O orçamento ${orcamento.numero_orcamento} foi aprovado. Pedido ${pedido.numero_pedido} criado e aguarda aprovação.`
        });
      } catch (_) { console.error('[aprovacao-assinatura] catch:', _); }

      try {
        await base44.functions.invoke('whatsappSend', {
          to: orcamento.whatsapp_contato || '',
          message: `✅ Orçamento ${orcamento.numero_orcamento} aprovado. Pedido ${pedido.numero_pedido} gerado e aguardando aprovação.`
        });
      } catch (_) { console.error('[aprovacao-assinatura] catch:', _); }

      return { orcamento, pedido, assinaturaUrl: file_url };
    },
    onSuccess: async ({ pedido }) => {
      queryClient.invalidateQueries(['orcamentos-aprovacao']);
      queryClient.invalidateQueries(['pedidos-dashboard']);
      setAssinaturaModal(false);
      setOrcamentoSelecionado(null);
      setNomeAssinante('');

      try {
        const cli = await base44.entities.Cliente.filter({ id: clienteId }).then(r => r?.[0]);
        const novo = Number(cli?.pontos_fidelidade || 0) + 50;
        await base44.entities.Cliente.update(clienteId, {
          pontos_fidelidade: novo,
          empresa_id: cli?.empresa_id || undefined,
          group_id: cli?.group_id || undefined,
        });
        try {
          await base44.entities.AuditLog.create({
            acao: 'Edição', modulo: 'Portal', tipo_auditoria: 'entidade',
            entidade: 'Cliente', registro_id: clienteId,
            descricao: 'Gamificação: aprovação de orçamento (+50)',
            dados_novos: { pontos_fidelidade: novo },
            data_hora: new Date().toISOString()
          });
        } catch (e) { console.error('[aprovacao-assinatura] catch:', e); }
      } catch (_) { console.error('[aprovacao-assinatura] catch:', _); }

      try { await queryClient.invalidateQueries({ queryKey: ['cliente-portal'] }); } catch (e) { console.error('[aprovacao-assinatura] catch:', e); }
      try { await queryClient.invalidateQueries({ queryKey: ['orcamentos-aprovados-flag'] }); } catch (e) { console.error('[aprovacao-assinatura] catch:', e); }

      toast.success(`✅ Orçamento aprovado! Pedido ${pedido.numero_pedido} criado.`);
    },
    onError: (error) => {
      toast.error('Erro ao aprovar orçamento: ' + error.message);
    }
  });

  const rejeitarMutation = useMutation({
    mutationFn: async ({ orcamento, motivo }) => {
      await base44.entities.OrcamentoCliente.update(orcamento.id, {
        status: 'Revisao Solicitada',
        comentario_revisao: motivo,
        data_aprovacao: new Date().toISOString()
      });
      try {
        await base44.entities.AuditLog.create({
          acao: 'Edição', modulo: 'Portal', tipo_auditoria: 'entidade',
          entidade: 'OrcamentoCliente', registro_id: orcamento.id,
          descricao: `Solicitação de revisão do orçamento ${orcamento.numero_orcamento}`,
          dados_novos: { comentario_revisao: motivo },
          data_hora: new Date().toISOString()
        });
      } catch (_) { console.error('[aprovacao-assinatura] catch:', _); }
      try {
        await base44.functions.invoke('sendEmailProvider', {
          to: orcamento.email_contato || orcamento.cliente_email || 'noreply@invalid.local',
          subject: `Revisão solicitada • ${orcamento.numero_orcamento}`,
          body: `O cliente solicitou revisão do orçamento ${orcamento.numero_orcamento}.\nMotivo: ${motivo || 'Não informado'}`
        });
      } catch (_) { console.error('[aprovacao-assinatura] catch:', _); }
      try {
        await base44.functions.invoke('whatsappSend', {
          to: orcamento.whatsapp_contato || '',
          message: `⚠️ Revisão solicitada no orçamento ${orcamento.numero_orcamento}. Motivo: ${motivo || 'Não informado'}`
        });
      } catch (_) { console.error('[aprovacao-assinatura] catch:', _); }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['orcamentos-aprovacao']);
      setRevisaoModal(false);
      setMotivoRevisao('');
      toast.success('Revisão solicitada');
    }
  });

  const handleAprovar = () => {
    if (!nomeAssinante.trim()) {
      toast.error('Digite seu nome para continuar');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas || !hasAssinatura()) {
      toast.error('Por favor, assine no campo acima');
      return;
    }
    const assinaturaDataUrl = canvas.toDataURL('image/png');
    aprovarMutation.mutate({ orcamento: orcamentoSelecionado, assinaturaDataUrl });
  };

  const handleRejeitar = () => {
    rejeitarMutation.mutate({
      orcamento: orcamentoSelecionado,
      motivo: motivoRevisao || 'Não informado'
    });
  };

  return {
    orcamentos,
    canvasRef,
    isDrawing,
    assinaturaModal, setAssinaturaModal,
    orcamentoSelecionado, setOrcamentoSelecionado,
    nomeAssinante, setNomeAssinante,
    revisaoModal, setRevisaoModal,
    motivoRevisao, setMotivoRevisao,
    aprovarMutation, rejeitarMutation,
    startDrawing, draw, stopDrawing, limparAssinatura,
    handleAprovar, handleRejeitar
  };
}