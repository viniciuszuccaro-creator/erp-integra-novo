import { QueryClient } from '@tanstack/react-query';


export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
			refetchOnMount: true,
			staleTime: 30000,
			gcTime: 300000,
			retry: 1,
			retryDelay: 1000,
		},
	},
});