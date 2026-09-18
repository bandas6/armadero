import {
  Component,
  DestroyRef,
  type EmbeddedViewRef,
  HostListener,
  PLATFORM_ID,
  type TemplateRef,
  ViewContainerRef,
  computed,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { DecimalPipe, NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import type { ProductImage } from '../core/models/product.model';

/** Cuánto agranda la lupa sobre la foto, sin abrir nada. */
const LUPA = 2.4;

/** Los saltos del visor: 1 es la foto entera; de ahí se acerca a golpes. */
const PASOS = [1, 2, 3, 4] as const;

/**
 * Ver la foto de cerca. Dos gestos, uno para cada forma de mirar:
 *
 * - **Con mouse**, pasar por encima de la foto la agranda bajo el puntero, como una lupa
 *   sobre la mesa. No abre nada ni mueve la página: se mira y se sigue leyendo.
 * - **Al tocarla o hacer clic**, se abre a pantalla completa sobre fondo oscuro, donde se
 *   puede acercar más, arrastrar para recorrerla y pasar a las otras fotos.
 *
 * Por qué importa en este catálogo: lo que se vende es el tejido y el acabado de la
 * madera, y eso solo se juzga de cerca. Un mueble tejido a mano se distingue de uno de
 * fábrica en la trama, y la trama no se ve en una foto de 500 px.
 *
 * La lupa se activa solo donde hay puntero fino (mouse). En celular no existe: ahí el
 * gesto natural es tocar y pellizcar, que es lo que hace el visor.
 */
@Component({
  selector: 'app-photo-zoom',
  standalone: true,
  imports: [NgOptimizedImage, DecimalPipe],
  templateUrl: './photo-zoom.html',
})
export class PhotoZoom {
  /** Todas las fotos del mueble, en orden. */
  readonly fotos = input.required<ProductImage[]>();
  /** Cuál se está viendo. Es de doble vía: el visor también la cambia. */
  readonly indice = model<number>(0);
  /** El nombre del mueble, para el texto alternativo y el rótulo del visor. */
  readonly nombre = input<string>('');

  private platformId = inject(PLATFORM_ID);
  private vcr = inject(ViewContainerRef);
  private plantilla = viewChild<TemplateRef<unknown>>('visor');

  readonly foto = computed(() => this.fotos()[this.indice()] ?? null);
  readonly total = computed(() => this.fotos().length);

  // ---- La lupa, sobre la foto de la ficha ----

  /** Solo con mouse: en una pantalla táctil la lupa se dispararía sola al tocar. */
  readonly conPunteroFino = signal(false);
  readonly lupaActiva = signal(false);
  /** Dónde está el puntero dentro de la foto, en porcentaje. */
  readonly lupaX = signal(50);
  readonly lupaY = signal(50);
  readonly factorLupa = LUPA;

  constructor() {
    // matchMedia puede no existir (SSR, y algunos entornos de prueba). Sin el dato, se
    // asume pantalla táctil: el visor funciona igual y la lupa simplemente no aparece.
    if (isPlatformBrowser(this.platformId) && typeof window.matchMedia === 'function') {
      this.conPunteroFino.set(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    }
    // Si se navega a otra ficha con el visor abierto, no puede quedar colgado del body.
    inject(DestroyRef).onDestroy(() => this.desmontar());
  }

  moverLupa(event: PointerEvent) {
    if (!this.conPunteroFino()) return;
    const caja = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.lupaX.set(((event.clientX - caja.left) / caja.width) * 100);
    this.lupaY.set(((event.clientY - caja.top) / caja.height) * 100);
    this.lupaActiva.set(true);
  }

  soltarLupa() {
    this.lupaActiva.set(false);
  }

  // ---- El visor a pantalla completa ----

  readonly abierto = signal(false);
  readonly escala = signal(1);
  readonly x = signal(0);
  readonly y = signal(0);

  /** Punteros apoyados sobre la foto: uno arrastra, dos pellizcan. */
  private punteros = new Map<number, { x: number; y: number }>();
  private arrastreDesde: { x: number; y: number; px: number; py: number } | null = null;
  private pellizcoDesde: { distancia: number; escala: number } | null = null;
  private devolverFoco: HTMLElement | null = null;

  readonly puedeAcercar = computed(() => this.escala() < PASOS[PASOS.length - 1]);
  readonly puedeAlejar = computed(() => this.escala() > 1);

  /**
   * El visor se cuelga del <body>, no de la ficha.
   *
   * La galería es `sticky`, y una caja sticky abre su propio contexto de apilamiento:
   * cualquier z-index de adentro se compara solo contra sus hermanos, así que el visor
   * quedaba por debajo del encabezado del sitio por más que se subiera. Sacarlo del
   * subárbol es la única forma de que tape la página entera. La vista sigue siendo de
   * este componente —las señales siguen vivas—; lo único que se mueve son los nodos.
   */
  private vista: EmbeddedViewRef<unknown> | null = null;

  private montar() {
    const plantilla = this.plantilla();
    if (!plantilla || this.vista || !isPlatformBrowser(this.platformId)) return;
    this.vista = this.vcr.createEmbeddedView(plantilla);
    this.vista.detectChanges();
    for (const nodo of this.vista.rootNodes) document.body.appendChild(nodo as Node);
    this.raiz()?.querySelector<HTMLElement>('[data-cerrar]')?.focus();
  }

  private desmontar() {
    this.vista?.destroy();
    this.vista = null;
    if (isPlatformBrowser(this.platformId)) document.body.style.overflow = '';
  }

  /** El nodo raíz del visor, para buscar dentro sin consultas de vista. */
  private raiz(): HTMLElement | null {
    return (this.vista?.rootNodes.find((n) => (n as Node).nodeType === 1) as HTMLElement) ?? null;
  }

  abrir() {
    if (!this.foto()) return;
    if (isPlatformBrowser(this.platformId)) {
      this.devolverFoco = document.activeElement as HTMLElement | null;
      // Sin esto, la página de atrás se desplaza al arrastrar la foto.
      document.body.style.overflow = 'hidden';
    }
    this.lupaActiva.set(false);
    this.reiniciar();
    this.abierto.set(true);
    this.montar();
  }

  cerrar() {
    this.abierto.set(false);
    this.punteros.clear();
    this.desmontar();
    // El foco vuelve a la foto de la ficha: quien usa teclado no queda perdido.
    this.devolverFoco?.focus?.();
  }

  private reiniciar() {
    this.escala.set(1);
    this.x.set(0);
    this.y.set(0);
  }

  /** El salto siguiente hacia arriba o hacia abajo, sin pasarse de los topes. */
  private salto(hacia: 1 | -1) {
    const actual = this.escala();
    const siguiente =
      hacia > 0
        ? (PASOS.find((p) => p > actual + 0.01) ?? PASOS[PASOS.length - 1])
        : ([...PASOS].reverse().find((p) => p < actual - 0.01) ?? 1);
    this.fijarEscala(siguiente);
  }

  acercar() {
    this.salto(1);
  }

  alejar() {
    this.salto(-1);
  }

  /** Doble clic o doble toque: acerca, y si ya está acercada vuelve a la foto entera. */
  alternarZoom() {
    if (this.escala() > 1) this.reiniciar();
    else this.fijarEscala(2);
  }

  private fijarEscala(valor: number) {
    const limitada = Math.min(PASOS[PASOS.length - 1], Math.max(1, valor));
    this.escala.set(limitada);
    if (limitada === 1) {
      this.x.set(0);
      this.y.set(0);
    } else {
      this.encajar();
    }
  }

  /**
   * Que la foto no se pueda arrastrar fuera de la pantalla: el desplazamiento máximo es
   * lo que sobra de la foto ampliada respecto a su marco.
   */
  private encajar() {
    const caja = this.raiz()?.querySelector('[data-lienzo]')?.getBoundingClientRect();
    if (!caja) return;
    const sobraX = (caja.width * (this.escala() - 1)) / 2;
    const sobraY = (caja.height * (this.escala() - 1)) / 2;
    this.x.set(Math.min(sobraX, Math.max(-sobraX, this.x())));
    this.y.set(Math.min(sobraY, Math.max(-sobraY, this.y())));
  }

  // ---- Arrastrar y pellizcar ----

  alApoyar(event: PointerEvent) {
    // Solo se captura el puntero cuando hay algo que arrastrar o pellizcar: capturarlo
    // siempre deja a la pagina sin clics normales.
    if (this.escala() > 1 || this.punteros.size >= 1) {
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    }
    this.punteros.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this.punteros.size === 2) {
      this.pellizcoDesde = { distancia: this.distancia(), escala: this.escala() };
      this.arrastreDesde = null;
    } else if (this.escala() > 1) {
      this.arrastreDesde = { x: event.clientX, y: event.clientY, px: this.x(), py: this.y() };
    }
  }

  alMover(event: PointerEvent) {
    if (!this.punteros.has(event.pointerId)) return;
    this.punteros.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (this.punteros.size >= 2 && this.pellizcoDesde) {
      const factor = this.distancia() / this.pellizcoDesde.distancia;
      this.fijarEscala(this.pellizcoDesde.escala * factor);
      return;
    }
    if (this.arrastreDesde) {
      this.x.set(this.arrastreDesde.px + (event.clientX - this.arrastreDesde.x));
      this.y.set(this.arrastreDesde.py + (event.clientY - this.arrastreDesde.y));
      this.encajar();
    }
  }

  alSoltar(event: PointerEvent) {
    this.punteros.delete(event.pointerId);
    if (this.punteros.size < 2) this.pellizcoDesde = null;
    if (this.punteros.size === 0) this.arrastreDesde = null;
  }

  private distancia(): number {
    const [a, b] = [...this.punteros.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  /** La rueda del mouse acerca y aleja, que es lo que espera quien usa computador. */
  alRodar(event: WheelEvent) {
    event.preventDefault();
    this.fijarEscala(this.escala() * (event.deltaY < 0 ? 1.15 : 1 / 1.15));
  }

  // ---- Pasar de una foto a otra ----

  /** Cambiar de foto vuelve a la vista entera: se mira la nueva, no el trozo de la vieja. */
  ir(paso: number) {
    const total = this.total();
    if (total < 2) return;
    this.indice.set((this.indice() + paso + total) % total);
    this.reiniciar();
  }

  verFoto(i: number) {
    this.indice.set(i);
    this.reiniciar();
  }

  @HostListener('document:keydown', ['$event'])
  alTeclear(event: KeyboardEvent) {
    if (!this.abierto()) return;
    const teclas: Record<string, () => void> = {
      Escape: () => this.cerrar(),
      ArrowRight: () => this.ir(1),
      ArrowLeft: () => this.ir(-1),
      '+': () => this.acercar(),
      '=': () => this.acercar(),
      '-': () => this.alejar(),
      '0': () => this.reiniciar(),
    };
    const accion = teclas[event.key];
    if (accion) {
      event.preventDefault();
      accion();
    }
  }
}
