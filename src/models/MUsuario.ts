import type { RolUsuario, Usuario } from '../interfaces/system';
import { DatabaseJson } from '../utils/DatabaseJson';

export class MUsuario {
  private database: DatabaseJson<Usuario>;

  constructor() {
    this.database = new DatabaseJson<Usuario>('usuarios', 'id');
    this.sembrarUsuariosIniciales();
  }

  registrar(nombre: string, correo: string, password: string, rol: RolUsuario = 'cliente'): Usuario {
    const datos = {
      nombre: nombre.trim(),
      correo: correo.trim().toLowerCase(),
      password: password.trim(),
      rol,
    };

    this.validar(datos.nombre, datos.correo, datos.password);

    if (this.buscarPorCorreo(datos.correo)) {
      throw new Error('Ya existe un usuario con ese correo.');
    }

    return this.database.guardar({
      id: 0,
      ...datos,
    });
  }

  actualizar(id: number, nombre: string, correo: string, password: string, rol: RolUsuario): string {
    const usuario = this.database.buscar(id);
    if (!usuario) throw new Error('El usuario no existe.');
    if (usuario.rol === 'administrador' && rol !== 'administrador') {
      throw new Error('No se puede cambiar el rol del administrador principal.');
    }

    const datos = {
      nombre: nombre.trim(),
      correo: correo.trim().toLowerCase(),
      password: password.trim(),
      rol,
    };
    this.validar(datos.nombre, datos.correo, datos.password);

    const repetido = this.buscarPorCorreo(datos.correo);
    if (repetido && repetido.id !== id) {
      throw new Error('Ya existe un usuario con ese correo.');
    }

    this.database.actualizar({
      id,
      ...datos,
    });
    return 'Usuario actualizado correctamente.';
  }

  eliminar(id: number): string {
    const usuario = this.database.buscar(id);
    if (!usuario) throw new Error('El usuario no existe.');
    if (usuario.rol === 'administrador') {
      throw new Error('No se puede eliminar el administrador principal.');
    }

    this.database.eliminar(id);
    return 'Usuario eliminado correctamente.';
  }

  login(correo: string, password: string): Usuario {
    const usuario = this.buscarPorCorreo(correo.trim().toLowerCase());
    if (!usuario || usuario.password !== password.trim()) {
      throw new Error('Correo o contrasena incorrectos.');
    }
    return usuario;
  }

  buscar(id: number): Usuario | undefined {
    return this.database.buscar(id);
  }

  listar(): Usuario[] {
    return this.database.listar();
  }

  private buscarPorCorreo(correo: string): Usuario | undefined {
    return this.database.listar().find((usuario) => usuario.correo === correo);
  }

  private validar(nombre: string, correo: string, password: string): void {
    if (nombre === '') throw new Error('Ingrese el nombre.');
    if (correo === '') throw new Error('Ingrese el correo.');
    if (!correo.includes('@')) throw new Error('Ingrese un correo valido.');
    if (password.length < 4) throw new Error('La contrasena debe tener al menos 4 caracteres.');
  }

  private sembrarUsuariosIniciales(): void {
    if (this.database.listar().length > 0) return;

    this.database.guardar({
      id: 0,
      nombre: 'Administrador',
      correo: 'admin@cafeteria.com',
      password: 'admin123',
      rol: 'administrador',
    });
    this.database.guardar({
      id: 0,
      nombre: 'Vendedor',
      correo: 'vendedor@cafeteria.com',
      password: 'vendedor123',
      rol: 'vendedor',
    });
  }
}
