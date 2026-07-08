import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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
    descricao: 'Acesso gerencial a todos os módulos operacionais e administrativos, sem acesso a Sistema',
    ativo: true,
    requer_aprovacao_especial: false,
    permissoes: {
      Dashboard: ["ver", "exportar"],
      Relatorios: ["ver", "criar", "editar", "exportar"],
      CRM: ["ver", "criar", "editar", "excluir", "aprovar"],
      Comercial: ["ver", "criar", "editar", "excluir", "aprovar", "desconto"],
      Estoque: ["ver", "criar", "editar", "excluir", "transferir", "inventario"],
      Compras: ["ver", "criar", "editar", "excluir", "aprovar", "receber"],
      Expedicao: ["ver", "criar", "editar", "excluir", "rastrear", "roteirizar"],
      Producao: ["ver", "criar", "editar", "excluir", "apontar", "concluir"],
      Financeiro: ["ver", "criar", "editar", "excluir", "aprovar", "liquidar", "conciliar"],
      RH: ["ver", "criar", "editar", "excluir", "aprovar"],
      Fiscal: ["ver", "criar", "editar", "excluir", "emitir", "cancelar", "exportar"],
      Cadastros: ["ver", "criar", "editar", "excluir", "importar", "exportar"],
      Agenda: ["ver", "criar", "editar", "excluir"],
      Contratos: ["ver", "criar", "editar", "excluir", "assinar", "renovar"],
      HubAtendimento: ["ver", "criar", "editar", "excluir", "responder"]
    }
  },
  Operacional: {
    nome_perfil: 'Operacional',
    descricao: 'CRUD em módulos operacionais, leitura em administrativos, sem acesso a Sistema',
    ativo: true,
    requer_aprovacao_especial: false,
    permissoes: {
      Dashboard: ["ver", "exportar"],
      Agenda: ["ver", "criar", "editar", "excluir"],
      CRM: ["ver", "criar", "editar", "excluir"],
      Cadastros: ["ver", "criar", "editar", "excluir", "importar"],
      Comercial: ["ver", "criar", "editar", "excluir"],
      Estoque: ["ver", "criar", "editar", "excluir", "transferir"],
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
    descricao: 'Leitura e exportação em todos os módulos, sem ações destrutivas nem Sistema',
    ativo: true,
    requer_aprovacao_especial: false,
    permissoes: {
      Dashboard: ["ver", "exportar"],
      Relatorios: ["ver", "criar", "editar", "exportar"],
      CRM: ["ver", "exportar"],
      Comercial: ["ver", "exportar"],
      Estoque: ["ver", "exportar"],
      Compras: ["ver", "exportar"],
      Financeiro: ["ver", "exportar"],
      RH: ["ver", "exportar"],
      Fiscal: ["ver", "exportar"],
      Cadastros: ["ver", "exportar"],
      Expedicao: ["ver", "exportar"],
      Producao: ["ver", "exportar"],
      Agenda: ["ver"],
      Contratos: ["ver", "exportar"],
      HubAtendimento: ["ver"]
    }
  },
  Financeiro: {
    nome_perfil: 'Financeiro',
    descricao: 'Controle total no Financeiro/Fiscal, leitura nos demais, sem Sistema',
    ativo: true,
    requer_aprovacao_especial: true,
    permissoes: {
      Dashboard: ["ver", "exportar"],
      Financeiro: ["ver", "criar", "editar", "excluir", "aprovar", "liquidar", "conciliar"],
      Fiscal: ["ver", "criar", "editar", "emitir", "cancelar", "exportar"],
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
    descricao: 'Controle total no RH, leitura nos demais, sem Sistema',
    ativo: true,
    requer_aprovacao_especial: false,
    permissoes: {
      Dashboard: ["ver", "exportar"],
      RH: ["ver", "criar", "editar", "excluir", "aprovar"],
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