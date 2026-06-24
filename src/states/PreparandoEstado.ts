import type { CPedido } from '../Controllers/CPedido';
import type { PedidoEstado } from './PedidoEstado';
import { CanceladoEstado } from './CanceladoEstado';
import { EntregadoEstado } from './EntregadoEstado';

export class PreparandoEstado implements PedidoEstado {
  private pedido: CPedido | null = null;

  establecerPedido(pedido: CPedido): void {
    this.pedido = pedido;
  }

  iniciarPreparacion(): void {
    throw new Error('El pedido ya esta en preparacion.');
  }

  marcarEntregado(): void {
    this.obtenerPedido().cambiarEstado(new EntregadoEstado());
  }

  cancelar(): void {
    this.obtenerPedido().cambiarEstado(new CanceladoEstado());
  }

  nombre(): 'preparando' {
    return 'preparando';
  }

  private obtenerPedido(): CPedido {
    if (!this.pedido) throw new Error('El estado no tiene un pedido asignado.');
    return this.pedido;
  }
}
