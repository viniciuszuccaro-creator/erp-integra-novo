import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Push notification helpers
const isPushHabilitado = () => "Notification" in window && Notification.permission === "granted";

const solicitarPermissaoPush = async () => {
  if (!("Notification" in window)) { toast.error("Este navegador não suporta notificações push"); return false; }
  if (Notification.permission === "granted") return true;
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
};

const testarPushNotification = () => {
  if (!isPushHabilitado()) { toast.error("Permissão de notificações não concedida"); return; }
  new Notification("🔔 Teste de Notificação", { body: "As notificações push estão funcionando corretamente!", icon: "/favicon.ico", badge: "/favicon.ico" });
};

export { isPushHabilitado, solicitarPermissaoPush, testarPushNotification };

/**
 * Hook extraído de ConfiguracoesUsuario.jsx
 * Encapsula estado de preferências, mutations e handlers.
 */
export default function useConfiguracoesUsuario() {
  const queryClient = useQueryClient();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pushHabilitado, setPushHabilitado] = useState(isPushHabilitado());

  const { data: user } = useQuery({ queryKey: ['currentUser'], queryFn: () => base44.auth.me() });

  const [preferencesForm, setPreferencesForm] = useState({
    preferencias_notificacoes: {
      notificacoes_ativadas: true,
      canais: { sistema: true, email: false, push: false },
      categorias: { Sistema: true, Comercial: true, Financeiro: true, Estoque: true, RH: true, Fiscal: true, Geral: true },
      prioridades: { Urgente: true, Alta: true, Normal: true, Baixa: false },
      horario_silencioso: { ativo: false, inicio: "22:00", fim: "08:00" },
      resumo_email: { ativo: false, frequencia: "Diário", horario: "09:00" },
      som_notificacao: true, notificacao_desktop: false
    },
    configuracoes_sistema: { tema: "Claro", idioma: "pt-BR", timezone: "America/Sao_Paulo", formato_data: "DD/MM/YYYY", formato_moeda: "BRL" }
  });

  useEffect(() => {
    if (user?.preferencias_notificacoes) {
      setPreferencesForm(prev => ({ ...prev, preferencias_notificacoes: { ...prev.preferencias_notificacoes, ...user.preferencias_notificacoes } }));
    }
    if (user?.configuracoes_sistema) {
      setPreferencesForm(prev => ({ ...prev, configuracoes_sistema: { ...prev.configuracoes_sistema, ...user.configuracoes_sistema } }));
    }
  }, [user]);

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['currentUser'] }); setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); },
  });

  const handleSave = () => updateUserMutation.mutate(preferencesForm);

  const updateNotificationPref = (path, value) => {
    const keys = path.split('.');
    setPreferencesForm(prev => {
      const newPreferencesForm = { ...prev };
      let current = newPreferencesForm.preferencias_notificacoes;
      for (let i = 0; i < keys.length - 1; i++) { current[keys[i]] = { ...current[keys[i]] }; current = current[keys[i]]; }
      current[keys[keys.length - 1]] = value;
      return newPreferencesForm;
    });
  };

  const updateSystemPref = (key, value) => {
    setPreferencesForm(prev => ({ ...prev, configuracoes_sistema: { ...prev.configuracoes_sistema, [key]: value } }));
  };

  const handleSolicitarPush = async () => {
    const permitido = await solicitarPermissaoPush();
    setPushHabilitado(permitido);
    if (permitido) setTimeout(() => testarPushNotification(), 500);
  };

  return {
    user, preferencesForm, saveSuccess, pushHabilitado,
    updateUserMutation, handleSave, updateNotificationPref, updateSystemPref, handleSolicitarPush,
    testarPushNotification
  };
}