import type { EntrenamientoIA, IntencionIA } from '../interfaces/system';

type Intencion = IntencionIA | 'desconocido';

interface EjemploEntrenamiento {
  texto: string;
  intencion: Intencion;
  personalizado?: boolean;
}

interface Prediccion {
  intencion: Intencion;
  confianza: number;
}

export class ClasificadorIntencion {
  private ejemplos: EjemploEntrenamiento[];
  private vocabulario: Set<string>;
  private conteoPorIntencion: Map<Intencion, number>;
  private palabrasPorIntencion: Map<Intencion, Map<string, number>>;
  private totalPalabrasPorIntencion: Map<Intencion, number>;
  private palabrasIgnoradas: Set<string>;

  constructor(ejemplosExtra: EntrenamientoIA[] = []) {
    this.ejemplos = ejemplosExtra.map((ejemplo) => ({
      texto: ejemplo.texto,
      intencion: ejemplo.intencion,
      personalizado: true,
    }));
    this.palabrasIgnoradas = new Set([
      'pedido',
      'pedidos',
      'producto',
      'productos',
      'cliente',
      'cafeteria',
      'favor',
      'porfavor',
      'por',
      'para',
      'con',
      'sin',
      'del',
      'los',
      'las',
      'una',
      'uno',
      'mis',
      'mio',
      'mia',
      'este',
      'esta',
      'ese',
      'esa',
    ]);
    this.vocabulario = new Set<string>();
    this.conteoPorIntencion = new Map();
    this.palabrasPorIntencion = new Map();
    this.totalPalabrasPorIntencion = new Map();
    this.entrenar();
  }

  predecir(texto: string): Prediccion {
    const tokens = this.tokenizar(texto);
    if (tokens.length === 0) return { intencion: 'desconocido', confianza: 0 };

    const coincidenciaPersonalizada = this.buscarCoincidenciaPersonalizada(texto);
    if (coincidenciaPersonalizada) {
      return { intencion: coincidenciaPersonalizada, confianza: 1 };
    }

    const intenciones = [...this.conteoPorIntencion.keys()];
    if (intenciones.length === 0) return { intencion: 'desconocido', confianza: 0 };
    const puntajes = intenciones.map((intencion) => {
      const totalEjemplos = this.ejemplos.length;
      const ejemplosIntencion = this.conteoPorIntencion.get(intencion) ?? 0;
      const palabras = this.palabrasPorIntencion.get(intencion) ?? new Map<string, number>();
      const totalPalabras = this.totalPalabrasPorIntencion.get(intencion) ?? 0;
      const vocabularioSize = Math.max(1, this.vocabulario.size);

      let score = Math.log(ejemplosIntencion / totalEjemplos);
      tokens.forEach((token) => {
        const conteo = palabras.get(token) ?? 0;
        score += Math.log((conteo + 1) / (totalPalabras + vocabularioSize));
      });

      return { intencion, score };
    });

    const mejor = puntajes.sort((a, b) => b.score - a.score)[0];
    const confianza = this.calcularConfianza(mejor.score, puntajes.map((item) => item.score));

    return {
      intencion: confianza >= 0.22 ? mejor.intencion : 'desconocido',
      confianza,
    };
  }

  private entrenar(): void {
    this.ejemplos.forEach((ejemplo) => {
      const tokens = this.tokenizar(ejemplo.texto);
      this.conteoPorIntencion.set(
        ejemplo.intencion,
        (this.conteoPorIntencion.get(ejemplo.intencion) ?? 0) + 1,
      );

      if (!this.palabrasPorIntencion.has(ejemplo.intencion)) {
        this.palabrasPorIntencion.set(ejemplo.intencion, new Map());
      }

      const palabras = this.palabrasPorIntencion.get(ejemplo.intencion) as Map<string, number>;
      tokens.forEach((token) => {
        this.vocabulario.add(token);
        palabras.set(token, (palabras.get(token) ?? 0) + 1);
        this.totalPalabrasPorIntencion.set(
          ejemplo.intencion,
          (this.totalPalabrasPorIntencion.get(ejemplo.intencion) ?? 0) + 1,
        );
      });
    });
  }

  private calcularConfianza(mejorScore: number, scores: number[]): number {
    const maxScore = Math.max(...scores);
    const probabilidades = scores.map((score) => Math.exp(score - maxScore));
    const total = probabilidades.reduce((suma, valor) => suma + valor, 0);
    return Math.exp(mejorScore - maxScore) / total;
  }

  private buscarCoincidenciaPersonalizada(texto: string): IntencionIA | undefined {
    const tokensTexto = new Set(this.tokenizar(texto));
    const ejemplosPersonalizados = this.ejemplos
      .filter((ejemplo) => ejemplo.personalizado)
      .map((ejemplo) => ({
        ...ejemplo,
        tokens: this.tokenizar(ejemplo.texto),
      }))
      .sort((a, b) => b.tokens.length - a.tokens.length);

    return ejemplosPersonalizados.find((ejemplo) => {
      if (ejemplo.tokens.length === 0) return false;
      return ejemplo.tokens.every((token) => tokensTexto.has(token));
    })?.intencion as IntencionIA | undefined;
  }

  private tokenizar(texto: string): string[] {
    return this.normalizarTexto(texto)
      .split(/\s+/)
      .filter((token) => token.length > 2)
      .map((token) => this.normalizarToken(token))
      .filter((token) => token !== '' && !this.palabrasIgnoradas.has(token));
  }

  private normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizarToken(token: string): string {
    if (/^\d+$/.test(token)) return '';
    if (token.startsWith('anad')) return 'anadir';
    if (token.startsWith('agreg')) return 'agregar';
    if (token.startsWith('aument')) return 'aumentar';
    if (token.startsWith('sumal') || token.startsWith('sum')) return 'sumar';
    if (token.startsWith('quit')) return 'quitar';
    if (token.startsWith('sac')) return 'sacar';
    if (token.startsWith('elimin')) return 'eliminar';
    if (token.startsWith('retir')) return 'retirar';
    if (token.startsWith('cambi')) return 'cambiar';
    if (token.startsWith('modific')) return 'modificar';
    if (token.startsWith('confirm')) return 'confirmar';
    if (token.startsWith('envi')) return 'enviar';
    if (token.startsWith('cancel')) return 'cancelar';
    if (token.startsWith('borr')) return 'borrar';
    if (token.length > 4 && token.endsWith('es')) return token.slice(0, -2);
    if (token.length > 3 && token.endsWith('s')) return token.slice(0, -1);
    return token;
  }
}
