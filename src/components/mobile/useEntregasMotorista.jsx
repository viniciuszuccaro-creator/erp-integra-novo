import { useState, useEffect, useRef } from "react";
import { enviarComprovantePendente } from '@/components/expedicao/comprovanteDigitalStorage';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { sanitizeFlow } from "@/components/lib/contexto/contextoCrud";
import { toast } from "sonner";

export default function useEntregasMotorista() {
  const { user } = useUser();
  const { filterInContext, empresaAtual, grupoAtual } = useContextoVisual();
  const [entregaAtual, setEntregaAtual] = useState(null);
  const [localizacao, setLocalizacao] = useState(null);
  const [rastreando, setRastreando] = useState(false);
  const [fotoComprovante, setFotoComprovante] = useState(null);
  const [isOffline, setIsOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false);
  const [smsNumero, setSmsNumero] = useState("");
  const sincronizando = useRef(false);
  const [reversaAtiva, setReversaAtiva] = useState(false);
  const [reversaMotivo, setReversaMotivo] = useState("Recusa Total");
  const [reversaQtd, setReversaQtd] = useState(0);
  const [reversaValor, setReversaValor] = useState(0);
  const [filaOffline, setFilaOffline] = useState(() => {
    try {
      const saved = localStorage.getItem('erp_zuccaro_fila_offline');
      return saved ? JSON.parse(saved) : [];
    } catch (_) { return []; }
  });

  // Persiste fila offline no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('erp_zuccaro_fila_offline', JSON.stringify(filaOffline));
    } catch (erro) { console.error('Não foi possível persistir a fila offline:', erro); }
  }, [filaOffline]);

  // Comprovantes offline mantêm arquivos no IndexedDB; o navegador persiste só a referência na fila.
  useEffect(() => {
    if (isOffline || !user?.id || sincronizando.current || !filaOffline.length) return;
    sincronizando.current = true;
    (async () => {
      const resolvidos = []; const versoesIniciadas = new Map();
      for (const op of filaOffline) {
        if (op.usuarioId !== user.id) continue;
        if (op.group_id && op.group_id !== grupoAtual?.id) continue;
        if (empresaAtual?.id && op.empresa_id && op.empresa_id !== empresaAtual.id) continue;
        try {
          if (op.tipo === 'comprovante_completo') await enviarComprovantePendente(op.dados.chave, user.id, versoesIniciadas.get(op.entregaId));
          else if (op.tipo === 'update_entrega') {
            const atualizada = await base44.entities.Entrega.update(op.entregaId, sanitizeFlow(op.dados));
            if (op.dados.status === 'Em Trânsito') versoesIniciadas.set(op.entregaId, atualizada.updated_date);
          }
          else continue;
          resolvidos.push(op.id);
        } catch (err) { toast.error(err.response?.data?.error || err.message || 'Comprovante pendente de sincronização.'); break; }
      }
      if (resolvidos.length) {
        setFilaOffline((prev) => prev.filter((op) => !resolvidos.includes(op.id)));
        toast.success(`${resolvidos.length} operação(ões) sincronizada(s)`); refetch();
      }
    })().finally(() => { sincronizando.current = false; });
  }, [isOffline, user?.id, grupoAtual?.id, empresaAtual?.id]);

  const enfileirarOperacao = (tipo, entregaId, dados) => {
    const entrega = minhasEntregas.find((item) => item.id === entregaId);
    if (!user?.id || !entrega?.group_id || !entrega?.empresa_id) throw new Error('Contexto da entrega obrigatório para guardar operação offline.');
    const op = { id: crypto.randomUUID(), usuarioId: user.id, group_id: entrega.group_id, empresa_id: entrega.empresa_id, tipo, entregaId, dados, criadoEm: new Date().toISOString() };
    setFilaOffline(prev => [...prev, op]);
    return op;
  };

  const { data: minhasEntregas = [], isLoading: carregandoEntregas, isError: erroEntregas, refetch } = useQuery({
    queryKey: ["entregas-motorista", user?.id, grupoAtual?.id, empresaAtual?.id],
    queryFn: () => filterInContext("Entrega", { motorista_id: user?.id, status: { $in: ['Saiu para Entrega', 'Em Trânsito'] } }, "-data_saida", 200),
    enabled: !!user && !!(empresaAtual?.id || grupoAtual?.id),
    refetchInterval: 30000,
    staleTime: 15000,
    gcTime: 120000,
    retry: 2,
    retryDelay: 1500,
  });

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); };
  }, []);

  useEffect(() => {
    if (minhasEntregas.length > 0 && !rastreando) iniciarRastreamento();
    return () => { if (rastreando && navigator.geolocation) navigator.geolocation.clearWatch(rastreando); };
  }, [minhasEntregas]);

  const iniciarRastreamento = () => {
    if (!navigator.geolocation) { toast.error("GPS não disponível neste dispositivo"); return; }
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const novaLocalizacao = { latitude: position.coords.latitude, longitude: position.coords.longitude, precisao: position.coords.accuracy, velocidade: position.coords.speed || 0, timestamp: new Date().toISOString() };
        setLocalizacao(novaLocalizacao);
        if (entregaAtual) {
          base44.entities.PosicaoVeiculo.create(sanitizeFlow({
            entrega_id: entregaAtual.id, romaneio_id: entregaAtual.romaneio_id, motorista_id: user.id, motorista_nome: user.full_name, placa: entregaAtual.placa,
            empresa_id: entregaAtual.empresa_id, group_id: entregaAtual.group_id,
            ...novaLocalizacao, bateria_nivel: 0, conectividade: navigator.connection?.effectiveType || "4G",
          }));
        }
      },
      (error) => console.error("Erro GPS:", error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
    setRastreando(watchId);
    toast.success("📍 Rastreamento GPS ativado");
  };

  const iniciarEntrega = async (entrega) => {
    if (!entrega?.id) { toast.error("Entrega inválida"); return; }
    setEntregaAtual(entrega);
    const dados = {
      status: "Em Trânsito",
      historico_status: [...(entrega.historico_status || []), { status: "Em Trânsito", data_hora: new Date().toISOString(), usuario: user.full_name, localizacao }],
    };
    if (isOffline) {
      enfileirarOperacao('update_entrega', entrega.id, dados);
      toast.info("📴 Sem conexão — operação enfileirada para sincronização");
      return;
    }
    try {
      const atualizada = await base44.entities.Entrega.update(entrega.id, sanitizeFlow(dados));
      setEntregaAtual(atualizada);
      try { await base44.entities.AuditLog.create({ usuario: user?.full_name || user?.email || "Motorista", usuario_id: user?.id, empresa_id: entrega.empresa_id || null, group_id: entrega.group_id || null, acao: "Edição", modulo: "Expedição", tipo_auditoria: "ui", entidade: "Entrega", registro_id: entrega.id, descricao: "Entrega iniciada no app do motorista", data_hora: new Date().toISOString() }); } catch (e) { console.error('[mobile] audit catch:', e); }
      refetch();
      toast.success("🚚 Entrega iniciada!");
    } catch (err) {
      console.error('[mobile] iniciarEntrega:', err);
      toast.error("Erro ao iniciar entrega. Verifique a conexão e tente novamente.");
      setEntregaAtual(null);
    }
  };

  const [enviandoFoto, setEnviandoFoto] = useState(false);

  const tirarFoto = async () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*"; input.capture = "environment";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setEnviandoFoto(true);
      try {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        setFotoComprovante(file_uri);
        toast.success("✅ Foto capturada!");
      } catch (error) {
        console.error('[mobile] uploadFoto:', error);
        toast.error("Erro ao enviar foto. Verifique a conexão e tente novamente.");
      } finally {
        setEnviandoFoto(false);
      }
    };
    input.click();
  };

  const concluirComprovante = () => { setEntregaAtual(null); setFotoComprovante(null); refetch(); toast.success('Entrega confirmada com comprovante completo.'); };
  const enfileirarComprovante = (chave) => {
    setFilaOffline((prev) => [...prev.filter((op) => op.dados?.chave !== chave), { id: crypto.randomUUID(), tipo: 'comprovante_completo', usuarioId: user.id, entregaId: entregaAtual.id, group_id: entregaAtual.group_id, empresa_id: entregaAtual.empresa_id, dados: { chave }, criadoEm: new Date().toISOString() }]);
    setEntregaAtual(null); toast.info('Comprovante guardado no dispositivo. Será enviado ao reconectar.');
  };

  const registrarOcorrencia = async (motivo) => {
    if (!entregaAtual?.id) { toast.error("Nenhuma entrega ativa"); return; }
    try {
      await base44.entities.Entrega.update(entregaAtual.id, sanitizeFlow({
        status: "Entrega Frustrada",
        entrega_frustrada: { motivo, detalhes: "", tentativa_numero: 1, reagendamento: null, foto_ocorrencia: fotoComprovante },
        historico_status: [...(entregaAtual.historico_status || []), { status: "Entrega Frustrada", data_hora: new Date().toISOString(), usuario: user.full_name, localizacao, observacao: motivo }],
      }));
      // Regra-Mãe 5d: auditoria da ocorrência de entrega frustrada
      try { await base44.entities.AuditLog.create({ usuario: user?.full_name || user?.email || "Motorista", usuario_id: user?.id, empresa_id: entregaAtual?.empresa_id || null, group_id: entregaAtual?.group_id || null, acao: "Edição", modulo: "Expedição", tipo_auditoria: "ui", entidade: "Entrega", registro_id: entregaAtual?.id, descricao: `Entrega frustrada no app do motorista: ${motivo}`, dados_novos: { status: "Entrega Frustrada", motivo }, data_hora: new Date().toISOString() }); } catch (e) { console.error('[mobile] audit catch:', e); }
      setEntregaAtual(null); refetch();
      toast.error("❌ Ocorrência registrada");
    } catch (err) {
      console.error('[mobile] registrarOcorrencia:', err);
      toast.error("Erro ao registrar ocorrência. Verifique a conexão.");
    }
  };

  const registrarReversa = async () => {
    if (!entregaAtual?.id) { toast.error("Nenhuma entrega ativa"); return; }
    try {
      await base44.entities.Entrega.update(entregaAtual.id, sanitizeFlow({
        status: "Devolvido",
        logistica_reversa: { ativada: true, motivo: reversaMotivo, quantidade_devolvida: reversaQtd, valor_devolvido: reversaValor },
        historico_status: [...(entregaAtual.historico_status || []), { status: "Devolvido", data_hora: new Date().toISOString(), usuario: user.full_name, observacao: reversaMotivo }],
      }));
      // Regra-Mãe 5d: auditoria da logística reversa
      try { await base44.entities.AuditLog.create({ usuario: user?.full_name || user?.email || "Motorista", usuario_id: user?.id, empresa_id: entregaAtual?.empresa_id || null, group_id: entregaAtual?.group_id || null, acao: "Edição", modulo: "Expedição", tipo_auditoria: "ui", entidade: "Entrega", registro_id: entregaAtual?.id, descricao: `Logística reversa registrada no app: ${reversaMotivo}`, dados_novos: { status: "Devolvido", motivo: reversaMotivo, quantidade_devolvida: reversaQtd }, data_hora: new Date().toISOString() }); } catch (e) { console.error('[mobile] audit catch:', e); }
      setEntregaAtual(null); refetch();
      toast.success("🔁 Logística reversa registrada");
    } catch (err) {
      console.error('[mobile] registrarReversa:', err);
      toast.error("Erro ao registrar logística reversa. Verifique a conexão.");
    }
  };

  return {
    user, minhasEntregas, refetch, carregandoEntregas, erroEntregas, entregaAtual, setEntregaAtual, localizacao, isOffline, smsNumero, setSmsNumero,
    fotoComprovante, setFotoComprovante, enviandoFoto,
    reversaMotivo, setReversaMotivo, reversaQtd, setReversaQtd, reversaValor, setReversaValor,
    iniciarEntrega, tirarFoto, concluirComprovante, enfileirarComprovante, registrarOcorrencia, registrarReversa,
    filaOffline, operacoesPendentes: filaOffline.length,
  };
}