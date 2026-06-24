import type { Usuario } from '../interfaces/system';
import { MUsuario } from '../models/MUsuario';
import { VLogin } from '../view/VLogin';

export class CAuth {
  private model: MUsuario;
  private view: VLogin;
  private onSesionCambiada: (usuario: Usuario | null) => void;

  constructor(onSesionCambiada: (usuario: Usuario | null) => void) {
    this.model = new MUsuario();
    this.view = new VLogin();
    this.onSesionCambiada = onSesionCambiada;
    this.iniciarEscucha();
  }

  crear(): HTMLElement {
    return this.view.obtenerHTML();
  }

  obtenerSesion(): Usuario | null {
    const data = localStorage.getItem('sesion_actual');
    if (!data) return null;

    try {
      return JSON.parse(data) as Usuario;
    } catch {
      return null;
    }
  }

  cerrarSesion(): void {
    localStorage.removeItem('sesion_actual');
    this.onSesionCambiada(null);
  }

  private iniciarSesion(): void {
    const data = this.view.obtenerLogin();
    const usuario = this.model.login(data.correo, data.password);
    localStorage.setItem('sesion_actual', JSON.stringify(usuario));
    this.onSesionCambiada(usuario);
  }

  private registrarCliente(): void {
    const data = this.view.obtenerRegistro();
    const usuario = this.model.registrar(data.nombre, data.correo, data.password, 'cliente');
    localStorage.setItem('sesion_actual', JSON.stringify(usuario));
    this.onSesionCambiada(usuario);
  }

  private iniciarEscucha(): void {
    this.view.obtenerHTML().addEventListener('submit', (event) => {
      event.preventDefault();
      try {
        this.iniciarSesion();
      } catch (error) {
        this.view.mensaje((error as Error).message, 'danger');
      }
    });

    this.view.btnRegistro.addEventListener('click', () => {
      try {
        this.registrarCliente();
      } catch (error) {
        this.view.mensaje((error as Error).message, 'danger');
      }
    });

    this.view.btnMostrarRegistro.addEventListener('click', () => this.view.mostrarRegistro());
    this.view.btnMostrarLogin.addEventListener('click', () => this.view.mostrarLogin());
  }
}
