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

/**
 * Medidas que la tarjeta muestra, resueltas por la API a partir de la variante por
 * defecto. En esta direccion de diseno la cedula de medidas va en TODAS las tarjetas: es
 * el dato que el comprador mira primero, no letra chica (design/PROMPT-3-catalogo.md).
 */
export interface CardMeasures {
  seats?: number;
  widthCm?: number;
  heightCm?: number;
  depthCm?: number;
  sizeLabel?: string;
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
  measures?: CardMeasures | null;
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
  seats?: number;
  personalizable?: boolean;
  disponible?: boolean;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

export interface SiteSettings {
  /** "8:30 a. m. – 5:30 p. m." — las dos lineas del pie y del hero. */
  hoursWeekday: string;
  hoursSaturday: string;
  /** Una frase para poner debajo de un boton de cotizar. */
  businessHours: string;
  announcement: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  storeAddress: string | null;
  foundingYear: number | null;
  faqs: { q: string; a: string }[];
  whatsappConfigured: boolean;
  whatsappContactUrl: string | null;
}

/** Banner del home (lo edita el panel). */
export interface Banner {
  _id: string;
  title?: string | null;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
}

/** Ambiente curado: una seleccion de muebles con nombre propio. */
export interface CollectionCard {
  _id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  productCount: number;
}

export interface CollectionDetail {
  _id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  products: ProductCard[];
}

/** Flete informativo por ciudad; el valor final se acuerda por WhatsApp. */
export interface ShippingZone {
  _id: string;
  city: string;
  cost: number;
  estimatedDays?: number | null;
  notes?: string | null;
}
