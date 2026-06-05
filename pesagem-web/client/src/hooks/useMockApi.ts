import { useCallback, useState } from 'react';

export const useMockApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const get = useCallback(
    async <T,>(endpoint: string): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api${endpoint}`);
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar dados: ${response.statusText}`);
        }

        const data = await response.json();
        return data as T;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const post = useCallback(
    async <T,>(endpoint: string, body: any): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ao criar: ${response.statusText}`);
        }

        const data = await response.json();
        return data as T;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const put = useCallback(
    async <T,>(endpoint: string, body: any): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api${endpoint}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ao atualizar: ${response.statusText}`);
        }

        const data = await response.json();
        return data as T;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const delete_ = useCallback(
    async <T,>(endpoint: string): Promise<T> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api${endpoint}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erro ao deletar: ${response.statusText}`);
        }

        const data = await response.json();
        return data as T;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    get,
    post,
    put,
    delete: delete_,
    isLoading,
    error,
  };
};
