import type { RolUsuario, Usuario } from '../interfaces/system';

export class VUsuario {
  private component: HTMLElement;
  private mensajeSalida: HTMLDivElement;
  private vistaLista: HTMLElement;
  private vistaFormulario: HTMLElement;
  private inputNombre: HTMLInputElement;
  private inputId: HTMLInputElement;
  private inputCorreo: HTMLInputElement;
  private inputPassword: HTMLInputElement;
  private inputRol: HTMLSelectElement;
  public btnNuevo: HTMLButtonElement;
  public btnCancelar: HTMLButtonElement;
  public tablaSalida: HTMLTableElement;

  constructor() {
    this.component = document.createElement('section');
    this.component.className = 'panel';
    this.component.innerHTML = this.plantilla();
    this.mensajeSalida = this.component.querySelector('#usuarioMensaje') as HTMLDivElement;
    this.vistaLista = this.component.querySelector('#usuarioVistaLista') as HTMLElement;
    this.vistaFormulario = this.component.querySelector('#usuarioVistaFormulario') as HTMLElement;
    this.inputId = this.component.querySelector('#usuarioId') as HTMLInputElement;
    this.inputNombre = this.component.querySelector('#usuarioNombre') as HTMLInputElement;
    this.inputCorreo = this.component.querySelector('#usuarioCorreo') as HTMLInputElement;
    this.inputPassword = this.component.querySelector('#usuarioPassword') as HTMLInputElement;
    this.inputRol = this.component.querySelector('#usuarioRol') as HTMLSelectElement;
    this.btnNuevo = this.component.querySelector('#usuarioNuevo') as HTMLButtonElement;
    this.btnCancelar = this.component.querySelector('#usuarioCancelar') as HTMLButtonElement;
    this.tablaSalida = this.component.querySelector('#usuarioTabla') as HTMLTableElement;
  }

  obtenerHTML(): HTMLElement {
    return this.component;
  }

  listar(usuarios: Usuario[]): void {
    const tbody = this.tablaSalida.querySelector('tbody') as HTMLTableSectionElement;
    tbody.innerHTML = usuarios.map((usuario) => `
      <tr>
        <td>#${usuario.id}</td>
        <td>${this.escapar(usuario.nombre)}</td>
        <td>${this.escapar(usuario.correo)}</td>
        <td><span class="badge ${usuario.rol}">${this.rolTexto(usuario.rol)}</span></td>
        <td>
          <div class="row-actions">
            <button class="button small secondary" type="button" data-type="view" data-id="${usuario.id}">Editar</button>
            ${usuario.rol === 'cliente'
              ? `<button class="button small" type="button" data-type="associate" data-id="${usuario.id}">Asociar pedidos</button>`
              : ''}
            <button class="button small danger-button" type="button" data-type="delete" data-id="${usuario.id}">Eliminar</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  crear(): void {
    this.limpiar();
    this.vistaLista.hidden = true;
    this.vistaFormulario.hidden = false;
  }

  buscar(usuario: Usuario): void {
    this.vistaLista.hidden = true;
    this.vistaFormulario.hidden = false;
    this.inputId.value = String(usuario.id);
    this.inputNombre.value = usuario.nombre;
    this.inputCorreo.value = usuario.correo;
    this.inputPassword.value = usuario.password;
    this.inputRol.value = usuario.rol;
    this.inputRol.disabled = usuario.rol === 'administrador';
  }

  cerrarFormulario(): void {
    this.limpiar();
    this.vistaFormulario.hidden = true;
    this.vistaLista.hidden = false;
  }

  obtenerDatos(): { nombre: string; correo: string; password: string; rol: RolUsuario } {
    return {
      nombre: this.inputNombre.value.trim(),
      correo: this.inputCorreo.value.trim(),
      password: this.inputPassword.value.trim(),
      rol: this.inputRol.value as RolUsuario,
    };
  }

  obtenerId(): number {
    return Number(this.inputId.value || 0);
  }

  mensaje(texto: string, tipo: 'success' | 'danger' = 'success'): void {
    this.mensajeSalida.className = `alert ${tipo}`;
    this.mensajeSalida.textContent = texto;
    this.mensajeSalida.hidden = false;
  }

  private limpiar(): void {
    this.inputId.value = '';
    this.inputNombre.value = '';
    this.inputCorreo.value = '';
    this.inputPassword.value = '';
    this.inputRol.value = 'cliente';
    this.inputRol.disabled = false;
  }

  private plantilla(): string {
    return `
      <div id="usuarioMensaje" hidden></div>
      <div id="usuarioVistaLista">
        <div class="panel-header">
          <div>
            <h2>Usuarios</h2>
            <p>El administrador registra clientes o vendedores.</p>
          </div>
          <button class="button" id="usuarioNuevo" type="button">Nuevo usuario</button>
        </div>
        <div class="table-wrap">
          <table id="usuarioTabla">
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
      <div id="usuarioVistaFormulario" hidden>
        <div class="panel-header">
          <div>
            <h2>Registrar usuario</h2>
            <p>Solo el administrador puede crear usuarios del sistema.</p>
          </div>
        </div>
        <form class="order-form" id="usuarioForm">
          <input type="hidden" id="usuarioId">
          <label class="field">
            <span>Nombre</span>
            <input type="text" id="usuarioNombre" placeholder="Ejemplo: Maria Gomez">
          </label>
          <label class="field">
            <span>Correo</span>
            <input type="text" id="usuarioCorreo" placeholder="correo@cafeteria.com">
          </label>
          <label class="field">
            <span>Contrasena</span>
            <input type="password" id="usuarioPassword" placeholder="Minimo 4 caracteres">
          </label>
          <label class="field">
            <span>Rol</span>
            <select id="usuarioRol">
              <option value="cliente">Cliente</option>
              <option value="vendedor">Vendedor</option>
            </select>
          </label>
          <div class="actions">
            <button class="button secondary" id="usuarioCancelar" type="button">Cancelar</button>
            <button class="button" type="submit">Guardar usuario</button>
          </div>
        </form>
      </div>
    `;
  }

  private rolTexto(rol: string): string {
    const textos: Record<string, string> = {
      cliente: 'Cliente',
      vendedor: 'Vendedor',
      administrador: 'Administrador',
    };
    return textos[rol] ?? rol;
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
