import type { Material, ProductCard } from './catalog.model';

/**
 * Espejo, del lado del cliente, de lo que expone GET /api/products/:slug. No es el
 * esquema de Mongoose (ese vive en api/src/models/, no se toca) — es la forma que
 * necesita la pantalla.
 */
export interface ProductVariant {
  _id: string;
  sku: string;
  name: string;
  price?: number;
  compareAtPrice?: number;
  colorName?: string;
  colorHex?: string;
  fabric?: string;
  sizeLabel?: string;
  seats?: number;
  widthCm?: number;
  heightCm?: number;
  depthCm?: number;
  /** Alto del asiento: en sillas, mecedoras y butacos decide si el mueble sirve. */
  seatHeightCm?: number;
  isDefault: boolean;
  active: boolean;
}

export interface ProductImage {
  _id: string;
  url: string;
  alt?: string;
  variantId?: string;
  isPrimary: boolean;
  position: number;
}

export interface ProductCategoryRef {
  _id: string;
  name: string;
  slug: string;
  parent?: string | null;
  material?: Material;
}

export type ProductStatus = 'AVAILABLE' | 'MADE_TO_ORDER' | 'OUT_OF_STOCK' | 'DISCONTINUED';

export type CustomizationType = 'number' | 'select' | 'text' | 'boolean';

/** Campo que el admin definió para que el cliente lo responda al cotizar. */
export interface CustomizationField {
  _id?: string;
  label: string;
  type: CustomizationType;
  required?: boolean;
  hint?: string;
  unit?: string;
  min?: number;
  max?: number;
  options?: string[];
  position?: number;
}

/** Respuesta del cliente a un campo de personalización. */
export interface CustomizationAnswer {
  label: string;
  value: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  material?: string;
  finish?: string;
  careNotes?: string;
  /** El espacio que el mueble necesita alrededor, debajo de la cedula de medidas. */
  spaceNote?: string;
  warrantyMonths?: number;
  leadTimeDays?: number;
  status: ProductStatus;
  personalizable: boolean;
  customizationNotes?: string;
  customizationFields?: CustomizationField[];
  category: ProductCategoryRef;
  variants: ProductVariant[];
  images: ProductImage[];
  priceFrom?: number;
  priceTo?: number;
  hasPrice: boolean;
  /**
   * La misma pieza en el otro material, resumida como tarjeta. null cuando no la hay: la
   * ficha omite el bloque limpiamente en vez de dejar un hueco.
   */
  twin?: ProductCard | null;
}
