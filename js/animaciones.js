const ANIMACIONES_ACTIVAS = {};

function animarBarras(idCanvas, valorOrigen, valorDestino, etiquetaOrigen, etiquetaDestino, valorBase = null) {
  const canvas = document.getElementById(idCanvas);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (ANIMACIONES_ACTIVAS[idCanvas]) cancelAnimationFrame(ANIMACIONES_ACTIVAS[idCanvas]);

  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || canvas.width;
  const cssHeight = canvas.clientHeight || canvas.height;
  if (canvas.width !== Math.round(cssWidth * dpr) || canvas.height !== Math.round(cssHeight * dpr)) {
    canvas.width = Math.round(cssWidth * dpr); canvas.height = Math.round(cssHeight * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = cssWidth, h = cssHeight, baseY = h - 45, maxH = h - 105;
  const text = getComputedStyle(document.documentElement).getPropertyValue("--color-texto").trim() || "#18202a";
  const primary = "#5266e8", accent = "#8b5cf6";

  // --- NUEVA LÓGICA DE INTENSIDAD DINÁMICA ---
  const numValor = parseFloat(valorOrigen) || 0;
  let duracion = 650;
  let tipoMovimiento = 'suave'; // Por defecto

  if (numValor > 500) {
    duracion = 800; // Un poco más pausado y dramático
    tipoMovimiento = 'rebote'; // Mayor dinamismo y rebote al final
  } else if (numValor <= 10) {
    duracion = 400; // Más rápido y directo
    tipoMovimiento = 'rapido';
  }

  let start = null;

  function draw(progress, scaleFactor = 1) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#f7f8fc"; ctx.fillRect(0, 0, w, h);
    const barW = Math.min(100, w * .22), x1 = w * .28 - barW / 2, x2 = w * .72 - barW / 2;

    // Altura modificada con el factor de escala dinámico según la magnitud
    const barH = maxH * .72 * progress * scaleFactor;

    ctx.strokeStyle = "#d8deea"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(25, baseY); ctx.lineTo(w - 25, baseY); ctx.stroke();

    ctx.fillStyle = primary; ctx.roundRect(x1, baseY - barH, barW, barH, 10); ctx.fill();
    ctx.fillStyle = accent; ctx.roundRect(x2, baseY - barH, barW, barH, 10); ctx.fill();

    ctx.fillStyle = text; ctx.textAlign = "center"; ctx.font = "800 13px system-ui";
    ctx.fillText(etiquetaOrigen, x1 + barW / 2, baseY + 22);
    ctx.fillText(etiquetaDestino, x2 + barW / 2, baseY + 22);
    ctx.font = "700 12px system-ui"; ctx.fillStyle = "#697483";
    ctx.fillText("ORIGEN", x1 + barW / 2, baseY - barH - 12);
    ctx.fillText("DESTINO", x2 + barW / 2, baseY - barH - 12);

    if (valorBase !== null && Number.isFinite(valorBase)) {
      ctx.fillStyle = "#18202a"; ctx.font = "700 12px system-ui";
      ctx.fillText("Equivalencia en unidad base: " + formatearNumero(valorBase), w / 2, 24);
    } else {
      ctx.fillStyle = "#18202a"; ctx.font = "700 12px system-ui";
      ctx.fillText("Ambos representan la misma cantidad física", w / 2, 24);
    }
  }

  function frame(t) {
    if (start === null) start = t;
    const p = Math.min((t - start) / duracion, 1);

    let eased = 0;
    let extraScale = 1;

    if (tipoMovimiento === 'rebote') {
      // Curva matemática con efecto elástico / rebote (Back out) para valores altos
      const c1 = 1.70158;
      const c3 = c1 + 1;
      eased = p === 1 ? 1 : 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
      // Pulso dinámico sutil mientras suben las barras grandes
      extraScale = 1 + Math.sin(p * Math.PI) * 0.03;
    } else if (tipoMovimiento === 'rapido') {
      // Transición rápida y limpia para valores pequeños
      eased = 1 - Math.pow(1 - p, 2);
    } else {
      // Transición estándar cúbica para valores medianos
      eased = 1 - Math.pow(1 - p, 3);
    }

    draw(Math.max(0, eased), extraScale);
    if (p < 1) ANIMACIONES_ACTIVAS[idCanvas] = requestAnimationFrame(frame);
  }

  ANIMACIONES_ACTIVAS[idCanvas] = requestAnimationFrame(frame);
}

function dibujarEstadoInicial(idCanvas) {
  const canvas = document.getElementById(idCanvas); if (!canvas) return;
  const ctx = canvas.getContext("2d"), dpr = devicePixelRatio || 1;
  const w = canvas.clientWidth || canvas.width, h = canvas.clientHeight || canvas.height;
  canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#f7f8fc"; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#697483"; ctx.textAlign = "center"; ctx.font = "600 13px system-ui";
  ctx.fillText("Ingresa un valor para visualizar la equivalencia", w / 2, h / 2);
}