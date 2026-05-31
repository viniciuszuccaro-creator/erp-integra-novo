/**
 * ParametrosGeraisPanel v5.0
 * - Seções colapsáveis por módulo com grid 2 colunas
 * - Todos os toggles usam ToggleConfigGlobal (persistência garantida)
 * - Adicionado: propagação por módulo individual, gestão avançada, compras
 */
import React, { useState } from "react";
import {
  Settings, Shield, Bell, Globe, Zap, Package,
  DollarSign, Truck, ChevronDown, ChevronRight, Users, Briefcase,
  ShoppingCart, BarChart3, MessageCircle, Monitor
} from "lucide-react";
import ToggleConfigGlobal from "@/components/sistema/ToggleConfigGlobal";

function Section({ title, icon: Icon, defaultOpen = false, color = "blue", children }) {
  const [open, setOpen] = useState(defaultOpen);
  const colorMap = {
    blue: "from-slate-50 to-blue-50",
    purple: "from-slate-50 to-purple-50",
    green: "from-slate-50 to-green-50",
    amber: "from-slate-50 to-amber-50",
    red: "from-slate-50 to-red-50",
  };
  const iconColorMap = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    green: "text-green-600",
    amber: "text-amber-600",
    red: "text-red-600",
  };
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r ${colorMap[color] || colorMap.blue} border-b border-slate-200 hover:bg-slate-100 transition-colors`}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Icon className={`w-4 h-4 ${iconColorMap[color] || iconColorMap.blue}`} />
          {title}
        </span>
        {open
          ? <ChevronDown className="w-4 h-4 text-slate-400" />
          : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>
      {open && (
        <div className="p-4 space-y-2">
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

        {/* ─ Segurança ─ */}
        <Section title="Segurança & RBAC" icon={Shield} defaultOpen color="red">
          <ToggleConfigGlobal configKey="rbac_granular_ativo"
            label="Controle de acesso granular (RBAC)"
            description="Restrições por módulo, seção e ação individuais"
            defaultValue={true} />
          <ToggleConfigGlobal configKey="auditoria_completa_ativa"
            label="Auditoria completa de ações"
            description="Registrar todas as operações no AuditLog"
            defaultValue={true} />
          <ToggleConfigGlobal configKey="2fa_obrigatorio_admin"
            label="2FA obrigatório para administradores"
            description="Exige autenticação de dois fatores para admins"
            defaultValue={false} />
          <ToggleConfigGlobal configKey="sessao_timeout_ativo"
            label="Timeout de sessão ativo"
            description="Encerrar sessão inativa após tempo configurado"
            defaultValue={true} />
          <ToggleConfigGlobal configKey="login_multiplos_dispositivos"
            label="Login simultâneo em múltiplos dispositivos"
            description="Permitir que o mesmo usuário acesse de vários dispositivos"
            defaultValue={true} />
        </Section>

        {/* ─ Notificações ─ */}
        <Section title="Notificações & Alertas" icon={Bell} defaultOpen={false} color="amber">
          <ToggleConfigGlobal configKey="notif_estoque_baixo"
            label="Alertar estoque abaixo do mínimo"
            description="Notificação quando produto atingir estoque mínimo"
            defaultValue={true} />
          <ToggleConfigGlobal configKey="notif_titulo_vencendo"
            label="Alertar títulos vencendo"
            description="Lembrete 3 dias antes do vencimento"
            defaultValue={true} />
          <ToggleConfigGlobal configKey="notif_whatsapp_pedido"
            label="Notificação WhatsApp em novos pedidos"
            description="Envia mensagem ao cliente quando pedido for criado"
            defaultValue={false} />
        </Section>

        {/* ─ Integrações ─ */}
        <Section title="Integrações Externas" icon={Globe} defaultOpen={false} color="purple">
          <ToggleConfigGlobal configKey="integracao_nfe_ativa"
            label="Emissão de NF-e ativa"
            description="Habilitar emissão eletrônica de notas fiscais"
            defaultValue={false} />
          <ToggleConfigGlobal configKey="integracao_boleto_ativa"
            label="Geração de boletos ativa"
            description="Integração com gateway para emissão de boletos"
            defaultValue={false} />
          <ToggleConfigGlobal configKey="marketplace_sync_ativo"
            label="Sincronização com Marketplaces"
            description="Sincronizar pedidos e estoque com marketplaces"
            defaultValue={false} />
          <ToggleConfigGlobal configKey="integracao_whatsapp"
            label="WhatsApp Business ativo"
            description="Integração com WhatsApp para envio de mensagens"
            defaultValue={false} />
        </Section>

        {/* ─ Estoque & Produção ─ */}
        <Section title="Estoque & Produção" icon={Package} defaultOpen={false} color="green">
          <ToggleConfigGlobal configKey="estoque_alerta_minimo_ativo"
            label="Alerta de estoque mínimo"
            description="Notifica quando produto abaixo do estoque mínimo"
            defaultValue={true} />
          <ToggleConfigGlobal configKey="estoque_reserva_automatica"
            label="Reserva automática ao confirmar pedido"
            description="Reservar estoque automaticamente ao aprovar pedidos"
            defaultValue={true} />
          <ToggleConfigGlobal configKey="producao_apontamento_mobile"
            label="Apontamento de produção via mobile"
            description="Habilitar app mobile para apontamento na fábrica"
            defaultValue={false} />
        </Section>

        {/* ─ Financeiro ─ */}
        <Section title="Financeiro & Fiscal" icon={DollarSign} defaultOpen={false} color="green">
          <ToggleConfigGlobal configKey="financeiro_aprovacao_despesa_ativa"
            label="Aprovação de despesas ativada"
            description="Despesas acima do limite exigem aprovação do gestor"
            defaultValue={true} />
          <ToggleConfigGlobal configKey="conciliacao_bancaria_automatica"
            label="Conciliação bancária automática"
            description="Conciliar lançamentos automaticamente ao importar extrato"
            defaultValue={false} />
          <ToggleConfigGlobal configKey="boleto_envio_automatico"
            label="Envio automático de boletos"
            description="Enviar boleto por e-mail/WhatsApp ao gerar"
            defaultValue={false} />
        </Section>

        {/* ─ Comercial & CRM ─ */}
        <Section title="Comercial & CRM" icon={Briefcase} defaultOpen={false} color="blue">
          <ToggleConfigGlobal configKey="crm_pipeline_ativo"
            label="Pipeline de vendas ativo"
            description="Habilitar funil de vendas com estágios de oportunidade"
            defaultValue={true} />
          <ToggleConfigGlobal configKey="comercial_aprovacao_pedido_ativa"
            label="Aprovação de pedidos ativada"
            description="Pedidos acima do limite exigem aprovação de gestor"
            defaultValue={true} />
          <ToggleConfigGlobal configKey="comercial_desconto_aprovacao"
            label="Aprovação hierárquica de descontos"
            description="Descontos acima do limite exigem aprovação do gerente"
            defaultValue={true} />
          <ToggleConfigGlobal configKey="crm_follow_up_automatico"
            label="Follow-up automático de oportunidades"
            description="Sistema cria lembretes automáticos para oportunidades paradas"
            defaultValue={false} />
        </Section>

        {/* ─ Logística ─ */}
        <Section title="Logística & Expedição" icon={Truck} defaultOpen={false} color="amber">
          <ToggleConfigGlobal configKey="logistica_rastreamento_ativo"
            label="Rastreamento em tempo real ativo"
            description="Habilitar rastreamento GPS de entregas"
            defaultValue={false} />
          <ToggleConfigGlobal configKey="logistica_assinatura_digital"
            label="Assinatura digital de entrega"
            description="Exigir assinatura digital do recebedor na entrega"
            defaultValue={false} />
          <ToggleConfigGlobal configKey="logistica_roteirizacao_ia"
            label="Roteirização inteligente por IA"
            description="Otimizar rotas de entrega automaticamente"
            defaultValue={false} />
        </Section>

        {/* ─ Compras ─ */}
        <Section title="Compras & Suprimentos" icon={ShoppingCart} defaultOpen={false} color="purple">
          <ToggleConfigGlobal configKey="compras_aprovacao_ativa"
            label="Aprovação de ordens de compra"
            description="OCs acima do limite exigem aprovação do gestor"
            defaultValue={true} />
          <ToggleConfigGlobal configKey="compras_cotacao_automatica"
            label="Cotação automática ao criar OC"
            description="Envia automaticamente e-mail de cotação ao fornecedor"
            defaultValue={false} />
        </Section>

        {/* ─ RH & Operações ─ */}
        <Section title="RH & Operações" icon={Users} defaultOpen={false} color="blue">
          <ToggleConfigGlobal configKey="rh_ponto_eletronico_ativo"
            label="Ponto eletrônico ativo"
            description="Habilitar registro de ponto eletrônico para colaboradores"
            defaultValue={false} />
          <ToggleConfigGlobal configKey="rh_ferias_aprovacao"
            label="Aprovação de férias por gestor"
            description="Solicitações de férias exigem aprovação do responsável"
            defaultValue={true} />
          <ToggleConfigGlobal configKey="rh_gamificacao_producao"
            label="Gamificação de produção"
            description="Sistema de pontos e metas para equipes de produção"
            defaultValue={false} />
        </Section>

        {/* ─ IA & Automação ─ */}
        <Section title="IA & Automação" icon={Zap} defaultOpen={false} color="purple">
          <ToggleConfigGlobal configKey="ia_preditiva_vendas"
            label="Previsão preditiva de vendas"
            description="IA analisa histórico e prevê vendas para os próximos 30 dias"
            defaultValue={false} />
          <ToggleConfigGlobal configKey="ia_anomalia_financeira"
            label="Detecção de anomalias financeiras"
            description="IA monitora lançamentos e alerta sobre inconsistências"
            defaultValue={false} />
          <ToggleConfigGlobal configKey="ia_churn_clientes"
            label="Análise de risco de churn"
            description="Identificar clientes com risco de abandono"
            defaultValue={false} />
          <ToggleConfigGlobal configKey="ia_precificacao_inteligente"
            label="Precificação inteligente por IA"
            description="IA sugere preços ótimos com base em histórico"
            defaultValue={false} />
          <ToggleConfigGlobal configKey="ia_sugestao_compras"
            label="Sugestão de compras por IA"
            description="IA sugere produtos a repor com base em histórico de vendas"
            defaultValue={false} />
          <ToggleConfigGlobal configKey="ia_classificacao_clientes"
            label="Classificação automática de clientes (IA)"
            description="IA classifica clientes ABC automaticamente"
            defaultValue={false} />
          <ToggleConfigGlobal configKey="ia_roteirizacao_automatica"
            label="Roteirização automática de entregas"
            description="IA otimiza rotas de entrega automaticamente ao emitir romaneio"
            defaultValue={false} />
        </Section>

        {/* ─ Relatórios & BI ─ */}
        <Section title="Relatórios & BI" icon={BarChart3} defaultOpen={false} color="blue">
          <ToggleConfigGlobal configKey="relatorios_consolidados_grupo"
            label="Relatórios consolidados do grupo"
            description="Exibir dados de todas as empresas consolidados nos relatórios"
            defaultValue={true} />
          <ToggleConfigGlobal configKey="bi_forecast_ativo"
            label="Previsões BI ativas"
            description="Habilitar módulo de forecast e previsões de negócio"
            defaultValue={false} />
          <ToggleConfigGlobal configKey="relatorio_multiempresa_ativo"
            label="Modo multiempresa nos relatórios"
            description="Filtrar relatórios por empresa específica ou grupo consolidado"
            defaultValue={true} />
        </Section>

        {/* ─ Portal & Omnicanal ─ */}
        <Section title="Portal & Omnicanal" icon={Monitor} defaultOpen={false} color="purple">
          <ToggleConfigGlobal configKey="portal_cliente_ativo"
            label="Portal do Cliente ativo"
            description="Habilitar acesso de clientes ao portal self-service"
            defaultValue={false} />
          <ToggleConfigGlobal configKey="portal_aprovacao_orcamento"
            label="Aprovação de orçamentos pelo portal"
            description="Cliente pode aprovar orçamentos diretamente no portal"
            defaultValue={false} />
          <ToggleConfigGlobal configKey="omnicanal_ativo"
            label="Hub de Atendimento Omnicanal"
            description="Centralizar atendimento de WhatsApp, e-mail e chat"
            defaultValue={false} />
          <ToggleConfigGlobal configKey="chatbot_ativo"
            label="Chatbot de atendimento ativo"
            description="Resposta automática para atendimento inicial de clientes"
            defaultValue={false} />
        </Section>

        {/* ─ Multiempresa Avançado ─ */}
        <Section title="Multiempresa Avançado" icon={Globe} defaultOpen={false} color="blue">
          <ToggleConfigGlobal configKey="multiempresa_modo_grupo"
            label="Modo grupo ativo"
            description="Visualizar e operar no contexto consolidado do grupo"
            defaultValue={true} />
          <ToggleConfigGlobal configKey="multiempresa_segregar_dados"
            label="Segregar dados por empresa"
            description="Cada empresa vê apenas seus próprios dados (exceto admins)"
            defaultValue={true} />
          <ToggleConfigGlobal configKey="multiempresa_transferencia_inter"
            label="Transferência entre empresas"
            description="Habilitar transferência de estoque/financeiro entre empresas"
            defaultValue={false} />
          <ToggleConfigGlobal configKey="multiempresa_rateio_automatico"
            label="Rateio automático de despesas"
            description="Distribuir despesas do grupo proporcionalmente entre empresas"
            defaultValue={false} />
        </Section>

      </div>
    </div>
  );
}