async function emitirENotas(nfe, integracao, config) {
  const apiKey = integracao.api_key;
  const empresaProv = integracao.empresa_id_provedor;
  const payload = {
    tipo: 'NF-e',
    idExterno: nfe.id,
    ambienteEmissao: (config.ambiente === 'Produção' ? 'Producao' : 'Homologacao'),
    cliente: {
      tipoPessoa: (nfe.cliente_cpf_cnpj?.length === 14 ? 'J' : 'F'),
      nome: nfe.cliente_fornecedor,
      email: nfe.cliente_endereco?.email || '',
      cpfCnpj: nfe.cliente_cpf_cnpj?.replace(/\D/g, ''),
      telefone: nfe.cliente_endereco?.telefone?.replace(/\D/g, '') || '',
      endereco: {
        pais: 'Brasil',
        uf: nfe.cliente_endereco?.estado || '',
        cidade: nfe.cliente_endereco?.cidade || '',
        logradouro: nfe.cliente_endereco?.logradouro || '',
        numero: nfe.cliente_endereco?.numero || 'S/N',
        complemento: nfe.cliente_endereco?.complemento || '',
        bairro: nfe.cliente_endereco?.bairro || '',
        cep: nfe.cliente_endereco?.cep?.replace(/\D/g, '') || ''
      }
    },
    produtos: (nfe.itens || []).map((it, i) => ({
      numeroItem: i + 1,
      codigo: it.codigo_produto || '',
      descricao: it.descricao,
      ncm: it.ncm?.replace(/\D/g, '') || '',
      cfop: it.cfop || config.cfop_padrao_dentro_estado,
      unidadeMedida: it.unidade || 'UN',
      quantidade: it.quantidade,
      valorUnitario: it.valor_unitario,
      valorBruto: it.valor_total
    })),
    pedidoNumero: nfe.numero_pedido || nfe.numero,
    observacoes: nfe.informacoes_complementares || ''
  };

  const r = await fetch(`https://api.enotas.com.br/v2/empresas/${empresaProv}/nfes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${btoa(apiKey + ':')}` },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error(await r.text());
  const j = await r.json();
  return {
    sucesso: true,
    nfeId: j.id,
    numero: j.numero,
    serie: j.serie,
    chave: j.chaveAcesso,
    protocolo: j.protocolo,
    dataAutorizacao: j.dataAutorizacao,
    xml: j.linkDownloadXml,
    pdf: j.linkDownloadPdf,
    status: j.status
  };
}

async function statusENotas(nfeId, integracao) {
  const r = await fetch(`https://api.enotas.com.br/v2/empresas/${integracao.empresa_id_provedor}/nfes/${nfeId}`, {
    headers: { Authorization: `Basic ${btoa(integracao.api_key + ':')}` }
  });
  if (!r.ok) throw new Error(await r.text());
  const j = await r.json();
  return { sucesso: true, status: j.status, protocolo: j.protocolo, dataAutorizacao: j.dataAutorizacao, xml: j.linkDownloadXml, pdf: j.linkDownloadPdf };
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({ ok: true, status: 'healthy', module: '_lib/nfeEnotas' });
});