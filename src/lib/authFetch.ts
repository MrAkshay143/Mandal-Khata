/** 
 * Authenticated fetch helper — automatically attaches JWT bearer token.
 * Drop-in replacement for window.fetch for API calls.
 */
export function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('mk_token');
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body && !(options.headers as any)?.['Content-Type']
        ? { 'Content-Type': 'application/json' }
        : {}),
    },
  });
}
