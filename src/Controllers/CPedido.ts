import { MPedido } from '../models/MPedido';
import { MProducto } from '../models/MProducto';
import { MDetallePedido } from '../models/MDetallePedido';
import { MUsuario } from '../models/MUsuario';
import type {
  DetallesPedidoEntrada,
  EstadoPedido,
  Pedido,
} from '../interfaces/system';
import type { PedidoEstado } from '../states/PedidoEstado';
import { CanceladoEstado } from '../states/CanceladoEstado';
import { EntregadoEstado } from '../states/EntregadoEstado';
import { PendienteEstado } from '../states/PendienteEstado';
import { PreparandoEstado } from '../states/PreparandoEstado';
import { VPedido } from '../view/VPedido';

export class CPedido {
  private model: MPedido;
  private productoModel: MProducto;
  private detalleModel: MDetallePedido;
  private usuarioModel: MUsuario;
  private view: VPedido;
  private estadoActual: PedidoEstado;
  private pedidoSeleccionadoId: number;

  constructor() {
    this.model = new MPedido();
    this.productoModel = new MProducto();
    this.detalleModel = new MDetallePedido();
    this.usuarioModel = new MUsuario();
    this.view = new VPedido();
    this.estadoActual = new PendienteEstado();
    this.estadoActual.establecerPedido(this);
    this.pedidoSeleccionadoId = 0;
    this.iniciarEscucha();
  }

  crear(): HTMLElement {
    this.cargarFormulario();
    this.listar();
    return this.view.obtenerHTML();
  }

  cargarFormulario(): void {
    this.view.cargarProductos(this.productoModel.listarActivos());
    this.view.cargarClientesRegistrados(
      this.usuarioModel.listar().filter((usuario) => usuario.rol === 'cliente'),
    );
  }

  listar(): void {
    this.view.listar(this.obtenerPedidos());
  }

  guardar(): void {
    const data = this.view.obtenerDatos();
    const cliente = this.obtenerNombreCliente(data.usuarioId, data.cliente);
    this.validarPedido(cliente, data.detalles);

    const productos = new Map(
      this.productoModel.listarActivos().map((producto) => [producto.id, producto]),
    );
    const detallesPreparados = Object.entries(data.detalles).map(([idTexto, detalle]) => {
      const productoId = Number(idTexto);
      const producto = productos.get(productoId);
      if (!producto) {
        throw new Error('Uno de los productos seleccionados ya no esta activo.');
      }
      return { producto, detalle };
    });

    this.model.establecerDatos(cliente, data.usuarioId, 'aceptado');
    const pedido = this.model.guardar();
    detallesPreparados.forEach(({ producto, detalle }) => {
      this.detalleModel.guardar({
        pedido_id: pedido.id,
        producto_id: producto.id,
        cantidad: detalle.cantidad,
        precio_unitario: producto.precio,
        observacion: detalle.observacion.trim(),
      });
    });

    this.view.cerrarFormulario();
    this.cargarFormulario();
    this.listar();
    this.view.mensaje('Pedido registrado correctamente.');
  }

  iniciarPreparacion(id: number): void {
    this.validarPedidoAceptado(id);
    this.cargarEstadoActual(id);
    this.estadoActual.iniciarPreparacion();
    this.listar();
    this.view.mensaje('El pedido paso a preparacion.');
  }

  marcarEntregado(id: number): void {
    this.validarPedidoAceptado(id);
    this.cargarEstadoActual(id);
    this.estadoActual.marcarEntregado();
    this.listar();
    this.view.mensaje('El pedido fue marcado como entregado.');
  }

  cancelar(id: number): void {
    if (!confirm('Desea cancelar este pedido?')) return;
    this.validarPedidoAceptado(id);
    this.cargarEstadoActual(id);
    this.estadoActual.cancelar();
    this.listar();
    this.view.mensaje('Pedido cancelado correctamente.');
  }

  cambiarEstado(nuevoEstado: PedidoEstado): void {
    this.estadoActual = nuevoEstado;
    this.estadoActual.establecerPedido(this);
    this.model.actualizarEstado(this.pedidoSeleccionadoId, this.estadoActual.nombre());
  }

  aceptarPedidoCliente(id: number): void {
    const mensaje = this.model.actualizarConfirmacion(id, 'aceptado');
    this.listar();
    this.view.mensaje(mensaje);
  }

  rechazarPedidoCliente(id: number): void {
    if (!confirm('Desea rechazar este pedido?')) return;
    const mensaje = this.model.actualizarConfirmacion(id, 'rechazado');
    this.listar();
    this.view.mensaje(mensaje);
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
        if (type === 'iniciarPreparacion') {
          this.iniciarPreparacion(id);
        }

        if (type === 'marcarEntregado') {
          this.marcarEntregado(id);
        }

        if (type === 'cancel') {
          this.cancelar(id);
        }

        if (type === 'accept') {
          this.aceptarPedidoCliente(id);
        }

        if (type === 'reject') {
          this.rechazarPedidoCliente(id);
        }
      } catch (error) {
        this.view.mensaje((error as Error).message, 'danger');
      }
    });
  }

  private cargarEstadoActual(id: number): void {
    const pedido = this.model.buscar(id);
    this.pedidoSeleccionadoId = pedido.id;
    this.estadoActual = this.crearEstado(pedido.estado);
    this.estadoActual.establecerPedido(this);
  }

  private crearEstado(estado: EstadoPedido): PedidoEstado {
    const estados: Record<EstadoPedido, PedidoEstado> = {
      pendiente: new PendienteEstado(),
      preparando: new PreparandoEstado(),
      entregado: new EntregadoEstado(),
      cancelado: new CanceladoEstado(),
    };
    return estados[estado];
  }

  private obtenerPedidos(): Pedido[] {
    const productos = new Map(
      this.productoModel.listar().map((producto) => [producto.id, producto]),
    );

    return this.model.listar().map((pedido) => {
      const detalles = this.detalleModel.listarPorPedido(pedido.id);
      const productosTexto = detalles.map((detalle) => {
        const producto = productos.get(detalle.producto_id);
        const observacion = detalle.observacion ? ` (${detalle.observacion})` : '';
        return `${producto?.nombre ?? 'Producto eliminado'} x${detalle.cantidad}${observacion}`;
      }).join(', ');

      return {
        ...pedido,
        productos: productosTexto,
        total: detalles.reduce(
          (suma, detalle) => suma + detalle.cantidad * detalle.precio_unitario,
          0,
        ),
        confirmacion: pedido.confirmacion ?? 'aceptado',
        usuario_id: pedido.usuario_id ?? 0,
      };
    });
  }

  private validarPedido(cliente: string, detalles: DetallesPedidoEntrada): void {
    if (cliente.trim() === '') throw new Error('Ingrese el nombre del cliente.');

    const valores = Object.values(detalles);
    if (valores.length === 0) throw new Error('Seleccione al menos un producto.');
    if (valores.some((detalle) => !Number.isInteger(detalle.cantidad) || detalle.cantidad <= 0)) {
      throw new Error('Las cantidades deben ser numeros enteros mayores que cero.');
    }
  }

  private obtenerNombreCliente(usuarioId: number, nombreManual: string): string {
    if (usuarioId > 0) {
      const usuario = this.usuarioModel.buscar(usuarioId);
      if (!usuario || usuario.rol !== 'cliente') {
        throw new Error('Seleccione un cliente registrado valido.');
      }
      return usuario.nombre;
    }

    return nombreManual.trim();
  }

  private validarPedidoAceptado(id: number): void {
    const pedido = this.model.buscar(id);
    if (pedido.confirmacion !== 'aceptado') {
      throw new Error('Primero debe aceptar el pedido del cliente.');
    }
  }
}
