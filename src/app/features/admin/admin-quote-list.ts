import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { DatePipe } from '@angular/common';
import { CopCurrencyPipe } from '../../shared/pipes/cop-currency.pipe';
import { AdminQuoteService } from '../../core/services/admin-quote.service';
import type { AdminQuoteCard, QuoteStats, QuoteStatus } from '../../core/models/admin.model';

const STATUS_LABEL: Record<QuoteStatus, string> = {
  NEW: 'Nueva',
  CONTACTED: 'Contactada',
  WON: 'Ganada',
  LOST: 'Perdida',
};

@Component({
  selector: 'app-admin-quote-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, CopCurrencyPipe],
  templateUrl: './admin-quote-list.html',
})
export class AdminQuoteList {
  private service = inject(AdminQuoteService);

  readonly statuses: QuoteStatus[] = ['NEW', 'CONTACTED', 'WON', 'LOST'];
  readonly label = STATUS_LABEL;

  quotes = signal<AdminQuoteCard[]>([]);
  stats = signal<QuoteStats | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  statusFilter = '';

  constructor() {
    this.load();
    this.service.stats().subscribe({ next: (s) => this.stats.set(s) });
  }

  load() {
    this.loading.set(true);
    this.service.list({ status: this.statusFilter || undefined }).subscribe({
      next: (r) => {
        this.quotes.set(r.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar las cotizaciones.');
        this.loading.set(false);
      },
    });
  }

  async changeStatus(q: AdminQuoteCard, status: string) {
    this.error.set(null);
    try {
      await firstValueFrom(this.service.update(q._id, { status: status as QuoteStatus }));
      this.quotes.update((list) =>
        list.map((x) => (x._id === q._id ? { ...x, status: status as QuoteStatus } : x)),
      );
      this.service.stats().subscribe({ next: (s) => this.stats.set(s) });
    } catch {
      this.error.set('No se pudo cambiar el estado.');
    }
  }
}
