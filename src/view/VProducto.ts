import type { Producto } from '../interfaces/system';

export class VProducto {
  private component: HTMLElement;
  private mensajeSalida: HTMLDivElement;
  private vistaLista: HTMLElement;
  private vistaFormulario: HTMLElement;
  private inputId: HTMLInputElement;
  private inputNombre: HTMLInputElement;
  private inputPrecio: HTMLInputElement;
  private btnGuardar: HTMLButtonElement;
  public btnCancelar: HTMLButtonElement;
  public btnNuevo: HTMLButtonElement;
  public tablaSalida: HTMLTableElement;

  constructor() {
    this.component = document.createElement('section');
    this.component.className = 'panel';
    this.component.innerHTML = this.plantilla();
    this.mensajeSalida = this.component.querySelector('#productoMensaje') as HTMLDivElement;
    this.vistaLista = this.component.querySelector('#productoVistaLista') as HTMLElement;
    this.vistaFormulario = this.component.querySelector('#productoVistaFormulario') as HTMLElement;
    this.inputId = this.component.querySelector('#productoId') as HTMLInputElement;
    this.inputNombre = this.component.querySelector('#productoNombre') as HTMLInputElement;
    this.inputPrecio = this.component.querySelector('#productoPrecio') as HTMLInputElement;
    this.btnGuardar = this.component.querySelector('#productoGuardar') as HTMLButtonElement;
    this.btnCancelar = this.component.querySelector('#productoCancelar') as HTMLButtonElement;
    this.btnNuevo = this.component.querySelector('#productoNuevo') as HTMLButtonElement;
    this.tablaSalida = this.component.querySelector('#productoTabla') as HTMLTableElement;
  }

  obtenerHTML(): HTMLElement {
    return this.component;
  }

  obtenerDatos(): { id: number; nombre: string; precio: number } {
    return {
      id: Number(this.inputId.value || 0),
      nombre: this.inputNombre.value.trim(),
      precio: Number(this.inputPrecio.value || 0),
    };
  }

  crear(): void {
    this.mostrarFormulario();
    this.inputId.value = '';
    this.inputNombre.value = '';
    this.inputPrecio.value = '';
    this.btnGuardar.textContent = 'Guardar producto';
  }

  buscar(producto: Producto): void {
    this.mostrarFormulario();
    this.inputId.value = String(producto.id);
    this.inputNombre.value = producto.nombre;
    this.inputPrecio.value = String(producto.precio);
    this.btnGuardar.textContent = 'Actualizar producto';
  }

  cerrarFormulario(): void {
    this.inputId.value = '';
    this.inputNombre.value = '';
    this.inputPrecio.value = '';
    this.btnGuardar.textContent = 'Guardar producto';
    this.vistaFormulario.hidden = true;
    this.vistaLista.hidden = false;
  }

  listar(productos: Producto[]): void {
    const tbody = this.tablaSalida.querySelector('tbody') as HTMLTableSectionElement;
    tbody.innerHTML = productos.map((producto) => `
      <tr>
        <td>#${producto.id}</td>
        <td>${this.escapar(producto.nombre)}</td>
        <td>S/ ${Number(producto.precio).toFixed(2)}</td>
        <td>
          <div class="row-actions">
            <button class="button small secondary" type="button" data-type="view" data-id="${producto.id}">Editar</button>
            <button class="button small ${producto.disponibilidad === 'activo' ? 'success-button' : 'warning-button'}" type="button" data-type="active" data-id="${producto.id}">
              ${producto.disponibilidad === 'activo' ? 'Activo' : 'No activo'}
            </button>
            <button class="button small danger-button" type="button" data-type="delete" data-id="${producto.id}">Eliminar</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  mensaje(texto: string, tipo: 'success' | 'danger' = 'success'): void {
    this.mensajeSalida.className = `alert ${tipo}`;
    this.mensajeSalida.textContent = texto;
    this.mensajeSalida.hidden = false;
  }

  private plantilla(): string {
    return `
      <div id="productoMensaje" hidden></div>
      <div id="productoVistaLista">
        <div class="panel-header">
          <div>
            <h2>Productos</h2>
          </div>
          <button class="button" id="productoNuevo" type="button">Nuevo producto</button>
        </div>
        <div class="table-wrap">
          <table id="productoTabla">
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
      <div id="productoVistaFormulario" hidden>
        <div class="panel-header">
          <div>
            <h2>Registrar producto</h2>
            <p>Completa los datos del producto.</p>
          </div>
        </div>
        <form class="order-form" id="productoForm">
          <input type="hidden" id="productoId">
          <label class="field">
            <span>Nombre del producto</span>
            <input type="text" id="productoNombre" placeholder="Ejemplo: Te helado">
          </label>
          <label class="field">
            <span>Precio</span>
            <input type="number" id="productoPrecio" min="0.10" step="0.10" placeholder="Ejemplo: 6.50">
          </label>
          <div class="actions">
            <button class="button secondary" id="productoCancelar" type="button">Cancelar</button>
            <button class="button" id="productoGuardar" type="submit">Guardar producto</button>
          </div>
        </form>
      </div>
    `;
  }

  private mostrarFormulario(): void {
    this.vistaLista.hidden = true;
    this.vistaFormulario.hidden = false;
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
