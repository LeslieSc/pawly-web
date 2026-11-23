import { ApiError } from './api.js';
// Catálogo público exportado de MongoDB. No contiene cuentas ni datos privados.
export function createCatalogApi(fetcher = fetch) {
  return {
    async query() {
      try {
        const response = await fetcher('/data/razas.json');
        if (!response.ok) throw new Error('catalog');
        const listarRazas = await response.json();
        if (!Array.isArray(listarRazas)) throw new Error('catalog');
        return { listarRazas };
      } catch { throw new ApiError('No pudimos cargar el catálogo. Inténtalo de nuevo.', 'CATALOG'); }
    }
  };
}
