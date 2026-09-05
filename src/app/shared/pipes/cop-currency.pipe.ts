import { Pipe, PipeTransform } from '@angular/core';

/** Pesos colombianos, enteros: "$ 1.850.000". Nunca decimales. */
@Pipe({ name: 'copCurrency' })
export class CopCurrencyPipe implements PipeTransform {
  transform(value: number | undefined | null): string {
    if (value == null) return 'Precio según medidas';
    return `$ ${Math.round(value).toLocaleString('es-CO')}`;
  }
}
