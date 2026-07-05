/**
 * V21.6 - Executor de Ações do Motor de Intents
 * Executa ações automáticas baseadas no intent detectado (consultas, criação de pedidos, boletos)
 */
import { base44 } from '@/api/base44Client';

/**
 * Executar ação automática baseada no intent
 */
export async function executarAcaoIntent(intent, entidades, clienteId, contexto = {}) {
  try {
    switch (intent) {
      case 'consultar_pedido':
        return await consultarPedidos(clienteId);
      case 'consultar_entrega':
        return await consultarEntregas(clienteId);
      case 'segunda_via_boleto':
        return await consultarBoletos(clienteId);
      case 'criar_pedido':
        return await criarPedido(clienteId, entidades, contexto);
      case 'emitir_boleto':
      case 'gerar_boleto':
        return await gerarBoleto(clienteId, entidades, contexto);
      default:
        return null;
    }
  } catch (error) {
    console.error('Erro ao executar ação:', error);
    return { tipo: 'erro', mensagem: 'Desculpe, ocorreu um erro ao processar sua solicitação. Tente novamente.' };
  }
}

async function consultarPedidos(clienteId) {
  if (!clienteId) {
    return { tipo: 'erro', mensagem: 'Para consultar pedidos, preciso identificar você. Qual seu CPF ou CNPJ?' };
  }
  const pedidos = await base44.entities.Pedido.filter({ cliente_id: clienteId }, '-data_pedido', 5);
  if (pedidos.length === 0) {
    return { tipo: 'info', mensagem: 'Não encontrei pedidos em seu nome. Deseja fazer um novo pedido?' };
  }
  const lista = pedidos.map(p =>
    `• ${p.numero_pedido} - ${p.status} - R$ ${p.valor_total?.toLocaleString('pt-BR')}`
  ).join('\n');
  return { tipo: 'lista_pedidos', mensagem: `📦 Seus últimos pedidos:\n\n${lista}\n\nDeseja detalhes de algum pedido específico?`, dados: pedidos };
}

async function consultarEntregas(clienteId) {
  if (!clienteId) {
    return { tipo: 'erro', mensagem: 'Para consultar entregas, preciso identificar você.' };
  }
  const entregas = await base44.entities.Entrega.filter(
    { cliente_id: clienteId, status: { $nin: ['Entregue', 'Cancelado'] } }, '-data_previsao', 5
  );
  if (entregas.length === 0) {
    return { tipo: 'info', mensagem: 'Não encontrei entregas pendentes. Seus pedidos já foram entregues!' };
  }
  const lista = entregas.map(e =>
    `• Pedido ${e.numero_pedido} - ${e.status} - Previsão: ${e.data_previsao ? new Date(e.data_previsao).toLocaleDateString('pt-BR') : 'A definir'}`
  ).join('\n');
  return { tipo: 'lista_entregas', mensagem: `🚚 Suas entregas em andamento:\n\n${lista}`, dados: entregas };
}

async function consultarBoletos(clienteId) {
  if (!clienteId) {
    return { tipo: 'erro', mensagem: 'Para consultar boletos, preciso identificar você.' };
  }
  const boletos = await base44.entities.ContaReceber.filter(
    { cliente_id: clienteId, status: { $in: ['Pendente', 'Atrasado'] } }, 'data_vencimento', 5
  );
  if (boletos.length === 0) {
    return { tipo: 'info', mensagem: '✅ Parabéns! Você não tem boletos em aberto.' };
  }
  const lista = boletos.map(b =>
    `• ${b.descricao || 'Título'} - R$ ${b.valor?.toLocaleString('pt-BR')} - Venc: ${new Date(b.data_vencimento).toLocaleDateString('pt-BR')}`
  ).join('\n');
  return { tipo: 'lista_boletos', mensagem: `💳 Seus boletos em aberto:\n\n${lista}\n\nDeseja a 2ª via de algum boleto?`, dados: boletos };
}

async function criarPedido(clienteId, entidades, contexto) {
  if (!clienteId) {
    return { tipo: 'erro', mensagem: 'Para criar o pedido, preciso identificar você (cliente). Informe seu CPF/CNPJ ou faça login.' };
  }
  const dataIso = new Date().toISOString().slice(0, 10);
  let clienteNome = 'Cliente';
  try {
    const c = await base44.entities.Cliente.filter({ id: clienteId });
    if (c?.[0]?.nome) clienteNome = c[0].nome;
  } catch {}

  const numero = `WEB-${Date.now()}`;
  const valor = Number(entidades?.valor || 0);
  const pedido = await base44.entities.Pedido.create({
    numero_pedido: numero,
    tipo: 'Pedido',
    origem_pedido: 'Chatbot',
    data_pedido: dataIso,
    cliente_id: clienteId,
    cliente_nome: clienteNome,
    valor_total: isNaN(valor) ? 0 : valor,
    empresa_id: contexto?.empresaId || undefined,
    group_id: contexto?.groupId || undefined,
    pode_ver_no_portal: true,
    prioridade: 'Normal',
    status: 'Rascunho'
  });

  try {
    await base44.entities.AuditLog.create({
      usuario: 'Chatbot', acao: 'Criação', modulo: 'Comercial', entidade: 'Pedido',
      registro_id: pedido.id, descricao: `Pedido criado via chatbot (${numero})`,
      data_hora: new Date().toISOString(),
    });
  } catch {}

  return {
    tipo: 'pedido_criado',
    mensagem: `🧾 Pedido ${numero} criado em rascunho para ${clienteNome}. ${valor > 0 ? `Valor informado: R$ ${valor.toLocaleString('pt-BR')}. ` : ''}Deseja adicionar itens ou finalizar?`,
    dados: pedido
  };
}

async function gerarBoleto(clienteId, entidades, contexto) {
  if (!clienteId) {
    return { tipo: 'erro', mensagem: 'Para emitir boleto, preciso identificar você (cliente).' };
  }
  const valor = Number(entidades?.valor || 0);
  if (!valor || isNaN(valor) || valor <= 0) {
    return { tipo: 'erro', mensagem: 'Informe o valor do boleto (ex: R$ 350,00).' };
  }

  let centroId, planoId;
  try {
    const centros = await base44.entities.CentroCusto.filter({ empresa_id: contexto?.empresaId, status: 'Ativo' }, '-updated_date', 1);
    centroId = centros?.[0]?.id;
  } catch {}
  try {
    const planos = base44.entities.PlanoDeContas
      ? await base44.entities.PlanoDeContas.filter({ empresa_id: contexto?.empresaId, group_id: contexto?.groupId })
      : [];
    planoId = planos?.[0]?.id;
  } catch {}

  if (!centroId || !planoId) {
    return { tipo: 'erro', mensagem: 'Não consegui emitir boleto: configure Centro de Custo e Plano de Contas padrão para a empresa.' };
  }

  const venc = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const cr = await base44.entities.ContaReceber.create({
    descricao: 'Boleto gerado via Chatbot',
    cliente_id: clienteId,
    valor: valor,
    data_vencimento: venc,
    centro_custo_id: centroId,
    plano_contas_id: planoId,
    forma_cobranca: 'Boleto',
    status_cobranca: 'gerada',
    url_boleto_pdf: null,
    empresa_id: contexto?.empresaId || undefined,
    group_id: contexto?.groupId || undefined,
    canal_origem: 'Chatbot'
  });

  try {
    const { data } = await base44.functions.invoke('emitirBoleto', { conta_receber_id: cr.id });
    if (data?.url) {
      await base44.entities.ContaReceber.update(cr.id, { url_boleto_pdf: data.url });
    }
  } catch {}

  try {
    await base44.entities.AuditLog.create({
      usuario: 'Chatbot', acao: 'Criação', modulo: 'Financeiro', entidade: 'ContaReceber',
      registro_id: cr.id,
      descricao: `Boleto emitido via chatbot no valor de R$ ${valor.toLocaleString('pt-BR')}`,
      data_hora: new Date().toISOString(),
    });
  } catch {}

  return {
    tipo: 'boleto_gerado',
    mensagem: `💳 Boleto criado com vencimento em ${new Date(venc).toLocaleDateString('pt-BR')}. Link para pagamento gerado.`,
    dados: cr
  };
}