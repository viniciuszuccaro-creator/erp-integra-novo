export const FINANCEIRO_LIST_LIMIT = 100;
export const FINANCEIRO_SMALL_LIST_LIMIT = 50;
export const FINANCEIRO_CONFIG_LIMIT = 9999;

export const financeiroQueryDefaults = {
  staleTime: 30000,
  gcTime: 300000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: 1,
  initialData: [],
};

export const financeiroCountQueryDefaults = {
  staleTime: 30000,
  gcTime: 300000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: 1,
};