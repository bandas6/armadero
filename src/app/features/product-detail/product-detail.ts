import { Component, DestroyRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, catchError, of } from 'rxjs';
import { NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { QuoteService } from '../../core/services/quote.service';
import { CartService } from '../../core/services/cart.service';
import { SeoService } from '../../core/services/seo.service';
import { StructuredDataService } from '../../core/services/structured-data.service';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { CustomizationFields } from '../../shared/customization-fields/customization-fields';
import type { Product, ProductVariant } from '../../core/models/product.model';

type LoadState = { product: Product | null; notFound: boolean };

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [NgOptimizedImage, ReactiveFormsModule, CopCurrencyPipe, RouterLink, CustomizationFields],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private quoteService = inject(QuoteService);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);
  private cart = inject(CartService);
  private seo = inject(SeoService);
  private jsonLd = inject(StructuredDataService);

  addedToCart = signal(false);
  private customFields = viewChild(CustomizationFields);

  constructor() {
    effect(() => {
      const p = this.product();
      if (this.notFound()) {
        this.seo.setPage({ title: 'Mueble no encontrado', path: '/catalogo', noindex: true });
        this.jsonLd.clear();
        return;
      }
      if (!p) return;
      const image = p.images?.find((i) => i.isPrimary)?.url ?? p.images?.[0]?.url;
      this.seo.setPage({
        title: p.name,
        description:
          p.shortDescription ||
          p.description ||
          `${p.name} — ${p.category?.name ?? 'mueble'} de Artemadero, hecho a la medida en Cali.`,
        path: `/producto/${p.slug}`,
        image,
        type: 'product',
      });
      this.jsonLd.setProduct(p);
    });
    inject(DestroyRef).onDestroy(() => this.jsonLd.clear());
  }

  /** Verdadero si hay campos de personalización requeridos sin responder. */
  private customizationInvalid(): boolean {
    const cf = this.customFields();
    if (!cf) return false;
    cf.markTouched();
    return cf.invalid();
  }

  addToCart() {
    const product = this.product();
    const variant = this.selectedVariant();
    if (!product || !variant) return;
    if (this.customizationInvalid()) {
      this.submitError.set('Completa los datos obligatorios de personalización.');
      return;
    }
    this.submitError.set(null);
    this.cart.add({
      productId: product._id,
      variantId: variant._id,
      slug: product.slug,
      productName: product.name,
      variantName: variant.name,
      unitPrice: variant.price,
      imageUrl: product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url,
      customization: this.customFields()?.collect() ?? [],
      customizationFields: product.customizationFields ?? [],
    });
    this.addedToCart.set(true);
  }

  private state = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) => {
        const slug = params.get('slug')!;
        return this.productService.getBySlug(slug).pipe(
          switchMap((product) => of({ product, notFound: false })),
          catchError(() => of({ product: null, notFound: true })),
        );
      }),
    ),
    { initialValue: { product: null, notFound: false } },
  );

  product = computed(() => this.state().product);
  notFound = computed(() => this.state().notFound && !this.state().product);

  selectedVariantId = signal<string | null>(null);
  selectedImageIndex = signal(0);

  selectedVariant = computed<ProductVariant | undefined>(() => {
    const product = this.product();
    if (!product) return undefined;
    const id = this.selectedVariantId();
    return product.variants.find((v) => v._id === id) ?? product.variants.find((v) => v.isDefault) ?? product.variants[0];
  });

  measureLabel = computed(() => {
    const product = this.product();
    const variant = this.selectedVariant();
    if (!product || !variant) return '';
    if (product.personalizable) return 'Se fabrica a la medida';

    const dims =
      variant.widthCm && variant.heightCm && variant.depthCm
        ? `${variant.widthCm} × ${variant.heightCm} × ${variant.depthCm} cm`
        : null;

    if (variant.seats && dims) return `${variant.seats} puestos · ${dims}`;
    if (variant.seats) return `${variant.seats} puestos`;
    return dims ?? 'Medidas a confirmar';
  });

  quoteForm = this.fb.nonNullable.group({
    customerName: ['', Validators.required],
    customerCity: ['', Validators.required],
    notes: [''],
  });

  submitting = signal(false);
  submitError = signal<string | null>(null);
  submitted = signal<{ code: string; whatsappUrl: string | null; whatsappConfigured: boolean } | null>(null);

  selectImage(index: number) {
    this.selectedImageIndex.set(index);
  }

  selectVariant(id: string) {
    this.selectedVariantId.set(id);
  }

  submitQuote() {
    const product = this.product();
    const variant = this.selectedVariant();
    if (!product || !variant || this.quoteForm.invalid) {
      this.quoteForm.markAllAsTouched();
      return;
    }
    if (this.customizationInvalid()) {
      this.submitError.set('Completa los datos obligatorios de personalización.');
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);

    const raw = this.quoteForm.getRawValue();

    this.quoteService
      .create({
        customerName: raw.customerName,
        customerCity: raw.customerCity,
        notes: raw.notes || undefined,
        source: 'product-page',
        items: [
          {
            productId: product._id,
            variantId: variant._id,
            quantity: 1,
            customization: this.customFields()?.collect() ?? [],
          },
        ],
      })
      .subscribe({
        next: (result) => {
          this.submitting.set(false);
          this.submitted.set(result);
          // La regla de negocio es no redirigir a WhatsApp sin haber guardado la
          // cotización primero: por eso el redirect ocurre solo despues de que el
          // POST respondio 201. Solo en el navegador: en SSR no hay `window`.
          if (result.whatsappUrl && isPlatformBrowser(this.platformId)) {
            window.location.href = result.whatsappUrl;
          }
        },
        error: () => {
          this.submitting.set(false);
          this.submitError.set(
            'No pudimos guardar tu cotización. Revisa los datos e intenta de nuevo.',
          );
        },
      });
  }
}
