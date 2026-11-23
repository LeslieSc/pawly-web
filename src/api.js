export class ApiError extends Error {
  constructor(message, code) { super(message); this.name = 'ApiError'; this.code = code; }
}
export function createApi(endpoint, fetcher = fetch) {
  let token = null;
  return {
    setToken(value) { token = value; },
    async query(query, variables = {}) {
      if (!endpoint) throw new ApiError('La conexión con el servicio todavía no está configurada.', 'CONFIGURATION');
      let response;
      try {
        response = await fetcher(endpoint, { method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(10000) });
      } catch { throw new ApiError('No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.', 'NETWORK'); }
      let result;
      try { result = await response.json(); } catch { throw new ApiError('El servicio no respondió correctamente. Inténtalo más tarde.', 'SERVER'); }
      if (result.errors?.length) {
        const error = result.errors[0];
        throw new ApiError(error.message, error.extensions?.code || 'GRAPHQL');
      }
      if (!response.ok) throw new ApiError('El servicio no pudo completar la solicitud.', 'SERVER');
      return result.data;
    }
  };
}
