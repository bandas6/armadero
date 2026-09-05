import type { Material, ProductStatus } from './catalog.model';
export type { Material } from './catalog.model';
export type { CustomizationField, CustomizationType, CustomizationAnswer } from './product.model';
import type { CustomizationField } from './product.model';

// --- Categorías ---
export interface AdminCategory {
  _id: string;
  name: string;
  slug: string;
  parent: string | null;
  parentName: string | null;
  material: Material | null;
  description: string | null;
  imageUrl: string | null;
  position: number;
  active: boolean;
  productCount: number;
  isLeaf: boolean;
}

export interface AdminCategoryInput {
  name?: string;
  slug?: string;
  parentId?: string | null;
  material?: Material | null;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
}

// --- Cotizaciones ---
export type QuoteStatus = 'NEW' | 'CONTACTED' | 'WON' | 'LOST';

export interface AdminQuoteCard {
  _id: string;
  code: string;
  customerName: string;
  customerCity: string;
  total: number;
  hasCustomItems: boolean;
  status: QuoteStatus;
  source: string;
  itemCount: number;
  createdAt: string;
}

export interface AdminQuoteItem {
  productName: string;
  variantName: string;
  sku: string;
  unitPrice?: number;
  quantity: number;
  imageUrl?: string;
  productUrl?: string;
  customization?: { label: string; value: string }[];
}

export interface AdminQuote {
  _id: string;
  code: string;
  customerName: string;
  customerCity: string;
  customerPhone?: string;
  customizationRequest?: string;
  notes?: string;
  adminNotes?: string;
  items: AdminQuoteItem[];
  total: number;
  hasCustomItems: boolean;
  status: QuoteStatus;
  source: string;
  createdAt: string;
  whatsappNumber: string | null;
}

export interface QuoteStats {
  byMonth: { month: string; count: number; won: number }[];
  topProducts: { sku: string; name: string; count: number; quotes: number }[];
  openCount: number;
  monthCount: number;
}

// --- Ajustes ---
export interface AdminSettings {
  whatsappNumber: string;
  businessHours: string;
  announcement: string;
  instagramUrl: string;
  facebookUrl: string;
  quoteMessageTemplate: string;
  effectiveWhatsapp: string | null;
  whatsappSource: 'panel' | 'env' | 'none';
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR';
}

export interface AuthResponse {
  accessToken: string;
  user: AdminUser;
}

export interface AdminProductCard {
  _id: string;
  name: string;
  slug: string;
  status: ProductStatus;
  active: boolean;
  featured: boolean;
  position: number;
  priceFrom?: number;
  priceTo?: number;
  hasPrice: boolean;
  personalizable: boolean;
  primaryImageUrl?: string;
  imageCount: number;
  category?: { _id: string; name: string; slug: string } | null;
}

export interface AdminProductList {
  items: AdminProductCard[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminVariant {
  _id?: string;
  sku?: string;
  name: string;
  price?: number;
  compareAtPrice?: number;
  colorName?: string;
  fabric?: string;
  sizeLabel?: string;
  seats?: number;
  widthCm?: number;
  heightCm?: number;
  depthCm?: number;
  isDefault?: boolean;
  active?: boolean;
}

export interface AdminImage {
  _id: string;
  url: string;
  publicId?: string;
  alt?: string;
  position: number;
  isPrimary: boolean;
}

export interface AdminProduct {
  _id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  material?: string;
  finish?: string;
  customizationNotes?: string;
  customizationFields?: CustomizationField[];
  status: ProductStatus;
  personalizable: boolean;
  featured: boolean;
  active: boolean;
  category: { _id: string; name: string; slug: string; parent?: string | null } | string;
  variants: AdminVariant[];
  images: AdminImage[];
}

export interface AdminProductInput {
  name: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  material?: string;
  finish?: string;
  customizationNotes?: string;
  customizationFields?: CustomizationField[];
  status?: ProductStatus;
  personalizable?: boolean;
  featured?: boolean;
  category?: string;
  variants?: AdminVariant[];
}
