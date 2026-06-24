import { MProducto } from '../models/MProducto';
import { MPedido } from '../models/MPedido';
import { MDetallePedido } from '../models/MDetallePedido';
import { MReporte } from '../models/MReporte';
import { VReporte } from '../view/VReporte';

export class CReporte {
  private reporte: MReporte;
  private productoModel: MProducto;
  private pedidoModel: MPedido;
  private detalleModel: MDetallePedido;
  private view: VReporte;

  constructor() {
    this.reporte = new MReporte();
    this.productoModel = new MProducto();
    this.pedidoModel = new MPedido();
    this.detalleModel = new MDetallePedido();
    this.view = new VReporte();
    this.iniciarEscucha();
  }

  crear(): HTMLElement {
    this.view.cargarProductos(this.productoModel.listar());
    this.view.cargarClientes(this.pedidoModel.listarClientes());
    return this.view.obtenerHTML();
  }

  consultarVentas(): void {
    if (this.detalleModel.listar().length === 0) {
      this.view.mostrarReporte({
        total_pedidos: 0,
        total_vendido: 0,
        producto_mas_vendido: '',
        productos: [],
        mensaje: 'Todavia no existen detalles de pedidos para generar reportes.',
      });
      return;
    }

    const reporte = this.reporte.generar(this.view.obtenerFiltro());
    this.view.mostrarReporte(reporte);
  }

  private iniciarEscucha(): void {
    this.view.btnLimpiar.addEventListener('click', () => this.view.limpiar());

    this.view.btnConsultar.addEventListener('click', () => {
      try {
        this.consultarVentas();
      } catch (error) {
        this.view.mensaje((error as Error).message, 'danger');
      }
    });
  }
}
