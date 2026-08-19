const PREGUNTAS = [
  { id: "n1", tipo: "opcion", enunciado: "Una película dura 2 horas y 30 minutos. ¿Cuántos minutos dura en total?", opciones: ["120 min", "130 min", "150 min", "180 min"], respuesta: "150 min", explicacion: "2 h × 60 = 120 min; 120 + 30 = 150 min." },
  { id: "n2", tipo: "completar", enunciado: "Una caminata mide 1,8 km. ¿Cuántos metros son?", respuesta: 1800, tolerancia: 0.5, unidad: "m", explicacion: "1,8 km × 1000 m/km = 1800 m." },
  { id: "n3", tipo: "opcion", enunciado: "Una receta necesita 750 ml de agua. ¿Qué cantidad en litros corresponde?", opciones: ["0,075 L", "0,75 L", "7,5 L", "75 L"], respuesta: "0,75 L", explicacion: "750 ml ÷ 1000 = 0,75 L." },
  { id: "n4", tipo: "completar", enunciado: "Un paquete pesa 3,5 kg. Convierte el peso a gramos.", respuesta: 3500, tolerancia: 0.5, unidad: "g", explicacion: "3,5 kg × 1000 g/kg = 3500 g." },
  { id: "n5", tipo: "opcion", enunciado: "¿Cuál es la unidad base utilizada por este OVA para la longitud?", opciones: ["cm", "mm", "m", "km"], respuesta: "m", explicacion: "La unidad base definida para longitud es el metro (m)." },
  { id: "n6", tipo: "completar", enunciado: "Convierte 4,5 horas a segundos.", respuesta: 16200, tolerancia: 1, unidad: "s", explicacion: "4,5 h × 3600 s/h = 16 200 s." },
  { id: "n7", tipo: "opcion", enunciado: "Un vaso contiene 250 ml. ¿Cuántos centímetros cúbicos (cm³) contiene?", opciones: ["25 cm³", "250 cm³", "2500 cm³", "0,25 cm³"], respuesta: "250 cm³", explicacion: "1 ml = 1 cm³, por lo tanto 250 ml = 250 cm³." },
  { id: "n8", tipo: "completar", enunciado: "Una bolsa contiene 2 libras. Usa 1 lb = 453,592 g. ¿Cuántos gramos son?", respuesta: 907.184, tolerancia: 1, unidad: "g", explicacion: "2 lb × 453,592 g/lb = 907,184 g." },
  { id: "n9", tipo: "opcion", enunciado: "Para convertir 600 cm a metros debes:", opciones: ["multiplicar por 1000", "dividir entre 100", "multiplicar por 100", "dividir entre 10"], respuesta: "dividir entre 100", explicacion: "1 m = 100 cm; por eso 600 ÷ 100 = 6 m." },
  { id: "n10", tipo: "completar", enunciado: "Una botella tiene 1,25 litros. ¿Cuántos mililitros contiene?", respuesta: 1250, tolerancia: 0.5, unidad: "ml", explicacion: "1,25 L × 1000 ml/L = 1250 ml." }
];
let indice = 0, respuestas = {};

document.addEventListener("DOMContentLoaded", () => {
  const cont = document.getElementById("contenedor-preguntas"); if (!cont) return;
  renderPregunta();
  document.getElementById("anterior").addEventListener("click", () => { if (indice > 0) { indice--; renderPregunta() } });
  document.getElementById("siguiente").addEventListener("click", () => { guardarRespuesta(); if (indice < PREGUNTAS.length - 1) { indice++; renderPregunta() } });
  document.getElementById("boton-calificar").addEventListener("click", (evento) => {
    evento.preventDefault();
    calificar();
  });
});

function renderPregunta() {
  const p = PREGUNTAS[indice], cont = document.getElementById("contenedor-preguntas");
  document.getElementById("progreso-texto").textContent = `Pregunta ${indice + 1} de ${PREGUNTAS.length}`;
  document.getElementById("barra-progreso").style.width = `${((indice + 1) / PREGUNTAS.length) * 100}%`;
  document.getElementById("anterior").classList.toggle("hidden", indice === 0);
  document.getElementById("siguiente").classList.toggle("hidden", indice === PREGUNTAS.length - 1);
  document.getElementById("boton-calificar").classList.toggle("hidden", indice !== PREGUNTAS.length - 1);
  let html = `<div class="pregunta-card"><span class="eyebrow">${p.tipo === "opcion" ? "Selección múltiple" : "Respuesta numérica"}</span><h2>${p.enunciado}</h2>`;
  if (p.tipo === "opcion") {
    html += '<div class="opciones">' + p.opciones.map(o => `<button type="button" class="opcion ${respuestas[p.id] === o ? "selected" : ""}" data-value="${o.replace(/"/g, "&quot;")}">${o}</button>`).join("") + '</div>';
  } else {
    html += `<input class="respuesta-input" id="respuesta-num" inputmode="decimal" placeholder="Escribe tu respuesta${p.unidad ? " en " + p.unidad : ""}" value="${respuestas[p.id] ?? ""}">`;
  }
  html += "</div>"; cont.innerHTML = html;
  cont.querySelectorAll(".opcion").forEach(b => b.addEventListener("click", () => { respuestas[p.id] = b.dataset.value; renderPregunta() }));
}

function guardarRespuesta() {
  const p = PREGUNTAS[indice], input = document.getElementById("respuesta-num");
  if (input) respuestas[p.id] = input.value.replace(",", ".").trim();
}

function calificar() {
  const boton = document.getElementById("boton-calificar");
  if (boton?.dataset.calificando === "1") return;
  if (boton) boton.dataset.calificando = "1";

  guardarRespuesta();

  let puntos = 0;
  const detalle = [];

  PREGUNTAS.forEach(p => {
    const r = respuestas[p.id];
    let ok = false;

    if (p.tipo === "opcion") {
      ok = r === p.respuesta;
    } else {
      ok = r !== undefined && r !== "" && Number.isFinite(Number(r)) &&
        Math.abs(Number(r) - p.respuesta) <= p.tolerancia;
    }

    if (ok) puntos++;
    detalle.push({ p, ok, r });
  });

  const porcentaje = puntos * 10;
  const contPreguntas = document.getElementById("contenedor-preguntas");
  const quizActions = document.querySelector(".quiz-actions");
  const quizProgress = document.querySelector(".quiz-progress");
  const box = document.getElementById("resultado-final");

  // Mantener también el resultado integrado como respaldo si el modal se cierra.
  const mensaje = puntos >= 8
    ? "¡Excelente! Dominas las conversiones."
    : puntos >= 6
      ? "Buen trabajo. Repasa las preguntas que fallaste."
      : "Sigue practicando con el laboratorio y vuelve a intentarlo.";

  const detalleHtml = detalle.map((d, i) => `
    <div class="detalle-resultado ${d.ok ? "correcta" : "incorrecta"}">
      <strong>${i + 1}. ${d.ok ? "✓ Correcta" : "✗ Para mejorar"}</strong>
      ${!d.ok ? `<div><span>Tu respuesta:</span> ${d.r ? d.r : "Sin respuesta"}</div>
      <div><span>Respuesta esperada:</span> ${d.p.respuesta}</div>
      <small>${d.p.explicacion}</small>` : ""}
    </div>
  `).join("");

  const resultadoHtml = `
    <div class="resultado-modal">
      <div class="resultado-puntaje">${puntos}<small>/10</small></div>
      <div class="resultado-porcentaje">${porcentaje}%</div>
      <p class="resultado-mensaje">${mensaje}</p>
      <div class="detalle-resultados">${detalleHtml}</div>
    </div>
  `;

  const resultadoIntegrado = `
    <div style="text-align:center; padding:20px;">
      <h2>${puntos}/10 · ${porcentaje}%</h2>
      <p style="font-size:16px; margin:15px 0; color:#4a5568;">${mensaje}</p>
      <div style="text-align:left; margin-top:20px; max-height:300px; overflow-y:auto; padding-right:10px;">
        ${detalle.map((d, i) => `
          <p style="margin-bottom:10px; padding:8px; border-radius:6px; background:${d.ok ? '#f0fff4' : '#fff5f5'};">
            <strong>${i + 1}. ${d.ok ? "✓ Correcta" : "✗ Para mejorar"}</strong><br>
            ${!d.ok ? `<span style="font-size:13px; color:#e53e3e;">Respuesta esperada: ${d.p.respuesta}. ${d.p.explicacion}</span>` : ""}
          </p>
        `).join("")}
      </div>
      <button class="btn primary" type="button" onclick="location.reload()" style="margin-top:25px;">Intentar de nuevo</button>
    </div>
  `;

  if (contPreguntas) contPreguntas.style.display = "none";
  if (quizActions) quizActions.style.display = "none";
  if (quizProgress) quizProgress.style.display = "none";

  if (box) {
    box.classList.remove("hidden");
    box.innerHTML = resultadoIntegrado;
  }

  // Mostrar el resultado en el modal visual existente.
  if (typeof window.mostrarModalEvaluacion === "function") {
    window.mostrarModalEvaluacion("Resultado de la evaluación", resultadoHtml, puntos >= 6 ? "exito" : "info");
  }

  if (box) box.scrollIntoView({ behavior: "smooth", block: "center" });
}
