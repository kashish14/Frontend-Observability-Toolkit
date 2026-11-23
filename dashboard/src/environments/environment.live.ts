/** Live mode: the dashboard reads from the mock backend and the SDK posts real events to it. */
export const environment = {
  production: false,
  apiBase: '/api',
  enableMockBackend: false,
  logLevel: 'debug' as const,
};
