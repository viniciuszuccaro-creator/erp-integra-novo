import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * WINDOW MANAGER V21.0
 * Sistema de Multitarefas com Janelas Responsivas
 * Regra-Mãe: Acrescentar • Reorganizar • Conectar • Melhorar
 */

const WindowContext = createContext();

export const useWindowManager = () => {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindowManager deve ser usado dentro de WindowProvider');
  }
  return context;
};

export function WindowProvider({ children }) {
  const [windows, setWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);

  // Fechar janela
  const closeWindow = useCallback((windowId) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
    if (activeWindowId === windowId) {
      setActiveWindowId(windows[windows.length - 2]?.id || null);
    }
  }, [activeWindowId, windows]);

  // Minimizar janela
  const minimizeWindow = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMinimized: true } : w
    ));
  }, []);

  // Restaurar janela minimizada
  const restoreWindow = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMinimized: false } : w
    ));
    setActiveWindowId(windowId);
  }, []);

  // Maximizar/Restaurar janela
  const toggleMaximize = useCallback((windowId) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  }, []);

  // Trazer janela para frente - V21.6.4 CORREÇÃO TOTAL
  // Teto de 990M: garante que portais Radix (999.9M) fiquem sempre acima das janelas
  const nextZ = (prev) => Math.min(Math.max(...prev.map(w => w.zIndex), 99999000) + 100000, 990000000);
  const bringToFront = useCallback((windowId) => {
  setActiveWindowId(windowId);
  setWindows(prev => {
    const z = nextZ(prev);
    return prev.map(w => 
      w.id === windowId ? { ...w, zIndex: z, isMinimized: false } : w
    );
  });
  }, []);

  // Abrir nova janela - V21.7 CORREÇÃO ESTADO UNIFICADO
  const openWindow = useCallback((component, props = {}, options = {}) => {
    const windowId = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    setWindows(prevWindows => {
      // 1. Verificar uniqueKey para evitar duplicação
      if (options.uniqueKey) {
        const janelaExistente = prevWindows.find(w => w.uniqueKey === options.uniqueKey);
        if (janelaExistente) {
          setActiveWindowId(janelaExistente.id);
          return prevWindows.map(w => 
            w.id === janelaExistente.id 
              ? { ...w, zIndex: nextZ(prevWindows), isMinimized: false }
              : w
          );
        }
      }

      // 2. Calcular z-index sempre no topo (com teto abaixo dos portais)
      const finalZ = nextZ(prevWindows);

      // 3. Cascata inteligente
      const offsetBase = prevWindows.length * 40;
      const maxOffset = 400;
      const cascade = offsetBase % maxOffset;
      
      const newWindow = {
        id: windowId,
        component,
        props,
        title: options.title || 'Nova Janela',
        isMinimized: false,
        isMaximized: false,
        width: options.width || 900,
        height: options.height || 600,
        x: options.x !== undefined ? options.x : 100 + cascade,
        y: options.y !== undefined ? options.y : 80 + cascade,
        zIndex: finalZ,
        uniqueKey: options.uniqueKey
      };

      setActiveWindowId(windowId);
      return [...prevWindows, newWindow];
    });
    
    return windowId;
  }, []);

  // Atualizar posição e tamanho
  const updateWindow = useCallback((windowId, updates) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, ...updates } : w
    ));
  }, []);

  const value = {
    windows,
    activeWindowId,
    openWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    toggleMaximize,
    bringToFront,
    updateWindow,
  };

  return (
    <WindowContext.Provider value={value}>
      {children}
    </WindowContext.Provider>
  );
}