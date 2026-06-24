import type { Pedido } from '../interfaces/system';

export class VMisPedidos {
  private component: HTMLElement;
  public tablaSalida: HTMLTableElement;
  private mensajeSalida: HTMLDivElement;

  constructor() {
    this.component = document.createElement('section');
    this.component.className = 'panel';
    this.component.innerHTML = this.plantilla();
    this.mensajeSalida = this.component.querySelector('#misPedidosMensaje') as HTMLDivElement;
    this.tablaSalida = this.component.querySelector('#misPedidosTabla') as HTMLTableElement;
  }

  obtenerHTML(): HTMLElement {
    return this.component;
  }

  listar(pedidos: Pedido[]): void {
    const tbody = this.tablaSalida.querySelector('tbody') as HTMLTableSectionElement;
    if (pedidos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty">Todavia no tienes pedidos.</td></tr>';
      return;
    }

    tbody.innerHTML = pedidos.map((pedido) => `
      <tr>
        <td>#${pedido.id}</td>
        <td>${this.escapar(pedido.productos || 'Sin productos')}</td>
        <td>S/ ${Number(pedido.total).toFixed(2)}</td>
        <td><span class="badge ${pedido.confirmacion}">${this.confirmacionTexto(pedido.confirmacion)}</span></td>
        <td><span class="badge ${pedido.estado}">${this.estadoTexto(pedido.estado)}</span></td>
        <td>${this.fecha(pedido.fecha_creacion)}</td>
        <td>${this.acciones(pedido)}</td>
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
      <div class="panel-header">
        <div>
          <h2>Mis pedidos</h2>
          <p>Historial de pedidos enviados desde el chat.</p>
        </div>
      </div>
      <div id="misPedidosMensaje" hidden></div>
      <div class="table-wrap">
        <table id="misPedidosTabla">
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Confirmacion</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    `;
  }

  private acciones(pedido: Pedido): string {
    if (pedido.estado === 'entregado') {
      return '<span class="muted">Entregado</span>';
    }

    if (pedido.estado === 'cancelado') {
      return '<span class="muted">Cancelado</span>';
    }

    if (pedido.confirmacion === 'rechazado') {
      return '<span class="muted">Rechazado</span>';
    }

    return `
      <button class="button small danger-button" type="button" data-type="cancel" data-id="${pedido.id}">
        Cancelar
      </button>
    `;
  }

  private confirmacionTexto(confirmacion: string): string {
    const textos: Record<string, string> = {
      en_espera: 'En espera',
      aceptado: 'Aceptado',
      rechazado: 'Rechazado',
    };
    return textos[confirmacion] ?? confirmacion;
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
