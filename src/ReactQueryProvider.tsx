import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/react';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 0,
		},
	},
});

const ReactQueryProvider = ({ children }: { children: ReactNode }) => {
	return (
		<NuqsAdapter>
			<QueryClientProvider client={queryClient}>
				{children}
			</QueryClientProvider>
		</NuqsAdapter>
	);
};

export default ReactQueryProvider;