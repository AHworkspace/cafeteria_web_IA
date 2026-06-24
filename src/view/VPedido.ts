import type { DetallesPedidoEntrada, Pedido, Producto, Usuario } from '../interfaces/system';

export class VPedido {
  private component: HTMLElement;
  private mensajeSalida: HTMLDivElement;
  private vistaLista: HTMLElement;
  private vistaFormulario: HTMLElement;
  private selectUsuarioCliente: HTMLSelectElement;
  private inputCliente: HTMLInputElement;
  private productosContenedor: HTMLDivElement;
  public btnNuevo: HTMLButtonElement;
  public btnCancelar: HTMLButtonElement;
  public tablaSalida: HTMLTableElement;

  constructor() {
    this.component = document.createElement('section');
    this.component.className = 'panel';
    this.component.innerHTML = this.plantilla();
    this.mensajeSalida = this.component.querySelector('#pedidoMensaje') as HTMLDivElement;
    this.vistaLista = this.component.querySelector('#pedidoVistaLista') as HTMLElement;
    this.vistaFormulario = this.component.querySelector('#pedidoVistaFormulario') as HTMLElement;
    this.selectUsuarioCliente = this.component.querySelector('#pedidoUsuarioCliente') as HTMLSelectElement;
    this.inputCliente = this.component.querySelector('#pedidoCliente') as HTMLInputElement;
    this.productosContenedor = this.component.querySelector('#pedidoProductos') as HTMLDivElement;
    this.btnNuevo = this.component.querySelector('#pedidoNuevo') as HTMLButtonElement;
    this.btnCancelar = this.component.querySelector('#pedidoCancelar') as HTMLButtonElement;
    this.tablaSalida = this.component.querySelector('#pedidoTabla') as HTMLTableElement;
  }

  obtenerHTML(): HTMLElement {
    return this.component;
  }

  listar(pedidos: Pedido[]): void {
    const tbody = this.tablaSalida.querySelector('tbody') as HTMLTableSectionElement;
    tbody.innerHTML = pedidos.map((pedido) => `
      <tr>
        <td>#${pedido.id}</td>
        <td>${this.escapar(pedido.cliente)}</td>
        <td>${this.escapar(pedido.productos)}</td>
        <td>S/ ${Number(pedido.total).toFixed(2)}</td>
        <td>${this.fecha(pedido.fecha_creacion)}</td>
        <td><span class="badge ${pedido.confirmacion}">${this.confirmacionTexto(pedido.confirmacion)}</span></td>
        <td><span class="badge ${pedido.estado}">${this.estadoTexto(pedido.estado)}</span></td>
        <td>${this.acciones(pedido)}</td>
      </tr>
    `).join('');
  }

  cargarProductos(productos: Producto[]): void {
    if (productos.length === 0) {
      this.productosContenedor.innerHTML = `
        <div class="empty-box">No hay productos activos. Primero registra o activa productos.</div>
      `;
      return;
    }

    this.productosContenedor.innerHTML = productos.map((producto) => `
      <label class="product-row">
        <span>
          <strong>${this.escapar(producto.nombre)}</strong>
          <small>S/ ${Number(producto.precio).toFixed(2)}</small>
        </span>
        <input type="number" min="0" value="0" aria-label="Cantidad" data-product-id="${producto.id}">
        <input
          class="product-observation"
          type="text"
          maxlength="200"
          placeholder="Observacion opcional"
          aria-label="Observacion para ${this.escapar(producto.nombre)}"
          data-observation-id="${producto.id}"
        >
      </label>
    `).join('');
  }

  cargarClientesRegistrados(clientes: Usuario[]): void {
    this.selectUsuarioCliente.innerHTML = [
      '<option value="0">Sin cliente registrado</option>',
      ...clientes.map((cliente) => (
        `<option value="${cliente.id}">${this.escapar(cliente.nombre)} - ${this.escapar(cliente.correo)}</option>`
      )),
    ].join('');
  }

  crear(): void {
    this.vistaLista.hidden = true;
    this.vistaFormulario.hidden = false;
    this.limpiarFormulario();
  }

  obtenerDatos(): { usuarioId: number; cliente: string; detalles: DetallesPedidoEntrada } {
    const detalles: DetallesPedidoEntrada = {};
    const inputs = this.productosContenedor.querySelectorAll<HTMLInputElement>('[data-product-id]');
    inputs.forEach((input) => {
      const productoId = Number(input.dataset.productId);
      const cantidad = Number(input.value);
      if (productoId > 0 && cantidad > 0) {
        const observacionInput = this.productosContenedor.querySelector<HTMLInputElement>(
          `[data-observation-id="${productoId}"]`,
        );
        detalles[productoId] = {
          cantidad,
          observacion: observacionInput?.value.trim() ?? '',
        };
      }
    });

    return {
      usuarioId: Number(this.selectUsuarioCliente.value || 0),
      cliente: this.inputCliente.value.trim(),
      detalles,
    };
  }

  limpiarFormulario(): void {
    this.selectUsuarioCliente.value = '0';
    this.inputCliente.value = '';
    this.productosContenedor.querySelectorAll<HTMLInputElement>('[data-product-id]').forEach((input) => {
      input.value = '0';
    });
    this.productosContenedor.querySelectorAll<HTMLInputElement>('[data-observation-id]').forEach((input) => {
      input.value = '';
    });
  }

  cerrarFormulario(): void {
    this.limpiarFormulario();
    this.vistaFormulario.hidden = true;
    this.vistaLista.hidden = false;
  }

  mensaje(texto: string, tipo: 'success' | 'danger' = 'success'): void {
    this.mensajeSalida.className = `alert ${tipo}`;
    this.mensajeSalida.textContent = texto;
    this.mensajeSalida.hidden = false;
  }

  private acciones(pedido: Pedido): string {
    if (pedido.estado === 'cancelado') {
      return '<span class="muted">Cancelado</span>';
    }

    if (pedido.estado === 'entregado') {
      return '<span class="muted">Sin acciones</span>';
    }

    if (pedido.confirmacion === 'en_espera') {
      return `
        <div class="row-actions">
          <button class="button small success-button" type="button" data-type="accept" data-id="${pedido.id}">Aceptar</button>
          <button class="button small danger-button" type="button" data-type="reject" data-id="${pedido.id}">Rechazar</button>
        </div>
      `;
    }

    if (pedido.confirmacion === 'rechazado') {
      return '<span class="muted">Pedido rechazado</span>';
    }

    if (pedido.estado === 'pendiente') {
      return `
        <div class="row-actions">
          <button class="button small" type="button" data-type="iniciarPreparacion" data-id="${pedido.id}">Iniciar preparacion</button>
          <button class="button small danger-button" type="button" data-type="cancel" data-id="${pedido.id}">Cancelar</button>
        </div>
      `;
    }

    if (pedido.estado === 'preparando') {
      return `
        <div class="row-actions">
          <button class="button small" type="button" data-type="marcarEntregado" data-id="${pedido.id}">Marcar entregado</button>
          <button class="button small danger-button" type="button" data-type="cancel" data-id="${pedido.id}">Cancelar</button>
        </div>
      `;
    }

    return '<span class="muted">Sin acciones</span>';
  }

  private plantilla(): string {
    return `
      <div id="pedidoMensaje" hidden></div>
      <div id="pedidoVistaLista">
        <div class="panel-header">
          <div>
            <h2>Lista de pedidos</h2>
          </div>
          <button class="button" id="pedidoNuevo" type="button">Nuevo pedido</button>
        </div>
        <div class="table-wrap">
          <table class="orders-table" id="pedidoTabla">
            <thead>
              <tr>
                <th class="col-id">Pedido</th>
                <th class="col-client">Cliente</th>
                <th class="col-products">Productos</th>
                <th class="col-total">Total</th>
                <th class="col-date">Fecha</th>
                <th class="col-confirmation">Confirmacion</th>
                <th class="col-status">Estado</th>
                <th class="col-actions">Accion</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
      <div id="pedidoVistaFormulario" hidden>
        <div class="panel-header">
          <div>
            <h2>Registrar pedido</h2>
            <p>El pedido se creara automaticamente en estado pendiente.</p>
          </div>
        </div>
        <form class="order-form" id="pedidoForm">
          <label class="field">
            <span>Cliente registrado</span>
            <select id="pedidoUsuarioCliente"></select>
          </label>
          <label class="field">
            <span>Nombre del cliente no registrado</span>
            <input type="text" id="pedidoCliente" placeholder="Llenar solo si no selecciona cliente registrado">
          </label>
          <div class="products">
            <h3>Productos activos</h3>
            <div id="pedidoProductos"></div>
          </div>
          <div class="actions">
            <button class="button secondary" id="pedidoCancelar" type="button">Cancelar</button>
            <button class="button" type="submit">Guardar pedido</button>
          </div>
        </form>
      </div>
    `;
  }

  private estadoTexto(estado: string): string {
    const textos: Record<string, string> = {
      pendiente: 'Pendiente',
      preparando: 'Preparando',
      entregado: 'Entregado',
      cancelado: 'Cancelado',
    };
    return textos[estado] ?? estado;
  }

  private confirmacionTexto(confirmacion: string): string {
    const textos: Record<string, string> = {
      en_espera: 'En espera',
      aceptado: 'Aceptado',
      rechazado: 'Rechazado',
    };
    return textos[confirmacion] ?? confirmacion;
  }

  private fecha(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
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
