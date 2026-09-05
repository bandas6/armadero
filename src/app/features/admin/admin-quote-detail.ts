import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { AdminQuoteService } from '../../core/services/admin-quote.service';
import type { AdminQuote, QuoteStatus } from '../../core/models/admin.model';

const STATUS_LABEL: Record<QuoteStatus, string> = {
  NEW: 'Nueva',
  CONTACTED: 'Contactada',
  WON: 'Ganada',
  LOST: 'Perdida',
};

@Component({
  selector: 'app-admin-quote-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule, CopCurrencyPipe],
  templateUrl: './admin-quote-detail.html',
})
export class AdminQuoteDetail {
  private route = inject(ActivatedRoute);
  private service = inject(AdminQuoteService);

  readonly statuses: QuoteStatus[] = ['NEW', 'CONTACTED', 'WON', 'LOST'];
  readonly label = STATUS_LABEL;

  quote = signal<AdminQuote | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  saved = signal(false);
  adminNotes = signal('');
  status = signal<QuoteStatus>('NEW');

  whatsappLink = computed(() => {
    const q = this.quote();
    if (!q?.whatsappNumber) return null;
    const text = `Hola ${q.customerName}, sobre tu cotización #${q.code}...`;
    return `https://wa.me/${q.whatsappNumber}?text=${encodeURIComponent(text)}`;
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.service.get(id).subscribe({
      next: (q) => {
        this.quote.set(q);
        this.adminNotes.set(q.adminNotes ?? '');
        this.status.set(q.status);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No encontramos esta cotización.');
        this.loading.set(false);
      },
    });
  }

  async save() {
    const q = this.quote();
    if (!q) return;
    this.error.set(null);
    this.saved.set(false);
    try {
      const updated = await firstValueFrom(
        this.service.update(q._id, { status: this.status(), adminNotes: this.adminNotes() }),
      );
      this.quote.set({ ...q, ...updated });
      this.saved.set(true);
    } catch {
      this.error.set('No se pudo guardar.');
    }
  }
}
