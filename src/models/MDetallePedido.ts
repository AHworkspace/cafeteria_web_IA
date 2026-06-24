import type { DetallePedido } from '../interfaces/system';
import { DatabaseJson } from '../utils/DatabaseJson';

export class MDetallePedido {
  private database: DatabaseJson<DetallePedido>;
  private id: number;
  private pedidoId: number;
  private productoId: number;
  private cantidad: number;
  private precioUnitario: number;
  private observacion: string;

  constructor() {
    this.database = new DatabaseJson<DetallePedido>('detalle_pedidos', 'id');
    this.id = 0;
    this.pedidoId = 0;
    this.productoId = 0;
    this.cantidad = 0;
    this.precioUnitario = 0;
    this.observacion = '';
  }

  guardar(detalle: {
    pedido_id: number;
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    observacion: string;
  }): DetallePedido {
    this.id = 0;
    this.pedidoId = detalle.pedido_id;
    this.productoId = detalle.producto_id;
    this.cantidad = detalle.cantidad;
    this.precioUnitario = detalle.precio_unitario;
    this.observacion = detalle.observacion;

    const guardado = this.database.guardar({
      id: this.id,
      pedido_id: this.pedidoId,
      producto_id: this.productoId,
      cantidad: this.cantidad,
      precio_unitario: this.precioUnitario,
      observacion: this.observacion,
    });
    this.id = guardado.id;
    return guardado;
  }

  listar(): DetallePedido[] {
    return this.database.listar();
  }

  listarPorPedido(pedidoId: number): DetallePedido[] {
    return this.listar().filter((detalle) => detalle.pedido_id === pedidoId);
  }

  productoEstaUsado(productoId: number): boolean {
    return this.listar().some((detalle) => detalle.producto_id === productoId);
  }
}
