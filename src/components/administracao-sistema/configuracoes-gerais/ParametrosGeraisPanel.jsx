/**
 * ParametrosGeraisPanel v4.0
 * - Seções colapsáveis por módulo (Propagação, Segurança, Notificações, etc.)
 * - Layout responsivo grid 2-colunas em desktop
 * - Todos os toggles usam ToggleConfigGlobal (persistência garantida)
 */
import React, { useState } from "react";
import {
  Settings, ArrowDownUp, Shield, Bell, Globe, Zap, Package,
  DollarSign, Truck, ChevronDown, ChevronRight
} from "lucide-react";
import ToggleConfigGlobal from "@/components/sistema/ToggleConfigGlobal";

function Section({ title, icon: Icon, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 hover:bg-slate-100 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Icon className="w-4 h-4 text-blue-600" />
          {title}
        </span>
        {open
          ? <ChevronDown className="w-4 h-4 text-slate-400" />
          : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="p-4 space-y-2.5">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ParametrosGeraisPanel() {
  return (
    <div className="w-full h-full overflow-auto">
      <div className="flex items-center gap-2 mb-4 px-1">
        <Settings className="w-5 h-5 text-slate-600" />
        <h2 className="text-lg font-bold text-slate-900">Configurações Globais do Sistema</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-6">

        {/* ─ Propagação ─ */}
        <Section title="Propagação Grupo ↔ Empresas" icon={ArrowDownUp} defaultOpen>
          <ToggleConfigGlobal
            configKey="propagacao_grupo_empresas_ativa"
            label="Propagação automática ativada"
            description="Replica cadastros do grupo para todas as empresas vinculadas"
            defaultValue={true}
          />
          <ToggleConfigGlobal
            configKey="propagacao_empresa_grupo_ativa"
            label="Sincronização empresa → grupo"
            description="Operações em uma empresa sobem automaticamente ao grupo"
            defaultValue={true}
          />
          <ToggleConfigGlobal
            configKey="propagacao_financeiro_ativa"
            label="Propagar baixas financeiras"
            description="Baixar título no grupo reflete na empresa correspondente"
            defaultValue={true}
          />
        </Section>

        {/* ─ Segurança ─ */}
        <Section title="Segurança & RBAC" icon={Shield} defaultOpen>
          <ToggleConfigGlobal
            configKey="rbac_granular_ativo"
            label="Controle de acesso granular (RBAC)"
            description="Restrições por módulo, seção e ação individuais"
            defaultValue={true}
          />
          <ToggleConfigGlobal
            configKey="auditoria_completa_ativa"
            label="Auditoria completa de ações"
            description="Registrar todas as operações no AuditLog"
            defaultValue={true}
          />
          <ToggleConfigGlobal
            configKey="2fa_obrigatorio_admin"
            label="2FA obrigatório para administradores"
            description="Exige autenticação de dois fatores para admins"
            defaultValue={false}
          />
        </Section>

        {/* ─ Notificações ─ */}
        <Section title="Notificações & Alertas" icon={Bell} defaultOpen={false}>
          <ToggleConfigGlobal
            configKey="notif_estoque_baixo"
            label="Alertar estoque abaixo do mínimo"
            description="Notificação quando produto atingir estoque mínimo"
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
        <Section title="Integrações Externas" icon={Globe} defaultOpen={false}>
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
            description="Sincronizar pedidos e estoque com marketplaces"
            defaultValue={false}
          />
        </Section>

        {/* ─ Estoque & Produção ─ */}
        <Section title="Estoque & Produção" icon={Package} defaultOpen={false}>
          <ToggleConfigGlobal
            configKey="estoque_alerta_minimo_ativo"
            label="Alerta de estoque mínimo"
            description="Notifica quando produto abaixo do estoque mínimo"
            defaultValue={true}
          />
          <ToggleConfigGlobal
            configKey="estoque_reserva_automatica"
            label="Reserva automática ao confirmar pedido"
            description="Reservar estoque automaticamente ao aprovar pedidos"
            defaultValue={true}
          />
          <ToggleConfigGlobal
            configKey="producao_apontamento_mobile"
            label="Apontamento de produção via mobile"
            description="Habilitar app mobile para apontamento na fábrica"
            defaultValue={false}
          />
        </Section>

        {/* ─ Financeiro ─ */}
        <Section title="Financeiro & Fiscal" icon={DollarSign} defaultOpen={false}>
          <ToggleConfigGlobal
            configKey="financeiro_aprovacao_despesa_ativa"
            label="Aprovação de despesas ativada"
            description="Despesas acima do limite exigem aprovação do gestor"
            defaultValue={true}
          />
          <ToggleConfigGlobal
            configKey="conciliacao_bancaria_automatica"
            label="Conciliação bancária automática"
            description="Conciliar lançamentos automaticamente ao importar extrato"
            defaultValue={false}
          />
          <ToggleConfigGlobal
            configKey="boleto_envio_automatico"
            label="Envio automático de boletos"
            description="Enviar boleto por e-mail/WhatsApp ao gerar"
            defaultValue={false}
          />
        </Section>

        {/* ─ Logística ─ */}
        <Section title="Logística & Expedição" icon={Truck} defaultOpen={false}>
          <ToggleConfigGlobal
            configKey="logistica_rastreamento_ativo"
            label="Rastreamento em tempo real ativo"
            description="Habilitar rastreamento GPS de entregas"
            defaultValue={false}
          />
          <ToggleConfigGlobal
            configKey="logistica_assinatura_digital"
            label="Assinatura digital de entrega"
            description="Exigir assinatura digital do recebedor na entrega"
            defaultValue={false}
          />
          <ToggleConfigGlobal
            configKey="logistica_roteirizacao_ia"
            label="Roteirização inteligente por IA"
            description="Otimizar rotas de entrega automaticamente"
            defaultValue={false}
          />
        </Section>

        {/* ─ IA & Automação ─ */}
        <Section title="IA & Automação" icon={Zap} defaultOpen={false}>
          <ToggleConfigGlobal
            configKey="ia_preditiva_vendas"
            label="Previsão preditiva de vendas"
            description="IA analisa histórico e prevê vendas para os próximos 30 dias"
            defaultValue={false}
          />
          <ToggleConfigGlobal
            configKey="ia_anomalia_financeira"
            label="Detecção de anomalias financeiras"
            description="IA monitora lançamentos e alerta sobre inconsistências"
            defaultValue={false}
          />
          <ToggleConfigGlobal
            configKey="ia_churn_clientes"
            label="Análise de risco de churn de clientes"
            description="Identificar clientes com risco de abandono"
            defaultValue={false}
          />
        </Section>

      </div>
    </div>
  );
}