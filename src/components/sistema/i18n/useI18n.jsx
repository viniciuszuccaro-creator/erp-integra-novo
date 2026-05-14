import { useState, useEffect } from 'react';

const DEFAULT_LANGUAGE = 'pt';
const SUPPORTED_LANGUAGES = ['pt', 'en', 'es'];

const TRANSLATIONS = {
  pt: {
    dashboard: 'Painel',
    comercial: 'Comercial',
    financeiro: 'Financeiro',
    estoque: 'Estoque',
    logout: 'Sair',
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Deletar',
    edit: 'Editar',
    close: 'Fechar',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
  },
  en: {
    dashboard: 'Dashboard',
    comercial: 'Sales',
    financeiro: 'Finance',
    estoque: 'Inventory',
    logout: 'Logout',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },
  es: {
    dashboard: 'Panel de Control',
    comercial: 'Comercial',
    financeiro: 'Financiero',
    estoque: 'Inventario',
    logout: 'Cerrar Sesión',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    close: 'Cerrar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
  },
};

export function useI18n() {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('language') || DEFAULT_LANGUAGE;
    } catch {
      return DEFAULT_LANGUAGE;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('language', language);
      document.documentElement.lang = language;
    } catch (err) {
      console.warn('i18n storage error:', err);
    }
  }, [language]);

  const t = (key) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS[DEFAULT_LANGUAGE]?.[key] || key;
  };

  return { language, setLanguage, t, supportedLanguages: SUPPORTED_LANGUAGES };
}