import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Upload, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useRLSQuery } from "@/components/lib/useRLSQuery";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  num, sanitize, sleep, norm, isHeaderRow, HEADERS, UNIDADES_ACEITAS,
  autoMapFromHeaders, mapUnidade, mapTipoItem, sanitizeNCM, isNCMValido, makeKey, get, resolverCodigoProduto
} from "./importador/importadorHelpers";
import ImportadorPreviewTable from "./importador/ImportadorPreviewTable";
import ImportadorDuplicidadesPanel from "./importador/ImportadorDuplicidadesPanel";
import ImportadorErrosPanel from "./importador/ImportadorErrosPanel";
import ImportadorMapeamentoPanel from "./importador/ImportadorMapeamentoPanel";

export default function ImportadorProdutosPlanilha({ onConcluido, closeSelf }) {
  const { empresaAtual, filterInContext } = useContextoVisual();
  const [arquivo, setArquivo] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [preview, setPreview] = useState([]);
  const [fileUrl, setFileUrl] = useState(null);
  const [columnMap, setColumnMap] = useState({});
  const [availableHeaders, setAvailableHeaders] = useState([]);
  const [parsedRows, setParsedRows] = useState([]);
  const [totalLinhas, setTotalLinhas] = useState(0);
  const [erro, setErro] = useState('');
  const [grupoId, setGrupoId] = useState('');
  const [empresaId, setEmpresaId] = useState(empresaAtual?.id || '');
  const [importarParaTodasEmpresas, setImportarParaTodasEmpresas] = useState(false);
  const [baseProdutos, setBaseProdutos] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [duplicidades, setDuplicidades] = useState([]);
  const [escolhasDuplicidades, setEscolhasDuplicidades] = useState({});
  const [checando, setChecando] = useState(false);
  const [estrategiaDuplicidadeGlobal, setEstrategiaDuplicidadeGlobal] = useState('pular');
  const [invalidNCMKeys, setInvalidNCMKeys] = useState(new Set());
  const [ncmSuggestions, setNcmSuggestions] = useState({});
  const [suggesting, setSuggesting] = useState(false);

  const { data: grupos = [] } = useRLSQuery('GrupoEmpresarial', {}, '-nome_do_grupo', 200, {});
  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-por-grupo', grupoId],
    queryFn: async () => {
      if (!grupoId) return base44.entities.Empresa.list();
      const [byGroup, byGrupo] = await Promise.all([
        base44.entities.Empresa.filter({ group_id: grupoId }),
        base44.entities.Empresa.filter({ grupo_id: grupoId }),
      ]);
      const merged = [...(byGroup || []), ...(byGrupo || [])];
      const map = new Map(); merged.forEach(e => { if (e?.id) map.set(e.id, e); });
      const arr = Array.from(map.values());
      return arr.length ? arr : [];
    },
    staleTime: 60000,
  });
  const { data: gruposProduto = [] } = useQuery({ queryKey: ['grupos-produto', empresaAtual?.id], queryFn: () => filterInContext('GrupoProduto', {}, 'nome_grupo', 999), staleTime: 300000, enabled: !!empresaAtual });
  const { data: setoresAtividade = [] } = useQuery({ queryKey: ['setores-atividade', empresaAtual?.id], queryFn: () => filterInContext('SetorAtividade', {}, 'nome', 999), staleTime: 300000, enabled: !!empresaAtual });

  const gruposByCodigo = React.useMemo(() => { const m = {}; (gruposProduto || []).forEach(g => { if (g?.codigo != null) m[String(g.codigo).trim()] = g.id; }); return m; }, [gruposProduto]);
  const gruposByNome = React.useMemo(() => { const m = {}; (gruposProduto || []).forEach(g => { const n = g?.nome_grupo || g?.nome; if (n) m[norm(n)] = g.id; }); return m; }, [gruposProduto]);
  const setoresByCodigo = React.useMemo(() => { const m = {}; (setoresAtividade || []).forEach(s => { if (s?.codigo != null) m[String(s.codigo).trim()] = s.id; }); return m; }, [setoresAtividade]);
  const setoresByNome = React.useMemo(() => { const m = {}; (setoresAtividade || []).forEach(s => { const n = s?.nome || s?.descricao; if (n) m[norm(n)] = s.id; }); return m; }, [setoresAtividade]);
  const groupsOptions = React.useMemo(() => {
    if (Array.isArray(grupos) && grupos.length > 0) return grupos;
    const ids = new Set();
    (empresas || []).forEach(e => { if (e?.group_id) ids.add(e.group_id); });
    return Array.from(ids).map(id => ({ id, nome: id }));
  }, [grupos, empresas]);

  let runtimeGruposByCodigo = {}, runtimeGruposByNome = {}, runtimeSetoresByNome = {};

  React.useEffect(() => {
    if (!empresaId && empresaAtual?.id) setEmpresaId(empresaAtual.id);
    else if (!empresaId && empresas?.length > 0) setEmpresaId(empresas[0].id);
  }, [empresaAtual?.id, empresas?.length, empresaId]);

  const getProdutosAlvo = () => {
    if (!baseProdutos?.length) return [];
    if ((importarParaTodasEmpresas && grupoId && empresas?.length) || (!empresaId && grupoId && empresas?.length)) {
      return empresas.flatMap(emp => baseProdutos.map(p => ({ ...p, empresa_id: emp.id, group_id: grupoId, compartilhado_grupo: true })));
    }
    return baseProdutos;
  };

  const downloadErrosCSV = () => {
    if (!validationErrors.length) return;
    const headers = ['empresa_id','codigo','motivo'];
    const rows = validationErrors.map(e => [e.empresa_id || '', e.codigo || '', e.motivo || '']);
    const csv = [headers.join(','), ...rows.map(r => r.map(x => `"${String(x).replace(/"/g,'"')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'erros_importacao_produtos.csv';
    document.body.appendChild(a); a.click(); URL.revokeObjectURL(url); a.remove();
  };

  const sugerirNCMsIA = async () => {
    toast.error('IA indisponivel: creditos esgotados ate 07/07/2026.');
  };

  const applySuggestion = (key) => {
    const ncm = ncmSuggestions[key]; if (!ncm) return;
    setBaseProdutos(prev => prev.map(p => (makeKey(p.empresa_id, p.codigo) === key ? { ...p, ncm } : p)));
    setPreview(prev => prev.map(p => (makeKey(p.empresa_id, p.codigo) === key ? { ...p, ncm } : p)));
  };

  const applyAllSuggestions = () => {
    const keys = Object.keys(ncmSuggestions || {});
    if (keys.length === 0) return;
    setBaseProdutos(prev => prev.map(p => { const k = makeKey(p.empresa_id, p.codigo); return ncmSuggestions[k] ? { ...p, ncm: ncmSuggestions[k] } : p; }));
    setPreview(prev => prev.map(p => { const k = makeKey(p.empresa_id, p.codigo); return ncmSuggestions[k] ? { ...p, ncm: ncmSuggestions[k] } : p; }));
  };

  React.useEffect(() => {
    const validar = async () => {
      if (!baseProdutos?.length) { setValidationErrors([]); setDuplicidades([]); setEscolhasDuplicidades({}); return; }
      const produtosAlvo = getProdutosAlvo();
      setChecando(true); setValidationErrors([]); setDuplicidades([]); setEscolhasDuplicidades({});
      const erros = []; const internos = new Set(); const vistos = new Set();
      for (const p of produtosAlvo) {
        const k = makeKey(p.empresa_id, p.codigo);
        if (!p?.codigo) erros.push({ empresa_id: p.empresa_id, codigo: '-', motivo: 'Código ausente' });
        if (!p?.descricao || String(p.descricao).trim() === '') erros.push({ empresa_id: p.empresa_id, codigo: p.codigo, motivo: 'Descrição obrigatória ausente' });
        if (!UNIDADES_ACEITAS.includes(p.unidade_medida)) erros.push({ empresa_id: p.empresa_id, codigo: p.codigo, motivo: 'Unidade de medida ausente ou inválida' });
        if (vistos.has(k)) internos.add(k); else vistos.add(k);
      }
      internos.forEach(k => { const [empId, code] = k.split('__'); erros.push({ empresa_id: empId, codigo: code, motivo: 'Código duplicado na empresa (na planilha)' }); });
      const invalids = new Set();
      for (const p of produtosAlvo) { if (!p?.ncm || !isNCMValido(p.ncm)) invalids.add(makeKey(p.empresa_id, p.codigo)); }
      setInvalidNCMKeys(invalids);
      const keys = Array.from(new Set(produtosAlvo.filter(p => p.codigo).map(p => makeKey(p.empresa_id, p.codigo))));
      const duplics = []; let delayDup = 0;
      for (let i = 0; i < keys.length; i += 10) {
        const slice = keys.slice(i, i + 10);
        if (delayDup) await sleep(delayDup);
        await Promise.allSettled(slice.map(async (k) => {
          const [empId, code] = k.split('__');
          if (internos.has(k)) return null;
          try {
            const encontrados = await base44.entities.Produto.filter({ empresa_id: empId, codigo: code }, undefined, 1);
            if (Array.isArray(encontrados) && encontrados.length > 0) {
              const novo = produtosAlvo.find(p => makeKey(p.empresa_id, p.codigo) === k);
              duplics.push({ empresa_id: empId, codigo: code, existente: encontrados[0], novo });
            }
          } catch (_) {}
          return null;
        }));
        await sleep(250);
      }
      setValidationErrors(erros); setDuplicidades(duplics); setChecando(false);
    };
    validar();
  }, [baseProdutos, empresaId, grupoId, importarParaTodasEmpresas, empresas?.length]);

  const getWithMap = (row, fieldKey) => {
    const mappedHeader = columnMap?.[fieldKey];
    const syns = HEADERS[fieldKey] || [];
    const candidates = mappedHeader ? [mappedHeader, ...syns] : syns;
    return get(row, candidates);
  };

  const montarProduto = (row) => {
    const rawGrupoId = sanitize(getWithMap(row, 'grupo_produto_id'));
    const rawGrupoNome = sanitize(getWithMap(row, 'grupo_produto_nome'));
    const gruposCodigoMap = { ...gruposByCodigo, ...runtimeGruposByCodigo };
    const gruposNomeMap = { ...gruposByNome, ...runtimeGruposByNome };
    let grupoIdResolved = (rawGrupoId && gruposCodigoMap[rawGrupoId]) || (rawGrupoNome && gruposNomeMap[norm(rawGrupoNome)]) || undefined;
    const rawSetorId = sanitize(getWithMap(row, 'setor_atividade_id'));
    const rawSetorNome = sanitize(getWithMap(row, 'setor_atividade_nome'));
    const setoresNomeMap = { ...setoresByNome, ...runtimeSetoresByNome };
    let setorIdResolved = (rawSetorNome && setoresNomeMap[norm(rawSetorNome)]) || undefined;
    const produto = {
      empresa_id: empresaId,
      group_id: grupoId || empresaAtual?.group_id || null,
      codigo: sanitize(getWithMap(row, 'codigo')),
      descricao: sanitize(getWithMap(row, 'descricao'))?.slice(0, 250),
      unidade_medida: mapUnidade(getWithMap(row, 'unidade_medida')),
      estoque_minimo: num(getWithMap(row, 'estoque_minimo')) || 0,
      estoque_atual: 0, estoque_reservado: 0, estoque_disponivel: 0,
      ncm: sanitizeNCM(getWithMap(row, 'ncm')),
      peso_teorico_kg_m: num(getWithMap(row, 'peso_teorico_kg_m')),
      grupo_produto_id: grupoIdResolved,
      grupo_produto_nome: rawGrupoNome,
      peso_liquido_kg: num(getWithMap(row, 'peso_liquido_kg')),
      peso_bruto_kg: num(getWithMap(row, 'peso_bruto_kg')),
      setor_atividade_id: setorIdResolved,
      setor_atividade_nome: rawSetorNome,
      custo_aquisicao: num(getWithMap(row, 'custo_aquisicao')),
      tipo_item: mapTipoItem(getWithMap(row, 'tipo_item')),
      status: "Ativo", modo_cadastro: "Lote/Importação",
    };
    Object.keys(produto).forEach((k) => produto[k] === undefined && delete produto[k]);
    return produto;
  };

  const detectEncoding = async (file) => {
    try {
      const buf = await file.slice(0, 4).arrayBuffer();
      const b = new Uint8Array(buf);
      if (b[0] === 0xFF && b[1] === 0xFE) return 'UTF-16LE';
      if (b[0] === 0xFE && b[1] === 0xFF) return 'UTF-16BE';
    } catch (_) {}
    return 'UTF-8';
  };

  const parseCSVRows = (raw) => {
    let text = String(raw || '').replace(/^\uFEFF/, '');
    const firstBreak = Math.min(...[text.indexOf('\n'), text.indexOf('\r')].filter(i => i !== -1));
    if (firstBreak > -1) {
      const m = /^sep=(.|\t)$/i.exec(text.slice(0, firstBreak).trim());
      if (m) text = text.slice(firstBreak + 1);
    }
    const firstLineEnd = Math.min(...[text.indexOf('\n'), text.indexOf('\r')].filter(i => i !== -1), text.length);
    const firstLine = text.slice(0, firstLineEnd);
    const delim = firstLine.includes('\t') ? '\t' : (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ',';
    const rows = []; let row = [], cur = '', inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i], next = text[i + 1];
      if (inQuotes) {
        if (ch === '"' && next === '"') { cur += '"'; i++; continue; }
        if (ch === '"') { inQuotes = false; continue; }
        cur += ch;
      } else {
        if (ch === '"') { inQuotes = true; continue; }
        if (ch === delim) { row.push(cur); cur = ''; continue; }
        if (ch === '\n' || ch === '\r') {
          if (ch === '\r' && next === '\n') i++;
          row.push(cur); rows.push(row); row = []; cur = ''; continue;
        }
        cur += ch;
      }
    }
    row.push(cur); rows.push(row);
    return rows.filter(r => r.some(c => String(c || '').trim() !== ''));
  };

  const extrairLinhas = async (file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFileUrl(file_url);
    const ext = (file?.name || '').split('.').pop()?.toLowerCase();
    if (ext === 'csv') {
      const buf = await file.arrayBuffer();
      const encoding = await detectEncoding(file);
      let text = null;
      try { text = new TextDecoder(encoding === 'UTF-16LE' ? 'utf-16le' : encoding === 'UTF-16BE' ? 'utf-16be' : 'utf-8').decode(buf); } catch { text = new TextDecoder('utf-8').decode(buf); }
      const rowsAA = parseCSVRows(text || '');
      if (Array.isArray(rowsAA) && rowsAA.length > 0) {
        const headerRowRaw = rowsAA[0].map((h) => String(h ?? '').replace(/^\uFEFF/, '').trim());
        const dataRows = rowsAA.slice(1);
        const maxLen = Math.max(headerRowRaw.length, ...dataRows.map(r => r.length), 0);
        const headerRow = headerRowRaw.length < maxLen ? [...headerRowRaw, ...Array.from({ length: maxLen - headerRowRaw.length }, (_, i) => `COL_${headerRowRaw.length + i + 1}`)] : headerRowRaw;
        const objetos = dataRows.map((linha) => {
          const obj = {};
          for (let i = 0; i < maxLen; i++) {
            const header = headerRow[i]; if (header) obj[header] = linha[i];
            obj[String.fromCharCode(65 + i)] = linha[i];
          }
          return obj;
        });
        if (objetos.length > 0) return objetos.filter(o => Object.keys(o).length > 0);
      }
    }
    const { data } = await base44.functions.invoke('parseSpreadsheet', { file_url });
    return Array.isArray(data?.rows) ? data.rows : [];
  };

  const handleArquivo = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setArquivo(f); setProcessando(true);
    try {
      if (!empresaId && !grupoId) { setErro('Selecione a empresa OU um grupo antes de importar.'); toast.error('Selecione a empresa ou um grupo.'); return; }
      const rows = await extrairLinhas(f);
      if (!rows.length) { toast.error("Não encontramos linhas na planilha."); return; }
      setParsedRows(rows);
      const dataRows = rows.filter((r) => !isHeaderRow(r));
      setTotalLinhas(dataRows.length);
      const headersDetectados = Array.from(new Set(dataRows.flatMap((r) => Object.keys(r || {})))).filter(Boolean);
      setAvailableHeaders(headersDetectados);
      setColumnMap(autoMapFromHeaders(headersDetectados));
      const baseAll = dataRows.map(r => montarProduto(r)).map(p => ({ ...p, estoque_atual: 0, estoque_reservado: 0, estoque_disponivel: 0, unidade_medida: UNIDADES_ACEITAS.includes(p.unidade_medida) ? p.unidade_medida : 'UN' })).filter(p => p?.descricao);
      setPreview(baseAll); setBaseProdutos(baseAll); setErro('');
      toast.success(`Arquivo lido: ${dataRows.length} item(ns)`);
    } finally { setProcessando(false); }
  };

  const importar = async () => {
    setErro('');
    if (!arquivo) { setErro('Selecione um arquivo válido.'); toast.error("Selecione um arquivo válido."); return; }
    if (!empresaId && !grupoId) { setErro('Selecione a empresa ou grupo.'); toast.error('Selecione a empresa ou um grupo.'); return; }
    toast("Iniciando importação...");
    setProcessando(true);
    try {
      const rows = await extrairLinhas(arquivo);
      const dataRows = rows.filter(r => !isHeaderRow(r));
      const base = dataRows.map(r => montarProduto(r)).filter(p => p?.descricao);
      let produtos;
      if ((importarParaTodasEmpresas && grupoId && empresas?.length) || (!empresaId && grupoId && empresas?.length)) {
        produtos = empresas.flatMap(emp => base.map(p => ({ ...p, empresa_id: emp.id, group_id: grupoId, compartilhado_grupo: true })));
      } else { produtos = base; }
      produtos = produtos.map(p => ({ ...p, empresa_id: p.empresa_id || empresaId || empresaAtual?.id || '', ...(grupoId ? { group_id: grupoId } : {}), unidade_medida: UNIDADES_ACEITAS.includes(p.unidade_medida) ? p.unidade_medida : 'UN', estoque_atual: 0, estoque_reservado: 0, estoque_disponivel: 0 }));
      const seenKeys = new Set();
      produtos = produtos.filter(p => { const k = makeKey(p.empresa_id, p.codigo); if (seenKeys.has(k)) return false; seenKeys.add(k); return true; });
      // Regra-Mãe §5c: resolver códigos sequenciais — duplicatas são auto-sequenciadas, NUNCA puladas
      const resolvedGid = grupoId || produtos[0]?.group_id || empresaAtual?.group_id;
      const usedCodes = new Set();
      for (const p of produtos) {
        p.codigo = await resolverCodigoProduto(p.codigo, resolvedGid, base44, usedCodes);
      }
      let createdTotal = 0, failedTotal = 0;
      const chunkSize = 10; let delay = 0;
      for (let i = 0; i < produtos.length; i += chunkSize) {
        const chunk = produtos.slice(i, i + chunkSize);
        if (delay) await sleep(delay);
        const results = await Promise.allSettled(chunk.map(p => base44.entities.Produto.create(p)));
        const failures = results.filter(r => r.status === 'rejected');
        if (failures.length > 0) delay = Math.min((delay || 400) * 1.5, 5000);
        failedTotal += failures.length;
        createdTotal += results.filter(r => r.status === 'fulfilled').length;
        await sleep(300);
      }
      if (failedTotal > 0) toast.warning(`Importação: ${createdTotal} criados, ${failedTotal} falharam.`);
      else toast.success(`Importação concluída: ${createdTotal} produtos criados.`);
      onConcluido && onConcluido(); closeSelf && closeSelf();
    } catch (e) { toast.error(e?.message || "Erro ao importar"); } finally { setProcessando(false); }
  };

  return (
    <Card className="border-indigo-200">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-base">Importar Planilha de Produtos</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <Alert className="border-indigo-200 bg-indigo-50">
          <AlertDescription className="text-sm text-indigo-900">
            Envie uma planilha com 14 colunas (A–N) e cabeçalho na linha 1. Formatos: XLS, XLSX, CSV.
          </AlertDescription>
        </Alert>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Grupo (opcional)</Label>
            <Select value={grupoId} onValueChange={(v) => { setGrupoId(v); setEmpresaId(''); }}>
              <SelectTrigger><SelectValue placeholder="Selecione o grupo (opcional)" /></SelectTrigger>
              <SelectContent>{(groupsOptions || []).map(g => <SelectItem key={g.id} value={g.id}>{g.nome_fantasia || g.razao_social || g.nome || g.id}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Empresa de destino</Label>
            <Select value={empresaId} onValueChange={setEmpresaId} disabled={!!grupoId}>
              <SelectTrigger><SelectValue placeholder="Selecione a empresa" /></SelectTrigger>
              <SelectContent>{empresas.map(e => <SelectItem key={e.id} value={e.id}>{e.nome_fantasia || e.razao_social || e.nome || e.id}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Input type="file" accept=".xls,.xlsx,.csv,text/csv" onChange={handleArquivo} disabled={processando} />
          {arquivo && <p className="text-xs text-slate-500 mt-1">{arquivo.name}</p>}
        </div>
        {erro && <Alert variant="destructive"><AlertDescription className="text-sm">{erro}</AlertDescription></Alert>}

        <ImportadorPreviewTable
          preview={preview} totalLinhas={totalLinhas} invalidNCMKeys={invalidNCMKeys}
          ncmSuggestions={ncmSuggestions} suggesting={suggesting}
          importarParaTodasEmpresas={importarParaTodasEmpresas} grupoId={grupoId}
          sugerirNCMsIA={sugerirNCMsIA} applyAllSuggestions={applyAllSuggestions} applySuggestion={applySuggestion}
        />

        {preview.length > 0 && (
          <div className="flex items-center gap-3 mt-2">
            <Checkbox id="importar-grupo" checked={importarParaTodasEmpresas} onCheckedChange={(v) => setImportarParaTodasEmpresas(!!v)} />
            <Label htmlFor="importar-grupo" className="text-sm">Importar para todas as empresas do grupo selecionado</Label>
          </div>
        )}

        <ImportadorMapeamentoPanel availableHeaders={availableHeaders} columnMap={columnMap} setColumnMap={setColumnMap} />
        <ImportadorDuplicidadesPanel duplicidades={duplicidades} estrategiaDuplicidadeGlobal={estrategiaDuplicidadeGlobal} setEstrategiaDuplicidadeGlobal={setEstrategiaDuplicidadeGlobal} escolhasDuplicidades={escolhasDuplicidades} setEscolhasDuplicidades={setEscolhasDuplicidades} />
        <ImportadorErrosPanel checando={checando} validationErrors={validationErrors} downloadErrosCSV={downloadErrosCSV} />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => closeSelf && closeSelf()} disabled={processando}>Cancelar</Button>
          <Button type="button" data-permission="Estoque.Produto.importar" onClick={importar} disabled={processando || !arquivo || (!empresaId && !grupoId) || checando} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            {processando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {processando ? "Importando..." : "Importar Agora"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}