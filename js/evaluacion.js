/**
 * evaluacion.js
 * Define el banco de preguntas (mínimo 10), valida las respuestas del
 * estudiante y muestra retroalimentación inmediata mediante un modal
 * propio (no se usa alert() ni validaciones nativas de HTML).
 */

const PREGUNTAS = [
  {
    id: "p1",
    tipo: "opcion",
    magnitud: "tiempo",
    enunciado: "¿Cuántos segundos hay en 5 minutos?",
    opciones: ["250", "300", "350", "400"],
    respuesta: "300",
    procedimiento: "5 min × 60 s/min = 300 s. Se multiplica por el factor de minutos a segundos (60)."
  },
  {
    id: "p2",
    tipo: "completar",
    magnitud: "tiempo",
    enunciado: "Convierte 2 horas a minutos:",
    unidadResultado: "min",
    respuesta: 120,
    tolerancia: 0.5,
    procedimiento: "2 h × 60 min/h = 120 min. Se multiplica por el factor de horas a minutos (60)."
  },
  {
    id: "p3",
    tipo: "opcion",
    magnitud: "tiempo",
    enunciado: "3 días equivalen a:",
    opciones: ["48 horas", "72 horas", "96 horas", "24 horas"],
    respuesta: "72 horas",
    procedimiento: "3 día × 24 h/día = 72 h. Cada día tiene 24 horas."
  },
  {
    id: "p4",
    tipo: "completar",
    magnitud: "longitud",
    enunciado: "1500 mm equivalen a cuántos cm:",
    unidadResultado: "cm",
    respuesta: 150,
    tolerancia: 0.5,
    procedimiento: "1500 mm ÷ 10 = 150 cm, ya que 1 cm = 10 mm."
  },
  {
    id: "p5",
    tipo: "opcion",
    magnitud: "longitud",
    enunciado: "¿Cuántos metros hay en 4.5 km?",
    opciones: ["45 m", "450 m", "4500 m", "0.45 m"],
    respuesta: "4500 m",
    procedimiento: "4.5 km × 1000 m/km = 4500 m. Se multiplica por el factor de km a m (1000)."
  },
  {
    id: "p6",
    tipo: "completar",
    magnitud: "longitud",
    enunciado: "Convierte 320 cm a metros:",
    unidadResultado: "m",
    respuesta: 3.2,
    tolerancia: 0.05,
    procedimiento: "320 cm × 0.01 m/cm = 3.2 m. Se multiplica por el factor de cm a m (0.01)."
  },
  {
    id: "p7",
    tipo: "opcion",
    magnitud: "masa",
    enunciado: "¿A cuántos gramos equivalen 2 kg?",
    opciones: ["200 g", "2000 g", "20000 g", "0.2 g"],
    respuesta: "2000 g",
    procedimiento: "2 kg × 1000 g/kg = 2000 g. Se multiplica por el factor de kg a g (1000)."
  },
  {
    id: "p8",
    tipo: "completar",
    magnitud: "masa",
    enunciado: "Convierte 5 libras a gramos (usa 1 lb = 453.592 g):",
    unidadResultado: "g",
    respuesta: 2267.96,
    tolerancia: 2,
    procedimiento: "5 lb × 453.592 g/lb = 2267.96 g. Se multiplica por el factor de libras a gramos."
  },
  {
    id: "p9",
    tipo: "opcion",
    magnitud: "volumen",
    enunciado: "¿Cuántos ml hay en 1.5 litros?",
    opciones: ["150 ml", "1500 ml", "15000 ml", "15 ml"],
    respuesta: "1500 ml",
    procedimiento: "1.5 l × 1000 ml/l = 1500 ml. Se multiplica por el factor de litros a ml (1000)."
  },
  {
    id: "p10",
    tipo: "completar",
    magnitud: "volumen",
    enunciado: "Convierte 6 onzas a mililitros (usa 1 oz = 29.5735 ml):",
    unidadResultado: "ml",
    respuesta: 177.44,
    tolerancia: 1,
    procedimiento: "6 oz × 29.5735 ml/oz = 177.44 ml. Se multiplica por el factor de onzas a ml."
  }
];

let respuestasEstudiante = {};

/**
 * Construye dinámicamente el formulario de evaluación dentro del contenedor dado.
 */
function construirEvaluacion(idContenedor) {
  const contenedor = document.getElementById(idContenedor);
  if (!contenedor) return;

  contenedor.innerHTML = "";

  PREGUNTAS.forEach((pregunta, indice) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-pregunta";
    tarjeta.setAttribute("data-id", pregunta.id);

    const numero = document.createElement("p");
    numero.className = "numero-pregunta";
    numero.textContent = "Pregunta " + (indice + 1) + " de " + PREGUNTAS.length;
    tarjeta.appendChild(numero);

    const enunciado = document.createElement("p");
    enunciado.className = "enunciado-pregunta";
    enunciado.textContent = pregunta.enunciado;
    tarjeta.appendChild(enunciado);

    if (pregunta.tipo === "opcion") {
      const listaOpciones = document.createElement("div");
      listaOpciones.className = "lista-opciones";
      pregunta.opciones.forEach((opcion, indiceOpcion) => {
        const idInput = pregunta.id + "-opcion-" + indiceOpcion;
        const contenedorOpcion = document.createElement("label");
        contenedorOpcion.className = "opcion-radio";
        contenedorOpcion.setAttribute("for", idInput);

        const input = document.createElement("input");
        input.type = "radio";
        input.name = pregunta.id;
        input.id = idInput;
        input.value = opcion;

        contenedorOpcion.appendChild(input);
        contenedorOpcion.appendChild(document.createTextNode(" " + opcion));
        listaOpciones.appendChild(contenedorOpcion);
      });
      tarjeta.appendChild(listaOpciones);
    } else {
      const contenedorInput = document.createElement("div");
      contenedorInput.className = "contenedor-input-completar";

      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "decimal";
      input.id = pregunta.id + "-respuesta";
      input.className = "input-completar";
      input.setAttribute("placeholder", "Escribe el valor numérico");
      input.setAttribute("aria-label", pregunta.enunciado);

      const etiquetaUnidad = document.createElement("span");
      etiquetaUnidad.className = "etiqueta-unidad-pregunta";
      etiquetaUnidad.textContent = pregunta.unidadResultado;

      contenedorInput.appendChild(input);
      contenedorInput.appendChild(etiquetaUnidad);
      tarjeta.appendChild(contenedorInput);

      const mensajeError = document.createElement("p");
      mensajeError.className = "mensaje-error-pregunta";
      mensajeError.setAttribute("data-error-para", pregunta.id);
      tarjeta.appendChild(mensajeError);
    }

    contenedor.appendChild(tarjeta);
  });
}

/**
 * Valida todas las respuestas, calcula el puntaje y muestra el modal de resultados.
 */
function calificarEvaluacion() {
  let aciertos = 0;
  const detalleErrores = [];
  let hayEntradaInvalida = false;

  PREGUNTAS.forEach((pregunta) => {
    if (pregunta.tipo === "opcion") {
      const seleccionado = document.querySelector('input[name="' + pregunta.id + '"]:checked');
      const valorSeleccionado = seleccionado ? seleccionado.value : null;
      if (valorSeleccionado === pregunta.respuesta) {
        aciertos++;
      } else {
        detalleErrores.push({
          enunciado: pregunta.enunciado,
          procedimiento: pregunta.procedimiento
        });
      }
    } else {
      const campoInput = document.getElementById(pregunta.id + "-respuesta");
      const campoError = document.querySelector('[data-error-para="' + pregunta.id + '"]');
      const textoIngresado = campoInput.value.trim();

      if (textoIngresado === "") {
        campoError.textContent = "Este campo es obligatorio.";
        campoInput.classList.add("input-invalido");
        hayEntradaInvalida = true;
        return;
      }

      const expresionNumerica = /^-?\d+(\.\d+)?$/;
      if (!expresionNumerica.test(textoIngresado)) {
        campoError.textContent = "Ingresa solo un valor numérico (sin letras ni símbolos).";
        campoInput.classList.add("input-invalido");
        hayEntradaInvalida = true;
        return;
      }

      campoError.textContent = "";
      campoInput.classList.remove("input-invalido");

      const valorIngresado = parseFloat(textoIngresado);
      const diferencia = Math.abs(valorIngresado - pregunta.respuesta);
      if (diferencia <= pregunta.tolerancia) {
        aciertos++;
      } else {
        detalleErrores.push({
          enunciado: pregunta.enunciado,
          procedimiento: pregunta.procedimiento
        });
      }
    }
  });

  if (hayEntradaInvalida) {
    mostrarModal(
      "Revisa tus respuestas",
      "Hay campos vacíos o con caracteres no numéricos. Corrígelos antes de calificar la evaluación.",
      []
    );
    return;
  }

  const total = PREGUNTAS.length;
  const tituloResultado = aciertos === total
    ? "¡Excelente! Respondiste todo correctamente"
    : "Resultado de la evaluación";
  const mensajeResultado = "Obtuviste " + aciertos + " de " + total + " respuestas correctas.";

  mostrarModal(tituloResultado, mensajeResultado, detalleErrores);
}

/**
 * Muestra el modal propio de retroalimentación (nunca alert()).
 */
function mostrarModal(titulo, mensaje, listaErrores) {
  const modal = document.getElementById("modal-retroalimentacion");
  const tituloModal = document.getElementById("modal-titulo");
  const mensajeModal = document.getElementById("modal-mensaje");
  const listaModal = document.getElementById("modal-lista-errores");

  tituloModal.textContent = titulo;
  mensajeModal.textContent = mensaje;
  listaModal.innerHTML = "";

  if (listaErrores.length > 0) {
    const subtitulo = document.createElement("p");
    subtitulo.className = "modal-subtitulo-errores";
    subtitulo.textContent = "Procedimiento correcto de las preguntas falladas:";
    listaModal.appendChild(subtitulo);

    listaErrores.forEach((error) => {
      const elementoLista = document.createElement("li");
      const enunciadoFuerte = document.createElement("strong");
      enunciadoFuerte.textContent = error.enunciado + " ";
      elementoLista.appendChild(enunciadoFuerte);
      elementoLista.appendChild(document.createTextNode(error.procedimiento));
      listaModal.appendChild(elementoLista);
    });
  }

  modal.classList.add("modal-visible");
  modal.setAttribute("aria-hidden", "false");
  document.getElementById("modal-cerrar").focus();
}

function cerrarModal() {
  const modal = document.getElementById("modal-retroalimentacion");
  modal.classList.remove("modal-visible");
  modal.setAttribute("aria-hidden", "true");
}
