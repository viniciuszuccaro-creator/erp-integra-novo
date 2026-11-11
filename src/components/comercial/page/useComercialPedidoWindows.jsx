// Regra-Mãe 3: Extraído de src/pages/Comercial.jsx — handlers de criação/edição de pedido em janela
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useWindow } from "@/components/lib/useWindow";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useUser } from "@/components/lib/UserContext";
import PedidoFormCompleto from "@/components/comercial/PedidoFormCompleto";
import useAcoesComerciais from '@/components/comercial/central-vendas-360/useAcoesComerciais';

export default function useComercialPedidoWindows({ clientes, refetchPedidos }) {
  const { openWindow, closeWindow } = useWindow();
  const { createInContext, updateInContext } = useContextoVisual();
  const { user } = useUser();
  const acoes = useAcoesComerciais();

  const handleCreateNewPedido = (cliente = null) => {
    if (acoes.carregando || !acoes.podeCriar) return toast.error('Sem permissão para criar pedidos.');
    let pedidoCriado = false;
    const janela = openWindow(
      PedidoFormCompleto,
      {
        clientes,
        windowMode: true,
        onCancel: () => closeWindow(janela),
        pedido: {
          status: 'Rascunho',
          ...(cliente?.id ? {
            cliente_id: cliente.id,
            cliente_nome: cliente.nome_fantasia || cliente.razao_social || cliente.nome || cliente.nome_completo || '',
          } : {}),
        },
        onSubmit: async (formData) => {
          if (pedidoCriado) return;
          pedidoCriado = true;
          try {
            const created = await createInContext('Pedido', {
              ...formData,
              vendedor: formData.vendedor || user?.full_name,
              vendedor_id: formData.vendedor_id || user?.id
            });
            toast.success("Pedido criado!");
            await refetchPedidos();
            return created;
          } catch (error) {
            pedidoCriado = false;
            toast.error("Erro: " + error.message);
          }
        }
      },
      { title: ' Novo Pedido', width: 1400, height: 800 }
    );
  };

  const handleEditPedido = (pedido) => {
    if (acoes.carregando || !acoes.podeEditar) return toast.error('Sem permissão para editar pedidos.');
    if (!['Rascunho', 'Aguardando Aprovação', 'Aprovado'].includes(pedido?.status)) {
      toast.info('Os ajustes deste pedido pertencem à tela operacional de Produção, Entrega ou Retira.');
      return;
    }
    let atualizacaoEmAndamento = false;
    let windowIdRef = openWindow(
      PedidoFormCompleto,
      {
        pedido,
        clientes,
        windowMode: true,
        onCancel: () => closeWindow(windowIdRef),
        onSubmit: async (formData) => {
          if (atualizacaoEmAndamento) return;
          atualizacaoEmAndamento = true;
          try {
            await updateInContext('Pedido', formData.id, formData);
            toast.success("Pedido atualizado!");
            await refetchPedidos();
            if (windowIdRef) closeWindow(windowIdRef);
          } catch (error) {
            atualizacaoEmAndamento = false;
            toast.error("Erro: " + error.message);
          }
        }
      },
      { title: `Editar: ${pedido.numero_pedido}`, width: 1400, height: 800 }
    );
  };

  return { handleCreateNewPedido, handleEditPedido };
}