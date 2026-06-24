import type { EntrenamientoIA, IntencionIA } from '../interfaces/system';

export class VEntrenamientoIA {
  private component: HTMLElement;
  private mensajeSalida: HTMLDivElement;
  private vistaLista: HTMLElement;
  private vistaFormulario: HTMLElement;
  private vistaMasiva: HTMLElement;
  private inputId: HTMLInputElement;
  private inputTexto: HTMLInputElement;
  private selectIntencion: HTMLSelectElement;
  private descripcionIntencion: HTMLParagraphElement;
  private textareaMasivo: HTMLTextAreaElement;
  private selectIntencionMasiva: HTMLSelectElement;
  private descripcionIntencionMasiva: HTMLParagraphElement;
  public btnMasivo: HTMLButtonElement;
  public btnFrasesSugeridas: HTMLButtonElement;
  public btnCancelar: HTMLButtonElement;
  public btnCancelarMasivo: HTMLButtonElement;
  public tablaSalida: HTMLTableElement;

  constructor() {
    this.component = document.createElement('section');
    this.component.className = 'panel';
    this.component.innerHTML = this.plantilla();
    this.mensajeSalida = this.component.querySelector('#entrenamientoMensaje') as HTMLDivElement;
    this.vistaLista = this.component.querySelector('#entrenamientoVistaLista') as HTMLElement;
    this.vistaFormulario = this.component.querySelector('#entrenamientoVistaFormulario') as HTMLElement;
    this.vistaMasiva = this.component.querySelector('#entrenamientoVistaMasiva') as HTMLElement;
    this.inputId = this.component.querySelector('#entrenamientoId') as HTMLInputElement;
    this.inputTexto = this.component.querySelector('#entrenamientoTexto') as HTMLInputElement;
    this.selectIntencion = this.component.querySelector('#entrenamientoIntencion') as HTMLSelectElement;
    this.descripcionIntencion = this.component.querySelector('#entrenamientoDescripcionIntencion') as HTMLParagraphElement;
    this.textareaMasivo = this.component.querySelector('#entrenamientoTextoMasivo') as HTMLTextAreaElement;
    this.selectIntencionMasiva = this.component.querySelector('#entrenamientoIntencionMasiva') as HTMLSelectElement;
    this.descripcionIntencionMasiva = this.component.querySelector('#entrenamientoDescripcionIntencionMasiva') as HTMLParagraphElement;
    this.btnMasivo = this.component.querySelector('#entrenamientoMasivo') as HTMLButtonElement;
    this.btnFrasesSugeridas = this.component.querySelector('#entrenamientoFrasesSugeridas') as HTMLButtonElement;
    this.btnCancelar = this.component.querySelector('#entrenamientoCancelar') as HTMLButtonElement;
    this.btnCancelarMasivo = this.component.querySelector('#entrenamientoCancelarMasivo') as HTMLButtonElement;
    this.tablaSalida = this.component.querySelector('#entrenamientoTabla') as HTMLTableElement;
    this.configurarAyudaIntenciones();
  }

  obtenerHTML(): HTMLElement {
    return this.component;
  }

  listar(ejemplos: EntrenamientoIA[]): void {
    const tbody = this.tablaSalida.querySelector('tbody') as HTMLTableSectionElement;
    if (ejemplos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty">No hay frases adicionales de entrenamiento.</td></tr>';
      return;
    }

    tbody.innerHTML = ejemplos.map((ejemplo) => `
      <tr>
        <td>#${ejemplo.id}</td>
        <td>${this.escapar(ejemplo.texto)}</td>
        <td><span class="badge ia-intent ${ejemplo.intencion}">${this.intencionTexto(ejemplo.intencion)}</span></td>
        <td>
          <div class="row-actions">
            <button class="button small secondary" type="button" data-type="view" data-id="${ejemplo.id}">Editar</button>
            <button class="button small danger-button" type="button" data-type="delete" data-id="${ejemplo.id}">Eliminar</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  crearMasivo(): void {
    this.limpiarMasivo();
    this.vistaLista.hidden = true;
    this.vistaFormulario.hidden = true;
    this.vistaMasiva.hidden = false;
    this.actualizarDescripcionMasiva();
  }

  buscar(ejemplo: EntrenamientoIA): void {
    this.vistaLista.hidden = true;
    this.vistaFormulario.hidden = false;
    this.vistaMasiva.hidden = true;
    this.inputId.value = String(ejemplo.id);
    this.inputTexto.value = ejemplo.texto;
    this.selectIntencion.value = ejemplo.intencion;
    this.actualizarDescripcionFormulario();
  }

  cerrarFormulario(): void {
    this.limpiar();
    this.vistaFormulario.hidden = true;
    this.vistaMasiva.hidden = true;
    this.vistaLista.hidden = false;
  }

  obtenerDatos(): { id: number; texto: string; intencion: IntencionIA } {
    return {
      id: Number(this.inputId.value || 0),
      texto: this.inputTexto.value.trim(),
      intencion: this.selectIntencion.value as IntencionIA,
    };
  }

  obtenerDatosMasivos(): { textos: string[]; intencion: IntencionIA } {
    return {
      textos: this.textareaMasivo.value.split(/\r?\n/),
      intencion: this.selectIntencionMasiva.value as IntencionIA,
    };
  }

  cargarFrasesSugeridas(): void {
    this.textareaMasivo.value = this.frasesSugeridas(this.selectIntencionMasiva.value as IntencionIA).join('\n');
  }

  mensaje(texto: string, tipo: 'success' | 'danger' = 'success'): void {
    this.mensajeSalida.className = `alert ${tipo}`;
    this.mensajeSalida.textContent = texto;
    this.mensajeSalida.hidden = false;
  }

  private limpiar(): void {
    this.inputId.value = '';
    this.inputTexto.value = '';
    this.selectIntencion.value = 'menu';
    this.actualizarDescripcionFormulario();
  }

  private limpiarMasivo(): void {
    this.textareaMasivo.value = '';
    this.selectIntencionMasiva.value = 'menu';
    this.actualizarDescripcionMasiva();
  }

  private plantilla(): string {
    return `
      <div id="entrenamientoMensaje" hidden></div>
      <div id="entrenamientoVistaLista">
        <div class="panel-header">
          <div>
            <h2>Entrenamiento IA</h2>
            <p>Agrega frases reales de clientes. El chat usara estos ejemplos en el siguiente mensaje.</p>
          </div>
          <div class="row-actions">
            <button class="button" id="entrenamientoMasivo" type="button">Carga de frases</button>
          </div>
        </div>
        <div class="table-wrap">
          <table id="entrenamientoTabla">
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Frase</th>
                <th>Intencion</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
      <div id="entrenamientoVistaFormulario" hidden>
        <div class="panel-header">
          <div>
            <h2>Frase de entrenamiento</h2>
            <p>Relaciona una forma de hablar del cliente con la intencion correcta.</p>
          </div>
        </div>
        <form class="order-form" id="entrenamientoForm">
          <input type="hidden" id="entrenamientoId">
          <label class="field">
            <span>Frase del cliente</span>
            <input type="text" id="entrenamientoTexto" placeholder="Ejemplo: algo piola para comer">
          </label>
          <label class="field">
            <span>Intencion</span>
            <select id="entrenamientoIntencion">
              <option value="menu">Menu</option>
              <option value="precio">Precio</option>
              <option value="recomendacion">Recomendacion</option>
              <option value="pedido">Pedido</option>
              <option value="saludo">Saludo</option>
              <option value="total_pedido">Total del pedido</option>
              <option value="quitar_producto">Quitar producto</option>
              <option value="modificar_pedido">Modificar pedido</option>
              <option value="confirmar_pedido">Confirmar pedido</option>
              <option value="cancelar_borrador">Cancelar borrador</option>
            </select>
            <p class="help-text" id="entrenamientoDescripcionIntencion"></p>
          </label>
          <div class="actions">
            <button class="button secondary" id="entrenamientoCancelar" type="button">Cancelar</button>
            <button class="button" type="submit">Guardar frase</button>
          </div>
        </form>
      </div>
      <div id="entrenamientoVistaMasiva" hidden>
        <div class="panel-header">
          <div>
            <h2>Carga de frases</h2>
            <p>Escribe una frase por linea. Todas se guardaran con la misma intencion.</p>
          </div>
        </div>
        <form class="order-form" id="entrenamientoMasivoForm">
          <label class="field">
            <span>Intencion</span>
            <select id="entrenamientoIntencionMasiva">
              <option value="menu">Menu</option>
              <option value="precio">Precio</option>
              <option value="recomendacion">Recomendacion</option>
              <option value="pedido">Pedido</option>
              <option value="saludo">Saludo</option>
              <option value="total_pedido">Total del pedido</option>
              <option value="quitar_producto">Quitar producto</option>
              <option value="modificar_pedido">Modificar pedido</option>
              <option value="confirmar_pedido">Confirmar pedido</option>
              <option value="cancelar_borrador">Cancelar borrador</option>
            </select>
            <p class="help-text" id="entrenamientoDescripcionIntencionMasiva"></p>
          </label>
          <label class="field">
            <span>Frases</span>
            <textarea id="entrenamientoTextoMasivo" rows="12" placeholder="que hay para comer&#10;muestrame la carta&#10;que productos tienes hoy"></textarea>
          </label>
          <div class="actions">
            <button class="button secondary" id="entrenamientoCancelarMasivo" type="button">Cancelar</button>
            <button class="button secondary" id="entrenamientoFrasesSugeridas" type="button">Usar frases recomendadas</button>
            <button class="button" type="submit">Guardar frases</button>
          </div>
        </form>
      </div>
    `;
  }

  private intencionTexto(intencion: string): string {
    const textos: Record<string, string> = {
      menu: 'Menu',
      precio: 'Precio',
      recomendacion: 'Recomendacion',
      pedido: 'Pedido',
      saludo: 'Saludo',
      total_pedido: 'Total del pedido',
      quitar_producto: 'Quitar producto',
      modificar_pedido: 'Modificar pedido',
      confirmar_pedido: 'Confirmar pedido',
      cancelar_borrador: 'Cancelar borrador',
    };
    return textos[intencion] ?? intencion;
  }

  private configurarAyudaIntenciones(): void {
    this.actualizarDescripcionFormulario();
    this.actualizarDescripcionMasiva();
    this.selectIntencion.addEventListener('change', () => this.actualizarDescripcionFormulario());
    this.selectIntencionMasiva.addEventListener('change', () => this.actualizarDescripcionMasiva());
  }

  private actualizarDescripcionFormulario(): void {
    this.descripcionIntencion.textContent = this.descripcionIntencionTexto(this.selectIntencion.value as IntencionIA);
  }

  private actualizarDescripcionMasiva(): void {
    this.descripcionIntencionMasiva.textContent = this.descripcionIntencionTexto(this.selectIntencionMasiva.value as IntencionIA);
  }

  private descripcionIntencionTexto(intencion: IntencionIA): string {
    const descripciones: Record<IntencionIA, string> = {
      menu: 'Usa esta intencion cuando el cliente quiere ver la carta o saber que productos hay disponibles.',
      precio: 'Usa esta intencion cuando el cliente pregunta cuanto cuesta uno o varios productos. No crea pedido.',
      recomendacion: 'Usa esta intencion cuando el cliente pide una sugerencia o algo recomendado.',
      pedido: 'Usa esta intencion para iniciar el pedido o agregar productos al borrador. Es como crear/agregar detalles del pedido.',
      saludo: 'Usa esta intencion para saludos o mensajes iniciales del cliente.',
      total_pedido: 'Usa esta intencion cuando el cliente quiere saber cuanto va sumando su borrador.',
      quitar_producto: 'Usa esta intencion cuando el cliente quiere quitar, retirar o disminuir un producto especifico del borrador.',
      modificar_pedido: 'Usa esta intencion cuando el cliente ya tiene borrador y quiere actualizar cantidades o agregar mas productos.',
      confirmar_pedido: 'Usa esta intencion cuando el cliente ya quiere enviar el pedido a la cafeteria.',
      cancelar_borrador: 'Usa esta intencion solo cuando el cliente quiere borrar todo el borrador o cancelar el pedido completo.',
    };

    return descripciones[intencion];
  }

  private frasesSugeridas(intencion: IntencionIA): string[] {
    const frases: Record<IntencionIA, string[]> = {
      menu: [
        'menu',
        'muestrame el menu',
        'quiero ver la carta',
        'que productos hay',
        'que venden hoy',
        'que hay disponible',
      ],
      precio: [
        'precio',
        'cuanto cuesta',
        'cuanto sale',
        'cuanto vale',
        'cuanto me sale',
        'cuanto me salen',
        'a cuanto esta',
      ],
      recomendacion: [
        'que me recomiendas',
        'recomiendame algo',
        'que es lo mas rico',
        'algo barato para comer',
        'sugerencia para pedir',
      ],
      pedido: [
        'quiero',
        'dame',
        'agrega',
        'ponme',
        'quisiera pedir',
        'quiero hacer un pedido',
        'quiero empezar mi pedido',
        'aumenta',
        'sumale',
        'incluye',
      ],
      saludo: [
        'hola',
        'buenos dias',
        'buenas tardes',
        'buenas noches',
        'como estas',
      ],
      total_pedido: [
        'total',
        'cuanto llevo',
        'cuanto voy gastando',
        'cuanto suma mi pedido',
        'cuanto va mi cuenta',
        'cuanto seria todo',
      ],
      quitar_producto: [
        'quita',
        'quita uno',
        'quitame uno',
        'saca',
        'sacame uno',
        'retira',
        'disminuye uno',
        'reduce uno',
        'resta uno',
        'ya no quiero ese producto',
      ],
      modificar_pedido: [
        'cambia la cantidad',
        'modifica la cantidad',
        'dejalo en uno',
        'solo quiero uno',
        'ahora quiero uno',
        'mejor cambialo a dos',
        'aumenta uno mas',
        'agrega uno mas',
        'sumale otro',
      ],
      confirmar_pedido: [
        'confirmo mi pedido',
        'enviar pedido',
        'envia mi pedido',
        'mandalo a la cafeteria',
        'quiero hacer ese pedido',
        'ese pedido esta bien',
      ],
      cancelar_borrador: [
        'borra todo',
        'cancela el borrador',
        'elimina todo',
        'ya no quiero pedir',
        'cancela mi pedido',
      ],
    };

    return frases[intencion];
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
