import { Injectable, signal } from '@angular/core';

export interface UndoOffer {
  message: string;
  undo: () => Promise<void> | void;
}

/**
 * "Deshacer" para las acciones destructivas del panel (ocultar un mueble, una categoría,
 * un banner…). La acción se ejecuta de una vez —no hay confirmación previa— y durante unos
 * segundos aparece un aviso con el botón para revertirla. Es la red de seguridad que pide
 * docs/panel-admin.md: Vanessa va a equivocarse sin que nadie la vea.
 */
@Injectable({ providedIn: 'root' })
export class UndoService {
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly current = signal<UndoOffer | null>(null);
  readonly busy = signal(false);

  offer(message: string, undo: () => Promise<void> | void, ms = 8000) {
    this.clearTimer();
    this.current.set({ message, undo });
    this.timer = setTimeout(() => this.dismiss(), ms);
  }

  async run() {
    const offer = this.current();
    if (!offer) return;
    this.busy.set(true);
    try {
      await offer.undo();
    } finally {
      this.busy.set(false);
      this.dismiss();
    }
  }

  dismiss() {
    this.clearTimer();
    this.current.set(null);
  }

  private clearTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }
}
