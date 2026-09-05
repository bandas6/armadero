import { Component, PLATFORM_ID, inject, signal, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService, type CartItem } from '../../core/services/cart.service';
import { QuoteService, type CreateQuoteResult } from '../../core/services/quote.service';
import { SeoService } from '../../core/services/seo.service';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { CustomizationFields } from '../../shared/customization-fields/customization-fields';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, CopCurrencyPipe, CustomizationFields],
  templateUrl: './cart.html',
})
export class Cart {
  private fb = inject(FormBuilder);
  private quoteService = inject(QuoteService);
  private platformId = inject(PLATFORM_ID);

  readonly cart = inject(CartService);

  /** variantId del ítem que se está personalizando (editor abierto). */
  editing = signal<string | null>(null);
  private editor = viewChild(CustomizationFields);

  constructor() {
    inject(SeoService).setPage({
      title: 'Tu selección',
      description: 'Arma tu selección de muebles y cotiza por WhatsApp con Artemadero.',
      path: '/carrito',
      noindex: true,
    });
  }

  form = this.fb.nonNullable.group({
    customerName: ['', Validators.required],
    customerCity: ['', Validators.required],
    notes: [''],
  });

  submitting = signal(false);
  submitError = signal<string | null>(null);
  submitted = signal<CreateQuoteResult | null>(null);

  setQty(variantId: string, value: string) {
    this.cart.setQuantity(variantId, Number(value));
  }

  openEditor(item: CartItem) {
    this.editing.set(item.variantId);
  }
  closeEditor() {
    this.editing.set(null);
  }
  saveEditor(item: CartItem) {
    const ed = this.editor();
    if (ed) {
      ed.markTouched();
      if (ed.invalid()) return;
      this.cart.updateCustomization(item.variantId, ed.collect());
    }
    this.editing.set(null);
  }

  submit() {
    if (this.cart.items().length === 0 || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);
    const raw = this.form.getRawValue();

    this.quoteService
      .create({
        customerName: raw.customerName,
        customerCity: raw.customerCity,
        notes: raw.notes || undefined,
        source: 'cart',
        items: this.cart.items().map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
          customization: i.customization ?? [],
        })),
      })
      .subscribe({
        next: (result) => {
          this.submitting.set(false);
          this.submitted.set(result);
          // Regla de negocio: la cotización YA quedó guardada (201). Recién ahora se
          // limpia el carrito y se redirige a WhatsApp, nunca antes.
          this.cart.clear();
          if (result.whatsappUrl && isPlatformBrowser(this.platformId)) {
            window.location.href = result.whatsappUrl;
          }
        },
        error: () => {
          this.submitting.set(false);
          this.submitError.set('No pudimos guardar tu cotización. Revisa los datos e intenta de nuevo.');
        },
      });
  }
}
