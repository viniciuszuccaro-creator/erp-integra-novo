import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/components/lib/UserContext";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
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
  const [assinaturaBase64, setAssinaturaBase64] = useState(null);
  const [nomeRecebedor, setNomeRecebedor] = useState("");
  const [documentoRecebedor, setDocumentoRecebedor] = useState("");
  const [reversaAtiva, setReversaAtiva] = useState(false);
  const [reversaMotivo, setReversaMotivo] = useState("Recusa Total");
  const [reversaQtd, setReversaQtd] = useState(0);
  const [reversaValor, setReversaValor] = useState(0);

  const { data: minhasEntregas = [], isLoading: carregandoEntregas, isError: erroEntregas, refetch } = useQuery({
    queryKey: ["entregas-motorista", `${grupoAtual?.id || 'g'}-${empresaAtual?.id || 'e'}`],
    queryFn: async () => {
      const todas = await filterInContext("Entrega", { motorista_id: user?.id }, "-data_saida", 200);
      return todas.filter((e) => ["Saiu para Entrega", "Em Trânsito"].includes(e.status));
    },
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
  }, [minhasEntregas]); // eslint-disable-line

  useEffect(() => {
    const canvas = document.getElementById("assinatura-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let drawing = false; let lastX = 0; let lastY = 0;
    const start = (x, y) => { drawing = true; lastX = x; lastY = y; };
    const move = (x, y) => { if (!drawing) return; ctx.strokeStyle = "#111"; ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke(); lastX = x; lastY = y; };
    const end = () => { drawing = false; try { setAssinaturaBase64(canvas.toDataURL("image/png")); } catch (e) { console.error('[mobile] catch:', e); } };
    const getPos = (e) => { if (e.touches?.[0]) { const rect = canvas.getBoundingClientRect(); return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }; } const rect = canvas.getBoundingClientRect(); return { x: e.offsetX ?? 0, y: e.offsetY ?? 0 }; };
    const mdown = (e) => { const p = getPos(e); start(p.x, p.y); };
    const mmove = (e) => { const p = getPos(e); move(p.x, p.y); e.preventDefault(); };
    const mup = () => end();
    canvas.addEventListener("mousedown", mdown); canvas.addEventListener("mousemove", mmove); canvas.addEventListener("mouseup", mup);
    canvas.addEventListener("touchstart", mdown, { passive: false }); canvas.addEventListener("touchmove", mmove, { passive: false }); canvas.addEventListener("touchend", mup);
    return () => {
      canvas.removeEventListener("mousedown", mdown); canvas.removeEventListener("mousemove", mmove); canvas.removeEventListener("mouseup", mup);
      canvas.removeEventListener("touchstart", mdown); canvas.removeEventListener("touchmove", mmove); canvas.removeEventListener("touchend", mup);
    };
  }, []);

  const iniciarRastreamento = () => {
    if (!navigator.geolocation) { toast.error("GPS não disponível neste dispositivo"); return; }
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const novaLocalizacao = { latitude: position.coords.latitude, longitude: position.coords.longitude, precisao: position.coords.accuracy, velocidade: position.coords.speed || 0, timestamp: new Date().toISOString() };
        setLocalizacao(novaLocalizacao);
        if (entregaAtual) {
          base44.entities.PosicaoVeiculo.create({
            entrega_id: entregaAtual.id, romaneio_id: entregaAtual.romaneio_id, motorista_id: user.id, motorista_nome: user.full_name, placa: entregaAtual.placa,
            empresa_id: entregaAtual.empresa_id, group_id: entregaAtual.group_id,
            ...novaLocalizacao, bateria_nivel: 0, conectividade: navigator.connection?.effectiveType || "4G",
          });
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
    try {
      await base44.entities.Entrega.update(entrega.id, {
        status: "Em Trânsito",
        historico_status: [...(entrega.historico_status || []), { status: "Em Trânsito", data_hora: new Date().toISOString(), usuario: user.full_name, localizacao }],
      });
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
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setFotoComprovante(file_url);
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

  const confirmarEntrega = async () => {
    if (!entregaAtual?.id) { toast.error("Nenhuma entrega ativa"); return; }
    if (!nomeRecebedor) { toast.error("Informe o nome de quem recebeu"); return; }
    if (!fotoComprovante) { toast.error("Tire uma foto do comprovante"); return; }
    let assinatura = assinaturaBase64;
    try { const canvas = document.getElementById("assinatura-canvas"); if (canvas) assinatura = canvas.toDataURL("image/png"); } catch (e) { console.error('[mobile] assinatura catch:', e); }

    try {
      await base44.entities.Entrega.update(entregaAtual.id, {
        status: "Entregue", data_entrega: new Date().toISOString(),
        comprovante_entrega: { foto_comprovante: fotoComprovante, assinatura_digital: assinatura, nome_recebedor: nomeRecebedor, documento_recebedor: documentoRecebedor, data_hora_recebimento: new Date().toISOString(), latitude_entrega: localizacao?.latitude, longitude_entrega: localizacao?.longitude },
        historico_status: [...(entregaAtual.historico_status || []), { status: "Entregue", data_hora: new Date().toISOString(), usuario: user.full_name, localizacao, observacao: `Recebido por: ${nomeRecebedor}` }],
      });

      try { await base44.entities.AuditLog.create({ usuario: user?.full_name || user?.email || "Motorista", usuario_id: user?.id, empresa_id: entregaAtual?.empresa_id || null, group_id: entregaAtual?.group_id || null, acao: "Edição", modulo: "Expedição", tipo_auditoria: "ui", entidade: "Entrega", registro_id: entregaAtual?.id, descricao: "Entrega confirmada (foto + assinatura) no app do motorista", data_hora: new Date().toISOString() }); } catch (e) { console.error('[mobile] audit catch:', e); }

      setEntregaAtual(null); setFotoComprovante(null); setAssinaturaBase64(null); setNomeRecebedor(""); setDocumentoRecebedor("");
      refetch();
      toast.success("✅ Entrega confirmada com sucesso!");
    } catch (err) {
      console.error('[mobile] confirmarEntrega:', err);
      toast.error("Erro ao confirmar entrega. Verifique a conexão e tente novamente.");
    }
  };

  const registrarOcorrencia = async (motivo) => {
    if (!entregaAtual?.id) { toast.error("Nenhuma entrega ativa"); return; }
    try {
      await base44.entities.Entrega.update(entregaAtual.id, {
        status: "Entrega Frustrada",
        entrega_frustrada: { motivo, detalhes: "", tentativa_numero: 1, reagendamento: null, foto_ocorrencia: fotoComprovante },
        historico_status: [...(entregaAtual.historico_status || []), { status: "Entrega Frustrada", data_hora: new Date().toISOString(), usuario: user.full_name, localizacao, observacao: motivo }],
      });
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
      await base44.entities.Entrega.update(entregaAtual.id, {
        status: "Devolvido",
        logistica_reversa: { ativada: true, motivo: reversaMotivo, quantidade_devolvida: reversaQtd, valor_devolvido: reversaValor },
        historico_status: [...(entregaAtual.historico_status || []), { status: "Devolvido", data_hora: new Date().toISOString(), usuario: user.full_name, observacao: reversaMotivo }],
      });
      setEntregaAtual(null); refetch();
      toast.success("🔁 Logística reversa registrada");
    } catch (err) {
      console.error('[mobile] registrarReversa:', err);
      toast.error("Erro ao registrar logística reversa. Verifique a conexão.");
    }
  };

  return {
    user, minhasEntregas, refetch, carregandoEntregas, erroEntregas, entregaAtual, setEntregaAtual, localizacao, isOffline, smsNumero, setSmsNumero,
    fotoComprovante, setFotoComprovante, enviandoFoto, nomeRecebedor, setNomeRecebedor, documentoRecebedor, setDocumentoRecebedor,
    assinaturaBase64, setAssinaturaBase64, reversaMotivo, setReversaMotivo, reversaQtd, setReversaQtd, reversaValor, setReversaValor,
    iniciarEntrega, tirarFoto, confirmarEntrega, registrarOcorrencia, registrarReversa,
  };
}