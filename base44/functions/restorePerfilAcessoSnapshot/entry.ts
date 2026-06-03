/**
 * restorePerfilAcessoSnapshot — Restaura PerfilAcesso deletados/órfãos
 * Recriar perfis base para cada bloco de módulo (5 perfis mínimo)
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PERFIS_BASE = [
  {
    nome_perfil: 'Administrador',
    descricao: 'Acesso total a todos os módulos',
    nivel_perfil: 'Administrador',
    permissoes: {
      'Sistema': { 'Geral': ['ler', 'criar', 'editar', 'excluir'] },
      'Dashboard': { 'Geral': ['ler', 'exportar'] },
      'CRM': { 'Geral': ['ler', 'criar', 'editar', 'excluir'] },
      'Comercial': { 'Geral': ['ler', 'criar', 'editar', 'excluir'] },
      'Estoque': { 'Geral': ['ler', 'criar', 'editar', 'excluir'] },
      'Compras': { 'Geral': ['ler', 'criar', 'editar', 'excluir'] },
      'Financeiro': { 'Geral': ['ler', 'criar', 'editar', 'excluir'] },
      'Fiscal': { 'Geral': ['ler', 'criar', 'editar', 'excluir'] },
      'RH': { 'Geral': ['ler', 'criar', 'editar', 'excluir'] },
      'Expedição': { 'Geral': ['ler', 'criar', 'editar', 'excluir'] },
      'Produção': { 'Geral': ['ler', 'criar', 'editar', 'excluir'] },
    },
    permissoes_sensiveis: ['excluir', 'editar:limites', 'editar:usuarios'],
    requer_aprovacao_especial: false,
    ativo: true,
  },
  {
    nome_perfil: 'Gerencial',
    descricao: 'Acesso a relatórios, dashboards e operações gerenciais',
    nivel_perfil: 'Gerencial',
    permissoes: {
      'Dashboard': { 'Geral': ['ler', 'exportar'] },
      'CRM': { 'Geral': ['ler', 'editar'] },
      'Comercial': { 'Geral': ['ler', 'editar'] },
      'Estoque': { 'Geral': ['ler'] },
      'Financeiro': { 'Geral': ['ler', 'editar'] },
    },
    permissoes_sensiveis: [],
    requer_aprovacao_especial: false,
    ativo: true,
  },
  {
    nome_perfil: 'Operacional',
    descricao: 'Acesso operacional a entrada de dados e consultas',
    nivel_perfil: 'Operacional',
    permissoes: {
      'Comercial': { 'Geral': ['ler', 'criar', 'editar'] },
      'Estoque': { 'Geral': ['ler', 'criar', 'editar'] },
      'Compras': { 'Geral': ['ler', 'criar', 'editar'] },
      'Expedição': { 'Geral': ['ler', 'criar', 'editar'] },
    },
    permissoes_sensiveis: [],
    requer_aprovacao_especial: false,
    ativo: true,
  },
  {
    nome_perfil: 'Consulta',
    descricao: 'Acesso somente leitura a todos os módulos',
    nivel_perfil: 'Consulta',
    permissoes: {
      'Dashboard': { 'Geral': ['ler'] },
      'CRM': { 'Geral': ['ler'] },
      'Comercial': { 'Geral': ['ler'] },
      'Estoque': { 'Geral': ['ler'] },
      'Compras': { 'Geral': ['ler'] },
      'Financeiro': { 'Geral': ['ler'] },
      'Fiscal': { 'Geral': ['ler'] },
      'RH': { 'Geral': ['ler'] },
      'Expedição': { 'Geral': ['ler'] },
    },
    permissoes_sensiveis: [],
    requer_aprovacao_especial: false,
    ativo: true,
  },
  {
    nome_perfil: 'Financeiro',
    descricao: 'Acesso especializado ao módulo financeiro',
    nivel_perfil: 'Operacional',
    permissoes: {
      'Financeiro': { 'Geral': ['ler', 'criar', 'editar'] },
      'Dashboard': { 'Geral': ['ler'] },
    },
    permissoes_sensiveis: ['editar:limites'],
    requer_aprovacao_especial: true,
    ativo: true,
  },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json();
    const groupId = body?.group_id || null;

    const created = [];
    const errors = [];

    for (const perfil of PERFIS_BASE) {
      try {
        const data = {
          ...perfil,
          group_id: groupId,
        };
        const created_perfil = await base44.asServiceRole.entities.PerfilAcesso.create(data);
        created.push({ nome: perfil.nome_perfil, id: created_perfil.id });
      } catch (error) {
        errors.push({ nome: perfil.nome_perfil, erro: error.message });
      }
    }

    return Response.json({ ok: true, created, errors, total: created.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});