const ANIMACIONES_ACTIVAS = {};

function animarBarras(idCanvas, valorOrigen, valorDestino, etiquetaOrigen, etiquetaDestino, valorBase = null, magnitud = '', unidadOrigen = '', unidadDestino = '') {
  const canvas = document.getElementById(idCanvas);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (ANIMACIONES_ACTIVAS[idCanvas]) cancelAnimationFrame(ANIMACIONES_ACTIVAS[idCanvas]);

  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.clientWidth || canvas.width;
  const cssHeight = canvas.clientHeight || canvas.height;
  if (canvas.width !== Math.round(cssWidth * dpr) || canvas.height !== Math.round(cssHeight * dpr)) {
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const w = cssWidth, h = cssHeight, baseY = h - 45, maxH = h - 105;
  const text = getComputedStyle(document.documentElement).getPropertyValue("--color-texto").trim() || "#18202a";
  const primary = "#5266e8", accent = "#8b5cf6";

  const origen = Math.max(0, Number(valorOrigen) || 0);
  const destino = Math.max(0, Number(valorDestino) || 0);
  const operacion = obtenerOperacionVisual(magnitud, unidadOrigen, unidadDestino, etiquetaOrigen, etiquetaDestino, origen, destino);
  const mayor = Math.max(origen, destino, 1);
  // La altura representa el número escrito en cada unidad. Por eso,
  // si se convierte 150 min a 2.5 h, la barra de 150 min será mayor.
  const proporcionOrigen = origen / mayor;
  const proporcionDestino = destino / mayor;

  const ritmo = obtenerRitmoConversion(magnitud, unidadOrigen, unidadDestino, etiquetaOrigen, etiquetaDestino);
  let duracion = Math.max(380, Math.min(2200, 950 / ritmo));
  let tipoMovimiento = ritmo >= 2 ? 'rapido' : (ritmo <= .55 ? 'lento' : 'suave');
  if (origen > 500 || destino > 500) duracion = Math.min(2400, duracion * 1.08);
  if (origen <= 10 && destino <= 10) duracion = Math.max(320, duracion * .92);

  let start = null;

  function draw(progress, scaleFactor = 1) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#f7f8fc";
    ctx.fillRect(0, 0, w, h);

    const barW = Math.min(100, w * .22);
    const x1 = w * .28 - barW / 2;
    const x2 = w * .72 - barW / 2;

    const barHOrigen = Math.max(origen > 0 ? 10 : 0, maxH * .82 * proporcionOrigen * progress * scaleFactor);
    const barHDestino = Math.max(destino > 0 ? 10 : 0, maxH * .82 * proporcionDestino * progress * scaleFactor);

    // La operación queda visible en la propia gráfica para que el estudiante
    // pueda relacionar la altura de las barras con el procedimiento.
    ctx.fillStyle = "#6746c8";
    ctx.textAlign = "center";
    ctx.font = "800 12px system-ui";
    ctx.fillText(operacion.texto, w / 2, 44);

    ctx.strokeStyle = "#d8deea";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(25, baseY);
    ctx.lineTo(w - 25, baseY);
    ctx.stroke();

    ctx.fillStyle = primary;
    ctx.roundRect(x1, baseY - barHOrigen, barW, barHOrigen, 10);
    ctx.fill();

    ctx.fillStyle = accent;
    ctx.roundRect(x2, baseY - barHDestino, barW, barHDestino, 10);
    ctx.fill();

    ctx.fillStyle = text;
    ctx.textAlign = "center";
    ctx.font = "800 13px system-ui";
    ctx.fillText(etiquetaOrigen, x1 + barW / 2, baseY + 22);
    ctx.fillText(etiquetaDestino, x2 + barW / 2, baseY + 22);

    ctx.font = "700 12px system-ui";
    ctx.fillStyle = "#697483";
    ctx.fillText("ORIGEN", x1 + barW / 2, Math.max(16, baseY - barHOrigen - 10));
    ctx.fillText("DESTINO", x2 + barW / 2, Math.max(16, baseY - barHDestino - 10));

    if (valorBase !== null && Number.isFinite(valorBase)) {
      ctx.fillStyle = "#18202a";
      ctx.font = "700 12px system-ui";
      ctx.fillText("Equivalencia física en unidad base: " + formatearNumero(valorBase), w / 2, 24);
    } else {
      ctx.fillStyle = "#18202a";
      ctx.font = "700 12px system-ui";
      ctx.fillText("Comparación numérica de los valores", w / 2, 24);
    }

    ctx.fillStyle = "#697483";
    ctx.font = "600 11px system-ui";
    ctx.fillText("La altura compara los números; la equivalencia física se muestra arriba.", w / 2, h - 8);
  }

  function frame(t) {
    if (start === null) start = t;
    const p = Math.min((t - start) / duracion, 1);

    let eased;
    let extraScale = 1;

    if (tipoMovimiento === 'lento') {
      eased = 1 - Math.pow(1 - p, 2.2);
    } else if (tipoMovimiento === 'rapido') {
      eased = 1 - Math.pow(1 - p, 1.35);
      extraScale = 1 + Math.sin(p * Math.PI) * 0.03;
    } else {
      eased = 1 - Math.pow(1 - p, 3);
    }

    draw(Math.max(0, eased), extraScale);
    if (p < 1) ANIMACIONES_ACTIVAS[idCanvas] = requestAnimationFrame(frame);
  }

  ANIMACIONES_ACTIVAS[idCanvas] = requestAnimationFrame(frame);
}

function obtenerOperacionVisual(magnitud, unidadOrigen, unidadDestino, etiquetaOrigen, etiquetaDestino, origen, destino) {
  let u1 = unidadOrigen || extraerUnidadDeEtiqueta(etiquetaOrigen, magnitud);
  let u2 = unidadDestino || extraerUnidadDeEtiqueta(etiquetaDestino, magnitud);
  const f1 = FACTORES?.[magnitud]?.unidades?.[u1]?.factor;
  const f2 = FACTORES?.[magnitud]?.unidades?.[u2]?.factor;

  if (!(f1 > 0) || !(f2 > 0)) {
    return { tipo: '', factor: 1, texto: 'Operación: según la equivalencia' };
  }

  const ratio = f2 / f1;
  if (Math.abs(ratio - 1) < 1e-12) {
    return { tipo: 'multiplicar', factor: 1, texto: `Operación: ${formatearNumero(origen)} × 1 = ${formatearNumero(destino)}` };
  }

  if (ratio > 1) {
    return {
      tipo: 'dividir',
      factor: ratio,
      texto: `Operación: ${formatearNumero(origen)} ÷ ${formatearNumero(ratio)} = ${formatearNumero(destino)}`
    };
  }

  const factor = f1 / f2;
  return {
    tipo: 'multiplicar',
    factor,
    texto: `Operación: ${formatearNumero(origen)} × ${formatearNumero(factor)} = ${formatearNumero(destino)}`
  };
}

function obtenerRitmoConversion(magnitud, unidadOrigen, unidadDestino, etiquetaOrigen, etiquetaDestino) {
  let origen = unidadOrigen;
  let destino = unidadDestino;

  if (!magnitud || !FACTORES?.[magnitud]) return 1;
  if (!origen) origen = extraerUnidadDeEtiqueta(etiquetaOrigen, magnitud);
  if (!destino) destino = extraerUnidadDeEtiqueta(etiquetaDestino, magnitud);

  const factorOrigen = FACTORES[magnitud]?.unidades?.[origen]?.factor;
  const factorDestino = FACTORES[magnitud]?.unidades?.[destino]?.factor;
  if (!(factorOrigen > 0) || !(factorDestino > 0)) return 1;

  // Grande -> pequeña: lento. Pequeña -> grande: rápido.
  return Math.max(.35, Math.min(3.5, Math.sqrt(factorDestino / factorOrigen)));
}

function extraerUnidadDeEtiqueta(etiqueta, magnitud) {
  const texto = String(etiqueta || '').toLowerCase();
  const unidades = FACTORES?.[magnitud]?.unidades || {};
  return Object.keys(unidades).sort((a,b) => b.length-a.length).find(clave => {
    const etiquetaUnidad = unidades[clave].etiqueta.toLowerCase();
    const simbolo = etiquetaUnidad.match(/\(([^)]+)\)/)?.[1] || clave;
    return texto.includes(simbolo.toLowerCase()) || texto.includes(clave.toLowerCase());
  }) || '';
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