// Estrutura centralizada de permissões do sistema (Regra-Mãe: modular, reutilizável, escalável)
// ESTRUTURA_SISTEMA movida para estruturaSistema.jsx para reduzir tamanho deste arquivo

export { ESTRUTURA_SISTEMA } from "./estruturaSistema";

// Ações disponíveis em todo o sistema
export const ACOES = [
  // Básicas
  { id: "visualizar", nome: "Visualizar", icone: "Eye", cor: "slate" },
  { id: "criar", nome: "Criar", icone: "Plus", cor: "blue" },
  { id: "editar", nome: "Editar", icone: "Pencil", cor: "green" },
  { id: "excluir", nome: "Excluir", icone: "Trash2", cor: "red" },
  
  // Aprovações e Validações
  { id: "aprovar", nome: "Aprovar", icone: "CheckSquare", cor: "purple" },
  { id: "rejeitar", nome: "Rejeitar", icone: "XSquare", cor: "red" },
  { id: "validar", nome: "Validar", icone: "CheckCircle2", cor: "emerald" },
  { id: "analisar", nome: "Analisar", icone: "BarChart3", cor: "blue" },
  
  // Específicas por Módulo
  { id: "baixar", nome: "Baixar", icone: "Download", cor: "cyan" },
  { id: "emitir", nome: "Emitir", icone: "Send", cor: "orange" },
  { id: "ativar", nome: "Ativar", icone: "Power", cor: "green" },
  { id: "inativar", nome: "Inativar", icone: "PowerOff", cor: "slate" },
  { id: "importar", nome: "Importar", icone: "Upload", cor: "blue" },
  { id: "exportar", nome: "Exportar", icone: "Download", cor: "cyan" },
  { id: "sincronizar", nome: "Sincronizar", icone: "RefreshCw", cor: "purple" },
  { id: "configurar", nome: "Configurar", icone: "Settings", cor: "slate" },
  { id: "gerar", nome: "Gerar", icone: "Zap", cor: "amber" },
  { id: "aprovar_desconto", nome: "Aprovar Desconto", icone: "DollarSign", cor: "emerald" },
  { id: "solicitar_desconto", nome: "Solicitar Desconto", icone: "TrendingDown", cor: "orange" },
  { id: "cancelar", nome: "Cancelar", icone: "X", cor: "red" },
  { id: "duplicar", nome: "Duplicar", icone: "Copy", cor: "blue" },
  { id: "consultar", nome: "Consultar", icone: "Search", cor: "slate" },
];

// Mapeamento de cores de ícones
export const COR_CLASS = {
  blue: "text-blue-600",
  green: "text-green-600",
  emerald: "text-emerald-600",
  purple: "text-purple-600",
  orange: "text-orange-600",
  cyan: "text-cyan-600",
  indigo: "text-indigo-600",
  pink: "text-pink-600",
  slate: "text-slate-600",
  red: "text-red-600",
  violet: "text-violet-600",
  amber: "text-amber-600",
  teal: "text-teal-600",
  sky: "text-sky-600",
  gray: "text-gray-600",
};

// Níveis de acesso padrão
export const NIVEIS_PERFIL = [
  { id: "administrador", nome: "Administrador", descricao: "Acesso total ao sistema" },
  { id: "gerencial", nome: "Gerencial", descricao: "Acesso a módulos e aprovações" },
  { id: "operacional", nome: "Operacional", descricao: "Acesso a operações e consultas" },
  { id: "consulta", nome: "Consulta", descricao: "Visualização de dados apenas" },
  { id: "personalizado", nome: "Personalizado", descricao: "Permissões definidas manualmente" },
];

// Matriz de permissões padrão por nível (Regra-Mãe: escalável e multiempresa)
export const MATRIZ_PERMISSOES_PADRAO = {
  administrador: {
    todos: ["visualizar", "criar", "editar", "excluir", "aprovar", "configurar"],
  },
  gerencial: {
    todos: ["visualizar", "criar", "editar", "aprovar"],
    sistema: ["visualizar", "consultar"],
  },
  operacional: {
    todos: ["visualizar", "criar", "editar"],
    sistema: [],
  },
  consulta: {
    todos: ["visualizar", "consultar"],
  },
  personalizado: {},
};