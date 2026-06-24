import type {
  DetallePedido,
  FiltroReporte,
  PedidoRegistro,
  Producto,
  ProductoVendido,
  ReporteVentas as ResultadoReporteVentas,
} from '../interfaces/system';
import { DatabaseJson } from '../utils/DatabaseJson';

export class MReporte {
  private pedidoDatabase: DatabaseJson<PedidoRegistro>;
  private detalleDatabase: DatabaseJson<DetallePedido>;
  private productoDatabase: DatabaseJson<Producto>;
  private totalPedidos: number;
  private totalVendido: number;
  private productoMasVendido: string;
  private productos: ProductoVendido[];
  private mensaje: string;

  constructor() {
    this.pedidoDatabase = new DatabaseJson<PedidoRegistro>('pedidos', 'id');
    this.detalleDatabase = new DatabaseJson<DetallePedido>('detalle_pedidos', 'id');
    this.productoDatabase = new DatabaseJson<Producto>('productos', 'id');
    this.totalPedidos = 0;
    this.totalVendido = 0;
    this.productoMasVendido = '';
    this.productos = [];
    this.mensaje = '';
  }

  generar(filtro: FiltroReporte): ResultadoReporteVentas {
    const pedidosEntregados = this.pedidoDatabase.listar().filter((pedido) => {
      if (pedido.estado !== 'entregado') return false;
      if ((pedido.confirmacion ?? 'aceptado') !== 'aceptado') return false;
      if (filtro.fechaDesde && pedido.fecha_creacion.slice(0, 10) < filtro.fechaDesde) return false;
      if (filtro.fechaHasta && pedido.fecha_creacion.slice(0, 10) > filtro.fechaHasta) return false;
      return !filtro.cliente
        || pedido.cliente.localeCompare(filtro.cliente, 'es', { sensitivity: 'accent' }) === 0;
    });

    const pedidosIds = new Set(pedidosEntregados.map((pedido) => pedido.id));
    const detalles = this.detalleDatabase.listar().filter((detalle) => (
      pedidosIds.has(detalle.pedido_id)
      && (filtro.productoId === 0 || detalle.producto_id === filtro.productoId)
    ));
    const idsConVentas = new Set(detalles.map((detalle) => detalle.pedido_id));
    const productos = new Map(
      this.productoDatabase.listar().map((producto) => [producto.id, producto]),
    );
    const resumen = new Map<number, ProductoVendido>();

    detalles.forEach((detalle) => {
      const producto = productos.get(detalle.producto_id);
      if (!producto) return;

      const actual = resumen.get(producto.id) ?? {
        nombre: producto.nombre,
        cantidad_vendida: 0,
        subtotal: 0,
      };
      actual.cantidad_vendida += detalle.cantidad;
      actual.subtotal += detalle.cantidad * detalle.precio_unitario;
      resumen.set(producto.id, actual);
    });

    this.productos = [...resumen.values()]
      .sort((a, b) => b.cantidad_vendida - a.cantidad_vendida);
    this.totalPedidos = idsConVentas.size;
    this.totalVendido = this.productos.reduce((suma, item) => suma + item.subtotal, 0);
    this.productoMasVendido = this.productos[0]?.nombre ?? '';
    this.mensaje = this.productos.length > 0
      ? 'Reporte generado correctamente.'
      : 'No hay ventas entregadas para los filtros seleccionados.';

    return {
      total_pedidos: this.totalPedidos,
      total_vendido: this.totalVendido,
      producto_mas_vendido: this.productoMasVendido,
      productos: this.productos,
      mensaje: this.mensaje,
    };
  }
}
