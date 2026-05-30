import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, ArrowDownUp, Shield, Bell, Globe } from "lucide-react";
import ToggleConfigGlobal from "@/components/sistema/ToggleConfigGlobal";

/**
 * ParametrosGeraisPanel v2.0
 * Painel de parâmetros globais com toggles persistentes
 * Organizado por categorias: Propagação, Segurança, Notificações, Integrações
 */

function Section({ title, icon: Icon, children }) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {children}
      </CardContent>
    </Card>
  );
}

export default function ParametrosGeraisPanel() {
  return (
    <div className="w-full h-full space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-slate-600" />
        <h2 className="text-xl font-bold text-slate-900">Parâmetros Gerais</h2>
      </div>

      {/* ─ Propagação ─ */}
      <Section title="Propagação Grupo ↔ Empresas" icon={ArrowDownUp}>
        <ToggleConfigGlobal
          configKey="propagacao_grupo_empresas_ativa"
          label="Propagação automática ativada"
          description="Replica automaticamente cadastros do grupo para todas as empresas vinculadas"
          defaultValue={true}
        />
        <ToggleConfigGlobal
          configKey="propagacao_empresa_grupo_ativa"
          label="Sincronização empresa → grupo ativada"
          description="Operações feitas em uma empresa sobem automaticamente para o grupo"
          defaultValue={true}
        />
        <ToggleConfigGlobal
          configKey="propagacao_financeiro_ativa"
          label="Propagar baixas financeiras"
          description="Baixar título no grupo reflete automaticamente na empresa correspondente"
          defaultValue={true}
        />
      </Section>

      {/* ─ Segurança ─ */}
      <Section title="Segurança & RBAC" icon={Shield}>
        <ToggleConfigGlobal
          configKey="rbac_granular_ativo"
          label="Controle de acesso granular (RBAC)"
          description="Restrições por módulo, seção e ação individuais"
          defaultValue={true}
        />
        <ToggleConfigGlobal
          configKey="auditoria_completa_ativa"
          label="Auditoria completa de ações"
          description="Registrar todas as operações (criação, edição, exclusão) no log"
          defaultValue={true}
        />
        <ToggleConfigGlobal
          configKey="2fa_obrigatorio_admin"
          label="2FA obrigatório para administradores"
          description="Exige autenticação de dois fatores para usuários admin"
          defaultValue={false}
        />
      </Section>

      {/* ─ Notificações ─ */}
      <Section title="Notificações" icon={Bell}>
        <ToggleConfigGlobal
          configKey="notif_estoque_baixo"
          label="Alertar estoque abaixo do mínimo"
          description="Envia notificação quando produto atingir estoque mínimo"
          defaultValue={true}
        />
        <ToggleConfigGlobal
          configKey="notif_titulo_vencendo"
          label="Alertar títulos vencendo"
          description="Lembrete 3 dias antes do vencimento"
          defaultValue={true}
        />
        <ToggleConfigGlobal
          configKey="notif_whatsapp_pedido"
          label="Notificação WhatsApp em novos pedidos"
          description="Envia mensagem ao cliente quando pedido for criado"
          defaultValue={false}
        />
      </Section>

      {/* ─ Integrações ─ */}
      <Section title="Integrações Externas" icon={Globe}>
        <ToggleConfigGlobal
          configKey="integracao_nfe_ativa"
          label="Emissão de NF-e ativa"
          description="Habilitar emissão eletrônica de notas fiscais"
          defaultValue={false}
        />
        <ToggleConfigGlobal
          configKey="integracao_boleto_ativa"
          label="Geração de boletos ativa"
          description="Integração com gateway para emissão de boletos"
          defaultValue={false}
        />
        <ToggleConfigGlobal
          configKey="marketplace_sync_ativo"
          label="Sincronização com Marketplaces"
          description="Sincronizar pedidos e estoque com marketplaces externos"
          defaultValue={false}
        />
      </Section>
    </div>
  );
}