/**
 * CadastrosConfig — Configuração central de grupos e helpers
 * Entidades movidas para config/cadastroEntities.jsx (Regra-Mãe §3: refatorar grandes)
 */
import { Users, Package, DollarSign, Truck, Building2, Zap } from "lucide-react";
import { CADASTROS_ENTITIES as ENTITIES } from "./config/cadastroEntities";

// Re-exporta para compatibilidade com todos os importadores existentes
export { CADASTROS_ENTITIES } from "./config/cadastroEntities";

export const CADASTROS_GROUPS = [
  { name: "Pessoas & Parceiros", icon: Users, description: "Clientes, fornecedores, colaboradores e parceiros" },
  { name: "Produtos & Serviços", icon: Package, description: "Catálogo de produtos, serviços e variações" },
  { name: "Financeiro & Fiscal", icon: DollarSign, description: "Bancos, contas, formas de pagamento, plano de contas" },
  { name: "Logística, Frotas & Almoxarifado", icon: Truck, description: "Veículos, motoristas, locais de estoque e rotas" },
  { name: "Estrutura Organizacional", icon: Building2, description: "Empresas, grupos, departamentos e perfis" },
  { name: "Tecnologia, IA & Parâmetros", icon: Zap, description: "APIs, webhooks, integrações e configurações" },
];

export function getCadastroConfig(entityName) {
  return ENTITIES[entityName] || null;
}

export function getGroupEntities(groupName) {
  return Object.entries(ENTITIES)
    .filter(([_, config]) => config.group === groupName)
    .map(([name]) => name);
}