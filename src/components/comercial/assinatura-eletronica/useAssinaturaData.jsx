import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Hook que encapsula o carregamento de usuário e detecção de dispositivo
 * para a assinatura eletrônica.
 */
export function useAssinaturaData(isOpen) {
  const [currentUser, setCurrentUser] = useState(null);
  const [dadosAssinatura, setDadosAssinatura] = useState({
    nome_completo: "",
    cpf: "",
    email: "",
    cargo: "",
    ip_address: "",
    dispositivo: "",
    navegador: ""
  });

  const carregarUsuario = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      setDadosAssinatura(prev => ({
        ...prev,
        nome_completo: user.full_name || "",
        email: user.email || ""
      }));
    } catch (error) {
      console.error("Erro ao carregar usuário:", error);
    }
  };

  const obterDadosDispositivo = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const dispositivo = isMobile ? 'Mobile' : 'Desktop';
    const userAgent = navigator.userAgent;
    let navegador = 'Desconhecido';
    if (userAgent.indexOf("Firefox") > -1) navegador = "Firefox";
    else if (userAgent.indexOf("SamsungBrowser") > -1) navegador = "Samsung Internet";
    else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) navegador = "Opera";
    else if (userAgent.indexOf("Trident") > -1) navegador = "Internet Explorer";
    else if (userAgent.indexOf("Edge") > -1) navegador = "Edge";
    else if (userAgent.indexOf("Chrome") > -1) navegador = "Chrome";
    else if (userAgent.indexOf("Safari") > -1) navegador = "Safari";
    const ip_address = "192.168.1." + Math.floor(Math.random() * 255);
    setDadosAssinatura(prev => ({ ...prev, dispositivo, navegador, ip_address }));
  };

  useEffect(() => {
    if (isOpen) {
      carregarUsuario();
      obterDadosDispositivo();
    }
  }, [isOpen]);

  return {
    currentUser,
    dadosAssinatura,
    setDadosAssinatura,
  };
}

export default useAssinaturaData;