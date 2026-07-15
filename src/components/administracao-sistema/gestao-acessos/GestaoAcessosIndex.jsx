import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import usePermissions from "@/components/lib/usePermissions";
import CentralPerfisAcesso from "@/components/sistema/CentralPerfisAcesso";
import RelatorioPermissoes from "@/components/sistema/RelatorioPermissoes";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useUser } from "@/components/lib/UserContext";
import { useQuery } from "@tanstack/react-query";
import { useRLSQuery } from "@/components/lib/useRLSQuery";
import SoDChecker from "@/components/administracao-sistema/gestao-acessos/SoDChecker";
import UsuariosTab from "@/components/administracao-sistema/gestao-acessos/UsuariosTab";
import AccessGovernancePanel from "@/components/administracao-sistema/gestao-acessos/AccessGovernancePanel";
import AccessImprovementChecklist from "@/components/administracao-sistema/gestao-acessos/AccessImprovementChecklist";
import AccessScopeSummary from "@/components/administracao-sistema/gestao-acessos/AccessScopeSummary";
import AccessRiskMatrix from "@/components/administracao-sistema/gestao-acessos/AccessRiskMatrix";
import AccessAuditTimeline from "@/components/administracao-sistema/gestao-acessos/AccessAuditTimeline";
import AccessActionPlan from "@/components/administracao-sistema/gestao-acessos/AccessActionPlan";
import AccessCoverageMap from "@/components/administracao-sistema/gestao-acessos/AccessCoverageMap";
import AccessAutomationPanel from "@/components/administracao-sistema/gestao-acessos/AccessAutomationPanel";
import AccessMaturityRoadmap from "@/components/administracao-sistema/gestao-acessos/AccessMaturityRoadmap";
import { Shield, Users, BarChart3, AlertTriangle, CheckCircle2, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAccessScope, isUserInAccessScope } from "@/components/administracao-sistema/gestao-acessos/accessScope";
import RBACStatsBar from "@/components/administracao-sistema/gestao-acessos/RBACStatsBar";
import IAAccessAnalyzer from "@/components/administracao-sistema/gestao-acessos/IAAccessAnalyzer";
import CoberturaMultiempresa from "@/components/administracao-sistema/gestao-acessos/CoberturaMultiempresa";
import RBACDashboard from "@/components/administracao-sistema/gestao-acessos/RBACDashboard";

export default function GestaoAcessosIndex() {
  const { hasPermission, isAdmin } = usePermissions();
  const podeVer = isAdmin() || hasPermission('Sistema', ['Controle de Acesso'], 'visualizar');
  const { filterInContext, empresaAtual, grupoAtual, contexto, empresasDoGrupo = [] } = useContextoVisual();
  const { user } = useUser();
  const [tab, setTab] = useState('governanca');
  const accessScope = getAccessScope({ contexto, empresaAtual, grupoAtual, empresasDoGrupo });
  const groupId = accessScope.groupId;
  const scopeKey = accessScope.scopeKey;

  const handleTabChange = (next) => {
    setTab(next);
    try {
      base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id,
        empresa_id: empresaAtual?.id || null,
        group_id: groupId,
        empresa_nome: empresaAtual?.nome_fantasia || empresaAtual?.razao_social || null,
        acao: 'Visualização',
        modulo: 'Sistema',
        tipo_auditoria: 'ui',
        entidade: 'Controle de Acesso',
        descricao: `Aba visualizada: ${next}`,
        data_hora: new Date().toISOString(),
      });
    } catch (e) { console.error('[gestao-acessos] catch:', e); }
  };

  // Hooks SEMPRE antes de qualquer return condicional
  const { data: perfis = [] } = useRLSQuery(
    'PerfilAcesso', {}, '-updated_date', 500,
    { enabled: podeVer }
  );

  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios', scopeKey],
    queryFn: async () => {
      const rows = await base44.entities.User.list();
      return rows.filter((u) => isUserInAccessScope(u, accessScope, contexto, empresaAtual));
    },
    enabled: podeVer && scopeKey !== 'sem-contexto',
  });

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-ga', scopeKey],
    queryFn: () => filterInContext('Empresa', {}, 'nome_fantasia', 500),
    enabled: podeVer && !!scopeKey,
  });

  const { data: auditoriasAcesso = [] } = useQuery({
    queryKey: ['auditoria-acessos', scopeKey],
    queryFn: () => base44.entities.AuditLog.filter(groupId ? { modulo: 'Sistema', group_id: groupId } : { modulo: 'Sistema' }, '-data_hora', 30),
    enabled: podeVer && !!scopeKey,
    staleTime: 60000,
  });

  if (!podeVer) {
    return (
      <div className="p-6 flex flex-col items-center gap-3 text-center">
        <AlertTriangle className="w-10 h-10 text-amber-500" />
        <p className="font-semibold text-slate-800">Acesso Restrito</p>
        <p className="text-sm text-slate-500">Você não tem permissão para acessar a Gestão de Acessos.</p>
      </div>
    );
  }

  // Estatísticas rápidas para o banner de status do RBAC
  const usuariosNoEscopo = usuarios;
  const usuariosSemPerfil = usuariosNoEscopo.filter(u => !u.perfil_acesso_id && u.role !== 'admin').length;
  const perfisAtivos = perfis.filter(p => p.ativo !== false).length;
  const cobertura = usuariosNoEscopo.length > 0
    ? Math.round(((usuariosNoEscopo.length - usuariosSemPerfil) / usuariosNoEscopo.length) * 100)
    : 100;

  return (
    <div className="w-full flex flex-col gap-3 min-h-0">
      {/* Banner RBAC com estatísticas — componente modular */}
      <RBACStatsBar perfis={perfis} usuarios={usuariosNoEscopo} />

      {/* Aviso se há usuários sem perfil */}
      {usuariosSemPerfil > 0 && (
        <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 w-full">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
          <span>
            <strong>{usuariosSemPerfil} usuário(s)</strong> sem perfil RBAC atribuído.
            Acesse a aba <strong>Usuários</strong> para corrigir.
          </span>
        </div>
      )}

      {/* Info RBAC */}
      <div className="flex items-start gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 w-full">
        <Shield className="w-4 h-4 flex-shrink-0 text-blue-600 mt-0.5" />
        <span className="leading-relaxed break-words min-w-0 flex-1">
          <strong>RBAC granular + multiempresa</strong> — Perfis controlam acesso por módulo, seção e ação.
          Permissões propagam automaticamente entre grupo ↔ empresas.
          Admins têm acesso total. Atribua perfis na aba <em>Usuários</em>.
          Verifique conflitos SoD na aba correspondente.
        </span>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
        <div className="w-full overflow-x-auto pb-1 -mx-1 px-1">
          <TabsList className="inline-flex h-auto gap-1 flex-nowrap min-w-max bg-slate-100 p-1 rounded-lg">
            <TabsTrigger value="governanca" className="text-xs px-2.5 sm:px-4 py-1.5 whitespace-nowrap rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Governança
            </TabsTrigger>
            <TabsTrigger value="perfis" className="text-xs px-2.5 sm:px-4 py-1.5 whitespace-nowrap rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Shield className="w-3.5 h-3.5 mr-1" />
              Perfis RBAC
              <Badge className="ml-1.5 text-[9px] bg-blue-100 text-blue-700 px-1">{perfisAtivos}</Badge>
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="text-xs px-2.5 sm:px-4 py-1.5 whitespace-nowrap rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="w-3.5 h-3.5 mr-1" />
              Usuários
              {usuariosSemPerfil > 0 && (
                <Badge className="ml-1.5 text-[9px] bg-amber-100 text-amber-700 px-1">{usuariosSemPerfil} ⚠</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sod" className="text-xs px-2.5 sm:px-4 py-1.5 whitespace-nowrap rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              SoD
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="text-xs px-2.5 sm:px-4 py-1.5 whitespace-nowrap rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BarChart3 className="w-3.5 h-3.5 mr-1" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="auditoria" className="text-xs px-2.5 sm:px-4 py-1.5 whitespace-nowrap rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Activity className="w-3.5 h-3.5 mr-1" />
              Auditoria
              <Badge className="ml-1.5 text-[9px] bg-slate-200 text-slate-700 px-1">{auditoriasAcesso.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="mapa-rbac" className="text-xs px-2.5 sm:px-4 py-1.5 whitespace-nowrap rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              🗺 Mapa RBAC
            </TabsTrigger>
            <TabsTrigger value="ia-acesso" className="text-xs px-2.5 sm:px-4 py-1.5 whitespace-nowrap rounded-md data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              ✦ IA
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="governanca" className="mt-3 w-full">
          <div className="w-full space-y-3">
            <AccessScopeSummary
              accessScope={accessScope}
              empresaAtual={empresaAtual}
              grupoAtual={grupoAtual}
              empresasDoGrupo={empresasDoGrupo}
              usuarios={usuariosNoEscopo}
              perfis={perfis}
            />
            <AccessGovernancePanel perfis={perfis} usuarios={usuariosNoEscopo} empresas={empresas} accessScope={accessScope} />
            <AccessMaturityRoadmap perfis={perfis} usuarios={usuariosNoEscopo} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <AccessRiskMatrix perfis={perfis} usuarios={usuariosNoEscopo} auditorias={auditoriasAcesso} />
              <AccessCoverageMap perfis={perfis} />
            </div>
            <AccessAutomationPanel accessScope={accessScope} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <AccessActionPlan perfis={perfis} usuarios={usuariosNoEscopo} />
              <AccessImprovementChecklist perfis={perfis} usuarios={usuariosNoEscopo} />
            </div>
            <CoberturaMultiempresa
              usuarios={usuariosNoEscopo}
              perfis={perfis}
              empresas={empresas}
            />
          </div>
        </TabsContent>

        <TabsContent value="perfis" className="mt-3 w-full">
          <div className="w-full overflow-x-auto">
            <CentralPerfisAcesso />
          </div>
        </TabsContent>

        <TabsContent value="usuarios" className="mt-3 w-full">
          <div className="w-full">
            <UsuariosTab />
          </div>
        </TabsContent>

        <TabsContent value="sod" className="mt-3 w-full">
          <div className="w-full overflow-x-auto">
            <SoDChecker />
          </div>
        </TabsContent>

        <TabsContent value="relatorios" className="mt-3 w-full">
          <div className="w-full overflow-x-auto">
            <RelatorioPermissoes perfis={perfis} usuarios={usuariosNoEscopo} empresas={empresas} />
          </div>
        </TabsContent>

        <TabsContent value="auditoria" className="mt-3 w-full">
          <div className="w-full space-y-3">
            <AccessAuditTimeline auditorias={auditoriasAcesso} />
          </div>
        </TabsContent>

        <TabsContent value="mapa-rbac" className="mt-3 w-full">
          <div className="w-full">
            <RBACDashboard />
          </div>
        </TabsContent>

        <TabsContent value="ia-acesso" className="mt-3 w-full">
          <div className="w-full space-y-3">
            <IAAccessAnalyzer perfis={perfis} usuarios={usuariosNoEscopo} empresas={empresas} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}