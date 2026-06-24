import type { Producto, ReporteVentas } from '../interfaces/system';
import type { FiltroReporte } from '../interfaces/system';

export class VReporte {
  private component: HTMLElement;
  private mensajeSalida: HTMLDivElement;
  private campoFechaDesde: HTMLInputElement;
  private campoFechaHasta: HTMLInputElement;
  private campoProducto: HTMLSelectElement;
  private campoCliente: HTMLSelectElement;
  private totalPedidos: HTMLElement;
  private totalVendido: HTMLElement;
  private productoMasVendido: HTMLElement;
  private tablaSalida: HTMLTableElement;
  public btnConsultar: HTMLButtonElement;
  public btnLimpiar: HTMLButtonElement;

  constructor() {
    this.component = document.createElement('section');
    this.component.className = 'panel';
    this.component.innerHTML = this.plantilla();
    this.mensajeSalida = this.component.querySelector('#reporteMensaje') as HTMLDivElement;
    this.campoFechaDesde = this.component.querySelector('#reporteFechaDesde') as HTMLInputElement;
    this.campoFechaHasta = this.component.querySelector('#reporteFechaHasta') as HTMLInputElement;
    this.campoProducto = this.component.querySelector('#reporteProducto') as HTMLSelectElement;
    this.campoCliente = this.component.querySelector('#reporteCliente') as HTMLSelectElement;
    this.totalPedidos = this.component.querySelector('#reporteTotalPedidos') as HTMLElement;
    this.totalVendido = this.component.querySelector('#reporteTotalVendido') as HTMLElement;
    this.productoMasVendido = this.component.querySelector('#reporteProductoMasVendido') as HTMLElement;
    this.tablaSalida = this.component.querySelector('#reporteTabla') as HTMLTableElement;
    this.btnConsultar = this.component.querySelector('#reporteConsultar') as HTMLButtonElement;
    this.btnLimpiar = this.component.querySelector('#reporteLimpiar') as HTMLButtonElement;
  }

  obtenerHTML(): HTMLElement {
    return this.component;
  }

  cargarProductos(productos: Producto[]): void {
    this.campoProducto.innerHTML = [
      '<option value="0">Seleccione producto</option>',
      ...productos.map((producto) => (
        `<option value="${producto.id}">${this.escapar(producto.nombre)}</option>`
      )),
    ].join('');
  }

  cargarClientes(clientes: string[]): void {
    this.campoCliente.innerHTML = [
      '<option value="">Todos los clientes</option>',
      ...clientes.map((cliente) => (
        `<option value="${this.escapar(cliente)}">${this.escapar(cliente)}</option>`
      )),
    ].join('');
  }

  obtenerFiltro(): FiltroReporte {
    if (
      this.campoFechaDesde.value !== ''
      && this.campoFechaHasta.value !== ''
      && this.campoFechaDesde.value > this.campoFechaHasta.value
    ) {
      throw new Error('La fecha desde no puede ser posterior a la fecha hasta.');
    }

    return {
      fechaDesde: this.campoFechaDesde.value,
      fechaHasta: this.campoFechaHasta.value,
      productoId: Number(this.campoProducto.value || 0),
      cliente: this.campoCliente.value.trim(),
    };
  }

  mostrarReporte(reporte: ReporteVentas): void {
    this.totalPedidos.textContent = String(reporte.total_pedidos);
    this.totalVendido.textContent = `S/ ${Number(reporte.total_vendido).toFixed(2)}`;
    this.productoMasVendido.textContent = reporte.producto_mas_vendido || 'Sin ventas';

    const tbody = this.tablaSalida.querySelector('tbody') as HTMLTableSectionElement;
    tbody.innerHTML = reporte.productos.map((producto) => `
      <tr>
        <td>${this.escapar(producto.nombre)}</td>
        <td>${Number(producto.cantidad_vendida)}</td>
        <td>S/ ${Number(producto.subtotal).toFixed(2)}</td>
      </tr>
    `).join('');

    if (reporte.productos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="empty">No hay ventas entregadas para mostrar.</td></tr>';
    }

    this.mensaje(reporte.mensaje);
  }

  limpiar(): void {
    this.campoFechaDesde.value = '';
    this.campoFechaHasta.value = '';
    this.campoProducto.value = '0';
    this.campoCliente.value = '';
    this.totalPedidos.textContent = '0';
    this.totalVendido.textContent = 'S/ 0.00';
    this.productoMasVendido.textContent = 'Sin ventas';
    this.mensajeSalida.hidden = true;

    const tbody = this.tablaSalida.querySelector('tbody') as HTMLTableSectionElement;
    tbody.innerHTML = '<tr><td colspan="3" class="empty">Presiona Consultar reporte.</td></tr>';
  }

  mensaje(texto: string, tipo: 'success' | 'danger' = 'success'): void {
    this.mensajeSalida.className = `alert ${tipo}`;
    this.mensajeSalida.textContent = texto;
    this.mensajeSalida.hidden = false;
  }

  private plantilla(): string {
    return `
      <div class="panel-header">
        <div>
          <h2>Reporte de ventas</h2>
        </div>
        <button class="button" id="reporteConsultar" type="button">Consultar reporte</button>
      </div>
      <div id="reporteMensaje" hidden></div>
      <div class="filter-grid">
        <label class="field">
          <span>Fecha desde</span>
          <input type="date" id="reporteFechaDesde">
        </label>
        <label class="field">
          <span>Fecha hasta</span>
          <input type="date" id="reporteFechaHasta">
        </label>
        <label class="field">
          <span>Producto</span>
          <select id="reporteProducto"></select>
        </label>
        <label class="field">
          <span>Cliente</span>
          <select id="reporteCliente"></select>
        </label>
        <button class="button secondary filter-clear" id="reporteLimpiar" type="button">Limpiar</button>
      </div>
      <div class="report-summary">
        <div class="summary-item">
          <span>Pedidos entregados</span>
          <strong id="reporteTotalPedidos">0</strong>
        </div>
        <div class="summary-item">
          <span>Total vendido</span>
          <strong id="reporteTotalVendido">S/ 0.00</strong>
        </div>
        <div class="summary-item">
          <span>Producto mas vendido</span>
          <strong id="reporteProductoMasVendido">Sin ventas</strong>
        </div>
      </div>
      <div class="table-wrap">
        <table id="reporteTabla">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad vendida</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colspan="3" class="empty">Presiona Consultar reporte.</td></tr>
          </tbody>
        </table>
      </div>
    `;
  }

  private escapar(value: string): string {
    return value.replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }[char] as string));
  }
}
