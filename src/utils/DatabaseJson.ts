import { SupabaseRest } from './SupabaseRest';

export class DatabaseJson<T extends Record<string, unknown>> {
  private tableName: string;
  private campoId: keyof T & string;

  constructor(tableName: string, campoId: keyof T & string) {
    this.tableName = tableName;
    this.campoId = campoId;
  }

  guardar(data: T): T {
    const id = Number(data[this.campoId] ?? 0);
    return id > 0 ? this.actualizar(data) : this.insertar(data);
  }

  insertar(data: T): T {
    const filas = this.leerFilas();
    const registro = {
      ...data,
      [this.campoId]: this.siguienteId(filas),
    } as T;

    filas.push(registro);
    this.escribirFilas(filas);
    this.sincronizarGuardado(registro);
    return { ...registro };
  }

  actualizar(data: T): T {
    const filas = this.leerFilas();
    const id = Number(data[this.campoId]);
    const index = filas.findIndex((fila) => Number(fila[this.campoId]) === id);

    if (index < 0) {
      throw new Error(`No se encontro el registro ${id} en ${this.tableName}.`);
    }

    filas[index] = { ...data };
    this.escribirFilas(filas);
    this.sincronizarGuardado(filas[index]);
    return { ...filas[index] };
  }

  eliminar(id: number): void {
    const filas = this.leerFilas();
    const restantes = filas.filter((fila) => Number(fila[this.campoId]) !== id);

    if (restantes.length === filas.length) {
      throw new Error(`No se encontro el registro ${id} en ${this.tableName}.`);
    }

    this.escribirFilas(restantes);
    this.sincronizarEliminacion(id);
  }

  buscar(id: number): T | undefined {
    const fila = this.leerFilas().find((item) => Number(item[this.campoId]) === id);
    return fila ? { ...fila } : undefined;
  }

  listar(): T[] {
    return this.leerFilas().map((fila) => ({ ...fila }));
  }

  private siguienteId(filas: T[]): number {
    return filas.reduce(
      (mayor, fila) => Math.max(mayor, Number(fila[this.campoId]) || 0),
      0,
    ) + 1;
  }

  private leerFilas(): T[] {
    const contenido = localStorage.getItem(this.tableName);
    if (!contenido) return [];

    try {
      const filas = JSON.parse(contenido);
      return Array.isArray(filas) ? filas as T[] : [];
    } catch {
      return [];
    }
  }

  private escribirFilas(filas: T[]): void {
    localStorage.setItem(this.tableName, JSON.stringify(filas));
  }

  private sincronizarGuardado(fila: T): void {
    void SupabaseRest.guardar(this.tableName, fila).catch((error: unknown) => {
      console.warn(`No se pudo sincronizar ${this.tableName} con Supabase.`, error);
    });
  }

  private sincronizarEliminacion(id: number): void {
    void SupabaseRest.eliminar(this.tableName, id).catch((error: unknown) => {
      console.warn(`No se pudo eliminar ${this.tableName} en Supabase.`, error);
    });
  }
}
