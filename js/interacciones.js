
(() => {
  "use strict";

  function crearModalVisual() {
    if (document.getElementById("modal-visual")) return;
    const modal = document.createElement("div");
    modal.id = "modal-visual";
    modal.className = "modal-visual oculto";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
        <button class="modal-cerrar" type="button" aria-label="Cerrar mensaje">×</button>
        <div class="modal-icono" aria-hidden="true">✓</div>
        <p class="eyebrow">Retroalimentación</p>
        <h2 id="modal-titulo">¡Muy bien!</h2>
        <div id="modal-mensaje" class="modal-mensaje"></div>
        <button class="btn primary modal-aceptar" type="button">Continuar</button>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector(".modal-cerrar").addEventListener("click", cerrarModal);
    modal.querySelector(".modal-aceptar").addEventListener("click", cerrarModal);
    modal.addEventListener("click", (evento) => { if (evento.target === modal) cerrarModal(); });
  }

  function mostrarModal(titulo, mensaje, tipo = "exito") {
    crearModalVisual();
    const modal = document.getElementById("modal-visual");
    const icono = modal.querySelector(".modal-icono");
    modal.querySelector("#modal-titulo").textContent = titulo;
    modal.querySelector("#modal-mensaje").textContent = mensaje;
    icono.textContent = tipo === "error" ? "!" : tipo === "info" ? "i" : "✓";
    modal.classList.remove("oculto");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-abierto");
    modal.querySelector(".modal-aceptar").focus();
  }

  function mostrarModalEvaluacion(titulo, contenidoHtml, tipo = "exito") {
    crearModalVisual();
    const modal = document.getElementById("modal-visual");
    const icono = modal.querySelector(".modal-icono");
    modal.querySelector("#modal-titulo").textContent = titulo;
    modal.querySelector("#modal-mensaje").innerHTML = contenidoHtml;
    icono.textContent = tipo === "error" ? "!" : tipo === "info" ? "i" : "✓";
    modal.classList.remove("oculto");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-abierto");
    modal.querySelector(".modal-aceptar").focus();
  }

  function cerrarModal() {
    const modal = document.getElementById("modal-visual");
    if (!modal) return;
    modal.classList.add("oculto");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-abierto");
  }

  function activarNavegacionActiva() {
    const pagina = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".topbar nav a").forEach(enlace => {
      const destino = enlace.getAttribute("href");
      if (destino === pagina) {
        enlace.classList.add("active");
        enlace.setAttribute("aria-current", "page");
      }
    });
  }

  function activarReveladoScroll() {
    const elementos = document.querySelectorAll(".section, .page-hero, .feature-card, .tarjeta-ejemplo, .converter-card, .chart-card, .challenge, .quiz-shell");
    elementos.forEach((elemento, indice) => {
      if (elemento.classList.contains("hero")) return;
      elemento.classList.add("reveal");
      elemento.style.animationDelay = `${Math.min(indice * 45, 260)}ms`;
    });
    const observador = new IntersectionObserver((entradas, observer) => {
      entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visible");
          observer.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach(elemento => observador.observe(elemento));
  }

  function activarOndasBotones() {
    document.addEventListener("click", evento => {
      const boton = evento.target.closest(".btn, .quick button, .boton-pestana, .opcion");
      if (!boton) return;
      boton.classList.remove("ripple");
      void boton.offsetWidth;
      boton.classList.add("ripple");
    });
  }

  function activarProgresoScroll() {
    const actualizar = () => {
      const maximo = document.documentElement.scrollHeight - window.innerHeight;
      const porcentaje = maximo > 0 ? (window.scrollY / maximo) * 100 : 0;
      document.documentElement.style.setProperty("--scroll-progress", `${porcentaje}%`);
    };
    window.addEventListener("scroll", actualizar, { passive: true });
    actualizar();
  }

  function crearBotonSubir() {
    const boton = document.createElement("button");
    boton.className = "scroll-top";
    boton.type = "button";
    boton.setAttribute("aria-label", "Volver al inicio");
    boton.textContent = "↑";
    document.body.appendChild(boton);
    window.addEventListener("scroll", () => boton.classList.toggle("visible", window.scrollY > 500), { passive: true });
    boton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function activarEjemplosProgresivos() {
    document.querySelectorAll(".tarjeta-ejemplo").forEach(tarjeta => {
      const pasos = tarjeta.querySelectorAll("li");
      pasos.forEach((paso, indice) => {
        paso.style.opacity = "0";
        paso.style.transform = "translateX(-8px)";
        paso.style.transition = "opacity .35s ease, transform .35s ease";
        paso.style.transitionDelay = `${indice * 90}ms`;
      });
      const mostrarPasos = () => pasos.forEach(paso => {
        paso.style.opacity = "1";
        paso.style.transform = "translateX(0)";
      });
      const observador = new IntersectionObserver(entradas => {
        if (entradas.some(entrada => entrada.isIntersecting)) {
          mostrarPasos();
          observador.disconnect();
        }
      }, { threshold: .25 });
      observador.observe(tarjeta);
    });
  }

  function activarResultadoEvaluacion() {
    const resultado = document.getElementById("resultado-final");
    if (!resultado) return;
    // Solo observamos cambios de contenido. No observamos atributos porque
    // la propia animación modifica classList y provocaría un bucle infinito.
    const observador = new MutationObserver(() => {
      if (!resultado.classList.contains("hidden") && resultado.textContent.trim()) {
        resultado.classList.remove("resultado-apareciendo");
        void resultado.offsetWidth;
        resultado.classList.add("resultado-apareciendo");
      }
    });
    observador.observe(resultado, { childList: true, subtree: true });
  }

  function activarModalReto() {
    const boton = document.getElementById("btn-reto");
    const respuesta = document.getElementById("respuesta-reto");
    if (!boton || !respuesta) return;
    boton.addEventListener("click", () => {
      setTimeout(() => mostrarModal("Reto comprobado", "La conversión es correcta: 2,5 kg equivalen a 2500 g.", "exito"), 120);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    crearModalVisual();
    activarNavegacionActiva();
    activarReveladoScroll();
    activarOndasBotones();
    activarProgresoScroll();
    crearBotonSubir();
    activarEjemplosProgresivos();
    activarResultadoEvaluacion();
    activarModalReto();

    document.addEventListener("keydown", evento => {
      if (evento.key === "Escape") cerrarModal();
    });
  });

  window.mostrarModal = mostrarModal;
  window.mostrarModalEvaluacion = mostrarModalEvaluacion;
  window.cerrarModal = cerrarModal;
})();
