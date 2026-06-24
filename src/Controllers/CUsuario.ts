import { MUsuario } from '../models/MUsuario';
import { MPedido } from '../models/MPedido';
import { VUsuario } from '../view/VUsuario';

export class CUsuario {
  private model: MUsuario;
  private pedidoModel: MPedido;
  private view: VUsuario;

  constructor() {
    this.model = new MUsuario();
    this.pedidoModel = new MPedido();
    this.view = new VUsuario();
    this.iniciarEscucha();
  }

  crear(): HTMLElement {
    this.listar();
    return this.view.obtenerHTML();
  }

  listar(): void {
    this.view.listar(this.model.listar());
  }

  guardar(): void {
    const data = this.view.obtenerDatos();
    const id = this.view.obtenerId();
    const mensaje = id > 0
      ? this.model.actualizar(id, data.nombre, data.correo, data.password, data.rol)
      : 'Usuario registrado correctamente.';

    const usuario = id === 0
      ? this.model.registrar(data.nombre, data.correo, data.password, data.rol)
      : this.model.buscar(id);

    if (usuario?.rol === 'cliente') {
      this.pedidoModel.asociarClienteRegistrado(usuario.id, usuario.nombre);
    }

    this.view.cerrarFormulario();
    this.listar();
    this.view.mensaje(mensaje);
  }

  eliminar(id: number): void {
    if (!confirm('Desea eliminar este usuario?')) return;
    const mensaje = this.model.eliminar(id);
    this.listar();
    this.view.mensaje(mensaje);
  }

  buscar(id: number): void {
    const usuario = this.model.buscar(id);
    if (usuario) this.view.buscar(usuario);
  }

  asociarPedidos(id: number): void {
    const usuario = this.model.buscar(id);
    if (!usuario) throw new Error('El usuario no existe.');
    if (usuario.rol !== 'cliente') throw new Error('Solo se pueden asociar pedidos a clientes.');

    const total = this.pedidoModel.asociarClienteRegistrado(usuario.id, usuario.nombre);
    this.view.mensaje(
      total > 0
        ? `${total} pedidos fueron asociados a ${usuario.nombre}.`
        : `No se encontraron pedidos sin asociar para ${usuario.nombre}.`,
    );
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
        if (type === 'view') this.buscar(id);
        if (type === 'associate') this.asociarPedidos(id);
        if (type === 'delete') this.eliminar(id);
      } catch (error) {
        this.view.mensaje((error as Error).message, 'danger');
      }
    });
  }
}
