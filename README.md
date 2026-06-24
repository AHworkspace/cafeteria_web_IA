# Cafeteria Estado

Sistema pequeno para gestionar productos, pedidos y reportes de ventas de una cafeteria.

## Tecnologias

- TypeScript
- HTML y CSS
- Vite
- localStorage
- Arquitectura MVC

El proyecto no necesita PHP, PostgreSQL ni una API. Los datos quedan guardados en el
navegador mediante `DatabaseJson`.

## Casos de uso

1. `CU1. Gestionar productos`: crear, listar, editar, activar/desactivar y eliminar.
2. `CU2. Gestionar pedidos`: registrar pedidos y cambiar su estado.
3. `CU3. Consultar reporte de ventas`: filtrar ventas por fechas, producto y cliente.
4. `CU4. Iniciar sesion por rol`: cliente, vendedor o administrador.
5. `CU5. Asistente IA`: el cliente consulta menu, recomendaciones y envia pedidos.
6. `CU6. Entrenar IA`: el administrador agrega frases para mejorar el clasificador.

## Roles

- `cliente`: solo accede al chat IA, consulta el menu y envia pedidos personalizados.
- `vendedor`: gestiona productos, pedidos manuales y acepta/rechaza pedidos de clientes.
- `administrador`: puede hacer todo, incluyendo reportes.
- `administrador`: tambien gestiona el entrenamiento IA.

Usuarios iniciales:

```text
admin@cafeteria.com / admin123
vendedor@cafeteria.com / vendedor123
```

Los clientes se registran desde la pantalla de inicio.

## Patrones

### State

Se aplica en `CU2`:

```text
Pendiente -> Preparando -> Entregado
Pendiente -> Cancelado
Preparando -> Cancelado
```

Las clases estan en `src/states`.

### Asistente IA

Se aplica en `CU5`. `AsistenteIA` consulta el menu actual y responde al cliente.
Usa un modelo local de Machine Learning supervisado (`ClasificadorIntencion`) basado
en Naive Bayes para reconocer intenciones como menu, precios, recomendaciones,
pedido y acciones del pedido. Todo funciona localmente en el navegador, sin servicios externos.
El administrador puede agregar mas ejemplos desde `Entrenamiento IA`; esos ejemplos
se guardan en `entrenamiento_ia` y se suman al entrenamiento base.

## Estructura

```text
examen2_1/
  index.html
  package.json
  tsconfig.json
  src/
    Controllers/
    models/
    proxy/
    states/
    interfaces/
    utils/
    view/
    main.ts
    style.css
```

## Datos

`localStorage` representa las tres tablas del modelo:

- `productos`
- `pedidos`
- `detalle_pedidos`
- `usuarios`
- `entrenamiento_ia`

Cada navegador mantiene sus propios datos.

## Ejecucion

```bash
npm install
npm run dev
```

Despues abre la direccion que muestre Vite, normalmente:

```text
http://localhost:5173
```

Para comprobar la compilacion:

```bash
npm run build
```
