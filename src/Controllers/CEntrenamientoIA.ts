import { MEntrenamientoIA } from '../models/MEntrenamientoIA';
import { VEntrenamientoIA } from '../view/VEntrenamientoIA';

export class CEntrenamientoIA {
  private model: MEntrenamientoIA;
  private view: VEntrenamientoIA;

  constructor() {
    this.model = new MEntrenamientoIA();
    this.view = new VEntrenamientoIA();
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
    const mensaje = data.id > 0
      ? this.model.actualizar(data.id, data.texto, data.intencion)
      : this.model.guardar(data.texto, data.intencion);

    this.view.cerrarFormulario();
    this.listar();
    this.view.mensaje(mensaje);
  }

  guardarMasivo(): void {
    const data = this.view.obtenerDatosMasivos();
    const mensaje = this.model.guardarMasivo(data.textos, data.intencion);
    this.view.cerrarFormulario();
    this.listar();
    this.view.mensaje(mensaje);
  }

  buscar(id: number): void {
    const ejemplo = this.model.buscar(id);
    if (ejemplo) this.view.buscar(ejemplo);
  }

  eliminar(id: number): void {
    if (!confirm('Desea eliminar esta frase de entrenamiento?')) return;
    const mensaje = this.model.eliminar(id);
    this.listar();
    this.view.mensaje(mensaje);
  }

  private iniciarEscucha(): void {
    this.view.btnMasivo.addEventListener('click', () => this.view.crearMasivo());
    this.view.btnFrasesSugeridas.addEventListener('click', () => this.view.cargarFrasesSugeridas());
    this.view.btnCancelar.addEventListener('click', () => this.view.cerrarFormulario());
    this.view.btnCancelarMasivo.addEventListener('click', () => this.view.cerrarFormulario());

    this.view.obtenerHTML().addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      try {
        if (form.id === 'entrenamientoMasivoForm') {
          this.guardarMasivo();
          return;
        }

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
        if (type === 'delete') this.eliminar(id);
      } catch (error) {
        this.view.mensaje((error as Error).message, 'danger');
      }
    });
  }
}
