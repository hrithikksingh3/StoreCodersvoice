import { API_BASE_URL } from './config';

let csrfToken = '';
export const setCsrfToken = (token: string) => { csrfToken = token; };
export const api = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: { ...(isFormData ? {} : { 'Content-Type': 'application/json' }), ...(csrfToken && options.method && !['GET', 'HEAD'].includes(options.method) ? { 'X-CSRF-Token': csrfToken } : {}), ...options.headers },
  });
  const data = await response.json().catch(() => ({ message: 'Unexpected server response' }));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data as T;
};
