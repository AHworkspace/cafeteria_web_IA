import type { Producto } from '../interfaces/system';
import { ClasificadorIntencion } from './ClasificadorIntencion';
import { MEntrenamientoIA } from '../models/MEntrenamientoIA';

export class AsistenteIA {
  predecir(mensaje: string): string {
    const clasificador = new ClasificadorIntencion(new MEntrenamientoIA().listar());
    return clasificador.predecir(mensaje).intencion;
  }

  responder(mensaje: string, productos: Producto[]): string {
    const clasificador = new ClasificadorIntencion(new MEntrenamientoIA().listar());
    const prediccion = clasificador.predecir(mensaje);
    const activos = productos.filter((producto) => producto.disponibilidad === 'activo');

    if (activos.length === 0) {
      return 'Por ahora no hay productos activos en el menu.';
    }

    if (prediccion.intencion === 'menu' || prediccion.intencion === 'precio') {
      return `Este es el menu disponible:\n${this.formatearMenu(activos)}`;
    }

    if (prediccion.intencion === 'recomendacion') {
      const recomendado = activos[0];
      return `Te recomiendo ${recomendado.nombre}. Esta disponible por S/ ${Number(recomendado.precio).toFixed(2)}.`;
    }

    if (prediccion.intencion === 'pedido') {
      return 'Puedo ayudarte a armar el pedido por chat. Escribe algo como "quiero 1 cafe sin azucar y 2 empanadas para llevar".';
    }

    if (prediccion.intencion === 'saludo') {
      return 'Hola, puedo ayudarte con el menu, precios, recomendaciones o pedidos personalizados.';
    }

    if (prediccion.intencion === 'total_pedido') {
      return 'Puedo calcular el total cuando tengas un pedido en borrador.';
    }

    if (prediccion.intencion === 'quitar_producto' || prediccion.intencion === 'modificar_pedido') {
      return 'Puedo modificar tu pedido si mencionas el producto. Por ejemplo: "quita el cafe" o "agrega 1 empanada".';
    }

    if (prediccion.intencion === 'confirmar_pedido') {
      return 'Puedo enviar tu pedido cuando ya tenga productos en el borrador.';
    }

    if (prediccion.intencion === 'cancelar_borrador') {
      return 'Puedo cancelar el borrador del pedido antes de enviarlo.';
    }

    return 'Puedo ayudarte con el menu, precios, recomendaciones y pedidos personalizados de la cafeteria.';
  }

  private formatearMenu(productos: Producto[]): string {
    return productos
      .map((producto) => `- ${producto.nombre}: S/ ${Number(producto.precio).toFixed(2)}`)
      .join('\n');
  }
}
