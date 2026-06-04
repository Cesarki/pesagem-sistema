import { useAuth } from '@/contexts/AuthContext';
import { useState, useCallback } from 'react';

const API_URL = 'http://localhost:8000/api';

interface UseApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
}

export const useApi = () => {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async <T,>(
      endpoint: string,
      options: UseApiOptions = {}
    ): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        const url = `${API_URL}${endpoint}`;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...options.headers,
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
          method: options.method || 'GET',
          headers,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Erro na requisição');
        }

        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  const post = useCallback(
    async <T,>(endpoint: string, body: any): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        const url = `${API_URL}${endpoint}`;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Erro na requisição');
        }

        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  const put = useCallback(
    async <T,>(endpoint: string, body: any): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        const url = `${API_URL}${endpoint}`;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Erro na requisição');
        }

        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  return { request, post, put, isLoading, error };
};
