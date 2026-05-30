import { useState, useEffect } from "react";

/**
 * Hook para criar toggles persistentes que salvam estado no localStorage
 * Garante que toggles funcionem corretamente após refresh
 */
export function usePersistentToggle(storageKey, defaultValue = false) {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      console.warn(`Erro ao carregar toggle ${storageKey}:`, e);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(isOpen));
    } catch (e) {
      console.warn(`Erro ao salvar toggle ${storageKey}:`, e);
    }
  }, [isOpen, storageKey]);

  const toggle = () => setIsOpen(!isOpen);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const set = (value) => setIsOpen(value);

  return { isOpen, toggle, open, close, set };
}

export default usePersistentToggle;