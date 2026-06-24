import { MProducto } from '../models/MProducto';
import { MDetallePedido } from '../models/MDetallePedido';
import type { Producto } from '../interfaces/system';
import { VProducto } from '../view/VProducto';

export class CProducto {
  private model: MProducto;
  private detalleModel: MDetallePedido;
  private view: VProducto;

  constructor() {
    this.model = new MProducto();
    this.detalleModel = new MDetallePedido();
    this.view = new VProducto();
    this.iniciarEscucha();
  }

  crear(): HTMLElement {
    this.listar();
    return this.view.obtenerHTML();
  }

  listar(): void {
    this.view.listar(this.model.listar());
  }

  guardar(): void {
    const data = this.view.obtenerDatos();
    this.model.establecerDatos(data.nombre, data.precio);

    const mensaje = data.id > 0
      ? this.actualizar(data.id)
      : this.model.guardar();

    this.view.cerrarFormulario();
    this.listar();
    this.view.mensaje(mensaje);
  }

  actualizar(id: number): string {
    this.model.establecerId(id);
    return this.model.actualizar();
  }

  eliminar(id: number): void {
    if (!confirm('Desea eliminar este producto?')) return;
    if (this.detalleModel.productoEstaUsado(id)) {
      throw new Error('No se puede eliminar un producto que ya fue usado en un pedido.');
    }
    const mensaje = this.model.eliminar(id);
    this.listar();
    this.view.mensaje(mensaje);
  }

  alternarActivo(id: number): void {
    const mensaje = this.model.alternarActivo(id);
    this.listar();
    this.view.mensaje(mensaje);
  }

  buscar(producto: Producto): void {
    this.view.buscar(producto);
  }

  private iniciarEscucha(): void {
    this.view.btnNuevo.addEventListener('click', () => this.view.crear());
    this.view.btnCancelar.addEventListener('click', () => this.view.cerrarFormulario());

    this.view.obtenerHTML().addEventListener('submit', (event) => {
      event.preventDefault();
      try {
        this.guardar();
      } catch (error) {
        this.view.mensaje((error as Error).message, 'danger');
      }
    });

    this.view.tablaSalida.addEventListener('click', (event) => {
      const element = event.target as HTMLElement;
      if (element.nodeName !== 'BUTTON') return;

      const id = Number(element.dataset.id ?? 0);
      const type = element.dataset.type;

      try {
        if (type === 'view') {
          const producto = this.model.buscar(id);
          if (producto) this.buscar(producto);
        }

        if (type === 'delete') {
          this.eliminar(id);
        }

        if (type === 'active') {
          this.alternarActivo(id);
        }
      } catch (error) {
        this.view.mensaje((error as Error).message, 'danger');
      }
    });
  }
}
