import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Mail, AlertCircle, Settings, User, Clock, Volume2, Monitor } from "lucide-react";

const CATEGORIAS = [
  { key: 'Sistema', label: 'Sistema', icon: Settings, color: 'text-slate-600' },
  { key: 'Comercial', label: 'Comercial', icon: User, color: 'text-blue-600' },
  { key: 'Financeiro', label: 'Financeiro', icon: Bell, color: 'text-green-600' },
  { key: 'Estoque', label: 'Estoque', icon: Monitor, color: 'text-purple-600' },
  { key: 'RH', label: 'RH', icon: User, color: 'text-pink-600' },
  { key: 'Fiscal', label: 'Fiscal', icon: Bell, color: 'text-orange-600' },
  { key: 'Geral', label: 'Geral', icon: Bell, color: 'text-slate-600' }
];

const PRIORIDADES = [
  { key: 'Urgente', label: 'Urgente', color: 'bg-red-100 text-red-700', desc: 'Requer ação imediata' },
  { key: 'Alta', label: 'Alta', color: 'bg-orange-100 text-orange-700', desc: 'Importante, requer atenção' },
  { key: 'Normal', label: 'Normal', color: 'bg-blue-100 text-blue-700', desc: 'Informações relevantes' },
  { key: 'Baixa', label: 'Baixa', color: 'bg-slate-100 text-slate-700', desc: 'Informações opcionais' }
];

export default function ConfigTabNotificacoes({
  preferencesForm, updateNotificationPref, pushHabilitado, handleSolicitarPush, testarPushNotification
}) {
  const prefs = preferencesForm.preferencias_notificacoes;
  const ativo = prefs.notificacoes_ativadas;

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="border-b bg-slate-50">
        <CardTitle>Preferências de Notificações</CardTitle>
        <p className="text-sm text-slate-600 mt-2">Configure como e quando você deseja receber notificações do sistema</p>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        {/* Master Switch */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div><p className="font-semibold text-slate-900">Habilitar Notificações</p><p className="text-sm text-slate-600">Ativar ou desativar todas as notificações do sistema</p></div>
          <Switch checked={ativo} onCheckedChange={(c) => updateNotificationPref('notificacoes_ativadas', c)} />
        </div>

        {!ativo && (
          <div className="p-4 bg-amber-50 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div><p className="text-sm text-amber-900 font-semibold">Atenção</p><p className="text-sm text-amber-800 mt-1">Você não receberá nenhuma notificação enquanto esta opção estiver desativada.</p></div>
          </div>
        )}

        {ativo && (
          <>
            {/* Canais */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-blue-600" />Canais de Notificação</h3>
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                {[
                  { label: 'Sistema (In-App)', desc: 'Notificações dentro do sistema', path: 'canais.sistema' },
                  { label: 'E-mail', desc: 'Receber notificações por e-mail', path: 'canais.email' }
                ].map(ch => (
                  <div key={ch.path} className="flex items-center justify-between">
                    <div><p className="font-medium text-slate-900">{ch.label}</p><p className="text-sm text-slate-600">{ch.desc}</p></div>
                    <Switch checked={prefs.canais[ch.path.split('.')[1]]} onCheckedChange={(c) => updateNotificationPref(ch.path, c)} />
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Push Desktop</p>
                    <p className="text-sm text-slate-600">Notificações do navegador no desktop</p>
                    {!pushHabilitado && prefs.canais.push && <p className="text-xs text-orange-600 mt-1">⚠️ Permissão não concedida pelo navegador</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {!pushHabilitado && prefs.canais.push && <Button size="sm" variant="outline" onClick={handleSolicitarPush} className="text-xs">Permitir</Button>}
                    <Switch checked={prefs.canais.push} onCheckedChange={(c) => { if (c && !pushHabilitado) handleSolicitarPush(); updateNotificationPref('canais.push', c); }} />
                  </div>
                </div>
                {pushHabilitado && prefs.canais.push && (
                  <div className="pt-2 border-t"><Button size="sm" variant="outline" onClick={testarPushNotification} className="w-full"><Bell className="w-4 h-4 mr-2" />Testar Notificação Push</Button></div>
                )}
              </div>
            </div>

            {/* Categorias */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-gray-600" />Categorias de Notificações</h3>
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-4">Escolha quais tipos de notificações você deseja receber</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CATEGORIAS.map(cat => (
                    <div key={cat.key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-2"><cat.icon className={`w-4 h-4 ${cat.color}`} /><span className="font-medium text-slate-900">{cat.label}</span></div>
                      <Switch checked={prefs.categorias[cat.key]} onCheckedChange={(c) => updateNotificationPref(`categorias.${cat.key}`, c)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Prioridades */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-600" />Níveis de Prioridade</h3>
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600 mb-4">Receber notificações apenas com estas prioridades</p>
                {PRIORIDADES.map(prio => (
                  <div key={prio.key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-2"><Badge className={prio.color}>{prio.label}</Badge><span className="text-sm text-slate-600">{prio.desc}</span></div>
                    <Switch checked={prefs.prioridades[prio.key]} onCheckedChange={(c) => updateNotificationPref(`prioridades.${prio.key}`, c)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Horário Silencioso */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-purple-600" />Horário Silencioso</h3>
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div><p className="font-medium text-slate-900">Não Perturbe</p><p className="text-sm text-slate-600">Pausar notificações em horários específicos</p></div>
                  <Switch checked={prefs.horario_silencioso.ativo} onCheckedChange={(c) => updateNotificationPref('horario_silencioso.ativo', c)} />
                </div>
                {prefs.horario_silencioso.ativo && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t mt-4">
                    <div><Label>Início</Label><Input type="time" value={prefs.horario_silencioso.inicio} onChange={(e) => updateNotificationPref('horario_silencioso.inicio', e.target.value)} /></div>
                    <div><Label>Fim</Label><Input type="time" value={prefs.horario_silencioso.fim} onChange={(e) => updateNotificationPref('horario_silencioso.fim', e.target.value)} /></div>
                  </div>
                )}
              </div>
            </div>

            {/* Resumo por E-mail */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Mail className="w-5 h-5 text-blue-600" />Resumo por E-mail</h3>
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div><p className="font-medium text-slate-900">Enviar Resumo Periódico</p><p className="text-sm text-slate-600">Receba um resumo das notificações por e-mail</p></div>
                  <Switch checked={prefs.resumo_email.ativo} onCheckedChange={(c) => updateNotificationPref('resumo_email.ativo', c)} />
                </div>
                {prefs.resumo_email.ativo && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t mt-4">
                    <div>
                      <Label>Frequência</Label>
                      <Select value={prefs.resumo_email.frequencia} onValueChange={(v) => updateNotificationPref('resumo_email.frequencia', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="Diário">Diário</SelectItem><SelectItem value="Semanal">Semanal (Segunda-feira)</SelectItem><SelectItem value="Mensal">Mensal (Dia 1)</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div><Label>Horário de Envio</Label><Input type="time" value={prefs.resumo_email.horario} onChange={(e) => updateNotificationPref('resumo_email.horario', e.target.value)} /></div>
                  </div>
                )}
              </div>
            </div>

            {/* Opções Adicionais */}
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Volume2 className="w-5 h-5 text-indigo-600" />Opções Adicionais</h3>
              <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                {[
                  { label: 'Som de Notificação', desc: 'Reproduzir som ao receber notificação', path: 'som_notificacao' },
                  { label: 'Notificação Desktop', desc: 'Mostrar notificações mesmo quando não estiver no sistema', path: 'notificacao_desktop' }
                ].map(opt => (
                  <div key={opt.path} className="flex items-center justify-between">
                    <div><p className="font-medium text-slate-900">{opt.label}</p><p className="text-sm text-slate-600">{opt.desc}</p></div>
                    <Switch checked={prefs[opt.path]} onCheckedChange={(c) => updateNotificationPref(opt.path, c)} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}