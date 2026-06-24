export class VLogin {
  private component: HTMLElement;
  private mensajeSalida: HTMLDivElement;
  private inputNombre: HTMLInputElement;
  private inputCorreo: HTMLInputElement;
  private inputPassword: HTMLInputElement;
  private titulo: HTMLElement;
  private subtitulo: HTMLElement;
  private nombreField: HTMLElement;
  public btnLogin: HTMLButtonElement;
  public btnRegistro: HTMLButtonElement;
  public btnMostrarRegistro: HTMLButtonElement;
  public btnMostrarLogin: HTMLButtonElement;

  constructor() {
    this.component = document.createElement('section');
    this.component.className = 'panel narrow auth-panel';
    this.component.innerHTML = this.plantilla();
    this.mensajeSalida = this.component.querySelector('#authMensaje') as HTMLDivElement;
    this.titulo = this.component.querySelector('#authTitulo') as HTMLElement;
    this.subtitulo = this.component.querySelector('#authSubtitulo') as HTMLElement;
    this.nombreField = this.component.querySelector('#authNombreField') as HTMLElement;
    this.inputNombre = this.component.querySelector('#authNombre') as HTMLInputElement;
    this.inputCorreo = this.component.querySelector('#authCorreo') as HTMLInputElement;
    this.inputPassword = this.component.querySelector('#authPassword') as HTMLInputElement;
    this.btnLogin = this.component.querySelector('#authLogin') as HTMLButtonElement;
    this.btnRegistro = this.component.querySelector('#authRegistro') as HTMLButtonElement;
    this.btnMostrarRegistro = this.component.querySelector('#authMostrarRegistro') as HTMLButtonElement;
    this.btnMostrarLogin = this.component.querySelector('#authMostrarLogin') as HTMLButtonElement;
    this.mostrarLogin();
  }

  obtenerHTML(): HTMLElement {
    return this.component;
  }

  obtenerLogin(): { correo: string; password: string } {
    return {
      correo: this.inputCorreo.value.trim(),
      password: this.inputPassword.value.trim(),
    };
  }

  obtenerRegistro(): { nombre: string; correo: string; password: string } {
    return {
      nombre: this.inputNombre.value.trim(),
      correo: this.inputCorreo.value.trim(),
      password: this.inputPassword.value.trim(),
    };
  }

  mensaje(texto: string, tipo: 'success' | 'danger' = 'success'): void {
    this.mensajeSalida.className = `alert ${tipo}`;
    this.mensajeSalida.textContent = texto;
    this.mensajeSalida.hidden = false;
  }

  mostrarLogin(): void {
    this.titulo.textContent = 'Ingresar al sistema';
    this.subtitulo.textContent = 'Acceso rapido para la revision del sistema.';
    this.nombreField.hidden = true;
    this.btnLogin.hidden = false;
    this.btnRegistro.hidden = true;
    this.btnMostrarRegistro.hidden = false;
    this.btnMostrarLogin.hidden = true;
    this.mensajeSalida.hidden = true;
    this.inputNombre.value = '';
    this.inputCorreo.value = 'admin@cafeteria.com';
    this.inputPassword.value = 'admin123';
  }

  mostrarRegistro(): void {
    this.titulo.textContent = 'Registro de cliente';
    this.subtitulo.textContent = 'Crea tu cuenta para usar el chat IA y enviar pedidos.';
    this.nombreField.hidden = false;
    this.btnLogin.hidden = true;
    this.btnRegistro.hidden = false;
    this.btnMostrarRegistro.hidden = true;
    this.btnMostrarLogin.hidden = false;
    this.mensajeSalida.hidden = true;
  }

  private plantilla(): string {
    return `
      <div class="panel-header">
        <div>
          <h2 id="authTitulo">Ingresar al sistema</h2>
          <p id="authSubtitulo">Acceso rapido para la revision del sistema.</p>
        </div>
      </div>
      <div id="authMensaje" hidden></div>
      <form class="order-form" id="authForm">
        <label class="field" id="authNombreField">
          <span>Nombre completo</span>
          <input type="text" id="authNombre" placeholder="Ejemplo: Juan Perez">
        </label>
        <label class="field">
          <span>Correo</span>
          <input type="text" id="authCorreo" value="admin@cafeteria.com">
        </label>
        <label class="field">
          <span>Contrasena</span>
          <input type="password" id="authPassword" value="admin123">
        </label>
        <div class="auth-actions">
          <button class="button" id="authLogin" type="submit">Entrar</button>
          <button class="button" id="authRegistro" type="button">Crear cuenta cliente</button>
          <button class="button secondary" id="authMostrarRegistro" type="button">Registrarse como cliente</button>
          <button class="button secondary" id="authMostrarLogin" type="button">Ya tengo cuenta</button>
        </div>
      </form>
      <div class="empty-box auth-help">
        Acceso administrador: admin@cafeteria.com / admin123.
      </div>
    `;
  }
}
