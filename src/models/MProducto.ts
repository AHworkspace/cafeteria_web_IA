import type { DisponibilidadProducto, Producto } from '../interfaces/system';
import { DatabaseJson } from '../utils/DatabaseJson';

export class MProducto {
  private database: DatabaseJson<Producto>;
  private id: number;
  private nombre: string;
  private precio: number;
  private disponibilidad: DisponibilidadProducto;

  constructor() {
    this.database = new DatabaseJson<Producto>('productos', 'id');
    this.id = 0;
    this.nombre = '';
    this.precio = 0;
    this.disponibilidad = 'activo';
  }

  establecerDatos(nombre: string, precio: number): void {
    this.nombre = nombre.trim();
    this.precio = precio;
  }

  establecerId(id: number): void {
    this.id = id;
  }

  listar(): Producto[] {
    return this.database.listar().sort((a, b) => b.id - a.id);
  }

  listarActivos(): Producto[] {
    return this.listar().filter((producto) => producto.disponibilidad === 'activo');
  }

  buscar(id: number): Producto | undefined {
    return this.database.buscar(id);
  }

  guardar(): string {
    this.validar();
    this.database.guardar({
      id: 0,
      nombre: this.nombre,
      precio: this.precio,
      disponibilidad: this.disponibilidad,
    });
    return 'Producto registrado correctamente.';
  }

  actualizar(): string {
    this.validar();
    const producto = this.obtenerProducto(this.id);
    this.database.actualizar({
      ...producto,
      nombre: this.nombre,
      precio: this.precio,
    });
    return 'Producto actualizado correctamente.';
  }

  eliminar(id: number): string {
    this.obtenerProducto(id);
    this.database.eliminar(id);
    return 'Producto eliminado correctamente.';
  }

  alternarActivo(id: number): string {
    const producto = this.obtenerProducto(id);
    this.disponibilidad = producto.disponibilidad === 'activo'
      ? 'no_activo'
      : 'activo';
    producto.disponibilidad = this.disponibilidad;
    this.database.actualizar(producto);
    return this.disponibilidad === 'activo'
      ? 'Producto activado correctamente.'
      : 'Producto marcado como no activo.';
  }

  private obtenerProducto(id: number): Producto {
    const producto = this.database.buscar(id);
    if (!producto) throw new Error('El producto no existe.');
    return producto;
  }

  private validar(): void {
    if (this.nombre === '') throw new Error('Ingrese el nombre del producto.');
    if (!Number.isFinite(this.precio) || this.precio <= 0) {
      throw new Error('Ingrese un precio valido.');
    }
  }
}
