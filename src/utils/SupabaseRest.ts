const SUPABASE_URL = (
  import.meta.env.VITE_SUPABASE_URL
  ?? 'https://zltsvswcruefqeiyvfoj.supabase.co'
).replace(/\/rest\/v1\/?$/, '');

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
  ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsdHN2c3djcnVlZnFlaXl2Zm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMDg3OTEsImV4cCI6MjA5Nzg4NDc5MX0.J-8_cL9uYr2JnWDBJnKh6Raah4crKyc4VnAWc40sW-A';

const TABLAS = [
  'usuarios',
  'productos',
  'pedidos',
  'detalle_pedidos',
  'entrenamiento_ia',
];

export class SupabaseRest {
  static estaConfigurado(): boolean {
    return SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '';
  }

  static async sincronizarDesdeServidor(): Promise<void> {
    if (!this.estaConfigurado()) return;

    await Promise.all(TABLAS.map(async (tabla) => {
      try {
        const filasServidor = await this.listar(tabla);
        const filasLocales = this.leerLocal(tabla);

        if (filasServidor.length > 0) {
          localStorage.setItem(tabla, JSON.stringify(filasServidor));
          return;
        }

        if (filasLocales.length > 0) {
          await Promise.all(filasLocales.map((fila) => this.guardar(tabla, fila)));
        }
      } catch (error) {
        console.warn(`No se pudo sincronizar la tabla ${tabla}.`, error);
      }
    }));
  }

  static async guardar(tabla: string, fila: Record<string, unknown>): Promise<void> {
    if (!this.estaConfigurado()) return;

    const respuesta = await fetch(`${SUPABASE_URL}/rest/v1/${tabla}?on_conflict=id`, {
      method: 'POST',
      headers: this.headers('resolution=merge-duplicates'),
      body: JSON.stringify(fila),
    });

    if (!respuesta.ok) {
      throw new Error(await respuesta.text());
    }
  }

  static async eliminar(tabla: string, id: number): Promise<void> {
    if (!this.estaConfigurado()) return;

    const respuesta = await fetch(`${SUPABASE_URL}/rest/v1/${tabla}?id=eq.${id}`, {
      method: 'DELETE',
      headers: this.headers(),
    });

    if (!respuesta.ok) {
      throw new Error(await respuesta.text());
    }
  }

  private static async listar(tabla: string): Promise<Record<string, unknown>[]> {
    const respuesta = await fetch(`${SUPABASE_URL}/rest/v1/${tabla}?select=*`, {
      headers: this.headers(),
    });

    if (!respuesta.ok) {
      throw new Error(await respuesta.text());
    }

    const filas = await respuesta.json();
    return Array.isArray(filas) ? filas as Record<string, unknown>[] : [];
  }

  private static headers(prefer?: string): HeadersInit {
    return {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    };
  }

  private static leerLocal(tabla: string): Record<string, unknown>[] {
    const contenido = localStorage.getItem(tabla);
    if (!contenido) return [];

    try {
      const filas = JSON.parse(contenido);
      return Array.isArray(filas) ? filas as Record<string, unknown>[] : [];
    } catch {
      return [];
    }
  }
}
