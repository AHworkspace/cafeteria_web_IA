import type { Usuario } from '../interfaces/system';

export class VChat {
  private component: HTMLElement;
  private mensajeSalida: HTMLDivElement;
  private chatMensajes: HTMLDivElement;
  private inputMensaje: HTMLInputElement;
  public btnEnviarMensaje: HTMLButtonElement;

  constructor(usuario: Usuario) {
    this.component = document.createElement('section');
    this.component.className = 'panel chat-panel';
    this.component.innerHTML = this.plantilla(usuario);
    this.mensajeSalida = this.component.querySelector('#chatMensajeSistema') as HTMLDivElement;
    this.chatMensajes = this.component.querySelector('#chatMensajes') as HTMLDivElement;
    this.inputMensaje = this.component.querySelector('#chatInput') as HTMLInputElement;
    this.btnEnviarMensaje = this.component.querySelector('#chatEnviar') as HTMLButtonElement;
  }

  obtenerHTML(): HTMLElement {
    return this.component;
  }

  obtenerMensaje(): string {
    const mensaje = this.inputMensaje.value.trim();
    this.inputMensaje.value = '';
    return mensaje;
  }

  agregarMensaje(emisor: 'cliente' | 'ia', texto: string): void {
    const div = document.createElement('div');
    div.className = `chat-message ${emisor}`;
    div.textContent = texto;
    this.chatMensajes.appendChild(div);
    this.chatMensajes.scrollTop = this.chatMensajes.scrollHeight;
  }

  mostrarBorradorPedido(resumen: string): void {
    this.chatMensajes.querySelector<HTMLDivElement>('#chatBorradorPedido')?.remove();
    const div = document.createElement('div');
    div.id = 'chatBorradorPedido';
    div.className = 'chat-message ia order-draft';
    div.innerHTML = `
      <strong>Borrador del pedido</strong>
      <span>${this.escapar(resumen)}</span>
      <div class="row-actions">
        <button class="button small success-button" type="button" data-chat-action="send-order">Enviar pedido</button>
        <button class="button small secondary" type="button" data-chat-action="cancel-order">Cancelar</button>
      </div>
    `;
    this.chatMensajes.appendChild(div);
    this.chatMensajes.scrollTop = this.chatMensajes.scrollHeight;
  }

  quitarBorradorPedido(): void {
    this.chatMensajes.querySelector('#chatBorradorPedido')?.remove();
  }

  mensaje(texto: string, tipo: 'success' | 'danger' = 'success'): void {
    this.mensajeSalida.className = `alert ${tipo}`;
    this.mensajeSalida.textContent = texto;
    this.mensajeSalida.hidden = false;
  }

  private plantilla(usuario: Usuario): string {
    return `
      <div class="panel-header">
        <div>
          <h2>Asistente IA</h2>
          <p>Hola ${this.escapar(usuario.nombre)}, aqui puedes consultar el menu y enviar pedidos personalizados.</p>
        </div>
      </div>
      <div id="chatMensajeSistema" hidden></div>
      <div class="chat-layout">
        <div class="chat-box">
          <div class="chat-messages" id="chatMensajes"></div>
          <div class="chat-input-row">
            <input type="text" id="chatInput" placeholder="Pregunta por el menu, precios o recomendaciones">
            <button class="button" id="chatEnviar" type="button">Enviar</button>
          </div>
        </div>
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
