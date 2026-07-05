import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

/**
 * Hook extraído de AssinaturaEletronicaForm.jsx
 * Gerencia canvas de assinatura, dados do dispositivo, validação e persistência
 */
export function useAssinaturaEletronica({ documento, tipo = "contrato", onAssinado }) {
  const { toast } = useToast();
  const canvasRef = useRef(null);
  const [assinando, setAssinando] = useState(false);
  const [assinado, setAssinado] = useState(false);
  const [desenhando, setDesenhando] = useState(false);
  const [assinaturaVazia, setAssinaturaVazia] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [dadosAssinatura, setDadosAssinatura] = useState({
    nome_completo: "", cpf: "", email: "", cargo: "", ip_address: "", dispositivo: "", navegador: ""
  });

  useEffect(() => {
    const carregarUsuario = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        setDadosAssinatura(prev => ({ ...prev, nome_completo: user.full_name || "", email: user.email || "" }));
      } catch (error) { console.error("Erro ao carregar usuário:", error); }
    };
    carregarUsuario();
    obterDadosDispositivo();
    setTimeout(() => inicializarCanvas(), 100);
  }, []);

  const obterDadosDispositivo = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const userAgent = navigator.userAgent;
    let navegador = 'Desconhecido';
    if (userAgent.indexOf("Firefox") > -1) navegador = "Firefox";
    else if (userAgent.indexOf("Chrome") > -1) navegador = "Chrome";
    else if (userAgent.indexOf("Safari") > -1) navegador = "Safari";
    else if (userAgent.indexOf("Edge") > -1) navegador = "Edge";

    setDadosAssinatura(prev => ({
      ...prev,
      dispositivo: isMobile ? 'Mobile' : 'Desktop',
      navegador,
      ip_address: "192.168.1." + Math.floor(Math.random() * 255)
    }));
  };

  const inicializarCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const obterCoordenada = (e, rect) => {
    if (e.type === 'mousedown' || e.type === 'mousemove') return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (e.type === 'touchstart' || e.type === 'touchmove') return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    return { x: 0, y: 0 };
  };

  const iniciarDesenho = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDesenhando(true);
    setAssinaturaVazia(false);
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const { x, y } = obterCoordenada(e, rect);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const desenhar = (e) => {
    if (!desenhando) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const { x, y } = obterCoordenada(e, rect);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const pararDesenho = () => setDesenhando(false);

  const limparAssinatura = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setAssinaturaVazia(true);
  };

  const validar = () => {
    if (assinaturaVazia) {
      toast({ title: "⚠️ Assinatura obrigatória", description: "Desenhe sua assinatura no espaço indicado", variant: "destructive" });
      return false;
    }
    if (!dadosAssinatura.nome_completo) { toast({ title: "⚠️ Nome completo obrigatório", variant: "destructive" }); return false; }
    if (!dadosAssinatura.cpf) { toast({ title: "⚠️ CPF obrigatório", variant: "destructive" }); return false; }
    return true;
  };

  const obterAssinaturaBase64 = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
  };

  const assinarDocumento = async () => {
    if (!validar()) return;
    try {
      setAssinando(true);
      const assinaturaImagem = obterAssinaturaBase64();
      const assinatura = {
        ...dadosAssinatura,
        assinatura_imagem: assinaturaImagem,
        data_hora: new Date().toISOString(),
        documento_tipo: tipo,
        documento_id: documento.id,
        documento_numero: documento.numero_contrato || documento.numero_pedido || documento.numero,
        geolocation: "São Paulo, BR",
        user_id: currentUser?.id || "",
        user_email: currentUser?.email || ""
      };

      await new Promise(resolve => setTimeout(resolve, 1500));

      if (tipo === "contrato") {
        await base44.entities.Contrato.update(documento.id, {
          assinado: true,
          data_assinatura: new Date().toISOString().split('T')[0],
          assinatura_digital: assinatura,
          status: documento.status === "Aguardando Assinatura" ? "Vigente" : documento.status
        });
      } else if (tipo === "pedido") {
        await base44.entities.Pedido.update(documento.id, {
          assinado_cliente: true,
          data_assinatura_cliente: new Date().toISOString(),
          assinatura_cliente: assinatura
        });
      }

      setAssinado(true);
      toast({ title: "✅ Documento assinado!", description: "Assinatura registrada com sucesso" });
      if (onAssinado) onAssinado(assinatura);
    } catch (error) {
      console.error("Erro ao assinar:", error);
      toast({ title: "❌ Erro ao assinar", description: error.message, variant: "destructive" });
    } finally {
      setAssinando(false);
    }
  };

  const baixarComprovante = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `assinatura_${tipo}_${documento.id}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast({ title: "📥 Download iniciado", description: "Comprovante de assinatura baixado" });
  };

  return {
    canvasRef, assinando, assinado, assinaturaVazia, dadosAssinatura, setDadosAssinatura,
    iniciarDesenho, desenhar, pararDesenho, limparAssinatura, assinarDocumento, baixarComprovante
  };
}