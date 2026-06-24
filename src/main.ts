import './style.css';
import type { Usuario } from './interfaces/system';
import { CAuth } from './Controllers/CAuth';
import { CChat } from './Controllers/CChat';
import { CMisPedidos } from './Controllers/CMisPedidos';
import { CPedido } from './Controllers/CPedido';
import { CProducto } from './Controllers/CProducto';
import { CReporte } from './Controllers/CReporte';
import { CUsuario } from './Controllers/CUsuario';
import { CEntrenamientoIA } from './Controllers/CEntrenamientoIA';

const app = document.querySelector<HTMLElement>('#app');
const navChat = document.querySelector<HTMLButtonElement>('#navChat');
const navMisPedidos = document.querySelector<HTMLButtonElement>('#navMisPedidos');
const navPedidos = document.querySelector<HTMLButtonElement>('#navPedidos');
const navProductos = document.querySelector<HTMLButtonElement>('#navProductos');
const navUsuarios = document.querySelector<HTMLButtonElement>('#navUsuarios');
const navEntrenamiento = document.querySelector<HTMLButtonElement>('#navEntrenamiento');
const navReportes = document.querySelector<HTMLButtonElement>('#navReportes');
const navCerrarSesion = document.querySelector<HTMLButtonElement>('#navCerrarSesion');

if (!app || !navChat || !navMisPedidos || !navPedidos || !navProductos || !navUsuarios || !navEntrenamiento || !navReportes || !navCerrarSesion) {
  throw new Error('No se pudo iniciar la interfaz.');
}

const root = app;
const btnChat = navChat;
const btnMisPedidos = navMisPedidos;
const btnPedidos = navPedidos;
const btnProductos = navProductos;
const btnUsuarios = navUsuarios;
const btnEntrenamiento = navEntrenamiento;
const btnReportes = navReportes;
const btnCerrarSesion = navCerrarSesion;
const authController = new CAuth((usuario) => iniciarAplicacion(usuario));
let sesionActual: Usuario | null = authController.obtenerSesion();

function mostrar(vista: HTMLElement): void {
  root.replaceChildren(vista);
}

function configurarNavegacion(usuario: Usuario | null): void {
  const autenticado = usuario !== null;
  btnChat.hidden = !autenticado || usuario.rol !== 'cliente';
  btnMisPedidos.hidden = !autenticado || usuario.rol !== 'cliente';
  btnPedidos.hidden = !autenticado || usuario.rol === 'cliente';
  btnProductos.hidden = !autenticado || usuario.rol === 'cliente';
  btnUsuarios.hidden = !autenticado || usuario.rol !== 'administrador';
  btnEntrenamiento.hidden = !autenticado || usuario.rol !== 'administrador';
  btnReportes.hidden = !autenticado || usuario.rol !== 'administrador';
  btnCerrarSesion.hidden = !autenticado;
}

function iniciarAplicacion(usuario: Usuario | null): void {
  sesionActual = usuario;
  configurarNavegacion(usuario);

  if (!usuario) {
    mostrar(authController.crear());
    return;
  }

  const pedidoController = new CPedido();
  const productoController = new CProducto();
  const reporteController = new CReporte();
  const usuarioController = new CUsuario();
  const entrenamientoController = new CEntrenamientoIA();
  const chatController = new CChat(usuario);
  const misPedidosController = new CMisPedidos(usuario);

  btnChat.onclick = () => {
    if (sesionActual?.rol === 'cliente') mostrar(chatController.crear());
  };

  btnMisPedidos.onclick = () => {
    if (sesionActual?.rol === 'cliente') mostrar(misPedidosController.crear());
  };

  btnPedidos.onclick = () => {
    if (sesionActual?.rol !== 'cliente') mostrar(pedidoController.crear());
  };

  btnProductos.onclick = () => {
    if (sesionActual?.rol !== 'cliente') mostrar(productoController.crear());
  };

  btnUsuarios.onclick = () => {
    if (sesionActual?.rol === 'administrador') mostrar(usuarioController.crear());
  };

  btnEntrenamiento.onclick = () => {
    if (sesionActual?.rol === 'administrador') mostrar(entrenamientoController.crear());
  };

  btnReportes.onclick = () => {
    if (sesionActual?.rol === 'administrador') mostrar(reporteController.crear());
  };

  if (usuario.rol === 'cliente') {
    mostrar(chatController.crear());
    return;
  }

  mostrar(pedidoController.crear());
}

btnCerrarSesion.addEventListener('click', () => authController.cerrarSesion());

iniciarAplicacion(sesionActual);
