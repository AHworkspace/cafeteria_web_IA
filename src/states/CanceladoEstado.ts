import type { CPedido } from '../Controllers/CPedido';
import type { PedidoEstado } from './PedidoEstado';

export class CanceladoEstado implements PedidoEstado {
  private pedido: CPedido | null = null;

  establecerPedido(pedido: CPedido): void {
    this.pedido = pedido;
  }

  iniciarPreparacion(): void {
    this.obtenerPedido();
    throw new Error('El pedido esta cancelado.');
  }

  marcarEntregado(): void {
    this.obtenerPedido();
    throw new Error('El pedido esta cancelado.');
  }

  cancelar(): void {
    this.obtenerPedido();
    throw new Error('El pedido ya esta cancelado.');
  }

  nombre(): 'cancelado' {
    return 'cancelado';
  }

  private obtenerPedido(): CPedido {
    if (!this.pedido) throw new Error('El estado no tiene un pedido asignado.');
    return this.pedido;
  }
}
