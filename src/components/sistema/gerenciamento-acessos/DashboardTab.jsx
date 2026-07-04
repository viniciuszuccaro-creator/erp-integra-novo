import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardSeguranca from "../DashboardSeguranca";
import RelatorioPermissoes from "../RelatorioPermissoes";
import ImportarExportarPerfis from "../ImportarExportarPerfis";
import {
  Shield, Users, UserCheck, Ban, AlertTriangle, ShieldCheck,
  Bolt, Plus, UserPlus, Building, Brain, RefreshCw, History,
  CheckCircle, XCircle, Edit, Key, Sparkles
} from "lucide-react";

export default function DashboardTab({
  estatisticas,
  perfis,
  usuarios,
  empresas,
  auditoriaAcessos,
  recomendacoesIA,
  analisandoIA,
  onAnalisarIA,
  onCriarPerfil,
  onAtribuirUsuario,
  onVerPermissoesEmpresa,
  onVerAuditoria,
  onCorrigirPerfil,
  onImportarPerfis,
}) {
  return (
    <>
      <DashboardSeguranca
        estatisticas={estatisticas}
        perfis={perfis}
        usuarios={usuarios}
        auditoriaAcessos={auditoriaAcessos}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Perfis</p>
                <p className="text-2xl font-bold">{estatisticas.totalPerfis}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-200" />
            </div>
            <p className="text-xs text-blue-100 mt-2">{estatisticas.perfisAtivos} ativos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Usuários</p>
                <p className="text-2xl font-bold">{estatisticas.totalUsuarios}</p>
              </div>
              <Users className="w-8 h-8 text-green-200" />
            </div>
            <p className="text-xs text-green-100 mt-2">{estatisticas.admins} admins</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Com Perfil</p>
                <p className="text-2xl font-bold">{estatisticas.usuariosComPerfil}</p>
              </div>
              <UserCheck className="w-8 h-8 text-purple-200" />
            </div>
            <Progress value={estatisticas.cobertura} className="mt-2 h-1.5 bg-purple-400" />
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${estatisticas.usuariosSemPerfil > 0 ? 'from-orange-500 to-orange-600' : 'from-emerald-500 to-emerald-600'} text-white`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Sem Perfil</p>
                <p className="text-2xl font-bold">{estatisticas.usuariosSemPerfil}</p>
              </div>
              <Ban className="w-8 h-8 text-white/60" />
            </div>
            <p className="text-xs text-white/80 mt-2">
              {estatisticas.usuariosSemPerfil > 0 ? 'Atenção!' : 'Todos cobertos'}
            </p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${estatisticas.conflitosTotal > 0 ? 'from-red-500 to-red-600' : 'from-teal-500 to-teal-600'} text-white`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Conflitos SoD</p>
                <p className="text-2xl font-bold">{estatisticas.conflitosTotal}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-white/60" />
            </div>
            <p className="text-xs text-white/80 mt-2">
              {estatisticas.conflitosTotal > 0 ? 'Resolver!' : 'OK'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Cobertura</p>
                <p className="text-2xl font-bold">{estatisticas.cobertura}%</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-indigo-200" />
            </div>
            <Progress value={estatisticas.cobertura} className="mt-2 h-1.5 bg-indigo-400" />
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas e Resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bolt className="w-5 h-5 text-yellow-500" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700" onClick={onCriarPerfil} data-permission="Sistema.PerfilAcesso.criar">
              <Plus className="w-4 h-4 mr-2" />
              Criar Novo Perfil
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={onAtribuirUsuario} data-permission="Sistema.Usuario.editar">
              <UserPlus className="w-4 h-4 mr-2" />
              Atribuir Perfil a Usuário
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={onVerPermissoesEmpresa} data-permission="Sistema.PerfilAcesso.visualizar">
              <Building className="w-4 h-4 mr-2" />
              Permissão por Empresa
            </Button>
            <Button variant="outline" className="w-full justify-start border-purple-200 text-purple-700 hover:bg-purple-50" onClick={onAnalisarIA} data-permission="Sistema.PerfilAcesso.visualizar" disabled={analisandoIA}>
              {analisandoIA ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
              Analisar com IA
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={onVerAuditoria} data-permission="Sistema.Auditoria.visualizar">
              <History className="w-4 h-4 mr-2" />
              Ver Auditoria
            </Button>
            <div className="pt-3 border-t space-y-3">
              <RelatorioPermissoes perfis={perfis} usuarios={usuarios} empresas={empresas} />
              <ImportarExportarPerfis perfis={perfis} onImportar={onImportarPerfis} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader className="bg-orange-50 border-b">
            <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
              <AlertTriangle className="w-5 h-5" />
              Usuários sem Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[200px]">
              {usuarios.filter(u => !u.perfil_acesso_id).length > 0 ? (
                usuarios.filter(u => !u.perfil_acesso_id).map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 border-b hover:bg-slate-50">
                    <div>
                      <p className="font-medium text-sm">{u.full_name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => onAtribuirUsuario(u)}>
                      <Key className="w-3 h-3 mr-1" />
                      Atribuir
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-green-600">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">Todos os usuários têm perfil!</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader className="bg-red-50 border-b">
            <CardTitle className="text-lg flex items-center gap-2 text-red-700">
              <XCircle className="w-5 h-5" />
              Conflitos de SoD
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[200px]">
              {perfis.filter(p => p.conflitos_sod_detectados?.length > 0).length > 0 ? (
                perfis.filter(p => p.conflitos_sod_detectados?.length > 0).map(p => (
                  <div key={p.id} className="p-3 border-b hover:bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{p.nome_perfil}</p>
                      <Badge className="bg-red-100 text-red-700">
                        {p.conflitos_sod_detectados.length} conflitos
                      </Badge>
                    </div>
                    {p.conflitos_sod_detectados.slice(0, 2).map((c, i) => (
                      <p key={i} className="text-xs text-slate-600 truncate">• {c.descricao}</p>
                    ))}
                    <Button size="sm" variant="ghost" className="w-full mt-2 text-red-600" onClick={() => onCorrigirPerfil(p)}>
                      <Edit className="w-3 h-3 mr-1" />
                      Corrigir
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-green-600">
                  <ShieldCheck className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">Nenhum conflito detectado!</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Recomendações da IA */}
      {recomendacoesIA && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="border-b border-purple-200">
            <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
              <Sparkles className="w-5 h-5" />
              Análise de Segurança por IA
              <Badge className={
                recomendacoesIA.nivel_risco === 'Crítico' ? 'bg-red-600 text-white' :
                recomendacoesIA.nivel_risco === 'Alto' ? 'bg-orange-600 text-white' :
                recomendacoesIA.nivel_risco === 'Médio' ? 'bg-yellow-600 text-white' :
                'bg-green-600 text-white'
              }>
                Score: {recomendacoesIA.score_seguranca}/100 • {recomendacoesIA.nivel_risco}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <p className="text-slate-700">{recomendacoesIA.resumo}</p>
            {recomendacoesIA.alertas?.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-red-700">⚠️ Alertas:</p>
                {recomendacoesIA.alertas.map((alerta, i) => (
                  <Alert key={i} className="border-red-200 bg-red-50">
                    <AlertDescription>{alerta}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
            {recomendacoesIA.recomendacoes?.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-purple-700">💡 Recomendações:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recomendacoesIA.recomendacoes.map((rec, i) => (
                    <div key={i} className="p-3 border rounded-lg bg-white">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={
                          rec.prioridade === 'Alta' ? 'bg-red-100 text-red-700' :
                          rec.prioridade === 'Média' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }>
                          {rec.prioridade}
                        </Badge>
                        <span className="font-medium text-sm">{rec.titulo}</span>
                      </div>
                      <p className="text-xs text-slate-600">{rec.descricao}</p>
                      {rec.acao && (
                        <p className="text-xs text-purple-600 mt-1 font-medium">→ {rec.acao}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}