import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { AdminContentService } from '../../core/services/admin-content.service';
import type { AdminRole, AdminUserRow } from '../../core/models/admin.model';
import { UndoService } from './undo.service';
import { apiErrorMessage, fechaHumana, haceCuanto } from './admin-utils';

/** Lo mínimo que acepta el API (passwordSchema, en armadero-api). */
export const MIN_CLAVE = 8;

/**
 * Palabras del taller para armar contraseñas que se puedan dictar por teléfono. Sin
 * tildes ni eñes a propósito: esta clave viaja por WhatsApp y se escribe en el teclado
 * de un celular.
 */
const PALABRAS = [
  'mimbre', 'roble', 'guadua', 'lino', 'ratan', 'cedro', 'fibra', 'nogal',
  'junco', 'teca', 'palma', 'sauce', 'arce', 'bambu', 'yute', 'caoba',
];

function alAzar(tope: number): number {
  // Es una credencial: si el navegador trae crypto, se usa crypto.
  const c = globalThis.crypto;
  if (c?.getRandomValues) {
    const buf = new Uint32Array(1);
    c.getRandomValues(buf);
    return buf[0] % tope;
  }
  return Math.floor(Math.random() * tope);
}

/** "mimbre-roble-742": dos palabras y tres cifras. Siempre por encima del mínimo. */
export function generarClave(): string {
  const a = PALABRAS[alAzar(PALABRAS.length)];
  let b = PALABRAS[alAzar(PALABRAS.length)];
  while (b === a) b = PALABRAS[alAzar(PALABRAS.length)];
  return `${a}-${b}-${100 + alAzar(900)}`;
}

/** La validación, dicha en positivo mientras sirva (REGLAS-COMUNES.md §4). */
export function revisarClave(clave: string): { sirve: boolean; texto: string } {
  const faltan = MIN_CLAVE - clave.length;
  if (faltan > 0) {
    return {
      sirve: false,
      texto:
        faltan === MIN_CLAVE
          ? `Escribe una contraseña de al menos ${MIN_CLAVE} caracteres.`
          : `Le falta${faltan === 1 ? '' : 'n'} ${faltan} caracter${faltan === 1 ? '' : 'es'}: necesita al menos ${MIN_CLAVE}.`,
    };
  }
  return { sirve: true, texto: `Sirve: tiene ${clave.length} caracteres.` };
}

interface Draft {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
}

/**
 * Quién entra al panel. Rediseño de design/panel/PROMPT-08-usuarios.md, sobre el
 * mockup design/panel/mockups/usuarios.html.
 *
 * Lo que cambia respecto a la pantalla vieja, y por qué:
 *
 * - El prompt() del navegador se va. Era la interacción más frágil del panel: obligaba a
 *   escribir la contraseña a ciegas, no se podía copiar, y en celular apenas se veía. En
 *   su lugar, un panel dentro de la propia fila con la clave ya generada, VISIBLE
 *   (type="text": es una credencial que hay que pasarle a otra persona, no la propia),
 *   con botón de copiar y otro para generar una distinta.
 * - El rol deja de ser un <select> y pasa a dos botones —y dos tarjetas al crear— que
 *   dicen qué deja hacer cada permiso, no cómo se llama.
 * - Las fechas se dicen en palabras: "entró hace 2 días", no "2026-09-12".
 * - Los límites que el API impone sobre la propia cuenta se explican ANTES, en la fila,
 *   en vez de aparecer como error después de intentarlo.
 * - "Quitarle el acceso", no "Desactivar", y con la aclaración de que no se borra nada de
 *   lo que esa persona cargó. Quien lo pierde se queda en la lista, en gris.
 */
@Component({
  selector: 'app-admin-user-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './admin-user-list.html',
})
export class AdminUserList {
  private auth = inject(AuthService);
  private service = inject(AdminContentService);
  private undo = inject(UndoService);

  users = signal<AdminUserRow[]>([]);
  loading = signal(true);
  busy = signal(false);
  error = signal<string | null>(null);

  /** El formulario de alta, cerrado hasta que se pide. */
  showNew = signal(false);
  draft = signal<Draft>(this.nuevoDraft());

  /** Fila cuyo panel de contraseña está abierto, y la clave que propone. */
  cambiandoClave = signal<string | null>(null);
  claveNueva = signal('');

  /** Fila cuya franja de "¿quitarle el acceso?" está abierta. Reemplaza al confirm(). */
  confirmandoSalida = signal<string | null>(null);

  /** Qué campo se acaba de copiar, para decirlo en el propio botón. */
  copiado = signal<string | null>(null);
  private copiadoTimer: ReturnType<typeof setTimeout> | null = null;

  readonly minClave = MIN_CLAVE;
  me = () => this.auth.user()?.id ?? '';

  /** Con acceso primero; quien lo perdió baja al final, que es donde estorba menos. */
  readonly ordenados = computed(() =>
    [...this.users()].sort((a, b) => Number(b.active) - Number(a.active)),
  );

  readonly resumen = computed(() => {
    const list = this.users();
    return { total: list.length, conAcceso: list.filter((u) => u.active).length };
  });

  readonly revisionNueva = computed(() => revisarClave(this.draft().password));
  readonly revisionCambio = computed(() => revisarClave(this.claveNueva()));

  constructor() {
    this.load();
  }

  private nuevoDraft(): Draft {
    return { name: '', email: '', password: generarClave(), role: 'EDITOR' };
  }

  load() {
    this.service.listUsers().subscribe({
      next: (list) => {
        this.users.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar los usuarios.');
        this.loading.set(false);
      },
    });
  }

  // ---- Lo que se lee en cada fila ----

  /** La inicial del círculo. */
  inicial(u: AdminUserRow): string {
    return (u.name.trim()[0] ?? '?').toUpperCase();
  }

  /** El color del círculo es el del permiso: tinta administra, madera carga. */
  colorRol(u: AdminUserRow): string {
    if (!u.active) return 'var(--linea-fuerte)';
    return u.role === 'ADMIN' ? 'var(--tinta)' : 'var(--madera)';
  }

  nombreRol(role: AdminRole): string {
    return role === 'ADMIN' ? 'Administra todo' : 'Carga muebles y fotos';
  }

  /** En pasado, para quien ya no entra: "Cargaba muebles y fotos". */
  rolPasado(role: AdminRole): string {
    return role === 'ADMIN' ? 'Administraba todo' : 'Cargaba muebles y fotos';
  }

  /**
   * Cuándo entró, dicho como se dice hablando. Para uno mismo no tiene sentido mirar el
   * registro: se está entrando ahora.
   */
  entrada(u: AdminUserRow): string {
    if (u._id === this.me()) return 'Entrando ahora';
    const cuando = haceCuanto(u.lastLoginAt);
    if (!cuando) return 'Todavía no ha entrado';
    return cuando.startsWith('hace') || cuando === 'hoy' || cuando === 'ayer'
      ? `Entró ${cuando}`
      : `Última entrada, ${cuando}`;
  }

  /** La línea de quien ya no tiene acceso: qué hacía y cuándo entró por última vez. */
  historia(u: AdminUserRow): string {
    const fecha = fechaHumana(u.lastLoginAt);
    const desde = fecha ? `última entrada, ${fecha}` : 'nunca llegó a entrar';
    return `${this.rolPasado(u.role)} · ${desde}`;
  }

  // ---- Acciones ----

  private replace(row: AdminUserRow) {
    this.users.update((list) => list.map((u) => (u._id === row._id ? row : u)));
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

  abrirNueva() {
    const abrir = !this.showNew();
    // Cada vez que se abre, una contraseña distinta: la anterior ya se vio en pantalla.
    if (abrir) this.draft.set(this.nuevoDraft());
    this.showNew.set(abrir);
    this.error.set(null);
  }

  regenerarNueva() {
    this.draft.update((d) => ({ ...d, password: generarClave() }));
  }

  create() {
    const d = this.draft();
    if (!d.name.trim() || !d.email.trim()) {
      this.error.set('Falta el nombre o el correo.');
      return;
    }
    if (!revisarClave(d.password).sirve) {
      this.error.set(`La contraseña necesita al menos ${MIN_CLAVE} caracteres.`);
      return;
    }
    this.run(async () => {
      const row = await firstValueFrom(this.service.createUser(d));
      this.users.update((list) => [...list, row]);
      this.showNew.set(false);
      this.draft.set(this.nuevoDraft());
    }, 'No se pudo crear la cuenta.');
  }

  setRole(u: AdminUserRow, role: AdminRole) {
    if (role === u.role) return;
    this.run(async () => {
      this.replace(await firstValueFrom(this.service.updateUser(u._id, { role })));
    }, 'No se pudo cambiar el permiso.');
  }

  // ---- Contraseña de otra persona ----

  abrirClave(u: AdminUserRow) {
    this.confirmandoSalida.set(null);
    if (this.cambiandoClave() === u._id) {
      this.cerrarClave();
      return;
    }
    this.cambiandoClave.set(u._id);
    this.claveNueva.set(generarClave());
    this.error.set(null);
  }

  cerrarClave() {
    this.cambiandoClave.set(null);
    this.claveNueva.set('');
  }

  regenerarClave() {
    this.claveNueva.set(generarClave());
  }

  ponerClave(u: AdminUserRow) {
    const password = this.claveNueva();
    if (!revisarClave(password).sirve) return;
    this.run(async () => {
      this.replace(await firstValueFrom(this.service.updateUser(u._id, { password })));
      this.cerrarClave();
    }, 'No se pudo cambiar la contraseña.');
  }

  /**
   * Copiar al portapapeles. Si el navegador no lo permite (o no hay permiso), se
   * selecciona el campo: copiar a mano sigue siendo posible, a ciegas no.
   */
  async copiar(texto: string, marca: string, campo?: HTMLInputElement) {
    try {
      await navigator.clipboard.writeText(texto);
      this.copiado.set(marca);
      if (this.copiadoTimer) clearTimeout(this.copiadoTimer);
      this.copiadoTimer = setTimeout(() => this.copiado.set(null), 2500);
    } catch {
      campo?.select();
    }
  }

  // ---- Quitar y devolver el acceso ----

  pedirSalida(u: AdminUserRow) {
    this.cerrarClave();
    this.confirmandoSalida.set(this.confirmandoSalida() === u._id ? null : u._id);
  }

  quitarAcceso(u: AdminUserRow) {
    this.confirmandoSalida.set(null);
    this.run(async () => {
      this.replace(await firstValueFrom(this.service.updateUser(u._id, { active: false })));
      this.undo.offer(`${u.name} ya no tiene acceso al panel.`, async () => {
        this.replace(await firstValueFrom(this.service.updateUser(u._id, { active: true })));
      });
    }, 'No se pudo quitar el acceso.');
  }

  devolverAcceso(u: AdminUserRow) {
    this.run(async () => {
      this.replace(await firstValueFrom(this.service.updateUser(u._id, { active: true })));
    }, 'No se pudo devolver el acceso.');
  }
}
