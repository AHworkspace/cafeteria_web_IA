export type DisponibilidadProducto = 'activo' | 'no_activo';
export type EstadoPedido = 'pendiente' | 'preparando' | 'entregado' | 'cancelado';
export type ConfirmacionPedido = 'en_espera' | 'aceptado' | 'rechazado';
export type RolUsuario = 'cliente' | 'vendedor' | 'administrador';
export type IntencionIA =
  | 'menu'
  | 'precio'
  | 'recomendacion'
  | 'pedido'
  | 'saludo'
  | 'total_pedido'
  | 'quitar_producto'
  | 'modificar_pedido'
  | 'confirmar_pedido'
  | 'cancelar_borrador';

export interface Usuario extends Record<string, unknown> {
  id: number;
  nombre: string;
  correo: string;
  password: string;
  rol: RolUsuario;
}

export interface EntrenamientoIA extends Record<string, unknown> {
  id: number;
  texto: string;
  intencion: IntencionIA;
}

export interface Producto extends Record<string, unknown> {
  id: number;
  nombre: string;
  precio: number;
  disponibilidad: DisponibilidadProducto;
}

export interface PedidoRegistro extends Record<string, unknown> {
  id: number;
  usuario_id: number;
  cliente: string;
  estado: EstadoPedido;
  confirmacion: ConfirmacionPedido;
  fecha_creacion: string;
}

export interface DetallePedido extends Record<string, unknown> {
  id: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  observacion: string;
}

export interface Pedido {
  id: number;
  usuario_id: number;
  cliente: string;
  estado: EstadoPedido;
  confirmacion: ConfirmacionPedido;
  fecha_creacion: string;
  productos: string;
  total: number;
}

export interface DetallePedidoEntrada {
  cantidad: number;
  observacion: string;
}

export type DetallesPedidoEntrada = Record<number, DetallePedidoEntrada>;

export interface FiltroReporte {
  fechaDesde: string;
  fechaHasta: string;
  productoId: number;
  cliente: string;
}

export interface ProductoVendido {
  nombre: string;
  cantidad_vendida: number;
  subtotal: number;
}

export interface ReporteVentas {
  total_pedidos: number;
  total_vendido: number;
  producto_mas_vendido: string;
  productos: ProductoVendido[];
  mensaje: string;
}
