import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { firstValueFrom } from 'rxjs';
import { AdminContentService } from '../../core/services/admin-content.service';
import { AdminProductService } from '../../core/services/admin-product.service';
import { AdminCategoryService } from '../../core/services/admin-category.service';
import { PORTADA_POR_DEFECTO } from '../../core/business';
import type { AdminBanner, AdminCategory, AdminCollection } from '../../core/models/admin.model';
import { environment } from '../../../environments/environment';
import { UndoService } from './undo.service';
import { apiErrorMessage, fechaHumana, fromDateInput, toDateInput } from './admin-utils';

/** A dónde manda el botón del hero. Cuatro destinos, no una caja de texto a ciegas. */
export type Destino = 'categoria' | 'coleccion' | 'catalogo' | 'otra';

/**
 * En qué estado está una portada, dicho como lo entiende quien la cargó.
 * `al-aire` es la única que se ve en la página; el resto espera, se venció o está apagada.
 */
export type EstadoPortada = 'al-aire' | 'siguiente' | 'en-cola' | 'programada' | 'vencida' | 'apagada';

interface Draft {
  imageUrl: string;
  imagePublicId: string;
  title: string;
  subtitle: string;
  destino: Destino;
  /** Slug de categoría, slug de colección o dirección libre, según el destino. */
  destinoValor: string;
  vigencia: 'siempre' | 'fechas';
  startsAt: string;
  endsAt: string;
}

const EMPTY: Draft = {
  imageUrl: '',
  imagePublicId: '',
  title: '',
  subtitle: '',
  destino: 'catalogo',
  destinoValor: '',
  vigencia: 'siempre',
  startsAt: '',
  endsAt: '',
};

/**
 * Portada del inicio. Rediseño de design/panel/PROMPT-05-inicio.md sobre el mockup
 * design/panel/mockups/inicio.html.
 *
 * El problema que resuelve: se administraba la pieza que abre el sitio sin poder ver
 * cómo iba a quedar. Se editaba a ciegas, con dos campos de fecha sin consecuencia
 * visible y una lista que no decía cuál de todas era la que sale.
 *
 * Ahora la pantalla arranca por lo que se ve ahora mismo —una maqueta del hero con la
 * foto y las frases cargadas—, sigue con la cola en orden de turno, cada una con su
 * estado en palabras y sus fechas en lenguaje humano, y termina con la portada de
 * siempre, que es la que sale cuando no hay ninguna encendida.
 *
 * El modelo no cambia: son los mismos banners y los mismos endpoints. Lo que cambia es
 * que "cambiar la foto del inicio" dejó de estar escondido detrás de "+ Nuevo".
 */
@Component({
  selector: 'app-admin-banner-list',
  standalone: true,
  imports: [FormsModule, CdkDropList, CdkDrag],
  templateUrl: './admin-banner-list.html',
})
export class AdminBannerList {
  private service = inject(AdminContentService);
  private uploads = inject(AdminProductService);
  private categories = inject(AdminCategoryService);
  private undo = inject(UndoService);

  banners = signal<AdminBanner[]>([]);
  colecciones = signal<AdminCollection[]>([]);
  categorias = signal<AdminCategory[]>([]);
  loading = signal(true);
  busy = signal(false);
  uploading = signal(false);
  error = signal<string | null>(null);

  /** null = solo la lista; 'new' = portada nueva; un id = editando esa. */
  editing = signal<string | null>(null);
  draft = signal<Draft>({ ...EMPTY });
  /** Fila con el menú ⋯ abierto. */
  openMenu = signal<string | null>(null);

  readonly porDefecto = PORTADA_POR_DEFECTO;
  readonly filesUrl = environment.filesUrl;
  readonly toDate = toDateInput;

  constructor() {
    this.service.listBanners().subscribe({
      next: (list) => {
        this.banners.set([...list].sort((a, b) => a.position - b.position));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar las portadas.');
        this.loading.set(false);
      },
    });
    // Para el selector de destino: adónde puede mandar el botón sin escribir una ruta.
    this.service.listCollections().subscribe({ next: (l) => this.colecciones.set(l) });
    this.categories.list().subscribe({ next: (l) => this.categorias.set(l) });
  }

  // ---- Quién está al aire y quién espera ----

  private dentroDeFecha(b: AdminBanner, hoy = Date.now()): boolean {
    const desde = b.startsAt ? Date.parse(b.startsAt) : null;
    const hasta = b.endsAt ? Date.parse(b.endsAt) : null;
    return (desde === null || desde <= hoy) && (hasta === null || hasta >= hoy);
  }

  private vencida(b: AdminBanner, hoy = Date.now()): boolean {
    return Boolean(b.endsAt) && Date.parse(b.endsAt!) < hoy;
  }

  /** La que la página está mostrando: la primera encendida y en fecha. Puede no haber. */
  readonly alAire = computed(
    () => this.banners().find((b) => b.active && this.dentroDeFecha(b)) ?? null,
  );

  /** Todas las demás, en el orden en que van a entrar. */
  readonly enCola = computed(() => {
    const arriba = this.alAire();
    return this.banners().filter((b) => b !== arriba);
  });

  /** La que entra sola si la de arriba se baja: la siguiente encendida y en fecha. */
  readonly siguiente = computed(
    () => this.enCola().find((b) => b.active && this.dentroDeFecha(b)) ?? null,
  );

  estado(b: AdminBanner): EstadoPortada {
    if (b === this.alAire()) return 'al-aire';
    if (!b.active) return 'apagada';
    if (this.vencida(b)) return 'vencida';
    if (b.startsAt && Date.parse(b.startsAt) > Date.now()) return 'programada';
    return b === this.siguiente() ? 'siguiente' : 'en-cola';
  }

  /** El rótulo de la pastilla de estado. */
  rotulo(b: AdminBanner): string {
    return {
      'al-aire': 'Al aire',
      siguiente: 'La siguiente',
      'en-cola': 'En la cola',
      programada: 'Programada',
      vencida: 'Se venció',
      apagada: 'Apagada',
    }[this.estado(b)];
  }

  /** El color del estado: el mismo código funcional del resto del panel. */
  color(b: AdminBanner): string {
    return {
      'al-aire': 'var(--hoja)',
      siguiente: 'var(--madera)',
      'en-cola': 'var(--linea-fuerte)',
      programada: 'var(--tejido)',
      vencida: 'var(--alerta)',
      apagada: 'var(--linea-fuerte)',
    }[this.estado(b)];
  }

  /**
   * Las fechas, dichas como consecuencia y no como dos campos: lo que hoy son
   * "startsAt" y "endsAt" aquí se lee "sube sola el 1 de diciembre y baja el 6 de enero".
   */
  cuando(b: AdminBanner): string {
    const desde = fechaHumana(b.startsAt);
    const hasta = fechaHumana(b.endsAt);
    switch (this.estado(b)) {
      case 'al-aire':
        return `Al aire${desde ? ` desde el ${desde}` : ''} · ${
          hasta ? `se baja sola el ${hasta}` : 'sin fecha de fin'
        }`;
      case 'programada':
        return `Sube sola el ${desde}${hasta ? ` y baja el ${hasta}` : ''}`;
      case 'vencida':
        return `Su fecha terminó el ${hasta}, así que ya no puede subir. Cámbiale las fechas o apágala.`;
      case 'apagada':
        return 'Apagada: no entra en el turno hasta que la enciendas.';
      case 'siguiente':
        return desde || hasta
          ? `Lista, entre fechas: ${desde ? `desde el ${desde}` : 'ya'}${hasta ? ` hasta el ${hasta}` : ''}`
          : 'Lista, sin fecha: entra en cuanto la de arriba salga';
      default:
        return desde || hasta
          ? `Entre fechas: ${desde ? `desde el ${desde}` : 'ya'}${hasta ? ` hasta el ${hasta}` : ''}`
          : 'Sin fecha: espera su turno en la cola';
    }
  }

  /**
   * Lo que se lee bajo el nombre: la frase y a dónde lleva el botón. Cuando faltan las
   * frases, dice cuál va a salir en su lugar: una portada sin titular no sale en blanco.
   */
  resumen(b: AdminBanner): string {
    if (!b.title && !b.subtitle) {
      return `Sin frases: usaría las de siempre, «${PORTADA_POR_DEFECTO.title}» · lleva a ${this.nombreDestino(b.linkUrl)}`;
    }
    const frase = b.subtitle ? `«${b.subtitle}»` : 'Sin frase debajo: queda la de siempre';
    return `${frase} · lleva a ${this.nombreDestino(b.linkUrl)}`;
  }

  /** Cómo se nombra una portada en la lista. Sin titular no tiene nombre propio. */
  titular(b: AdminBanner): string {
    return b.title || 'Sin titular';
  }

  /** "Comedores tejidos" en vez de "/catalogo?categoria=comedores-tejidos". */
  nombreDestino(linkUrl: string | null | undefined): string {
    if (!linkUrl) return 'todo el catálogo';
    if (/^https?:\/\//.test(linkUrl)) return linkUrl;
    const slug = /[?&]categoria=([^&]+)/.exec(linkUrl)?.[1];
    if (slug) {
      return this.categorias().find((c) => c.slug === slug)?.name ?? slug;
    }
    const col = /\/coleccion\/([^/?]+)/.exec(linkUrl)?.[1];
    if (col) {
      return this.colecciones().find((c) => c.slug === col)?.name ?? col;
    }
    return linkUrl === '/catalogo' ? 'todo el catálogo' : linkUrl;
  }

  /** Las subcategorías, que son las que tienen muebles colgando. */
  readonly hojas = computed(() => {
    const todas = this.categorias();
    const nombre = (id: string) => todas.find((c) => c._id === id)?.name ?? '';
    return todas
      .filter((c) => c.parent)
      .map((c) => ({ slug: c.slug, etiqueta: `${nombre(c.parent!)} · ${c.name}` }));
  });

  /**
   * Lo que le falta a la portada para estar completa. La portada es lo que ve todo el
   * que llega: si algo está a medias, va arriba y no enterrado en una fila.
   */
  readonly pendientes = computed(() => {
    const out: { texto: string; banner: AdminBanner | null }[] = [];
    const arriba = this.alAire();
    if (!arriba && this.banners().length > 0) {
      out.push({
        texto:
          'Ninguna portada está al aire: el inicio está usando la de siempre. Enciende una de la cola o sube una nueva.',
        banner: null,
      });
    }
    for (const b of this.banners()) {
      if (this.estado(b) === 'vencida') {
        out.push({ texto: `«${this.titular(b)}» se venció y ya no puede subir.`, banner: b });
      }
    }
    return out;
  });

  // ---- Formulario ----

  abrirNueva() {
    this.draft.set({ ...EMPTY });
    this.editing.set('new');
    this.error.set(null);
  }

  /** "Cambiar la de siempre": la nueva arranca con el texto de la de siempre cargado. */
  abrirDesdePorDefecto() {
    this.draft.set({
      ...EMPTY,
      title: PORTADA_POR_DEFECTO.title,
      subtitle: PORTADA_POR_DEFECTO.subtitle,
    });
    this.editing.set('new');
    this.error.set(null);
  }

  abrirEdicion(b: AdminBanner) {
    this.openMenu.set(null);
    const link = b.linkUrl ?? '';
    const categoria = /[?&]categoria=([^&]+)/.exec(link)?.[1];
    const coleccion = /\/coleccion\/([^/?]+)/.exec(link)?.[1];
    const destino: Destino = categoria
      ? 'categoria'
      : coleccion
        ? 'coleccion'
        : !link || link === '/catalogo'
          ? 'catalogo'
          : 'otra';
    this.draft.set({
      imageUrl: b.imageUrl,
      imagePublicId: b.imagePublicId ?? '',
      title: b.title ?? '',
      subtitle: b.subtitle ?? '',
      destino,
      destinoValor: categoria ?? coleccion ?? (destino === 'otra' ? link : ''),
      vigencia: b.startsAt || b.endsAt ? 'fechas' : 'siempre',
      startsAt: toDateInput(b.startsAt),
      endsAt: toDateInput(b.endsAt),
    });
    this.editing.set(b._id);
    this.error.set(null);
  }

  parche(campo: Partial<Draft>) {
    this.draft.update((d) => ({ ...d, ...campo }));
  }

  setDestino(destino: Destino) {
    this.parche({ destino, destinoValor: destino === 'catalogo' ? '' : this.draft().destinoValor });
  }

  private linkUrl(): string {
    const d = this.draft();
    switch (d.destino) {
      case 'categoria':
        return d.destinoValor ? `/catalogo?categoria=${d.destinoValor}` : '/catalogo';
      case 'coleccion':
        return d.destinoValor ? `/coleccion/${d.destinoValor}` : '/catalogo';
      case 'otra':
        return d.destinoValor.trim();
      default:
        return '/catalogo';
    }
  }

  async subirFoto(event: Event) {
    const el = event.target as HTMLInputElement;
    const file = el.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.error.set(null);
    try {
      const up = await firstValueFrom(this.uploads.upload(file));
      this.parche({ imageUrl: up.url, imagePublicId: up.publicId });
    } catch (e: unknown) {
      this.error.set(apiErrorMessage(e, 'No se pudo subir la foto.'));
    } finally {
      this.uploading.set(false);
      el.value = '';
    }
  }

  private payload() {
    const d = this.draft();
    const conFechas = d.vigencia === 'fechas';
    return {
      title: d.title.trim(),
      subtitle: d.subtitle.trim(),
      linkUrl: this.linkUrl(),
      imageUrl: d.imageUrl,
      imagePublicId: d.imagePublicId || undefined,
      startsAt: conFechas ? fromDateInput(d.startsAt) : null,
      endsAt: conFechas ? fromDateInput(d.endsAt) : null,
    };
  }

  private replace(row: AdminBanner) {
    this.banners.update((list) => list.map((b) => (b._id === row._id ? row : b)));
  }

  private async run(fn: () => Promise<void>, fallback: string) {
    this.busy.set(true);
    this.error.set(null);
    try {
      await fn();
    } catch (e: unknown) {
      this.error.set(apiErrorMessage(e, fallback));
    } finally {
      this.busy.set(false);
    }
  }

  /** El orden que ve la página es `position`: guardarlo es lo que decide el turno. */
  private async guardarOrden(list: AdminBanner[]) {
    this.banners.set(list.map((b, i) => ({ ...b, position: i })));
    await firstValueFrom(this.service.reorderBanners(list.map((b) => b._id)));
  }

  /**
   * @param alAire true = "Subirla ahora": queda de primera y encendida, así que es la
   * que sale. false = "Guardar para después": se queda al final de la cola.
   */
  guardar(alAire: boolean) {
    const id = this.editing();
    if (!id) return;
    if (!this.draft().imageUrl) {
      this.error.set('Falta la foto: es lo único obligatorio de una portada.');
      return;
    }
    this.run(async () => {
      let row: AdminBanner;
      if (id === 'new') {
        row = await firstValueFrom(this.service.createBanner(this.payload()));
        this.banners.update((list) => [...list, row]);
      } else {
        row = await firstValueFrom(this.service.updateBanner(id, this.payload()));
        this.replace(row);
      }
      if (alAire) await this.ponerDePrimera(row);
      this.editing.set(null);
    }, 'No se pudo guardar la portada.');
  }

  // ---- Acciones de una fila ----

  private async ponerDePrimera(b: AdminBanner) {
    const fresca = b.active ? b : await firstValueFrom(this.service.setBannerActive(b._id, true));
    this.replace(fresca);
    const resto = this.banners().filter((x) => x._id !== b._id);
    await this.guardarOrden([this.banners().find((x) => x._id === b._id)!, ...resto]);
  }

  subirYa(b: AdminBanner) {
    this.openMenu.set(null);
    const antes = this.alAire();
    this.run(async () => {
      await this.ponerDePrimera(b);
      if (antes && antes._id !== b._id) {
        this.undo.offer(`«${this.titular(b)}» quedó al aire.`, async () => {
          await this.ponerDePrimera(antes);
        });
      }
    }, 'No se pudo subir la portada.');
  }

  /** "Bajarla": se apaga, y entra sola la siguiente de la cola. */
  bajar(b: AdminBanner) {
    this.openMenu.set(null);
    this.run(async () => {
      this.replace(await firstValueFrom(this.service.setBannerActive(b._id, false)));
      this.undo.offer(`«${this.titular(b)}» ya no está al aire.`, async () => {
        this.replace(await firstValueFrom(this.service.setBannerActive(b._id, true)));
      });
    }, 'No se pudo bajar la portada.');
  }

  encender(b: AdminBanner) {
    this.openMenu.set(null);
    this.run(async () => {
      this.replace(await firstValueFrom(this.service.setBannerActive(b._id, true)));
    }, 'No se pudo encender la portada.');
  }

  drop(event: CdkDragDrop<AdminBanner[]>) {
    if (event.previousIndex === event.currentIndex) return;
    const cola = [...this.enCola()];
    moveItemInArray(cola, event.previousIndex, event.currentIndex);
    const arriba = this.alAire();
    const orden = arriba ? [arriba, ...cola] : cola;
    this.banners.set(orden.map((b, i) => ({ ...b, position: i })));
    this.service.reorderBanners(orden.map((b) => b._id)).subscribe({
      error: () => this.error.set('No se pudo guardar el nuevo turno.'),
    });
  }
}
