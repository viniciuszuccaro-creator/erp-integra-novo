import React from 'react';

/**
 * Guard simplificado - a proteção de empresa é feita dentro do Layout (que tem UserProvider).
 * Este componente apenas passa children sem bloqueio no nível do App.jsx.
 * A lógica de onboarding/seleção de empresa fica dentro do Layout onde os providers estão disponíveis.
 */
export default function EmpresaSelectorGuard({ children }) {
  return children;
}