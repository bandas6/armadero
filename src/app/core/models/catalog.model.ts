/**
 * Formas del lado del cliente para el catalogo publico. Espejo de lo que exponen
 * GET /api/products, GET /api/categories y GET /api/settings — no son los esquemas de
 * Mongoose (esos viven en api/src/models/).
 */

export type Material = 'tejido' | 'madera';

export type ProductStatus = 'AVAILABLE' | 'MADE_TO_ORDER' | 'OUT_OF_STOCK' | 'DISCONTINUED';

export interface CategoryRef {
  _id: string;
  name: string;
  slug: string;
  parent?: string | null;
  material?: Material;
}

export interface CategoryNode {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  material?: Material;
  position: number;
  productCount: number;
  children: CategoryNode[];
}

/** Tarjeta del listado: solo campos planos, sin variantes ni arreglo de imagenes. */
export interface ProductCard {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  primaryImageUrl?: string;
  priceFrom?: number;
  priceTo?: number;
  hasPrice: boolean;
  personalizable: boolean;
  status: ProductStatus;
  featured?: boolean;
  category: CategoryRef;
}

export interface ProductListResponse {
  items: ProductCard[];
  total: number;
  page: number;
  pageSize: number;
}

export type ProductSort = 'destacados' | 'precio-asc' | 'precio-desc' | 'recientes';

export interface ProductFilters {
  category?: string;
  material?: Material;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

export interface SiteSettings {
  businessHours: string;
  announcement: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  whatsappConfigured: boolean;
  whatsappContactUrl: string | null;
}
