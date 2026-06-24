import type { EntrenamientoIA, IntencionIA } from '../interfaces/system';
import { DatabaseJson } from '../utils/DatabaseJson';

export class MEntrenamientoIA {
  private database: DatabaseJson<EntrenamientoIA>;

  constructor() {
    this.database = new DatabaseJson<EntrenamientoIA>('entrenamiento_ia', 'id');
  }

  listar(): EntrenamientoIA[] {
    return this.database.listar().sort((a, b) => b.id - a.id);
  }

  buscar(id: number): EntrenamientoIA | undefined {
    return this.database.buscar(id);
  }

  guardar(texto: string, intencion: IntencionIA): string {
    this.validar(texto, intencion);
    this.database.guardar({
      id: 0,
      texto: texto.trim(),
      intencion,
    });
    return 'Frase de entrenamiento registrada correctamente.';
  }

  guardarMasivo(textos: string[], intencion: IntencionIA): string {
    const frases = textos
      .map((texto) => texto.trim())
      .filter((texto) => texto !== '');

    if (frases.length === 0) {
      throw new Error('Ingrese al menos una frase de entrenamiento.');
    }

    frases.forEach((texto) => {
      this.validar(texto, intencion);
      this.database.guardar({
        id: 0,
        texto,
        intencion,
      });
    });

    return `${frases.length} frases de entrenamiento registradas correctamente.`;
  }

  actualizar(id: number, texto: string, intencion: IntencionIA): string {
    const ejemplo = this.database.buscar(id);
    if (!ejemplo) throw new Error('La frase de entrenamiento no existe.');
    this.validar(texto, intencion);
    this.database.actualizar({
      id,
      texto: texto.trim(),
      intencion,
    });
    return 'Frase de entrenamiento actualizada correctamente.';
  }

  eliminar(id: number): string {
    this.database.eliminar(id);
    return 'Frase de entrenamiento eliminada correctamente.';
  }

  private validar(texto: string, intencion: IntencionIA): void {
    if (texto.trim() === '') throw new Error('Ingrese la frase de entrenamiento.');
    if (![
      'menu',
      'precio',
      'recomendacion',
      'pedido',
      'saludo',
      'total_pedido',
      'quitar_producto',
      'modificar_pedido',
      'confirmar_pedido',
      'cancelar_borrador',
    ].includes(intencion)) {
      throw new Error('Seleccione una intencion valida.');
    }
  }
}
