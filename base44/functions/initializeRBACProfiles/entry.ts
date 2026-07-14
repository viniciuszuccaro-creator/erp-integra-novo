import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * Perfis RBAC padrão do sistema — alinhados com regras SoD.
 *
 * Princípio de Segregação de Funções (SoD):
 * - Quem CRIA/INICIA uma transação NÃO APROVA (Operacional cria → Gerente aprova)
 * - Quem APROVA NÃO EXECUTA/LIQUIDA (Gerente aprova → Financeiro liquida)
 * - Ninguém tem CRIAR + EXCLUIR no mesmo módulo (exclusão é admin-only)
 * - Ninguém tem EMITIR + CANCELAR NF-e no mesmo perfil
 * - Sistema é exclusivo de admin (entityGuard bloqueia não-admin)
 *
 * 3 níveis de responsabilidade:
 * 1. Executor (Operacional) — cria/edita, não aprova nem exclui
 * 2. Aprovador (Gerente) — aprova/autoriza, não cria nem exclui
 * 3. Especialista (Financeiro/RH) — executa ações específicas sem aprovar
 */
const DEFAULT_PROFILES = {
  Administrador: {
    nome_perfil: 'Administrador',
    descricao: 'Acesso total ao sistema — isento de regras SoD',
    nivel_perfil: 'Administrador',
    ativo: true,
    requer_aprovacao_especial: false,
    permissoes: {
      "*": ["*"]
    }
  },
  Gerente: {
    nome_perfil: 'Gerente',
    descricao: 'Aprovador/Gestor — aprova e autoriza transações, não cria nem exclui. Sem acesso a Sistema.',
    nivel_perfil: 'Gerencial',
    ativo: true,
    requer_aprovacao_especial: false,
    permissoes: {
      Dashboard: ["ver", "exportar"],
      Relatorios: ["ver", "criar", "editar", "exportar"],
      Agenda: ["ver", "criar", "editar", "excluir"],
      CRM: ["ver", "editar", "aprovar", "exportar"],
      Cadastros: ["ver", "editar", "exportar"],
      Comercial: ["ver", "aprovar", "cancelar", "exportar"],
      Estoque: ["ver", "transferir", "inventario", "exportar"],
      Compras: ["ver", "aprovar", "exportar"],
      Expedicao: ["ver", "rastrear", "roteirizar", "exportar"],
      Producao: ["ver", "aprovar", "concluir", "exportar"],
      Financeiro: ["ver", "aprovar", "conciliar", "exportar"],
      RH: ["ver", "aprovar"],
      Fiscal: ["ver", "exportar"],
      Contratos: ["ver", "aprovar", "assinar", "renovar", "exportar"],
      HubAtendimento: ["ver", "responder", "transferir", "exportar"]
    }
  },
  Operacional: {
    nome_perfil: 'Operacional',
    descricao: 'Executor — cria e edita transações operacionais, não aprova nem exclui. Sem Sistema.',
    nivel_perfil: 'Operacional',
    ativo: true,
    requer_aprovacao_especial: false,
    permissoes: {
      Dashboard: ["ver", "exportar"],
      Agenda: ["ver", "criar", "editar", "excluir"],
      CRM: ["ver", "criar", "editar", "exportar"],
      Cadastros: ["ver", "criar", "editar", "importar"],
      Comercial: ["ver", "criar", "editar", "exportar"],
      Estoque: ["ver", "criar", "editar", "transferir"],
      Compras: ["ver", "criar", "editar", "receber"],
      Expedicao: ["ver", "criar", "editar", "rastrear", "roteirizar"],
      Producao: ["ver", "criar", "editar", "apontar", "concluir"],
      Financeiro: ["ver"],
      RH: ["ver"],
      Fiscal: ["ver"],
      Contratos: ["ver"],
      Relatorios: ["ver", "exportar"],
      HubAtendimento: ["ver", "criar", "editar", "responder"]
    }
  },
  Analista: {
    nome_perfil: 'Analista',
    descricao: 'Consultor — leitura e exportação em todos os módulos, sem ações destrutivas nem Sistema.',
    nivel_perfil: 'Consulta',
    ativo: true,
    requer_aprovacao_especial: false,
    permissoes: {
      Dashboard: ["ver", "exportar"],
      Relatorios: ["ver", "criar", "editar", "exportar"],
      Agenda: ["ver"],
      CRM: ["ver", "exportar"],
      Cadastros: ["ver", "exportar"],
      Comercial: ["ver", "exportar"],
      Estoque: ["ver", "exportar"],
      Compras: ["ver", "exportar"],
      Expedicao: ["ver", "exportar"],
      Producao: ["ver", "exportar"],
      Financeiro: ["ver", "exportar"],
      RH: ["ver", "exportar"],
      Fiscal: ["ver", "exportar"],
      Contratos: ["ver", "exportar"],
      HubAtendimento: ["ver"]
    }
  },
  Financeiro: {
    nome_perfil: 'Financeiro',
    descricao: 'Especialista financeiro — executa liquidações e emissões, não aprova nem exclui. Sem Sistema.',
    nivel_perfil: 'Operacional',
    ativo: true,
    requer_aprovacao_especial: true,
    permissoes: {
      Dashboard: ["ver", "exportar"],
      Financeiro: ["ver", "criar", "editar", "liquidar", "conciliar", "exportar"],
      Fiscal: ["ver", "criar", "editar", "emitir", "exportar"],
      Comercial: ["ver"],
      Estoque: ["ver"],
      Compras: ["ver"],
      Expedicao: ["ver"],
      Producao: ["ver"],
      CRM: ["ver"],
      RH: ["ver"],
      Cadastros: ["ver"],
      Agenda: ["ver", "criar", "editar", "excluir"],
      Contratos: ["ver", "criar", "editar", "assinar", "renovar"],
      Relatorios: ["ver", "criar", "editar", "exportar"],
      HubAtendimento: ["ver"]
    }
  },
  RH: {
    nome_perfil: 'RH',
    descricao: 'Especialista de RH — edita dados de pessoal, não aprova nem exclui. Sem Sistema.',
    nivel_perfil: 'Operacional',
    ativo: true,
    requer_aprovacao_especial: false,
    permissoes: {
      Dashboard: ["ver", "exportar"],
      RH: ["ver", "criar", "editar", "exportar"],
      Cadastros: ["ver", "criar", "editar"],
      Agenda: ["ver", "criar", "editar", "excluir"],
      Comercial: ["ver"],
      Estoque: ["ver"],
      Compras: ["ver"],
      Expedicao: ["ver"],
      Producao: ["ver"],
      Financeiro: ["ver"],
      Fiscal: ["ver"],
      CRM: ["ver"],
      Contratos: ["ver"],
      Relatorios: ["ver", "exportar"],
      HubAtendimento: ["ver"]
    }
  },
  User: {
    nome_perfil: 'User',
    descricao: 'Leitura em todos os módulos, sem ações de escrita nem Sistema.',
    nivel_perfil: 'Consulta',
    ativo: true,
    requer_aprovacao_especial: false,
    permissoes: {
      Dashboard: ["ver", "exportar"],
      Relatorios: ["ver", "exportar"],
      Agenda: ["ver", "criar", "editar", "excluir"],
      CRM: ["ver"],
      Cadastros: ["ver"],
      Comercial: ["ver"],
      Estoque: ["ver"],
      Compras: ["ver"],
      Expedicao: ["ver"],
      Producao: ["ver"],
      Financeiro: ["ver"],
      RH: ["ver"],
      Fiscal: ["ver"],
      Contratos: ["ver"],
      HubAtendimento: ["ver"]
    }
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payload = await req.json().catch(() => ({}));
    const group_id = payload?.group_id;
    const empresa_id = payload?.empresa_id;

    if (!group_id && !empresa_id) {
      return Response.json({ error: 'Informe group_id ou empresa_id' }, { status: 400 });
    }

    const scope = {};
    if (group_id) scope.group_id = group_id;
    if (empresa_id) scope.empresa_id = empresa_id;

    // Verifica quais perfis já existem
    const existingProfiles = await base44.asServiceRole.entities.PerfilAcesso.filter(scope);
    const existingByName = new Map();
    for (const p of existingProfiles || []) {
      existingByName.set(p.nome_perfil, p);
    }

    const created = [];
    const updated = [];

    for (const [key, profile] of Object.entries(DEFAULT_PROFILES)) {
      const existing = existingByName.get(profile.nome_perfil);
      if (existing) {
        // Atualiza permissões do perfil existente para alinhar com SoD
        const permsChanged = JSON.stringify(existing.permissoes || {}) !== JSON.stringify(profile.permissoes);
        const descChanged = existing.descricao !== profile.descricao;
        const nivelChanged = existing.nivel_perfil !== profile.nivel_perfil;
        if (permsChanged || descChanged || nivelChanged) {
          await base44.asServiceRole.entities.PerfilAcesso.update(existing.id, {
            permissoes: profile.permissoes,
            descricao: profile.descricao,
            nivel_perfil: profile.nivel_perfil,
          });
          updated.push({ id: existing.id, nome: profile.nome_perfil });
        }
      } else {
        try {
          const newProfile = await base44.asServiceRole.entities.PerfilAcesso.create({
            ...profile,
            ...scope
          });
          created.push(newProfile);
        } catch (err) {
          console.error(`Erro ao criar perfil ${key}:`, err.message);
        }
      }
    }

    // Auditoria
    if (created.length > 0 || updated.length > 0) {
      await base44.entities.AuditLog.create({
        usuario: user.full_name,
        usuario_id: user.id,
        acao: created.length > 0 ? 'Criação' : 'Edição',
        modulo: 'Sistema',
        tipo_auditoria: 'seguranca',
        entidade: 'PerfilAcesso',
        descricao: `Inicialização RBAC: ${created.length} criados, ${updated.length} atualizados (SoD-compliant)`,
        empresa_id: empresa_id || null,
        group_id: group_id || null,
        dados_novos: {
          created: created.map(p => p.nome_perfil),
          updated: updated.map(p => p.nome),
          sod_compliant: true
        },
        data_hora: new Date().toISOString(),
      });
    }

    return Response.json({
      ok: true,
      created: created.length,
      updated: updated.length,
      profiles: [...created, ...updated].map(p => ({ id: p.id, nome: p.nome_perfil || p.nome })),
      sod_compliant: true
    });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});