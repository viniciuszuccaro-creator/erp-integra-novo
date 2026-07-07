/**
 * tableFormatters.js — Utilitários de formatação de células da tabela universal
 * Extraído no Ciclo 24 de VisualizadorTableBody para reutilização e testabilidade
 */
import React from "react";
import { Badge } from "@/components/ui/badge";

export const STATUS_COLORS = {
  Ativo:        "bg-green-100 text-green-700 border-green-200",
  Ativa:        "bg-green-100 text-green-700 border-green-200",
  Aprovado:     "bg-green-100 text-green-700 border-green-200",
  OK:           "bg-green-100 text-green-700 border-green-200",
  "Em Análise": "bg-blue-100 text-blue-700 border-blue-200",
  Pendente:     "bg-yellow-100 text-yellow-700 border-yellow-200",
  Inativo:      "bg-slate-100 text-slate-500 border-slate-200",
  Bloqueado:    "bg-red-100 text-red-700 border-red-200",
  Cancelado:    "bg-red-100 text-red-700 border-red-200",
};

export const STATUS_FIELDS = new Set([
  "status","status_fornecedor","status_cliente","situacao",
  "situacao_credito","status_fiscal_receita",
]);
export const BOOL_FIELDS  = new Set(["ativo","ativa","habilitado","compartilhado_grupo","principal"]);
export const DATE_FIELDS  = new Set([
  "created_date","updated_date","data_admissao","data_nascimento",
  "data_vencimento","data_validade","ultima_compra","cnh_validade",
]);
export const MONEY_FIELDS = new Set([
  "salario","preco_venda","custo_aquisicao","custo_medio","limite_credito","valor_total","valor",
]);

export const LABEL_FALLBACKS = [
  'nome','nome_completo','razao_social','nome_fantasia','nome_banco','nome_cargo','nome_turno',
  'nome_departamento','nome_grupo','nome_marca','nome_rota','nome_segmento','nome_regiao','nome_perfil',
  'nome_condicao','nome_kit','nome_modelo','nome_conta','nome_api','nome_canal','nome_intent',
  'nome_job','nome_webhook','nome_gateway','nome_do_grupo','nome_regra','usuario_nome','codigo_operador',
  'razao_social_grupo','nome_cargo','nome_turno','nome_departamento','nome_banco','nome_marca',
  'descricao','titulo','sigla','codigo','codigo_banco','codigo_servico','matricula','placa','cpf','cnpj',
];

export function getDisplayValue(item, col, isFirstCol) {
  const v = item[col.field];
  if (v !== null && v !== undefined && v !== '') return v;
  if (isFirstCol) {
    for (const f of LABEL_FALLBACKS) {
      if (f !== col.field && item[f] != null && item[f] !== '') return item[f];
    }
  }
  return v;
}

export function fmtValue(value, col, extraColors = {}) {
  if (value === null || value === undefined || value === "")
    return <span className="text-slate-300 text-xs">—</span>;

  const allColors = { ...STATUS_COLORS, ...extraColors };

  if (BOOL_FIELDS.has(col.field))
    return value
      ? <Badge variant="outline" className="text-xs rounded-sm bg-green-100 text-green-700 border-green-200">Sim</Badge>
      : <Badge variant="outline" className="text-xs rounded-sm bg-slate-100 text-slate-500 border-slate-200">Não</Badge>;

  if (STATUS_FIELDS.has(col.field) && typeof value === "string") {
    const cls = allColors[value] || "bg-slate-100 text-slate-600 border-slate-200";
    return <Badge variant="outline" className={"text-xs rounded-sm " + cls}>{value}</Badge>;
  }

  if (DATE_FIELDS.has(col.field) || col.type === "date") {
    try { const d = new Date(value); if (!isNaN(d.getTime())) return d.toLocaleDateString("pt-BR"); } catch (_) {}
  }

  if (MONEY_FIELDS.has(col.field) || col.type === "currency") {
    const n = Number(value);
    if (!isNaN(n)) return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  if (col.type === "number") { const n = Number(value); return isNaN(n) ? String(value) : n.toLocaleString("pt-BR"); }
  if (typeof value === "boolean") return value ? "✓" : "—";
  if (typeof value === "object") return Array.isArray(value) ? "[" + value.length + "]" : "–";
  return String(value).substring(0, 130);
}