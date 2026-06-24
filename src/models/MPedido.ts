import type {
  ConfirmacionPedido,
  EstadoPedido,
  PedidoRegistro,
} from '../interfaces/system';
import { DatabaseJson } from '../utils/DatabaseJson';

export class MPedido {
  private database: DatabaseJson<PedidoRegistro>;
  private id: number;
  private usuarioId: number;
  private cliente: string;
  private estado: EstadoPedido;
  private confirmacion: ConfirmacionPedido;
  private fechaCreacion: string;

  constructor() {
    this.database = new DatabaseJson<PedidoRegistro>('pedidos', 'id');
    this.id = 0;
    this.usuarioId = 0;
    this.cliente = '';
    this.estado = 'pendiente';
    this.confirmacion = 'aceptado';
    this.fechaCreacion = '';
  }

  establecerDatos(
    cliente: string,
    usuarioId = 0,
    confirmacion: ConfirmacionPedido = 'aceptado',
  ): void {
    this.cliente = cliente.trim();
    this.usuarioId = usuarioId;
    this.confirmacion = confirmacion;
  }

  listar(): PedidoRegistro[] {
    return this.listarRegistros().sort((a, b) => b.id - a.id);
  }

  listarRegistros(): PedidoRegistro[] {
    return this.database.listar().map((pedido) => this.normalizar(pedido));
  }

  listarClientes(): string[] {
    const clientes = this.database.listar().map((pedido) => pedido.cliente.trim());
    return [...new Set(clientes)]
      .filter((cliente) => cliente !== '')
      .sort((a, b) => a.localeCompare(b, 'es'));
  }

  guardar(): PedidoRegistro {
    this.validar();
    this.estado = 'pendiente';
    this.fechaCreacion = new Date().toISOString();
    const pedido = this.database.guardar({
      id: 0,
      usuario_id: this.usuarioId,
      cliente: this.cliente,
      estado: this.estado,
      confirmacion: this.confirmacion,
      fecha_creacion: this.fechaCreacion,
    });
    this.id = pedido.id;
    return pedido;
  }

  buscar(id: number): PedidoRegistro {
    const pedido = this.database.buscar(id);
    if (!pedido) throw new Error('El pedido no existe.');
    return this.normalizar(pedido);
  }

  actualizarEstado(id: number, estado: EstadoPedido): string {
    const pedido = this.database.buscar(id);
    if (!pedido) throw new Error('El pedido no existe.');

    this.id = pedido.id;
    this.usuarioId = pedido.usuario_id ?? 0;
    this.cliente = pedido.cliente;
    this.estado = estado;
    this.confirmacion = pedido.confirmacion ?? 'aceptado';
    this.fechaCreacion = pedido.fecha_creacion;
    this.database.actualizar({
      ...pedido,
      id: this.id,
      estado,
    });
    return 'Estado actualizado correctamente.';
  }

  actualizarConfirmacion(id: number, confirmacion: ConfirmacionPedido): string {
    const pedido = this.database.buscar(id);
    if (!pedido) throw new Error('El pedido no existe.');

    this.database.actualizar({
      ...pedido,
      usuario_id: pedido.usuario_id ?? 0,
      confirmacion,
    });

    return confirmacion === 'aceptado'
      ? 'Pedido aceptado correctamente.'
      : 'Pedido rechazado correctamente.';
  }

  asociarClienteRegistrado(usuarioId: number, nombreCliente: string): number {
    const nombreNormalizado = this.normalizarTexto(nombreCliente);
    if (usuarioId <= 0 || nombreNormalizado === '') return 0;

    const pedidos = this.database.listar();
    let totalAsociados = 0;

    pedidos.forEach((pedido) => {
      const pedidoNormalizado = this.normalizar(pedido);
      const mismoNombre = this.normalizarTexto(pedidoNormalizado.cliente) === nombreNormalizado;
      const sinUsuario = pedidoNormalizado.usuario_id === 0;

      if (mismoNombre && sinUsuario) {
        this.database.actualizar({
          ...pedidoNormalizado,
          usuario_id: usuarioId,
          cliente: nombreCliente.trim(),
        });
        totalAsociados += 1;
      }
    });

    return totalAsociados;
  }

  private validar(): void {
    if (this.cliente === '') throw new Error('Ingrese el nombre del cliente.');
  }

  private normalizar(pedido: PedidoRegistro): PedidoRegistro {
    return {
      ...pedido,
      usuario_id: Number(pedido.usuario_id ?? 0),
      confirmacion: pedido.confirmacion ?? 'aceptado',
    };
  }

  private normalizarTexto(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ');
  }
}
