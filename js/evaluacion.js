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
  document.getElementById("boton-calificar").addEventListener("click", calificar);
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
  guardarRespuesta(); let puntos = 0, detalle = [];
  PREGUNTAS.forEach(p => {
    const r = respuestas[p.id]; let ok = false;
    if (p.tipo === "opcion") ok = r === p.respuesta;
    else ok = r !== undefined && r !== "" && Math.abs(Number(r) - p.respuesta) <= p.tolerancia;
    if (ok) puntos++; detalle.push({ p, ok, r });
  });
  const porcentaje = puntos * 10;
  const box = document.getElementById("resultado-final"); box.classList.remove("hidden");
  box.innerHTML = `<h2>${puntos}/10 · ${porcentaje}%</h2><p>${puntos >= 8 ? "¡Excelente! Dominas las conversiones." : puntos >= 6 ? "Buen trabajo. Repasa las preguntas que fallaste." : "Sigue practicando con el laboratorio y vuelve a intentarlo."}</p><div>${detalle.map((d, i) => `<p><strong>${i + 1}. ${d.ok ? "✓ Correcta" : "✗ Para mejorar"}</strong> ${d.ok ? "" : `Respuesta esperada: ${d.p.respuesta}. ${d.p.explicacion}`}</p>`).join("")}</div>`;
  box.scrollIntoView({ behavior: "smooth", block: "start" });
}
