import type { CPedido } from '../Controllers/CPedido';
import type { PedidoEstado } from './PedidoEstado';
import { CanceladoEstado } from './CanceladoEstado';
import { PreparandoEstado } from './PreparandoEstado';

export class PendienteEstado implements PedidoEstado {
  private pedido: CPedido | null = null;

  establecerPedido(pedido: CPedido): void {
    this.pedido = pedido;
  }

  iniciarPreparacion(): void {
    this.obtenerPedido().cambiarEstado(new PreparandoEstado());
  }

  marcarEntregado(): void {
    throw new Error('Primero debe iniciar la preparacion del pedido.');
  }

  cancelar(): void {
    this.obtenerPedido().cambiarEstado(new CanceladoEstado());
  }

  nombre(): 'pendiente' {
    return 'pendiente';
  }

  private obtenerPedido(): CPedido {
    if (!this.pedido) throw new Error('El estado no tiene un pedido asignado.');
    return this.pedido;
  }
}
