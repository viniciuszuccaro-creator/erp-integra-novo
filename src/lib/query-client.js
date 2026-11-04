import { QueryClient } from '@tanstack/react-query';


export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			refetchOnMount: true,
			// 2 min: voltar a uma tela já visitada usa o cache em vez de refazer todas
			// as consultas (antes eram 15 s). Mutações continuam invalidando na hora.
			staleTime: 120000,
			gcTime: 300000,
			retry: 1,
			retryDelay: 1000,
		},
	},
});