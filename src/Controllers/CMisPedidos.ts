import type { Usuario } from '../interfaces/system';
import { CChat } from './CChat';
import { MPedido } from '../models/MPedido';
import { VMisPedidos } from '../view/VMisPedidos';

export class CMisPedidos {
  private usuario: Usuario;
  private chatController: CChat;
  private pedidoModel: MPedido;
  private view: VMisPedidos;

  constructor(usuario: Usuario) {
    this.usuario = usuario;
    this.chatController = new CChat(usuario);
    this.pedidoModel = new MPedido();
    this.view = new VMisPedidos();
    this.iniciarEscucha();
  }

  crear(): HTMLElement {
    this.view.listar(this.chatController.obtenerMisPedidos());
    return this.view.obtenerHTML();
  }

  cancelar(id: number): void {
    const pedido = this.pedidoModel.buscar(id);
    if (pedido.usuario_id !== this.usuario.id) {
      throw new Error('No puede cancelar un pedido de otro cliente.');
    }

    if (pedido.estado === 'entregado') {
      throw new Error('No se puede cancelar un pedido entregado.');
    }

    if (pedido.estado === 'cancelado') {
      throw new Error('El pedido ya esta cancelado.');
    }

    if (!confirm('Desea cancelar este pedido?')) return;

    this.pedidoModel.actualizarEstado(id, 'cancelado');
    this.view.listar(this.chatController.obtenerMisPedidos());
    this.view.mensaje('Pedido cancelado correctamente.');
  }

  private iniciarEscucha(): void {
    this.view.tablaSalida.addEventListener('click', (event) => {
      const element = event.target as HTMLElement;
      if (element.nodeName !== 'BUTTON') return;

      const id = Number(element.dataset.id ?? 0);
      const type = element.dataset.type;

      try {
        if (type === 'cancel') this.cancelar(id);
      } catch (error) {
        this.view.mensaje((error as Error).message, 'danger');
      }
    });
  }
}
