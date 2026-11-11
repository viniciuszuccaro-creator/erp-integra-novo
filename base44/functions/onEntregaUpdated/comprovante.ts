const normalizar = (v) => String(v || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const pagina = (v) => Array.isArray(v) ? v : v?.items || [];
const camposArquivo = ['foto_comprovante', 'foto_mercadoria', 'foto_local', 'assinatura_digital'];
const texto = (v, max) => String(v || '').replace(/<[^>]*>/g, '').replace(/javascript\s*:/gi, '').trim().slice(0, max);

function permitido(ctx, leitura) {
  if (ctx.user.bloqueado) return false;
  if (ctx.user.role === 'admin') return true;
  if (!ctx.perfil || ctx.perfil.ativo === false) return false;
  const modulo = Object.entries(ctx.perfil.permissoes || {}).find(([k]) => normalizar(k) === 'expedicao')?.[1];
  const secao = Object.entries(modulo || {}).find(([k]) => ['entrega', 'entregas'].includes(normalizar(k)))?.[1];
  const aliases = leitura ? ['ver', 'visualizar', 'consultar', 'read', 'view', 'listar'] : ['editar', 'update', 'edit', 'corrigir', 'gerenciar', 'atualizar'];
  const contem = (v) => Array.isArray(v) ? v.some((a) => aliases.includes(normalizar(a))) : v && typeof v === 'object' && Object.values(v).some(contem);
  return Boolean(contem(secao));
}

async function auditar(base44, user, registro, acao, descricao, depois = null) {
  return base44.asServiceRole.entities.AuditLog.create({
    usuario: user.full_name || user.email, usuario_id: user.id, acao, modulo: 'Expedição',
    entidade: 'Entrega', registro_id: registro.id, group_id: registro.group_id, empresa_id: registro.empresa_id,
    tipo_auditoria: acao === 'Bloqueio' ? 'seguranca' : 'entidade', descricao,
    dados_anteriores: registro, dados_novos: depois, data_hora: new Date().toISOString(), sucesso: acao !== 'Bloqueio',
  });
}

// Ações explícitas do comprovante, separadas do processamento legado de eventos de entrega.
export async function processarComprovante(base44, ctx, body) {
  const { acao, entrega_id, group_id, empresa_id, versao, operacao_id } = body;
  const leitura = acao === 'consultar_comprovante';
  if (!['registrar_comprovante', 'consultar_comprovante'].includes(acao)) return Response.json({ error: 'Ação de comprovante inválida.' }, { status: 400 });
  if (![entrega_id, group_id, empresa_id].every((id) => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id))) return Response.json({ error: 'Entrega, grupo e empresa válidos são obrigatórios.' }, { status: 400 });
  if (!permitido(ctx, leitura)) return Response.json({ error: 'Sem permissão em Expedição / Entrega para esta ação.' }, { status: 403 });
  if (ctx.user.role !== 'admin') {
    // Estes vínculos e o perfil são campos protegidos do User, nunca escolhas de contexto do navegador.
    const empresaPermitida = (ctx.user.empresas_vinculadas || []).some((v) => (typeof v === 'string' ? v === empresa_id : v.empresa_id === empresa_id && v.ativo !== false));
    const grupoPermitido = (ctx.user.grupos_vinculados || []).some((v) => (typeof v === 'string' ? v === group_id : v.grupo_id === group_id && v.ativo !== false));
    if (!empresaPermitida && !grupoPermitido) return Response.json({ error: 'Usuário sem vínculo ativo com a empresa ou grupo.' }, { status: 403 });
  }
  const [empresas, entregas] = await Promise.all([
    base44.asServiceRole.entities.Empresa.filter({ id: empresa_id, group_id }, { limit: 1 }),
    base44.asServiceRole.entities.Entrega.filter({ id: entrega_id, group_id, empresa_id }, { limit: 1 }),
  ]);
  const registro = pagina(entregas)[0];
  if (!pagina(empresas).length || !registro) return Response.json({ error: 'Entrega não encontrada neste contexto.' }, { status: 404 });
  const negar = async (error, status = 422) => { await auditar(base44, ctx.user, registro, 'Bloqueio', error); return Response.json({ error }, { status }); };
  if (ctx.user.role !== 'admin' && ctx.user.restricoes_adicionais?.pode_ver_apenas_proprios_registros && registro.motorista_id !== ctx.user.id && registro.created_by_id !== ctx.user.id) return negar('Entrega atribuída a outro responsável.', 403);
  if (leitura) {
    const comprovante = { ...(registro.comprovante_entrega || {}) };
    // Assina exclusivamente arquivos já vinculados à entrega autorizada. URLs públicas legadas continuam legíveis.
    await Promise.all(camposArquivo.map(async (campo) => {
      const uri = comprovante[campo];
      if (typeof uri !== 'string' || !uri) return;
      if (/^private(?:\/|:\/\/)/.test(uri)) {
        const result = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 300 });
        comprovante[campo] = result.signed_url;
      } else if (!/^https:\/\//.test(uri) && !(campo === 'assinatura_digital' && /^data:image\/png;base64,/.test(uri))) delete comprovante[campo];
    }));
    return Response.json({ ok: true, comprovante, status: registro.status });
  }
  if (typeof operacao_id !== 'string' || !/^[\da-f-]{36}$/i.test(operacao_id) || typeof versao !== 'string' || !versao.trim()) return negar('Operação e versão da entrega são obrigatórias.', 400);
  if (registro.comprovante_entrega?.operacao_id === operacao_id) return Response.json({ ok: true, entrega_id, repetida: true });
  if (!['Saiu para Entrega', 'Em Trânsito'].includes(registro.status)) return negar('Somente uma entrega em rota pode ser confirmada.', 409);
  if (registro.updated_date !== versao) return negar('Entrega alterada por outro usuário. Recarregue e revise o comprovante.', 409);
  if (body.revisado !== true) return negar('Confirme a conferência das fotos e da assinatura.');
  const origem = body.comprovante || {};
  const comprovante = {
    nome_recebedor: texto(origem.nome_recebedor, 160), documento_recebedor: texto(origem.documento_recebedor, 40),
    cargo_recebedor: texto(origem.cargo_recebedor, 100), observacoes_recebimento: texto(origem.observacoes_recebimento, 2000), operacao_id,
  };
  if (comprovante.nome_recebedor.length < 3 || comprovante.documento_recebedor.replace(/[^\p{L}\d]/gu, '').length < 5) return negar('Informe nome completo e documento do recebedor.');
  for (const campo of camposArquivo) {
    const uri = origem[campo];
    if (typeof uri !== 'string' || !/^private(?:\/|:\/\/)/.test(uri) || uri.length > 2048) return negar('Canhoto, mercadoria, local e assinatura devem ser arquivos privados válidos.');
    // A integração verifica se o arquivo realmente existe no armazenamento deste app.
    await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 60 });
    comprovante[campo] = uri;
  }
  const recebimento = Date.parse(origem.data_hora_recebimento);
  if (!Number.isFinite(recebimento) || recebimento > Date.now() + 300000 || recebimento < Date.now() - 7 * 86400000) return negar('Data do recebimento inválida ou comprovante offline há mais de sete dias.');
  comprovante.data_hora_recebimento = new Date(recebimento).toISOString();
  if (origem.latitude_entrega != null || origem.longitude_entrega != null) {
    if (typeof origem.latitude_entrega !== 'number' || typeof origem.longitude_entrega !== 'number' || !Number.isFinite(origem.latitude_entrega) || !Number.isFinite(origem.longitude_entrega) || Math.abs(origem.latitude_entrega) > 90 || Math.abs(origem.longitude_entrega) > 180) return negar('Coordenadas de recebimento inválidas.');
    comprovante.latitude_entrega = origem.latitude_entrega; comprovante.longitude_entrega = origem.longitude_entrega;
  }
  const dados = {
    status: 'Entregue', data_entrega: comprovante.data_hora_recebimento, comprovante_entrega: comprovante,
    historico_status: [...(registro.historico_status || []), { status: 'Entregue', data_hora: new Date().toISOString(), usuario: ctx.user.full_name || ctx.user.email, observacao: `Comprovante completo. Recebido por ${comprovante.nome_recebedor}.`, ...(comprovante.latitude_entrega != null ? { localizacao: { latitude: comprovante.latitude_entrega, longitude: comprovante.longitude_entrega } } : {}) }],
  };
  // A operação individual preserva os gatilhos existentes de estoque/financeiro/produção.
  // updateMany não dispara esses efeitos; a versão é revalidada antes da gravação.
  const atual = await base44.asServiceRole.entities.Entrega.get(entrega_id);
  if (atual.updated_date !== versao) return negar('A entrega mudou durante a confirmação. Recarregue antes de tentar novamente.', 409);
  const depois = await base44.asServiceRole.entities.Entrega.update(entrega_id, dados);
  await auditar(base44, ctx.user, registro, 'Edição', 'Comprovante digital completo registrado', depois);
  return Response.json({ ok: true, entrega_id });
}