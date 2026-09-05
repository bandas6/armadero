import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CreateQuoteItemInput {
  productId: string;
  variantId: string;
  quantity: number;
  customization?: { label: string; value: string }[];
}

export interface CreateQuoteInput {
  customerName: string;
  customerCity: string;
  customerPhone?: string;
  notes?: string;
  customizationRequest?: string;
  source: 'product-page' | 'cart';
  items: CreateQuoteItemInput[];
}

export interface CreateQuoteResult {
  code: string;
  whatsappUrl: string | null;
  whatsappConfigured: boolean;
}

export interface PublicQuoteItem {
  productName: string;
  variantName: string;
  sku: string;
  unitPrice?: number;
  quantity: number;
  imageUrl?: string;
  productUrl?: string;
  customization?: { label: string; value: string }[];
}

export interface PublicQuote {
  code: string;
  customerName: string;
  customerCity: string;
  items: PublicQuoteItem[];
  total: number;
  hasCustomItems: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private http = inject(HttpClient);

  create(input: CreateQuoteInput): Observable<CreateQuoteResult> {
    return this.http.post<CreateQuoteResult>(`${environment.apiUrl}/quotes`, input);
  }

  getByCode(code: string): Observable<PublicQuote> {
    return this.http.get<PublicQuote>(`${environment.apiUrl}/quotes/${code}`);
  }
}
