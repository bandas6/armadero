import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { CustomizationAnswer, CustomizationField } from '../models/product.model';

/**
 * Item del carrito: lo minimo para reconstruir la cotizacion y pintar la lista. El
 * precio se guarda solo para mostrarlo; el total real lo recalcula el servidor en
 * POST /api/quotes a partir de los precios reales (docs/modelo-datos.md).
 */
export interface CartItem {
  productId: string;
  variantId: string;
  slug: string;
  productName: string;
  variantName: string;
  unitPrice?: number;
  imageUrl?: string;
  quantity: number;
  /** Respuestas del cliente a la personalización del producto. */
  customization?: CustomizationAnswer[];
  /** Copia de los campos configurados, para poder re-editar en el carrito. */
  customizationFields?: CustomizationField[];
}

const STORAGE_KEY = 'artemadero.cart.v1';
const MAX_QTY = 20;

@Injectable({ providedIn: 'root' })
export class CartService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private _items = signal<CartItem[]>(this.restore());

  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((n, i) => n + i.quantity, 0));
  readonly estimatedTotal = computed(() =>
    this._items().reduce((sum, i) => sum + (i.unitPrice ?? 0) * i.quantity, 0),
  );
  readonly hasCustomItems = computed(() => this._items().some((i) => i.unitPrice == null));

  /**
   * Cuantos muebles del carrito se cotizan segun medidas. El total no puede quedar roto
   * cuando hay piezas sin precio: se muestra el subtotal de lo que si tiene precio y
   * aparte cuantos items se cotizan aparte (design/PROMPT-4-ficha.md).
   */
  readonly customItemCount = computed(() =>
    this._items().filter((i) => i.unitPrice == null).reduce((n, i) => n + i.quantity, 0),
  );

  constructor() {
    // Persistencia: cada cambio del arreglo se guarda. Solo en el navegador.
    effect(() => {
      const snapshot = this._items();
      if (!this.isBrowser) return;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      } catch {
        /* almacenamiento lleno o bloqueado: el carrito sigue funcionando en memoria */
      }
    });
  }

  add(item: Omit<CartItem, 'quantity'>, quantity = 1): void {
    this._items.update((items) => {
      const existing = items.find((i) => i.variantId === item.variantId);
      if (existing) {
        return items.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + quantity) }
            : i,
        );
      }
      return [...items, { ...item, quantity: Math.min(MAX_QTY, quantity) }];
    });
  }

  setQuantity(variantId: string, quantity: number): void {
    const q = Math.max(1, Math.min(MAX_QTY, Math.floor(quantity) || 1));
    this._items.update((items) =>
      items.map((i) => (i.variantId === variantId ? { ...i, quantity: q } : i)),
    );
  }

  updateCustomization(variantId: string, customization: CartItem['customization']): void {
    this._items.update((items) =>
      items.map((i) => (i.variantId === variantId ? { ...i, customization } : i)),
    );
  }

  remove(variantId: string): void {
    this._items.update((items) => items.filter((i) => i.variantId !== variantId));
  }

  clear(): void {
    this._items.set([]);
  }

  private restore(): CartItem[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((i) => i && typeof i.variantId === 'string' && typeof i.productId === 'string')
        .map((i) => ({ ...i, quantity: Math.max(1, Math.min(MAX_QTY, Number(i.quantity) || 1)) }));
    } catch {
      return [];
    }
  }
}
