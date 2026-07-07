import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useToast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from "sonner";

/**
 * Hook extraído de FormularioEntrega.jsx
 * Encapsula mutations de criar/atualizar entrega + IA previsão + geolocalização.
 */
export default function useEntregaForm({ formData, setFormData, onCancel, isEditing }) {
  const [previsaoIA, setPrevisaoIA] = useState(null);
  const [calculandoPrevisao, setCalculandoPrevisao] = useState(false);
  const queryClient = useQueryClient();
  const { toast: toastHook } = useToast();
  const { user: authUser } = useUser();
  const { createInContext, updateInContext } = useContextoVisual();

  const calcularPrevisaoEntrega = async () => {
    if (!formData.endereco_entrega_completo?.cidade) { sonnerToast.error("❌ Preencha o endereço primeiro"); return; }
    setCalculandoPrevisao(true);
    try {
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Calcule a previsão de entrega para:\nCidade: ${formData.endereco_entrega_completo.cidade}\nEstado: ${formData.endereco_entrega_completo.estado}\nPeso: ${formData.peso_total_kg || 0} kg\nPrioridade: ${formData.prioridade}\nTipo Frete: ${formData.tipo_frete}\n\nRetorne:\n- data_prevista (formato YYYY-MM-DD)\n- prazo_dias (número inteiro)\n- horario_previsto (HH:MM)\n- confianca_percentual (0-100)`,
        response_json_schema: { type: "object", properties: { data_prevista: { type: "string" }, prazo_dias: { type: "number" }, horario_previsto: { type: "string" }, confianca_percentual: { type: "number" } } }
      });
      setPrevisaoIA(resultado);
      setFormData(prev => ({ ...prev, data_previsao: resultado.data_prevista }));
      sonnerToast.success("🤖 Previsão calculada com IA!");
    } catch (error) { sonnerToast.error("Erro ao calcular previsão"); }
    finally { setCalculandoPrevisao(false); }
  };

  const createMutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        usuario_responsavel: data.usuario_responsavel || (authUser?.full_name || authUser?.email),
        usuario_responsavel_id: data.usuario_responsavel_id || authUser?.id,
        group_id: data.group_id,
        empresa_id: data.empresa_id,
      };
      return base44.entities.Entrega.create(payload);
    },
    onSuccess: async (entregaCriada) => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      toastHook({ title: "✅ Entrega criada!" });
      sonnerToast.success("✅ Entrega criada com sucesso!");
      try {
        await base44.entities.AuditLog.create({
          empresa_id: entregaCriada?.empresa_id, usuario: authUser?.full_name || authUser?.email, usuario_id: authUser?.id,
          acao: 'Criação', modulo: 'Expedição', entidade: 'Entrega', registro_id: entregaCriada?.id,
          descricao: 'Entrega criada via formulário', dados_novos: entregaCriada, data_hora: new Date().toISOString(), sucesso: true
        });
      } catch (_) {}
      onCancel();
    },
    onError: (error) => { toastHook({ title: "❌ Erro ao criar entrega", description: error.message, variant: "destructive" }); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateInContext('Entrega', id, data),
    onSuccess: async (entregaAtualizada) => {
      queryClient.invalidateQueries({ queryKey: ['entregas'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      toastHook({ title: "✅ Entrega atualizada!" });
      sonnerToast.success("✅ Entrega atualizada!");
      try {
        await base44.entities.AuditLog.create({
          empresa_id: entregaAtualizada?.empresa_id, usuario: authUser?.full_name || authUser?.email, usuario_id: authUser?.id,
          acao: 'Edição', modulo: 'Expedição', entidade: 'Entrega', registro_id: entregaAtualizada?.id,
          descricao: 'Entrega atualizada via formulário', dados_novos: entregaAtualizada, data_hora: new Date().toISOString(), sucesso: true
        });
      } catch (_) {}
      onCancel();
    },
    onError: (error) => { toastHook({ title: "❌ Erro ao atualizar entrega", description: error.message, variant: "destructive" }); }
  });

  const handleClienteChange = (clienteId, clientes) => {
    const cliente = clientes.find(c => c.id === clienteId);
    if (cliente) {
      const enderecoPrincipal = cliente.locais_entrega?.find(l => l.principal) || cliente.locais_entrega?.[0];
      const contatoPrincipal = cliente.contatos?.find(c => c.principal) || cliente.contatos?.[0];
      setFormData(prev => ({
        ...prev, cliente_id: clienteId, cliente_nome: cliente.nome || cliente.razao_social,
        endereco_entrega_completo: enderecoPrincipal ? {
          cep: enderecoPrincipal.cep || "", logradouro: enderecoPrincipal.logradouro || "", numero: enderecoPrincipal.numero || "",
          complemento: enderecoPrincipal.complemento || "", bairro: enderecoPrincipal.bairro || "",
          cidade: enderecoPrincipal.cidade || "", estado: enderecoPrincipal.estado || "",
          latitude: enderecoPrincipal.latitude || null, longitude: enderecoPrincipal.longitude || null,
          referencia: enderecoPrincipal.referencia || "", link_google_maps: enderecoPrincipal.link_google_maps || ""
        } : prev.endereco_entrega_completo,
        contato_entrega: { nome: contatoPrincipal?.observacao || "", telefone: contatoPrincipal?.tipo === "Telefone" ? contatoPrincipal.valor : "", whatsapp: (contatoPrincipal?.tipo === "WhatsApp" || contatoPrincipal?.tipo === "Telefone") ? contatoPrincipal.valor : "", email: "", instrucoes_especiais: "" }
      }));
    }
  };

  const handlePedidoChange = (pedidoId, pedidos, clientes) => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (pedido) {
      setFormData(prev => ({ ...prev, pedido_id: pedidoId, numero_pedido: pedido.numero_pedido, cliente_id: pedido.cliente_id, cliente_nome: pedido.cliente_nome, valor_mercadoria: pedido.valor_total, endereco_entrega_completo: pedido.endereco_entrega_principal || prev.endereco_entrega_completo }));
      if (pedido.cliente_id) handleClienteChange(pedido.cliente_id, clientes);
    }
  };

  const handleSubmitForm = async () => {
    if (isEditing && formData.id) updateMutation.mutate({ id: formData.id, data: formData });
    else createMutation.mutate(formData);
  };

  const buscarDadosGoogleMaps = async () => {
    const endereco = `${formData.endereco_entrega_completo.logradouro}, ${formData.endereco_entrega_completo.numero}, ${formData.endereco_entrega_completo.cidade}, ${formData.endereco_entrega_completo.estado}`;
    try {
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Gere um link do Google Maps para o endereço: ${endereco}\nTambém forneça coordenadas aproximadas (latitude, longitude).\n\nRetorne no formato JSON.`,
        response_json_schema: { type: "object", properties: { link_google_maps: { type: "string" }, latitude: { type: "number" }, longitude: { type: "number" } } }
      });
      setFormData(prev => ({ ...prev, endereco_entrega_completo: { ...prev.endereco_entrega_completo, link_google_maps: resultado.link_google_maps, latitude: resultado.latitude, longitude: resultado.longitude } }));
      sonnerToast.success("📍 Geolocalização obtida!");
    } catch (error) { sonnerToast.error("Erro ao buscar coordenadas"); }
  };

  return {
    previsaoIA, calculandoPrevisao, calcularPrevisaoEntrega, buscarDadosGoogleMaps,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    handleSubmitForm, handleClienteChange, handlePedidoChange
  };
}