/**
 * 🔧 GARANTIA GLOBAL DE Z-INDEX V21.5
 * 
 * Sistema automático que garante z-index correto em TODOS os componentes
 * Sobrescreve qualquer z-index incorreto automaticamente
 */

import { useEffect } from 'react';

/**
 * Hook para garantir z-index correto em tempo real
 * Uso: Adicionar no Layout.js para monitoramento global
 */
export function useZIndexGuard() {
  useEffect(() => {
    // Usar apenas CSS via <style> injetado — sem MutationObserver que conflita com React HMR
    // O CSS já cobre todos os casos via seletores de atributo
    return () => {};
  }, []);
}

/**
 * CSS Global Injection - Garantia definitiva
 */
export function injectGlobalZIndexStyles() {
  if (typeof document === 'undefined') return;

  const styleId = 'zindex-global-fix-v21-5';
  
  // Remover estilo anterior se existir
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }

  const style = document.createElement('style');
  style.id = styleId;
  style.innerHTML = `
    /* 🔧 GARANTIA GLOBAL DE Z-INDEX V21.6.2 - HIERARQUIA CORRETA */
    
    /* Janelas multitarefa - PRIORIDADE MÁXIMA */
    [class*="motion-div"] {
      position: relative;
    }
    
    /* Select Content - acima das janelas */
    [data-radix-select-content] {
      z-index: 999999999 !important;
    }
    
    /* Dropdown Menu Content - acima das janelas */
    [data-radix-dropdown-menu-content] {
      z-index: 999999999 !important;
    }
    
    /* Popover Content - acima das janelas */
    [data-radix-popover-content] {
      z-index: 999999999 !important;
    }
    
    /* Command Dialog - acima das janelas */
    [data-radix-dialog-content][cmdk-dialog-content] {
      z-index: 999999999 !important;
    }
    
    /* Tooltip Content - acima das janelas */
    [data-radix-tooltip-content] {
      z-index: 999999999 !important;
    }
    
    /* Context Menu - acima das janelas */
    [data-radix-context-menu-content] {
      z-index: 999999999 !important;
    }
    
    /* Garantia adicional para portals - SEMPRE acima das janelas */
    [data-radix-portal] > div,
    [data-radix-portal] > [role="dialog"],
    [data-radix-portal] > [role="alertdialog"],
    [data-radix-portal] > [role="menu"],
    [data-radix-portal] > [role="listbox"] {
      z-index: 999999999 !important;
    }
  `;
  
  document.head.appendChild(style);
}

/**
 * Componente para usar no Layout
 */
export default function ZIndexGuard({ children }) {
  useZIndexGuard();
  
  useEffect(() => {
    injectGlobalZIndexStyles();
  }, []);

  return children;
}