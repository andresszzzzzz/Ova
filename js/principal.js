/**
 * principal.js
 * Inicializa la página: llena los selectores de unidades del conversor
 * interactivo, escucha los cambios de los inputs para recalcular en
 * tiempo real (sin recargar la página) y conecta el módulo de evaluación.
 */

const ETIQUETAS_MAGNITUD = {
  tiempo: "Tiempo",
  longitud: "Longitud",
  masa: "Masa",
  volumen: "Volumen"
};

document.addEventListener("DOMContentLoaded", () => {
  inicializarPestanasMagnitud();
  inicializarConversorInteractivo();
  construirEvaluacion("contenedor-preguntas");
  inicializarBotonesModal();
  inicializarEjemplosResueltos();
});

/**
 * Controla las pestañas de la sección "Contenidos Multimediales" (Paso 2)
 * que permiten alternar entre tiempo, longitud, masa y volumen.
 */
function inicializarPestanasMagnitud() {
  const botones = document.querySelectorAll(".boton-pestana");
  if (botones.length === 0) return;

  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      const magnitudObjetivo = boton.getAttribute("data-magnitud");

      botones.forEach((b) => b.setAttribute("aria-selected", "false"));
      boton.setAttribute("aria-selected", "true");

      document.querySelectorAll(".panel-magnitud").forEach((panel) => {
        panel.classList.remove("panel-activo");
      });
      const panelObjetivo = document.getElementById("panel-" + magnitudObjetivo);
      if (panelObjetivo) {
        panelObjetivo.classList.add("panel-activo");
        // Redibuja las animaciones de los ejemplos del panel recién mostrado
        panelObjetivo.querySelectorAll("[data-ejemplo-canvas]").forEach((lienzo) => {
          const valorOrigen = parseFloat(lienzo.getAttribute("data-valor-origen"));
          const valorDestino = parseFloat(lienzo.getAttribute("data-valor-destino"));
          const etiquetaOrigen = lienzo.getAttribute("data-etiqueta-origen");
          const etiquetaDestino = lienzo.getAttribute("data-etiqueta-destino");
          animarBarras(lienzo.id, valorOrigen, valorDestino, etiquetaOrigen, etiquetaDestino);
        });
      }
    });
  });
}

/**
 * Llena el selector de unidades según la magnitud elegida.
 */
function llenarSelectorUnidades(selectorElemento, magnitud) {
  const unidades = obtenerUnidades(magnitud);
  selectorElemento.innerHTML = "";
  unidades.forEach((unidad) => {
    const opcion = document.createElement("option");
    opcion.value = unidad.clave;
    opcion.textContent = unidad.etiqueta;
    selectorElemento.appendChild(opcion);
  });
}

function inicializarConversorInteractivo() {
  const selectorMagnitud = document.getElementById("selector-magnitud");
  const selectorOrigen = document.getElementById("selector-unidad-origen");
  const selectorDestino = document.getElementById("selector-unidad-destino");
  const inputValor = document.getElementById("input-valor-origen");
  const mensajeError = document.getElementById("mensaje-error-conversor");
  const resultadoTexto = document.getElementById("resultado-conversion");

  if (!selectorMagnitud) return; // el conversor no está en esta vista

  function actualizarSelectoresUnidad() {
    const magnitud = selectorMagnitud.value;
    llenarSelectorUnidades(selectorOrigen, magnitud);
    llenarSelectorUnidades(selectorDestino, magnitud);
    // Selecciona automáticamente una segunda unidad distinta como destino, si existe
    if (selectorDestino.options.length > 1) {
      selectorDestino.selectedIndex = 1;
    }
    recalcular();
  }

  function recalcular() {
    const magnitud = selectorMagnitud.value;
    const textoValor = inputValor.value.trim();

    if (textoValor === "") {
      resultadoTexto.textContent = "—";
      mensajeError.textContent = "";
      inputValor.classList.remove("input-invalido");
      dibujarEstadoInicial("lienzo-conversor");
      return;
    }

    const expresionNumerica = /^-?\d+(\.\d+)?$/;
    if (!expresionNumerica.test(textoValor)) {
      resultadoTexto.textContent = "—";
      mensajeError.textContent = "Ingresa solo números (no se permiten letras ni símbolos).";
      inputValor.classList.add("input-invalido");
      return;
    }

    mensajeError.textContent = "";
    inputValor.classList.remove("input-invalido");

    const valor = parseFloat(textoValor);
    const unidadOrigen = selectorOrigen.value;
    const unidadDestino = selectorDestino.value;

    const resultado = convertir(magnitud, valor, unidadOrigen, unidadDestino);
    resultadoTexto.textContent = formatearNumero(resultado) + " " + unidadDestino;

    animarBarras(
      "lienzo-conversor",
      valor,
      resultado,
      unidadOrigen,
      unidadDestino
    );
  }

  selectorMagnitud.addEventListener("change", actualizarSelectoresUnidad);
  selectorOrigen.addEventListener("change", recalcular);
  selectorDestino.addEventListener("change", recalcular);
  inputValor.addEventListener("input", recalcular);

  // Estado inicial
  actualizarSelectoresUnidad();
  dibujarEstadoInicial("lienzo-conversor");
}

/**
 * Conecta el botón de calificar y el botón de cerrar del modal.
 */
function inicializarBotonesModal() {
  const botonCalificar = document.getElementById("boton-calificar");
  const botonCerrarModal = document.getElementById("modal-cerrar");
  const fondoModal = document.getElementById("modal-retroalimentacion");

  if (botonCalificar) {
    botonCalificar.addEventListener("click", calificarEvaluacion);
  }
  if (botonCerrarModal) {
    botonCerrarModal.addEventListener("click", cerrarModal);
  }
  if (fondoModal) {
    fondoModal.addEventListener("click", (evento) => {
      if (evento.target === fondoModal) cerrarModal();
    });
    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape") cerrarModal();
    });
  }
}

/**
 * Dibuja las mini-animaciones estáticas de comparación junto a cada
 * ejemplo resuelto de la sección de Contenidos Multimediales (Paso 2).
 */
function inicializarEjemplosResueltos() {
  const lienzosEjemplo = document.querySelectorAll("[data-ejemplo-canvas]");
  lienzosEjemplo.forEach((lienzo) => {
    const valorOrigen = parseFloat(lienzo.getAttribute("data-valor-origen"));
    const valorDestino = parseFloat(lienzo.getAttribute("data-valor-destino"));
    const etiquetaOrigen = lienzo.getAttribute("data-etiqueta-origen");
    const etiquetaDestino = lienzo.getAttribute("data-etiqueta-destino");
    animarBarras(lienzo.id, valorOrigen, valorDestino, etiquetaOrigen, etiquetaDestino);
  });
}
