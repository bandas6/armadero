import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { App } from './app';

/**
 * Prueba de humo del armazon del sitio publico: que monte, y que traiga el encabezado y
 * el pie con la marca. El panel (/admin) trae los suyos y por eso los oculta.
 *
 * El encabezado y el pie piden /api/settings al arrancar; aqui se responde vacio para
 * que la prueba no dependa de la API.
 */
describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('monta el armazón', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra el logotipo en el encabezado y el pie', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    TestBed.inject(HttpTestingController).match(() => true).forEach((req) => req.flush(null));
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    const logos = [...el.querySelectorAll('img')].map((img) => img.getAttribute('src'));
    expect(logos).toContain('/marca/logotipo-tinta.svg');
    expect(logos).toContain('/marca/logotipo.svg');
  });

  it('deja el horario de atención a la vista en el pie', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    TestBed.inject(HttpTestingController).match(() => true).forEach((req) => req.flush(null));
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Horario de atención');
  });
});
