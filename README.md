# OVA · Conversión de Magnitudes Físicas

**Tema:** Conversión de magnitudes físicas escalares — tiempo, longitud, masa y volumen.

## Descripción

Objeto Virtual de Aprendizaje diseñado como una plataforma educativa interactiva para aprender, practicar y evaluar conversiones de unidades. La actualización visual incorpora tarjetas dinámicas, navegación activa, animaciones CSS, revelado al hacer scroll, microinteracciones, barra de progreso visual, modal personalizado, feedback visual y diseño responsive.

## Regla de funcionamiento

La lógica existente de conversiones, ejercicios, simuladores y evaluación se conserva. Las mejoras se agregaron principalmente mediante CSS y funciones JavaScript independientes para la capa visual e interactiva.

## Tecnologías utilizadas

- HTML5 semántico y accesible.
- CSS3 con variables CSS, animaciones, transiciones y media queries.
- JavaScript Vanilla.
- Canvas 2D para las visualizaciones de conversiones.
- No se agregan frameworks ni dependencias externas.
- `assets/matter.min.js` se conserva como recurso local del proyecto.

## Estructura

```text
/
├── index.html
├── contenidos.html
├── actividad.html
├── evaluacion.html
├── README.md
├── css/
│   ├── estilos.css
│   ├── variables.css
│   ├── animaciones.css
│   └── responsive.css
├── js/
│   ├── conversiones.js
│   ├── animaciones.js
│   ├── actividades.js
│   ├── evaluacion.js
│   ├── principal.js
│   └── interacciones.js
├── img/
│   ├── cocina.jpg
│   └── laboratorio.jpg
└── assets/
    └── matter.min.js
```

## Funcionalidades visuales añadidas

- Navegación con sección activa.
- Indicador de progreso superior según el desplazamiento.
- Animaciones suaves de entrada y aparición progresiva.
- Hover y estados activos en tarjetas, pestañas, botones y opciones.
- Efectos de selección en la evaluación.
- Visualización progresiva de pasos de los ejemplos.
- Botón flotante para volver al inicio.
- Modal personalizado para el reto rápido.
- Animación visual del resultado final de la evaluación.
- Soporte para `prefers-reduced-motion`.
- Mejoras responsive para computador, tablet y celular.
- Estados `:focus-visible` para accesibilidad.
- Variables CSS centralizadas para colores, sombras, radios y transiciones.

## Cómo ejecutar

1. Descomprime el proyecto.
2. Abre `index.html` en un navegador moderno.
3. Usa la navegación superior para recorrer **Inicio**, **Aprende**, **Practica** y **Evalúate**.
4. No requiere instalación de frameworks ni servidor para las funciones principales.

## Librerías permitidas

El OVA utiliza JavaScript Vanilla y Canvas 2D. No se agregaron CDNs, Bootstrap, Tailwind, React, Vue, Angular, jQuery ni otras dependencias externas.

## Capturas de pantalla

Agrega aquí capturas reales del OVA una vez abierto en el navegador:

- `img/captura-inicio.png`
- `img/captura-aprende.png`
- `img/captura-practica.png`
- `img/captura-evaluacion.png`

## Verificación

Se conservaron las funciones y cálculos existentes en `conversiones.js`, `principal.js`, `animaciones.js` y `evaluacion.js`. Las nuevas interacciones están aisladas en `js/interacciones.js`.

## Animaciones por magnitud
La versión mejorada incorpora una capa visual independiente (`js/magnitudes-visuales.js`) que no modifica la lógica de conversión ni evaluación. Usa Canvas 2D para representar tiempo y longitud, y Matter.js local (`assets/matter.min.js`) para las escenas físicas de masa y volumen. En tiempo se visualiza un reloj de arena con arena descendiendo; en longitud una regla con indicador móvil; en masa pesos con física 2D; y en volumen partículas dentro de un recipiente.
