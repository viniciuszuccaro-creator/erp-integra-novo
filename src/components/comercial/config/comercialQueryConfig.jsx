export const COMERCIAL_LIST_LIMIT = 100;
export const COMERCIAL_SHORT_LIMIT = 50;
export const COMERCIAL_EXTERNAL_LIMIT = 30;
export const COMERCIAL_COMPANY_LIMIT = 9999;

export const comercialQueryDefaults = {
  staleTime: 30000,
  gcTime: 300000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: 1,
  initialData: [],
};