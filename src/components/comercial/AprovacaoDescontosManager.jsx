import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { useWindow } from "@/components/lib/useWindow";
import CentralAprovacoesManager from "./CentralAprovacoesManager";

/**
 * 🔐 APROVAÇÃO DE DESCONTOS MANAGER V21.6 - LEGACY WRAPPER
 *
 * ⚠️ DEPRECATED: Substituído por CentralAprovacoesManager.jsx
 * Este wrapper mantém compatibilidade de importação (Financeiro.jsx)
 * e delega 100% para o componente moderno (fechamento automático + RBAC).
 *
 * REGRA-MÃE: Melhoria no existente — wrapper leve sem duplicar lógica.
 */
export default function AprovacaoDescontosManager({ windowMode = false, empresaId = null }) {
  return (
    <CentralAprovacoesManager
      windowMode={windowMode}
      empresaId={empresaId}
      legacyBadge
    />
  );
}