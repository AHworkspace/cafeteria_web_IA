import { AsistenteIA } from '../ai/AsistenteIA';
import type { DetallesPedidoEntrada, IntencionIA, Pedido, Producto, Usuario } from '../interfaces/system';
import { MDetallePedido } from '../models/MDetallePedido';
import { MPedido } from '../models/MPedido';
import { MProducto } from '../models/MProducto';
import { VChat } from '../view/VChat';

export class CChat {
  private usuario: Usuario;
  private productoModel: MProducto;
  private pedidoModel: MPedido;
  private detalleModel: MDetallePedido;
  private ia: AsistenteIA;
  private view: VChat;
  private borradorPedido: DetallesPedidoEntrada;
  private borradorActivo: boolean;
  private chatIniciado: boolean;

  constructor(usuario: Usuario) {
    this.usuario = usuario;
    this.productoModel = new MProducto();
    this.pedidoModel = new MPedido();
    this.detalleModel = new MDetallePedido();
    this.ia = new AsistenteIA();
    this.view = new VChat(usuario);
    this.borradorPedido = {};
    this.borradorActivo = false;
    this.chatIniciado = false;
    this.iniciarEscucha();
  }

  crear(): HTMLElement {
    if (!this.chatIniciado) {
      this.view.agregarMensaje(
        'ia',
        'Hola, soy el asistente de la cafeteria. Puedes preguntarme por el menu, precios o recomendaciones. Tambien puedes escribir tu pedido, por ejemplo: "quiero 1 cafe y 2 empanadas sin picante".',
      );
      this.chatIniciado = true;
    }
    return this.view.obtenerHTML();
  }

  async enviarMensaje(): Promise<void> {
    const mensaje = this.view.obtenerMensaje();
    if (mensaje === '') return;

    this.view.agregarMensaje('cliente', mensaje);
    const intencion = this.ia.predecir(mensaje) as IntencionIA | 'desconocido';

    if (intencion === 'menu') {
      const respuesta = this.ia.responder(mensaje, this.productoModel.listarActivos());
      this.view.agregarMensaje('ia', respuesta);
      return;
    }

    if (intencion === 'precio') {
      this.view.agregarMensaje('ia', this.responderPrecio(mensaje));
      return;
    }

    if (intencion === 'total_pedido') {
      this.view.agregarMensaje('ia', this.resumenBorrador());
      return;
    }

    if (intencion === 'confirmar_pedido') {
      try {
        this.enviarPedido();
      } catch (error) {
        this.view.agregarMensaje('ia', (error as Error).message);
      }
      return;
    }

    if (intencion === 'cancelar_borrador') {
      this.cancelarPorChat();
      return;
    }

    if (intencion === 'quitar_producto') {
      const productoQuitado = this.quitarProductoDelBorrador(mensaje);
      if (!productoQuitado) return;

      if (!this.tieneProductosEnBorrador()) {
        this.cerrarBorrador();
        this.view.agregarMensaje('ia', 'Quite el producto. El borrador quedo vacio.');
        return;
      }

      this.view.mostrarBorradorPedido(this.resumenBorradorTexto());
      return;
    }

    if (intencion === 'modificar_pedido') {
      if (!this.tieneProductosEnBorrador()) {
        this.view.agregarMensaje('ia', 'Primero debes agregar productos al borrador. Por ejemplo: "quiero 2 cafes".');
        return;
      }

      const cantidadCambiada = this.cambiarCantidadDelBorrador(mensaje);
      if (!cantidadCambiada) return;

      this.view.mostrarBorradorPedido(this.resumenBorradorTexto());
      return;
    }

    if (intencion === 'pedido') {
      const pedidoDetectado = this.detectarPedido(mensaje);
      if (Object.keys(pedidoDetectado.detalles).length > 0) {
        this.agregarAlBorrador(pedidoDetectado.detalles);
        this.view.mostrarBorradorPedido(this.resumenBorradorTexto());
        return;
      }

      this.view.agregarMensaje('ia', `No encontre ese producto en el menu activo.\n\nPuedes pedirme alguno de estos productos:\n${this.menuActivoTexto()}`);
      return;
    }

    const respuesta = this.ia.responder(mensaje, this.productoModel.listarActivos());
    this.view.agregarMensaje('ia', respuesta);
  }

  enviarPedido(): void {
    const detalles = this.borradorPedido;
    this.validarPedido(detalles);

    const productos = new Map(
      this.productoModel.listarActivos().map((producto) => [producto.id, producto]),
    );

    this.pedidoModel.establecerDatos(this.usuario.nombre, this.usuario.id, 'en_espera');
    const pedido = this.pedidoModel.guardar();

    Object.entries(detalles).forEach(([idTexto, detalle]) => {
      const producto = productos.get(Number(idTexto));
      if (!producto) throw new Error('Uno de los productos seleccionados ya no esta activo.');
      this.detalleModel.guardar({
        pedido_id: pedido.id,
        producto_id: producto.id,
        cantidad: detalle.cantidad,
        precio_unitario: producto.precio,
        observacion: detalle.observacion,
      });
    });

    this.borradorPedido = {};
    this.borradorActivo = false;
    this.view.quitarBorradorPedido();
    this.view.mensaje('Tu pedido fue enviado y queda en espera de aceptacion.');
    this.view.agregarMensaje('ia', 'Listo, envie tu pedido a la cafeteria. El vendedor debe aceptarlo para iniciar el proceso.');
  }

  obtenerMisPedidos(): Pedido[] {
    const productos = new Map(
      this.productoModel.listar().map((producto) => [producto.id, producto]),
    );
    return this.pedidoModel.listar()
      .filter((pedido) => pedido.usuario_id === this.usuario.id)
      .map((pedido) => this.prepararPedido(pedido, productos));
  }

  private prepararPedido(
    pedido: ReturnType<MPedido['listar']>[number],
    productos: Map<number, Producto>,
  ): Pedido {
    const detalles = this.detalleModel.listarPorPedido(pedido.id);
    return {
      ...pedido,
      productos: detalles.map((detalle) => {
        const producto = productos.get(detalle.producto_id);
        const observacion = detalle.observacion ? ` (${detalle.observacion})` : '';
        return `${producto?.nombre ?? 'Producto eliminado'} x${detalle.cantidad}${observacion}`;
      }).join(', '),
      total: detalles.reduce(
        (suma, detalle) => suma + detalle.cantidad * detalle.precio_unitario,
        0,
      ),
    };
  }

  private iniciarEscucha(): void {
    this.view.btnEnviarMensaje.addEventListener('click', () => {
      void this.enviarMensaje();
    });

    this.view.obtenerHTML().addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && event.target instanceof HTMLInputElement && event.target.id === 'chatInput') {
        event.preventDefault();
        void this.enviarMensaje();
      }
    });

    this.view.obtenerHTML().addEventListener('click', (event) => {
      const element = event.target as HTMLElement;
      if (element.nodeName !== 'BUTTON') return;
      const action = element.dataset.chatAction;

      try {
        if (action === 'send-order') {
          this.enviarPedido();
        }

        if (action === 'cancel-order') {
          this.cerrarBorrador();
          this.view.agregarMensaje('ia', 'Borrador cancelado. Si quieres hacer otro pedido, empezaremos uno nuevo desde cero.');
        }
      } catch (error) {
        this.view.mensaje((error as Error).message, 'danger');
      }
    });
  }

  private validarPedido(detalles: DetallesPedidoEntrada): void {
    const valores = Object.values(detalles);
    if (valores.length === 0) throw new Error('Seleccione al menos un producto.');
    if (valores.some((detalle) => !Number.isInteger(detalle.cantidad) || detalle.cantidad <= 0)) {
      throw new Error('Las cantidades deben ser numeros enteros mayores que cero.');
    }
  }

  private detectarPedido(mensaje: string): { detalles: DetallesPedidoEntrada; resumen: string } {
    const productos = this.buscarProductosEnTexto(mensaje);
    const detalles: DetallesPedidoEntrada = {};
    const resumen: string[] = [];

    productos.forEach((producto) => {
      const cantidad = this.extraerCantidad(mensaje, producto.nombre);
      const observacion = this.extraerObservacion(this.normalizarTexto(mensaje));
      detalles[producto.id] = {
        cantidad,
        observacion,
      };
      resumen.push(`${producto.nombre} x${cantidad}${observacion ? ` (${observacion})` : ''}`);
    });

    return {
      detalles,
      resumen: resumen.join(', '),
    };
  }

  private responderPrecio(mensaje: string): string {
    const productos = this.buscarProductosEnTexto(mensaje);
    if (productos.length === 0) {
      return this.productoModel.listarActivos()
        .map((producto) => `${producto.nombre}: S/ ${Number(producto.precio).toFixed(2)}`)
        .join('\n') || 'No hay productos activos para consultar precios.';
    }

    const lineas = productos.map((producto) => {
      const cantidad = this.extraerCantidad(mensaje, producto.nombre);
      const total = cantidad * producto.precio;
      return `${cantidad} ${producto.nombre} te costara S/ ${total.toFixed(2)}.`;
    });

    return lineas.join('\n');
  }

  private agregarAlBorrador(detalles: DetallesPedidoEntrada): void {
    this.borradorActivo = true;
    Object.entries(detalles).forEach(([idTexto, detalle]) => {
      const productoId = Number(idTexto);
      const actual = this.borradorPedido[productoId];
      this.borradorPedido[productoId] = {
        cantidad: (actual?.cantidad ?? 0) + detalle.cantidad,
        observacion: detalle.observacion || actual?.observacion || '',
      };
    });
  }

  private quitarProductoDelBorrador(mensaje: string): boolean {
    const producto = this.buscarProductosEnTexto(mensaje)[0];

    if (!producto) {
      this.view.agregarMensaje('ia', 'No encontre que producto quieres quitar del borrador.');
      return false;
    }

    if (!this.borradorPedido[producto.id]) {
      this.view.agregarMensaje('ia', `${producto.nombre} no esta en tu borrador.`);
      return false;
    }

    const cantidadActual = this.borradorPedido[producto.id].cantidad;
    const cantidadIndicada = this.tieneCantidadExplicita(mensaje)
      ? this.extraerCantidad(mensaje, producto.nombre)
      : 0;

    if (cantidadIndicada > 0 && cantidadIndicada < cantidadActual) {
      this.borradorPedido[producto.id] = {
        ...this.borradorPedido[producto.id],
        cantidad: cantidadActual - cantidadIndicada,
      };
      return true;
    }

    delete this.borradorPedido[producto.id];
    return true;
  }

  private cambiarCantidadDelBorrador(mensaje: string): boolean {
    const producto = this.buscarProductosEnTexto(mensaje)[0];

    if (!producto) {
      this.view.agregarMensaje('ia', 'No encontre que producto quieres modificar en el borrador.');
      return false;
    }

    if (!this.borradorPedido[producto.id]) {
      this.agregarAlBorrador({
        [producto.id]: {
          cantidad: this.extraerCantidad(mensaje, producto.nombre),
          observacion: this.extraerObservacion(this.normalizarTexto(mensaje)),
        },
      });
      return true;
    }

    const cantidad = this.extraerCantidadObjetivo(mensaje, producto.nombre);
    this.borradorPedido[producto.id] = {
      ...this.borradorPedido[producto.id],
      cantidad,
    };

    return true;
  }

  private cancelarPorChat(): void {
    if (this.borradorActivo || this.tieneProductosEnBorrador()) {
      this.cerrarBorrador();
      this.view.agregarMensaje('ia', 'Listo, borre el borrador del pedido. El siguiente pedido empezara desde cero.');
      return;
    }

    const pedido = this.pedidoModel.listar()
      .filter((item) => item.usuario_id === this.usuario.id)
      .find((item) => (
        item.estado !== 'entregado'
        && item.estado !== 'cancelado'
        && item.confirmacion !== 'rechazado'
      ));

    if (!pedido) {
      this.view.agregarMensaje('ia', 'No tienes pedidos activos para cancelar.');
      return;
    }

    this.pedidoModel.actualizarEstado(pedido.id, 'cancelado');
    this.view.agregarMensaje('ia', `Cancele el pedido #${pedido.id}.`);
  }

  private resumenBorrador(): string {
    if (!this.tieneProductosEnBorrador()) {
      return 'Todavia no tienes productos en el borrador del pedido.';
    }

    return `Tu pedido va asi:\n${this.resumenBorradorTexto()}`;
  }

  private resumenBorradorTexto(): string {
    const productos = new Map(
      this.productoModel.listarActivos().map((producto) => [producto.id, producto]),
    );

    const lineas = Object.entries(this.borradorPedido).map(([idTexto, detalle]) => {
      const producto = productos.get(Number(idTexto));
      const nombre = producto?.nombre ?? 'Producto eliminado';
      const precio = producto?.precio ?? 0;
      const subtotal = detalle.cantidad * precio;
      const observacion = detalle.observacion ? ` (${detalle.observacion})` : '';
      return `${nombre} x${detalle.cantidad}${observacion}: S/ ${subtotal.toFixed(2)}`;
    });

    const total = Object.entries(this.borradorPedido).reduce((suma, [idTexto, detalle]) => {
      const producto = productos.get(Number(idTexto));
      return suma + detalle.cantidad * (producto?.precio ?? 0);
    }, 0);

    return `${lineas.join('\n')}\nTotal: S/ ${total.toFixed(2)}`;
  }

  private extraerCantidad(texto: string, nombreProducto: string): number {
    const textoNormalizado = this.normalizarTexto(texto);
    const nombreNormalizado = this.normalizarTexto(nombreProducto);
    const cantidadGeneral = this.extraerCantidadGeneral(textoNormalizado);
    const posicion = textoNormalizado.indexOf(nombreNormalizado);
    if (posicion < 0) return cantidadGeneral;

    const antes = textoNormalizado.slice(Math.max(0, posicion - 24), posicion);
    const match = antes.match(/(\d+)\s*$/);
    return match ? Math.max(1, Number(match[1])) : cantidadGeneral;
  }

  private extraerCantidadObjetivo(texto: string, nombreProducto: string): number {
    const textoNormalizado = this.normalizarTexto(texto);
    const numeros = this.extraerCantidades(textoNormalizado);
    if (numeros.length === 0) return this.extraerCantidad(texto, nombreProducto);

    const patronesObjetivo = [
      /\b(?:a|en|por)\s+(\d+)\b/,
      /\b(?:a|en|por)\s+(un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\b/,
      /\b(?:solo|solamente)\s+(\d+)\b/,
      /\b(?:solo|solamente)\s+(un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\b/,
    ];

    for (const patron of patronesObjetivo) {
      const match = textoNormalizado.match(patron);
      if (match) return this.numeroDesdeTexto(match[1]);
    }

    return numeros[numeros.length - 1];
  }

  private extraerObservacion(texto: string): string {
    const claves = ['sin ', 'con ', 'para llevar', 'poco ', 'extra '];
    const clave = claves.find((item) => texto.includes(item));
    if (!clave) return '';

    const inicio = texto.indexOf(clave);
    return texto.slice(inicio).trim().slice(0, 120);
  }

  private normalizarTexto(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private buscarProductosEnTexto(mensaje: string): Producto[] {
    const texto = this.normalizarTexto(mensaje);
    const productos = this.productoModel.listarActivos();
    const exactos = this.buscarCoincidenciasExactas(texto, productos);

    if (exactos.length > 0) return exactos;

    const candidatos = productos.map((producto) => {
      const nombre = this.normalizarTexto(producto.nombre);
      const tokensProducto = nombre
        .split(/\s+/)
        .filter((token) => token.length > 1 && !['para', 'con', 'sin', 'de', 'del', 'la', 'el', 'los', 'las'].includes(token));
      const coincidencias = tokensProducto.filter((token) => texto.split(/\s+/).includes(token)).length;
      const score = tokensProducto.length === 0 ? 0 : coincidencias / tokensProducto.length;
      return { producto, score };
    }).filter((item) => item.score > 0);

    if (candidatos.length === 0) return [];

    candidatos.sort((a, b) => b.score - a.score);
    const mejor = candidatos[0];
    const segundo = candidatos[1];

    if (mejor.score < 0.5) return [];
    if (segundo && segundo.score === mejor.score) return [];

    return [mejor.producto];
  }

  private buscarCoincidenciasExactas(texto: string, productos: Producto[]): Producto[] {
    const coincidencias = productos
      .map((producto) => {
        const nombre = this.normalizarTexto(producto.nombre);
        const inicio = texto.indexOf(nombre);
        return {
          producto,
          nombre,
          inicio,
          fin: inicio + nombre.length,
        };
      })
      .filter((item) => item.inicio >= 0)
      .sort((a, b) => b.nombre.length - a.nombre.length);

    const ocupados: Array<{ inicio: number; fin: number }> = [];
    const seleccionados: Producto[] = [];

    coincidencias.forEach((item) => {
      const seCruza = ocupados.some((ocupado) => item.inicio < ocupado.fin && item.fin > ocupado.inicio);
      if (seCruza) return;

      ocupados.push({ inicio: item.inicio, fin: item.fin });
      seleccionados.push(item.producto);
    });

    return seleccionados;
  }

  private extraerCantidadGeneral(texto: string): number {
    const numero = texto.match(/\b(\d+)\b/);
    if (numero) return Math.max(1, Number(numero[1]));

    const numerosTexto: Record<string, number> = {
      un: 1,
      una: 1,
      uno: 1,
      dos: 2,
      tres: 3,
      cuatro: 4,
      cinco: 5,
      seis: 6,
      siete: 7,
      ocho: 8,
      nueve: 9,
      diez: 10,
    };

    const palabra = texto.split(/\s+/).find((token) => numerosTexto[token]);
    return palabra ? numerosTexto[palabra] : 1;
  }

  private tieneCantidadExplicita(mensaje: string): boolean {
    const texto = this.normalizarTexto(mensaje);
    return /\b(\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\b/.test(texto);
  }

  private extraerCantidades(texto: string): number[] {
    const numerosTexto: Record<string, number> = {
      un: 1,
      una: 1,
      uno: 1,
      dos: 2,
      tres: 3,
      cuatro: 4,
      cinco: 5,
      seis: 6,
      siete: 7,
      ocho: 8,
      nueve: 9,
      diez: 10,
    };

    return texto
      .split(/\s+/)
      .map((token) => {
        if (/^\d+$/.test(token)) return Math.max(1, Number(token));
        return numerosTexto[token] ?? 0;
      })
      .filter((cantidad) => cantidad > 0);
  }

  private numeroDesdeTexto(texto: string): number {
    return this.extraerCantidades(this.normalizarTexto(texto))[0] ?? 1;
  }

  private menuActivoTexto(): string {
    const productos = this.productoModel.listarActivos();
    if (productos.length === 0) return 'No hay productos activos por ahora.';
    return productos.map((producto) => `- ${producto.nombre}`).join('\n');
  }

  private tieneProductosEnBorrador(): boolean {
    return Object.keys(this.borradorPedido).length > 0;
  }

  private cerrarBorrador(): void {
    this.borradorPedido = {};
    this.borradorActivo = false;
    this.view.quitarBorradorPedido();
  }
}
