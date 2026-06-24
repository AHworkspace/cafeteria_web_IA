import type { CPedido } from '../Controllers/CPedido';
import type { EstadoPedido } from '../interfaces/system';

export interface PedidoEstado {
  establecerPedido(pedido: CPedido): void;
  iniciarPreparacion(): void;
  marcarEntregado(): void;
  cancelar(): void;
  nombre(): EstadoPedido;
}
