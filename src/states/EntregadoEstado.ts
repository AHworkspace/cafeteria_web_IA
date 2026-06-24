import type { CPedido } from '../Controllers/CPedido';
import type { PedidoEstado } from './PedidoEstado';

export class EntregadoEstado implements PedidoEstado {
  private pedido: CPedido | null = null;

  establecerPedido(pedido: CPedido): void {
    this.pedido = pedido;
  }

  iniciarPreparacion(): void {
    this.obtenerPedido();
    throw new Error('El pedido ya fue entregado.');
  }

  marcarEntregado(): void {
    this.obtenerPedido();
    throw new Error('El pedido ya fue entregado.');
  }

  cancelar(): void {
    this.obtenerPedido();
    throw new Error('Un pedido entregado no se puede cancelar.');
  }

  nombre(): 'entregado' {
    return 'entregado';
  }

  private obtenerPedido(): CPedido {
    if (!this.pedido) throw new Error('El estado no tiene un pedido asignado.');
    return this.pedido;
  }
}
