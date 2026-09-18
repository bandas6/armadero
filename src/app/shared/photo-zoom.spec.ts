import { TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { PhotoZoom } from './photo-zoom';
import type { ProductImage } from '../core/models/product.model';

function foto(i: number): ProductImage {
  return { _id: `f${i}`, url: `/fotos/${i}.webp`, isPrimary: i === 0, position: i };
}

@Component({
  standalone: true,
  imports: [PhotoZoom],
  template: `<app-photo-zoom [fotos]="fotos" [(indice)]="indice" nombre="Mecedora Buga" />`,
})
class Anfitrion {
  fotos = [foto(0), foto(1), foto(2)];
  indice = signal(0);
}

/**
 * Lo que se puede romper sin que se note a simple vista: los topes del zoom y el paso de
 * una foto a otra. Un zoom que se pasa de 4x deja la foto reventada, y uno que no vuelve
 * a 1x al cambiar de foto muestra la foto nueva por un trozo cualquiera.
 */
describe('Ver la foto de cerca', () => {
  function crear() {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.detectChanges();
    const zoom = fixture.debugElement.children[0].componentInstance as PhotoZoom;
    return { fixture, zoom };
  }

  it('acerca y aleja a saltos, sin pasarse de los topes', () => {
    const { zoom } = crear();
    expect(zoom.escala()).toBe(1);
    expect(zoom.puedeAlejar()).toBe(false);

    zoom.acercar();
    expect(zoom.escala()).toBe(2);
    zoom.acercar();
    zoom.acercar();
    expect(zoom.escala()).toBe(4);

    zoom.acercar();
    expect(zoom.escala()).toBe(4);
    expect(zoom.puedeAcercar()).toBe(false);

    zoom.alejar();
    expect(zoom.escala()).toBe(3);
  });

  it('el doble clic alterna entre la foto entera y el detalle', () => {
    const { zoom } = crear();
    zoom.alternarZoom();
    expect(zoom.escala()).toBe(2);
    zoom.alternarZoom();
    expect(zoom.escala()).toBe(1);
  });

  it('volver a 1x recentra la foto', () => {
    const { zoom } = crear();
    zoom.acercar();
    zoom.alternarZoom();
    expect([zoom.x(), zoom.y()]).toEqual([0, 0]);
  });

  it('pasa de una foto a otra en círculo y avisa al padre', () => {
    const { fixture, zoom } = crear();
    const anfitrion = fixture.componentInstance;

    zoom.ir(1);
    fixture.detectChanges();
    expect(anfitrion.indice()).toBe(1);

    zoom.ir(-1);
    zoom.ir(-1);
    fixture.detectChanges();
    expect(anfitrion.indice()).toBe(2);
  });

  it('cambiar de foto la muestra entera, no por donde quedó la anterior', () => {
    const { zoom } = crear();
    zoom.acercar();
    expect(zoom.escala()).toBe(2);
    zoom.ir(1);
    expect(zoom.escala()).toBe(1);
  });

  it('con una sola foto no hay a dónde pasar', () => {
    const fixture = TestBed.createComponent(Anfitrion);
    fixture.componentInstance.fotos = [foto(0)];
    fixture.detectChanges();
    const zoom = fixture.debugElement.children[0].componentInstance as PhotoZoom;
    zoom.ir(1);
    expect(fixture.componentInstance.indice()).toBe(0);
  });
});
