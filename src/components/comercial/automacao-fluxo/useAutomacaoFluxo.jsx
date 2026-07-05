import { useState, useEffect } from "react";
import { toast } from "sonner";
import { executarFechamentoCompleto } from "@/components/lib/useFluxoPedido";
import { useUser } from "@/components/lib/UserContext";

/**
 * Hook: Automação do Fluxo de Pedido
 * Gerencia estado, permissões e execução do fechamento automático
 */
export default function useAutomacaoFluxo(pedido, empresaId, onComplete, autoExecute = false) {
  const { user } = useUser();
  const empresaProcessamento = empresaId || pedido?.empresa_id;
  const [executando, setExecutando] = useState(false);
  const [etapaConcluida, setEtapaConcluida] = useState({ estoque: false, financeiro: false, logistica: false, status: false });
  const [progresso, setProgresso] = useState(0);
  const [logs, setLogs] = useState([]);
  const [permitido, setPermitido] = useState(true);

  const adicionarLog = (mensagem, tipo = 'info') => {
    setLogs(prev => [...prev, { mensagem, tipo, timestamp: new Date() }]);
  };

  useEffect(() => {
    if (user) {
      const temPermissao = user.role === 'admin' || user.role === 'gerente';
      setPermitido(temPermissao);
      if (!temPermissao) {
        adicionarLog('⚠️ Apenas administradores e gerentes podem executar fechamento automático', 'warning');
      }
    }
  }, [user]);

  useEffect(() => {
    if (autoExecute && !executando && progresso === 0 && permitido) {
      executarFluxoCompleto();
    }
  }, [autoExecute, permitido]);

  const executarFluxoCompleto = async () => {
    if (executando || !permitido) {
      if (!permitido) toast.error('❌ Sem permissão para executar fechamento automático');
      return;
    }

    setExecutando(true);
    setProgresso(0);
    setLogs([]);

    try {
      await executarFechamentoCompleto(pedido, empresaProcessamento, {
        onProgresso: (valor) => setProgresso(valor),
        onLog: (mensagem, tipo) => adicionarLog(mensagem, tipo),
        onEtapaConcluida: (etapa, sucesso) => {
          setEtapaConcluida(prev => ({ ...prev, [etapa]: sucesso }));
        },
        onComplete: (resultados) => {
          toast.success('✅ Fluxo de pedido concluído com sucesso!');
          adicionarLog('🎉 AUTOMAÇÃO CONCLUÍDA! Fechando em 2s...', 'success');
          setTimeout(() => { if (onComplete) onComplete(resultados); }, 2000);
        },
        onError: (error) => {
          toast.error(`❌ Erro na automação: ${error.message}`);
        }
      });
    } catch (error) {
      toast.error(`❌ Erro crítico: ${error.message}`);
      adicionarLog(`❌ FALHA CRÍTICA: ${error.message}`, 'error');
    } finally {
      setExecutando(false);
    }
  };

  return {
    executando, etapaConcluida, progresso, logs, permitido,
    executarFluxoCompleto,
  };
}