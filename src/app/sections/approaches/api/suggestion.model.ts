export interface Suggestion {
  id: string;
  title: string;
  url: string;
}

/**
 * OpenSearch devuelve una tupla posicional, no objetos:
 * [termino, titulos[], descripciones[], urls[]]
 */
export type OpenSearchResponse = [string, string[], string[], string[]];

export function parseOpenSearch(payload: OpenSearchResponse): Suggestion[] {
  const titles = payload?.[1] ?? [];
  const urls = payload?.[3] ?? [];

  return titles.map((title, index) => ({
    id: urls[index] ?? title,
    title,
    url: urls[index] ?? ''
  }));
}

/**
 * Los tres enfoques exponen el mismo estado, para que la comparacion sea
 * sobre la fontaneria reactiva y no sobre la forma de los datos.
 */
export interface SearchState {
  status: 'idle' | 'loading' | 'loaded' | 'error';
  results: Suggestion[];
  error: string | null;
}

export const IDLE: SearchState = { status: 'idle', results: [], error: null };
export const LOADING: SearchState = { status: 'loading', results: [], error: null };

export function loaded(results: Suggestion[]): SearchState {
  return { status: 'loaded', results, error: null };
}

export function failed(error: string): SearchState {
  return { status: 'error', results: [], error };
}

/** Por debajo de esto no merece la pena molestar a la API. */
export const MIN_QUERY_LENGTH = 2;
