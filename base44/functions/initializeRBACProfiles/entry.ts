import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Perfis RBAC padrão do sistema
const DEFAULT_PROFILES = {
  Administrador: {
    nome_perfil: 'Administrador',
    descricao: 'Acesso total ao sistema',
    ativo: true,
    requer_aprovacao_especial: false,
    permissoes: {
      "*": ["*"] // Acesso total
    }
  },
  Gerente: {
    nome_perfil: 'Gerente',
    descricao: 'Acesso gerencial a todos os módulos',
    ativo: true,
    requer_aprovacao_especial: false,
    permissoes: {
      Dashboard: ["ver", "exportar"],
      Relatorios: ["ver", "exportar"],
      CRM: ["ver", "criar", "editar", "aprovar"],
      Comercial: ["ver", "criar", "editar", "aprovar", "desconto"],
      Estoque: ["ver", "criar", "editar"],
      Compras: ["ver", "criar", "editar", "aprovar"],
      Expedicao: ["ver", "criar", "editar"],
      Producao: ["ver", "criar", "editar"],
      Financeiro: ["ver", "criar", "editar", "aprovar"],
      RH: ["ver"],
      Fiscal: ["ver"],
      Agenda: ["ver", "criar", "editar"]
    }
  },
  Operacional: {
    nome_perfil: 'Operacional',
    descricao: 'Acesso a módulos operacionais',
    ativo: true,
    requer_aprovacao_especial: false,
    permissoes: {
      Dashboard: ["ver"],
      Comercial: ["ver", "criar", "editar"],
      Estoque: ["ver", "criar", "editar"],
      Compras: ["ver", "criar"],
      Expedicao: ["ver", "criar", "editar"],
      Producao: ["ver", "criar", "editar"],
      Agenda: ["ver", "criar", "editar"]
    }
  },
  Analista: {
    nome_perfil: 'Analista',
    descricao: 'Acesso de visualização e exportação',
    ativo: true,
    requer_aprovacao_especial: false,
    permissoes: {
      Dashboard: ["ver", "exportar"],
      Relatorios: ["ver", "exportar"],
      CRM: ["ver", "exportar"],
      Comercial: ["ver", "exportar"],
      Estoque: ["ver", "exportar"],
      Compras: ["ver", "exportar"],
      Financeiro: ["ver", "exportar"],
      RH: ["ver", "exportar"],
      Fiscal: ["ver", "exportar"]
    }
  },
  Financeiro: {
    nome_perfil: 'Financeiro',
    descricao: 'Acesso ao módulo financeiro',
    ativo: true,
    requer_aprovacao_especial: true,
    permissoes: {
      Dashboard: ["ver"],
      Financeiro: ["ver", "criar", "editar", "aprovar", "liquidar", "conciliar"],
      Comercial: ["ver"],
      Contatos: ["ver"],
      Agenda: ["ver", "criar"]
    }
  },
  RH: {
    nome_perfil: 'RH',
    descricao: 'Acesso ao módulo de RH',
    ativo: true,
    requer_aprovacao_especial: false,
    permissoes: {
      Dashboard: ["ver"],
      RH: ["ver", "criar", "editar", "aprovar"],
      Agenda: ["ver", "criar", "editar"]
    }
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Apenas admin pode inicializar perfis
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
    const existingNames = new Set(existingProfiles.map(p => p.nome_perfil));

    // Cria apenas perfis que não existem
    const created = [];
    for (const [key, profile] of Object.entries(DEFAULT_PROFILES)) {
      if (!existingNames.has(profile.nome_perfil)) {
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
    if (created.length > 0) {
      await base44.entities.AuditLog.create({
        usuario: user.full_name,
        usuario_id: user.id,
        acao: 'Criação',
        modulo: 'Sistema',
        tipo_auditoria: 'seguranca',
        entidade: 'PerfilAcesso',
        descricao: `Inicialização de ${created.length} perfis RBAC`,
        empresa_id: empresa_id || null,
        group_id: group_id || null,
        dados_novos: { profiles: created.map(p => p.nome_perfil) },
        data_hora: new Date().toISOString(),
      });
    }

    return Response.json({
      ok: true,
      created: created.length,
      profiles: created.map(p => ({ id: p.id, nome: p.nome_perfil }))
    });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});