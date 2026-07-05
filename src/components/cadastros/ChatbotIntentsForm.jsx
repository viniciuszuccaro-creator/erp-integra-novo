import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MessageCircle, Lock } from "lucide-react";
import ChatbotIntentForm from "./ChatbotIntentForm";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

// Adapter: mantém a API antiga mas grava/edita na entidade consolidada ChatbotIntent
export default function ChatbotIntentsForm({ intent, onSubmit, isSubmitting }) {
  const { filterInContext, carimbarContexto } = useContextoVisual();
  const toNew = (legacy) => {
    const prioridadeMap = { Baixa: 25, Normal: 50, Alta: 75, Urgente: 100 };
    return {
      nome_intent: legacy?.nome_intent || "",
      descricao: legacy?.descricao || "",
      frases_treinamento: [],
      palavras_chave: legacy?.palavras_chave || [],
      tipo_intent: legacy?.tipo_intent || "consulta",
      acao_automatica: legacy?.acao_automatica || "nenhuma",
      entidade_vinculada: legacy?.entidade_vinculada || "",
      exige_autenticacao: !!legacy?.requer_autenticacao,
      resposta_template: legacy?.resposta_padrao || "",
      prioridade: prioridadeMap[legacy?.prioridade] ?? 100,
      ativo: legacy?.ativo ?? true,
      observacoes: legacy?.observacoes || "",
    };
  };

  const toLegacy = (neo) => ({
    nome_intent: neo?.nome_intent,
    descricao: neo?.descricao,
    palavras_chave: neo?.palavras_chave || [],
    tipo_intent: neo?.tipo_intent,
    entidade_vinculada: neo?.entidade_vinculada,
    requer_autenticacao: !!neo?.exige_autenticacao,
    resposta_padrao: neo?.resposta_template,
    prioridade: neo?.prioridade,
    ativo: neo?.ativo,
    observacoes: neo?.observacoes,
  });

  const initial = toNew(intent);

  const handleSubmit = async (data) => {
    if (intent?.id && intent?.__entity === 'ChatbotIntent') {
      await base44.entities.ChatbotIntent.update(intent.id, data);
    } else if (intent?.id && intent?.__entity === 'ChatbotIntents') {
      const existentes = await filterInContext('ChatbotIntent', { nome_intent: intent.nome_intent }, '-updated_date', 1);
      if (existentes?.length) {
        await base44.entities.ChatbotIntent.update(existentes[0].id, data);
      } else {
        await base44.entities.ChatbotIntent.create(carimbarContexto(data, 'empresa_id'));
      }
    } else {
      await base44.entities.ChatbotIntent.create(carimbarContexto(data, 'empresa_id'));
    }
    if (typeof onSubmit === 'function') onSubmit(toLegacy(data));
  };

  return <ChatbotIntentForm chatbotIntent={initial} onSubmit={handleSubmit} isSubmitting={isSubmitting} windowMode={false} />;
}