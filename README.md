# Pawly Web

Frontend de PawlyApp para Programación para Internet I, construido con React y Vite. Es un repositorio independiente: Android y el backend GraphQL se desarrollan por separado.

## Ejecutar localmente

Requiere Node.js 22.12 o posterior.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Abrir http://localhost:5173. En Windows se puede copiar el archivo desde el explorador.

- `VITE_PREVIEW=true`: avance público con catálogo de razas y búsqueda; no requiere backend.
- `VITE_PREVIEW=false` y `VITE_API_URL=http://localhost:4000/`: aplicación conectada a la API local. Primero iniciar los servicios en el repositorio separado [BDpawlyapp](https://github.com/Beca1804/BDpawlyapp).

## Qué funciona en el avance público

Inicio adaptable a móvil y escritorio, paleta de Pawly, catálogo de 18 razas con descripción, tamaño, energía y origen, búsqueda por nombre y estados de carga, error y lista vacía. El catálogo se exportó de los registros actualizados en MongoDB; `public/data/razas.json` contiene exclusivamente información pública de razas. No se necesita mantener encendida la computadora para consultarlo.

## Qué funciona conectado al backend local

Registro de cuentas, login, cierre con revocación de sesión, menú recibido de Neo4j, consulta y creación de mascotas, registro y consulta de actividad, lectura de historial médico, vacunas y citas. Usuarios se muestra según los permisos administrativos. El token permanece en memoria, por lo que recargar requiere iniciar sesión otra vez.

## Qué sigue en construcción

Conexión del sitio público con una API y bases alojadas en la nube; acceso a cuentas desde el despliegue público; GPS y pasos automáticos, fotografías, edición de perfiles, formularios de vacunas y citas, notificaciones y comunidad. El avance publicado muestra el catálogo; no presenta las funciones locales como si ya estuvieran desplegadas.

## Pruebas y compilación

```sh
npm test
npm run build
npm run preview
```

`dist/` contiene el sitio compilado. Para compilar exactamente el avance público, configurar `VITE_PREVIEW=true` y dejar `VITE_API_URL` vacío antes del build. Se usan rutas con hash para recargar secciones sin errores de rutas.

## Render

Static Site, raíz del repositorio, comando `npm ci && npm run build`, directorio de publicación `dist`, variable `VITE_PREVIEW=true`. La configuración también está en `render.yaml`. Sitio publicado: https://pawly-web.onrender.com

Repositorio: https://github.com/LeslieSc/pawly-web

Las variables se leen con `import.meta.env.VITE_...`. Son públicas: nunca colocar contraseñas ni secretos del backend en ellas. `.env.local`, `node_modules/` y `dist/` están excluidos de Git. Se incluyen `.env.example` y `package-lock.json`.

## Organización

`src/main.jsx` monta React. `App.jsx` administra sesión y navegación; `views.jsx` reúne las pantallas; `ui.jsx` contiene componentes y el hook de consultas; `api.js` conecta GraphQL; `catalog.js` lee el catálogo público. Las consultas descartan resultados cuando se abandona una pantalla.

Paleta: `#B82799`, `#27B8B3`, `#B89F27`, `#633659` y `#283838`.
