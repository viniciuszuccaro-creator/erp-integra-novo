import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FileText, LogOut } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { base44 } from '@/api/base44Client';
import { useUser } from '@/components/lib/UserContext';
import usePermissions from '@/components/lib/usePermissions';

export default function LayoutSidebar({ navigationItems, groupedItems, onHoverItem }) {
  const location = useLocation();
  const { user } = useUser();
  const { hasPermission } = usePermissions();

  const titleToModule = {
    'CRM - Relacionamento': 'CRM',
    'Comercial e Vendas': 'Comercial',
    'Estoque e Almoxarifado': 'Estoque',
    'Compras e Suprimentos': 'Compras',
    'Financeiro e Contábil': 'Financeiro',
    'Fiscal e Tributário': 'Fiscal',
    'Recursos Humanos': 'RH',
  };

  return (
    <Sidebar className="border-r border-slate-200 bg-white/80 backdrop-blur-sm">
      <SidebarHeader className="border-b border-slate-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-xl text-slate-900">ERP Zuccaro</h2>
            <p className="text-xs text-slate-500">V22 • Sistema Completo</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        {Object.entries(groupedItems).map(([groupName, items]) => {
          if (items.length === 0) return null;

          const groupLabels = {
            principal: 'Principal',
            cadastros: 'Cadastros',
            operacional: 'Operacional',
            administrativo: 'Administrativo',
            sistema: 'Sistema',
            publico: 'Público',
          };

          return (
            <SidebarGroup key={groupName}>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 mb-1">
                {groupLabels[groupName]}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title} onMouseEnter={() => onHoverItem?.(item.title)}>
                        <SidebarMenuButton
                          asChild
                          className={`transition-all duration-200 rounded-lg mb-1 ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200'
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 p-4 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <Link to={createPageUrl('ConfiguracoesUsuario')} className="flex items-center gap-3 hover:bg-slate-100 p-2 rounded-lg transition-colors flex-1">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{user?.full_name?.[0] || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 text-sm truncate">{user?.full_name || 'Usuário'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
            </div>
          </Link>
          <button
            onClick={() => base44.auth.logout()}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            title="Sair"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}