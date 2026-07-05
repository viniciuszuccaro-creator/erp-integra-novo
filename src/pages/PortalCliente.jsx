import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Package, Truck, Receipt, MessageSquare, FileText, LayoutDashboard, Download } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

import PortalHeader from '../components/portal/PortalHeader';
import HeaderPortalCompacto from '../components/portal/portal-launchpad/HeaderPortalCompacto';
import IAContextualModulo from '../components/ia/IAContextualModulo';
import DashboardCliente from '../components/portal/DashboardCliente';
import PedidosList from '../components/portal/PedidosList';
import EntregasList from '../components/portal/EntregasList';
import BoletosList from '../components/portal/BoletosList';
import ChamadosWidget from '../components/portal/ChamadosWidget';
import OrcamentosList from '../components/portal/OrcamentosList';
import DownloadsDocumentos from '../components/portal/DownloadsDocumentos';

const TABS = [
  { value: 'dashboard', label: 'Início', icon: LayoutDashboard },
  { value: 'pedidos',   label: 'Pedidos',    icon: Package },
  { value: 'entregas',  label: 'Entregas',   icon: Truck },
  { value: 'boletos',   label: '2ª Via',     icon: Receipt },
  { value: 'orcamentos',label: 'Orçamentos', icon: FileText },
  { value: 'chamados',  label: 'Suporte',    icon: MessageSquare },
  { value: 'documentos',label: 'Docs',       icon: Download },
];

export default function PortalCliente() {
  const { isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();
  const { filterInContext, empresaAtual, grupoAtual } = useContextoVisual();
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const [tab, setTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('tab');
    return TABS.find(x => x.value === t) ? t : 'dashboard';
  });

  useEffect(() => {
    const handler = (e) => setTab(e.detail || 'dashboard');
    window.addEventListener('portal:setTab', handler);
    return () => window.removeEventListener('portal:setTab', handler);
  }, []);

  const { data: user } = useQuery({
    queryKey: ['me'],
    enabled: !!isAuthenticated,
    queryFn: () => base44.auth.me(),
  });

  const isNonPortalRole = !!(user && user.role && user.role !== 'user');

  const { data: cliente, isLoading: carregandoCliente } = useQuery({
    queryKey: ['cliente-portal', user?.id],
    enabled: !!user?.id && !isNonPortalRole,
    queryFn: async () => {
      const list = await filterInContext('Cliente', { portal_usuario_id: user.id }, '-updated_date', 1);
      return list?.[0] || null;
    }
  });

  const { data: notasFiscais = [] } = useQuery({
    queryKey: ['portal-nfs', cliente?.id, `${grupoAtual?.id||'g'}-${empresaAtual?.id||'e'}`],
    enabled: !!cliente?.id,
    queryFn: async () => filterInContext('NotaFiscal', { cliente_fornecedor_id: cliente.id }, '-data_emissao', 100)
  });

  const { data: spotlight } = useQuery({
    queryKey: ['portal-token', token],
    enabled: !!token && !!isAuthenticated,
    queryFn: async () => {
      const res = await base44.functions.invoke('portalToken', { action: 'validate', token });
      const exp = res?.data?.exp;
      const expMin = exp ? Math.max(0, Math.round((exp * 1000 - Date.now()) / 60000)) : null;
      return { raw: res?.data, exp_minutes_remaining: expMin };
    }
  });

  if (isLoadingAuth) {
    return (
      <div className="w-full h-full p-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-blue-600" />
          <div className="text-sm text-muted-foreground">Verificando acesso...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full h-full p-6 flex items-center justify-center">
        <Card className="max-w-lg w-full">
          <CardContent className="p-6 text-center space-y-3">
            <div className="text-lg font-semibold text-slate-900">Faça login para acessar o portal</div>
            <div className="text-sm text-muted-foreground">Seu acesso precisa ser autenticado antes de carregar os dados.</div>
            <button onClick={() => navigateToLogin()} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Entrar</button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isNonPortalRole) {
    return (
      <div className="w-full h-full p-6 flex items-center justify-center">
        <Card className="max-w-lg w-full">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            Este painel é exclusivo para clientes. Acesse os módulos internos pelo menu lateral.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (carregandoCliente) {
    return (
      <div className="w-full h-full p-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-blue-600" />
          <div className="text-sm text-muted-foreground">Carregando seu portal...</div>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="w-full h-full p-6 flex items-center justify-center">
        <Card className="max-w-lg w-full">
          <CardContent className="p-6 text-center space-y-2">
            <div className="text-lg font-semibold text-slate-900">Portal indisponível</div>
            <div className="text-sm text-muted-foreground">
              Seu usuário ainda não está vinculado a um cliente no portal.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full p-3 sm:p-4 space-y-3">
      <HeaderPortalCompacto clienteNome={cliente?.nome_fantasia || cliente?.nome} />
      <PortalHeader cliente={cliente} spotlight={spotlight} />
      <div className="flex justify-end">
        <IAContextualModulo modulo="Portal" compact />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full min-w-0">
        {/* Scrollable tabs para mobile */}
        <div className="w-full overflow-x-auto pb-1 -mx-0.5 px-0.5">
          <TabsList className="inline-flex h-auto gap-1 flex-nowrap min-w-max bg-slate-100 p-1 rounded-lg">
            {TABS.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 sm:px-4 py-2 whitespace-nowrap rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="dashboard"  className="mt-3"><DashboardCliente clienteId={cliente.id} /></TabsContent>
        <TabsContent value="pedidos"    className="mt-3"><PedidosList cliente={cliente} /></TabsContent>
        <TabsContent value="entregas"   className="mt-3"><EntregasList cliente={cliente} /></TabsContent>
        <TabsContent value="boletos"    className="mt-3"><BoletosList cliente={cliente} /></TabsContent>
        <TabsContent value="orcamentos" className="mt-3"><OrcamentosList cliente={cliente} /></TabsContent>
        <TabsContent value="chamados"   className="mt-3"><ChamadosWidget cliente={cliente} /></TabsContent>
        <TabsContent value="documentos" className="mt-3"><DownloadsDocumentos clienteId={cliente.id} notasFiscais={notasFiscais} /></TabsContent>
      </Tabs>

      {spotlight?.raw && (
        <p className="text-center text-xs text-muted-foreground pb-2">
          🔐 Acesso via link seguro ativo para <strong>{spotlight.raw.subject}</strong> · expira em {spotlight.exp_minutes_remaining} min
        </p>
      )}
    </div>
  );
}