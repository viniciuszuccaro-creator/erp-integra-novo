import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import useContextoVisual from "@/components/lib/useContextoVisual";

const defaultFormData = {
  tipo: "Pessoa Jurídica", status: "Prospect", motivo_inatividade: "", nome: "", razao_social: "", nome_fantasia: "",
  cpf: "", cnpj: "", rg: "", inscricao_estadual: "", inscricao_municipal: "",
  endereco_principal: { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", pais: "Brasil" },
  contatos: [{ tipo: "Telefone", valor: "", principal: true, observacao: "" }],
  condicao_comercial: { tabela_preco_id: "", tabela_preco_nome: "", percentual_desconto: 0, condicao_pagamento: "À Vista", prazo_pagamento_dias: 0, limite_credito: 0, limite_aprovado_por: "", limite_aprovado_em: "", vigencia_desconto_ate: "", dia_vencimento_preferencial: 10 },
  locais_entrega: [],
  configuracao_fiscal: { regime_tributario: "Simples Nacional", isento_ipi: false, isento_icms: false, contribuinte_icms: true, substituicao_tributaria_especial: false, utilizar_nfe_interna: false, nfe_interna_aprovado_por: "", nfe_interna_aprovado_em: "", observacoes_fiscais: "" },
  documentos: [], vendedor_responsavel: "", vendedor_responsavel_id: "", classificacao_abc: "Novo", valor_compras_12meses: 0,
  proxima_acao: { data: "", descricao: "", responsavel: "" }, observacoes: ""
};

const safeMerge = (defaultObj, sourceObj) => {
  if (!sourceObj || typeof sourceObj !== 'object') return defaultObj;
  return { ...defaultObj, ...sourceObj };
};

const buildInitialFormData = (cliente) => {
  if (!cliente) return { ...defaultFormData };
  return {
    tipo: cliente.tipo || defaultFormData.tipo, status: cliente.status || defaultFormData.status,
    motivo_inatividade: cliente.motivo_inatividade || "", nome: cliente.nome || "", razao_social: cliente.razao_social || "",
    nome_fantasia: cliente.nome_fantasia || "", cpf: cliente.cpf || "", cnpj: cliente.cnpj || "", rg: cliente.rg || "",
    inscricao_estadual: cliente.inscricao_estadual || "", inscricao_municipal: cliente.inscricao_municipal || "",
    endereco_principal: safeMerge(defaultFormData.endereco_principal, cliente.endereco_principal),
    contatos: Array.isArray(cliente.contatos) && cliente.contatos.length > 0 ? cliente.contatos : [...defaultFormData.contatos],
    condicao_comercial: safeMerge(defaultFormData.condicao_comercial, cliente.condicao_comercial),
    locais_entrega: Array.isArray(cliente.locais_entrega) ? cliente.locais_entrega : [],
    configuracao_fiscal: safeMerge(defaultFormData.configuracao_fiscal, cliente.configuracao_fiscal),
    documentos: Array.isArray(cliente.documentos) ? cliente.documentos : [],
    vendedor_responsavel: cliente.vendedor_responsavel || "", vendedor_responsavel_id: cliente.vendedor_responsavel_id || "",
    classificacao_abc: cliente.classificacao_abc || "Novo", valor_compras_12meses: cliente.valor_compras_12meses || 0,
    proxima_acao: safeMerge(defaultFormData.proxima_acao, cliente.proxima_acao), observacoes: cliente.observacoes || ""
  };
};

/**
 * Hook extraído de ClienteFormCompleto.jsx
 * Estado, busca CEP/CNPJ com debounce, handlers de contatos/locais/documentos, submit.
 */
export default function useClienteForm({ cliente, onSubmit, onCancel }) {
  const { carimbarContexto } = useContextoVisual();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("principal");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [buscandoCnpj, setBuscandoCnpj] = useState(false);
  const lastCnpjRef = useRef('');
  const lastCepRef = useRef('');
  const cnpjTimerRef = useRef(null);
  const cepTimerRef = useRef(null);

  const [formData, setFormData] = useState(() => buildInitialFormData(cliente));

  const buscarCep = async (cep) => {
    if (!cep || cep.length < 8) return;
    setBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (data.erro) { toast({ title: "CEP não encontrado", variant: "destructive" }); return; }
      setFormData(prev => ({ ...prev, endereco_principal: { ...prev.endereco_principal, cep, logradouro: data.logradouro, bairro: data.bairro, cidade: data.localidade, estado: data.uf } }));
      toast({ title: "✅ CEP encontrado!", description: `${data.logradouro}, ${data.bairro}` });
    } catch (error) { toast({ title: "Erro ao buscar CEP", description: error.message, variant: "destructive" }); }
    finally { setBuscandoCep(false); }
  };

  const buscarCnpj = async (cnpj) => {
    const limpo = (cnpj || '').replace(/\D/g, '');
    if (!limpo || limpo.length < 14) return;
    setBuscandoCnpj(true);
    try {
      const { data } = await base44.functions.invoke('ConsultarCNPJ', { cnpj: limpo });
      if (data?.sucesso && data?.dados) {
        const d = data.dados;
        setFormData(prev => ({
          ...prev, cnpj: limpo, nome: d.razao_social || prev.nome, razao_social: d.razao_social || prev.razao_social,
          nome_fantasia: d.nome_fantasia || prev.nome_fantasia, cnae_principal: d.cnae_principal || d.cnae_codigo || prev.cnae_principal,
          endereco_principal: {
            ...(prev.endereco_principal || {}),
            logradouro: d.endereco_completo?.logradouro || prev.endereco_principal?.logradouro || '',
            numero: d.endereco_completo?.numero || prev.endereco_principal?.numero || '',
            complemento: d.endereco_completo?.complemento || prev.endereco_principal?.complemento || '',
            bairro: d.endereco_completo?.bairro || prev.endereco_principal?.bairro || '',
            cidade: d.endereco_completo?.cidade || prev.endereco_principal?.cidade || '',
            estado: d.endereco_completo?.uf || prev.endereco_principal?.estado || '',
            cep: d.endereco_completo?.cep || prev.endereco_principal?.cep || '', pais: 'Brasil'
          },
          contatos: (() => {
            const contatos = Array.isArray(prev.contatos) ? [...prev.contatos] : [];
            if (d.telefone) { const tel = (d.telefone || '').replace(/\D/g, ''); if (!contatos.some(c => c.tipo === 'Telefone' && c.valor === tel)) contatos.push({ tipo: 'Telefone', valor: tel, principal: contatos.length === 0 }); }
            if (d.email) { if (!contatos.some(c => c.tipo === 'E-mail' && c.valor === d.email)) contatos.push({ tipo: 'E-mail', valor: d.email, principal: contatos.length === 0 }); }
            return contatos;
          })()
        }));
        toast({ title: '✅ CNPJ encontrado', description: d.razao_social || limpo });
      } else { toast({ title: 'CNPJ não encontrado', description: data?.erro || 'Verifique o número informado', variant: 'destructive' }); }
    } catch (error) { toast({ title: 'Erro ao buscar CNPJ', description: error?.message || String(error), variant: 'destructive' }); }
    finally { setBuscandoCnpj(false); }
  };

  const adicionarContato = () => setFormData(prev => ({ ...prev, contatos: [...(prev.contatos || []), { tipo: "Telefone", valor: "", principal: false, observacao: "" }] }));
  const removerContato = (index) => setFormData(prev => ({ ...prev, contatos: (prev.contatos || []).filter((_, i) => i !== index) }));

  const adicionarLocalEntrega = () => setFormData(prev => ({ ...prev, locais_entrega: [...(prev.locais_entrega || []), { apelido: "", cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", latitude: null, longitude: null, horario_inicio: "08:00", horario_fim: "18:00", contato_nome: "", contato_telefone: "", observacoes: "", principal: false }] }));
  const removerLocalEntrega = (index) => setFormData(prev => ({ ...prev, locais_entrega: (prev.locais_entrega || []).filter((_, i) => i !== index) }));

  const geocodificarEndereco = (index) => {
    toast({ title: "🗺️ Geocodificação", description: "Em produção, usaria Google Maps API" });
    setFormData(prev => { const novosLocais = [...(prev.locais_entrega || [])]; novosLocais[index] = { ...novosLocais[index], latitude: -23.5505 + (Math.random() - 0.5) * 0.1, longitude: -46.6333 + (Math.random() - 0.5) * 0.1 }; return { ...prev, locais_entrega: novosLocais }; });
  };

  const handleUploadDocumento = (tipo) => {
    toast({ title: "📎 Upload", description: "Em produção, integraria com armazenamento" });
    const novoDoc = { tipo, nome_arquivo: `documento_${Date.now()}.pdf`, url_arquivo: `https://example.com/docs/${Date.now()}.pdf`, data_upload: new Date().toISOString().split('T')[0], data_validade: "", observacao: "" };
    setFormData(prev => ({ ...prev, documentos: [...(prev.documentos || []), novoDoc] }));
  };
  const removerDocumento = (index) => setFormData(prev => ({ ...prev, documentos: (prev.documentos || []).filter((_, i) => i !== index) }));

  const handleSubmit = async () => {
    if ((formData.status === 'Inativo' || formData.status === 'Bloqueado') && !formData.motivo_inatividade) {
      toast({ title: "⚠️ Campo Obrigatório", description: "Informe o motivo da inativação/bloqueio", variant: "destructive" });
      setActiveTab("principal");
      return;
    }
    const dataToSubmit = { ...formData, condicao_comercial: { ...formData.condicao_comercial, limite_credito: formData.condicao_comercial?.condicao_pagamento === 'À Vista' ? 0 : formData.condicao_comercial?.limite_credito || 0 } };
    onSubmit(carimbarContexto(dataToSubmit, 'empresa_id'));
  };

  useEffect(() => {
    if (formData?.condicao_comercial?.condicao_pagamento === 'À Vista') {
      setFormData(prev => ({ ...prev, condicao_comercial: { ...(prev.condicao_comercial || {}), limite_credito: 0 } }));
    }
  }, [formData?.condicao_comercial?.condicao_pagamento]);

  useEffect(() => {
    const limpo = (formData?.cnpj || '').replace(/\D/g, '');
    if (formData?.tipo === 'Pessoa Jurídica' && limpo.length === 14 && limpo !== lastCnpjRef.current) {
      if (cnpjTimerRef.current) clearTimeout(cnpjTimerRef.current);
      cnpjTimerRef.current = setTimeout(() => { lastCnpjRef.current = limpo; buscarCnpj(limpo); }, 600);
    }
    return () => { if (cnpjTimerRef.current) clearTimeout(cnpjTimerRef.current); };
  }, [formData?.cnpj, formData?.tipo]);

  useEffect(() => {
    const limpoCep = (formData?.endereco_principal?.cep || '').replace(/\D/g, '');
    if (limpoCep.length >= 8 && limpoCep !== lastCepRef.current) {
      if (cepTimerRef.current) clearTimeout(cepTimerRef.current);
      cepTimerRef.current = setTimeout(() => { lastCepRef.current = limpoCep; buscarCep(limpoCep); }, 600);
    }
    return () => { if (cepTimerRef.current) clearTimeout(cepTimerRef.current); };
  }, [formData?.endereco_principal?.cep]);

  return {
    activeTab, setActiveTab, formData, setFormData, buscandoCep, buscandoCnpj,
    buscarCep, buscarCnpj, adicionarContato, removerContato, adicionarLocalEntrega, removerLocalEntrega,
    geocodificarEndereco, handleUploadDocumento, removerDocumento, handleSubmit
  };
}

export { defaultFormData };