const ETIQUETAS_MAGNITUD = { tiempo: "Tiempo", longitud: "Longitud", masa: "Masa", volumen: "Volumen" };

document.addEventListener("DOMContentLoaded", () => {
  inicializarPestanasMagnitud();
  inicializarConversorInteractivo();
  inicializarEjemplosResueltos();
  inicializarReto();
});

function inicializarPestanasMagnitud() {
  document.querySelectorAll(".boton-pestana").forEach(btn => {
    btn.addEventListener("click", () => {
      const mag = btn.dataset.magnitud;
      document.querySelectorAll(".boton-pestana").forEach(b => b.setAttribute("aria-selected", "false"));
      btn.setAttribute("aria-selected", "true");
      document.querySelectorAll(".panel-magnitud").forEach(p => p.classList.remove("panel-activo"));
      const panel = document.getElementById("panel-" + mag);
      if (panel) {
        panel.classList.add("panel-activo");
        panel.querySelectorAll("[data-ejemplo-canvas]").forEach(c => animarBarras(c.id,
          parseFloat(c.dataset.valorOrigen), parseFloat(c.dataset.valorDestino), c.dataset.etiquetaOrigen, c.dataset.etiquetaDestino));
      }
    });
  });
}
function llenarSelectorUnidades(el, magnitud) {
  if (!el) return;
  el.innerHTML = "";
  obtenerUnidades(magnitud).forEach(u => { const o = document.createElement("option"); o.value = u.clave; o.textContent = u.etiqueta; el.appendChild(o) });
}
function inicializarConversorInteractivo() {
  const mag = document.getElementById("selector-magnitud"); if (!mag) return;
  const ori = document.getElementById("selector-unidad-origen"), des = document.getElementById("selector-unidad-destino");
  const input = document.getElementById("input-valor-origen"), msg = document.getElementById("mensaje-error-conversor"), result = document.getElementById("resultado-conversion");
  function actualizar() {
    llenarSelectorUnidades(ori, mag.value); llenarSelectorUnidades(des, mag.value);
    if (des.options.length > 1) des.selectedIndex = 1; recalcular();
  }
  function recalcular() {
    const txt = input.value.trim();
    if (!txt) { result.textContent = "—"; msg.textContent = ""; dibujarEstadoInicial("lienzo-conversor"); return }
    if (!/^-?\d+([.,]\d+)?$/.test(txt)) { result.textContent = "—"; msg.textContent = "Usa un número, por ejemplo 12.5"; return }
    const valor = parseFloat(txt.replace(",", ".")), u1 = ori.value, u2 = des.value;
    const convertido = convertir(mag.value, valor, u1, u2);
    result.textContent = formatearNumero(convertido) + " " + u2; msg.textContent = "";
    const base = valor * FACTORES[mag.value].unidades[u1].factor;
    animarBarras("lienzo-conversor", valor, convertido, u1 + " · " + formatearNumero(valor), u2 + " · " + formatearNumero(convertido), base);
  }
  mag.addEventListener("change", actualizar); ori.addEventListener("change", recalcular); des.addEventListener("change", recalcular); input.addEventListener("input", recalcular);
  document.querySelectorAll(".quick button").forEach(b => b.addEventListener("click", () => { input.value = b.dataset.valor; recalcular() }));
  actualizar();
}
function inicializarEjemplosResueltos() {
  document.querySelectorAll("[data-ejemplo-canvas]").forEach(c => animarBarras(c.id, parseFloat(c.dataset.valorOrigen), parseFloat(c.dataset.valorDestino), c.dataset.etiquetaOrigen, c.dataset.etiquetaDestino));
}
function inicializarReto() {
  const b = document.getElementById("btn-reto"), r = document.getElementById("respuesta-reto"); if (!b) return;
  b.addEventListener("click", () => r.textContent = " ✓ 2,5 kg = 2500 g");
}
