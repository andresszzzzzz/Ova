/*
 * magnitudes-visuales.js
 * Capa visual independiente. No modifica funciones de conversiones,
 * ejercicios, evaluación ni simuladores existentes.
 * Usa Canvas 2D y Matter.js (ya incluido en assets/) para microanimaciones físicas.
 */
(() => {
  const ESTADOS = new Map();
  const ICONOS = { tiempo: '⌛', longitud: '📏', masa: '⚖️', volumen: '🧪' };
  const NOMBRES = { tiempo: 'Tiempo', longitud: 'Longitud', masa: 'Masa', volumen: 'Volumen' };

  function crearEscena(contenedor, magnitud, opciones = {}) {
    if (!contenedor) return null;
    const anterior = contenedor.querySelector('.escena-magnitud');
    if (anterior) anterior.remove();

    const escena = document.createElement('div');
    escena.className = `escena-magnitud escena-${magnitud}`;
    escena.innerHTML = `
      <div class="escena-cabecera">
        <div><span class="escena-icono" aria-hidden="true">${ICONOS[magnitud]}</span><div><strong>${NOMBRES[magnitud]} en acción</strong><small>${descripcion(magnitud)}</small></div></div>
        <span class="escena-chip">Animación física</span>
      </div>
      <canvas class="canvas-magnitud" width="760" height="250" aria-label="Animación interactiva de ${NOMBRES[magnitud]}"></canvas>
    `;
    contenedor.prepend(escena);
    iniciarAnimacion(escena.querySelector('canvas'), magnitud, opciones);
    return escena;
  }

  function descripcion(magnitud) {
    return {
      tiempo: 'La arena cae de un recipiente al otro para representar el paso del tiempo.',
      longitud: 'Una regla animada muestra cómo cambia la escala de una medida.',
      masa: 'Los pesos caen y se equilibran sobre una balanza usando física 2D.',
      volumen: 'Las partículas se mueven dentro del recipiente para representar el volumen.'
    }[magnitud];
  }

  function iniciarAnimacion(canvas, magnitud, opciones) {
    const ctx = canvas.getContext('2d');
    const estado = { activo: true, raf: 0, motor: null, cuerpos: [], valor: Number(opciones.valor) || 1 };
    ESTADOS.set(canvas, estado);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ancho = canvas.clientWidth || 760;
    const alto = canvas.clientHeight || 250;
    canvas.width = Math.round(ancho * dpr); canvas.height = Math.round(alto * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (magnitud === 'masa' || magnitud === 'volumen') {
      if (window.Matter) iniciarMatter(estado, canvas, magnitud, ancho, alto);
    }

    let inicio = performance.now();
    function frame(t) {
      if (!estado.activo) return;
      const tiempo = (t - inicio) / 1000;
      const valorActual = estado.valor;

      if (magnitud === 'tiempo') dibujarTiempo(ctx, ancho, alto, tiempo, valorActual);
      if (magnitud === 'longitud') dibujarLongitud(ctx, ancho, alto, tiempo, valorActual);
      if (magnitud === 'masa' && !window.Matter) dibujarMasaFallback(ctx, ancho, alto, tiempo, valorActual);
      if (magnitud === 'volumen' && !window.Matter) dibujarVolumenFallback(ctx, ancho, alto, tiempo, valorActual);
      if (magnitud === 'masa' || magnitud === 'volumen') dibujarMatter(ctx, estado, ancho, alto, magnitud, valorActual);

      estado.raf = requestAnimationFrame(frame);
    }
    estado.raf = requestAnimationFrame(frame);

    const observador = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) estado.activo = true; });
    });
    observador.observe(canvas);
  }

  function preparar(ctx, ancho, alto) {
    ctx.clearRect(0, 0, ancho, alto);
    const grad = ctx.createLinearGradient(0, 0, ancho, alto);
    grad.addColorStop(0, '#f7f9ff'); grad.addColorStop(1, '#f5f0ff');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, ancho, alto);
    ctx.strokeStyle = 'rgba(82,102,232,.07)'; ctx.lineWidth = 1;
    for (let x = 0; x < ancho; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, alto); ctx.stroke(); }
    for (let y = 0; y < alto; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ancho, y); ctx.stroke(); }
  }

  function dibujarTiempo(ctx, w, h, t, valor) {
    preparar(ctx, w, h);
    const cx = w * .5, top = 35, bottom = h - 38, neck = h * .5;
    const numValor = Math.max(0, Number(valor) || 1);

    ctx.save();
    ctx.shadowColor = 'rgba(82,102,232,.18)'; ctx.shadowBlur = 20;
    ctx.fillStyle = 'rgba(255,255,255,.86)'; ctx.strokeStyle = '#5266e8'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(cx - 72, top); ctx.lineTo(cx + 72, top); ctx.lineTo(cx + 16, neck); ctx.lineTo(cx + 72, bottom); ctx.lineTo(cx - 72, bottom); ctx.lineTo(cx - 16, neck); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();

    // Velocidad de caída proporcional al valor
    const velocidad = 0.5 + Math.min(numValor / 50, 4);
    const ciclo = (t * velocidad) % 2;
    const progreso = ciclo <= 1 ? ciclo : 2 - ciclo;

    ctx.fillStyle = '#f4b942';
    ctx.beginPath(); ctx.moveTo(cx - 55, neck - 8); ctx.lineTo(cx + 55, neck - 8); ctx.lineTo(cx + 42, top + 22); ctx.lineTo(cx - 42, top + 22); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx - 42, bottom - 22); ctx.lineTo(cx + 42, bottom - 22); ctx.lineTo(cx + 55, neck + 8); ctx.lineTo(cx - 55, neck + 8); ctx.closePath(); ctx.fill();

    ctx.globalAlpha = .9;
    const numParticulas = Math.min(Math.max(10, Math.floor(numValor / 2)), 40);
    for (let i = 0; i < numParticulas; i++) {
      const seed = i * 17.3;
      const y = neck + ((t * (120 * velocidad) + seed) % Math.max(8, bottom - neck - 35));
      const x = cx + Math.sin(seed + t) * (numValor > 100 ? 6 : 3);
      ctx.beginPath(); ctx.arc(x, y, numValor > 500 ? 3 : 2.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#263243'; ctx.font = '800 14px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(`Flujo de arena · ${formatearVisual(valor)} unidades`, cx, h - 12);
  }

  function dibujarLongitud(ctx, w, h, t, valor) {
    preparar(ctx, w, h);
    const x0 = 55, x1 = w - 55, y = h * .56;
    const numValor = Math.max(0, Number(valor) || 0);

    // Escala dinámica basada en el valor real ingresado
    let maxEscala = 20;
    if (numValor > 20) {
      maxEscala = Math.ceil(numValor * 1.15 / 10) * 10;
      if (maxEscala < numValor) maxEscala = numValor * 1.2;
    }

    ctx.lineCap = 'round'; ctx.strokeStyle = '#5266e8'; ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();

    const pasos = 10;
    for (let i = 0; i <= pasos; i++) {
      const x = x0 + (x1 - x0) * (i / pasos);
      const alto = i % 2 === 0 ? 25 : 14;
      ctx.strokeStyle = '#263243'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, y - alto); ctx.lineTo(x, y + alto); ctx.stroke();

      const etiquetaValor = (maxEscala * (i / pasos));
      const etiquetaTexto = etiquetaValor >= 1000 ? (etiquetaValor / 1000) + 'k' : Math.round(etiquetaValor * 10) / 10;
      ctx.fillStyle = '#5266e8'; ctx.font = '700 11px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(etiquetaTexto, x, y + 43);
    }

    // Posición proporcional exacta según el valor actual
    const proporcion = maxEscala > 0 ? Math.min(numValor / maxEscala, 1) : 0;
    const pos = x0 + (x1 - x0) * proporcion;

    // Dinamismo de movimiento sutil según la magnitud
    const intensidadMovimiento = numValor > 500 ? Math.sin(t * 3) * 4 : (numValor > 50 ? Math.sin(t * 2) * 2 : 0);

    ctx.fillStyle = '#8b5cf6'; ctx.shadowColor = 'rgba(139,92,246,.35)'; ctx.shadowBlur = 16;
    ctx.beginPath(); ctx.arc(pos + intensidadMovimiento, y, 15, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;

    ctx.fillStyle = '#263243'; ctx.font = '800 14px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(`Medida animada · ${formatearVisual(valor)} unidades`, w / 2, 35);
  }

  function iniciarMatter(estado, canvas, magnitud, w, h) {
    const { Engine, World, Bodies } = Matter;
    const engine = Engine.create({ enableSleeping: false });
    engine.gravity.y = 1.0;
    estado.motor = engine;
    const suelo = Bodies.rectangle(w / 2, h - 26, w - 50, 30, { isStatic: true });
    World.add(engine.world, [suelo]);

    if (magnitud === 'masa') {
      for (let i = 0; i < 7; i++) {
        const peso = Bodies.rectangle(w * .35 + i * 38, 35 + i * 4, 28, 28, { restitution: .65, friction: .5 });
        peso.magnitudVisual = i + 1; estado.cuerpos.push(peso); World.add(engine.world, peso);
      }
      const barra = Bodies.rectangle(w * .5, h - 55, w * .55, 10, { isStatic: true, angle: -.05 });
      World.add(engine.world, barra); estado.cuerpos.push(barra);
    } else {
      const paredes = [Bodies.rectangle(30, h / 2, 12, h, { isStatic: true }), Bodies.rectangle(w - 30, h / 2, 12, h, { isStatic: true }), Bodies.rectangle(w / 2, h - 25, w - 60, 12, { isStatic: true })];
      World.add(engine.world, paredes);
      for (let i = 0; i < 24; i++) {
        const p = Bodies.circle(80 + (i % 8) * 40, h - 45 - Math.floor(i / 8) * 18, 5 + ((i % 3)), { restitution: .45, friction: .05 });
        estado.cuerpos.push(p); World.add(engine.world, p);
      }
    }
    Engine.run(engine);
  }

  function dibujarMatter(ctx, estado, w, h, magnitud, valor) {
    if (!estado.motor) return;
    const { bodies } = estado.motor.world;
    preparar(ctx, w, h);
    const numValor = Number(valor) || 1;

    // Ajustar la gravedad dinámicamente según el valor ingresado
    if (estado.motor) {
      estado.motor.gravity.y = magnitud === 'masa' ? Math.min(0.2 + (numValor / 200), 1.5) : Math.min(0.05 + (numValor / 500), 0.4);
    }

    ctx.save();
    if (magnitud === 'masa') {
      ctx.fillStyle = '#eef1ff'; ctx.fillRect(w * .19, h - 69, w * .62, 16);
      ctx.fillStyle = '#5266e8'; ctx.font = '800 14px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(`Pesos en movimiento · ${formatearVisual(numValor)} unidades`, w / 2, 28);
    } else {
      ctx.fillStyle = 'rgba(82,102,232,.13)'; ctx.fillRect(36, h * .25, w - 72, h * .62);
      ctx.strokeStyle = '#5266e8'; ctx.lineWidth = 3; ctx.strokeRect(36, h * .25, w - 72, h * .62);
      ctx.fillStyle = '#5266e8'; ctx.font = '800 14px system-ui'; ctx.textAlign = 'center';
      ctx.fillText(`Partículas de volumen · ${formatearVisual(numValor)} unidades`, w / 2, 28);
    }

    for (const cuerpo of bodies) {
      if (cuerpo.isStatic) continue;
      ctx.save(); ctx.translate(cuerpo.position.x, cuerpo.position.y); ctx.rotate(cuerpo.angle);
      ctx.fillStyle = magnitud === 'masa' ? '#8b5cf6' : '#5266e8';
      ctx.beginPath();
      if (magnitud === 'masa') ctx.roundRect(-14, -14, 28, 28, 6); else ctx.arc(0, 0, cuerpo.circleRadius || 6, 0, Math.PI * 2);
      ctx.fill(); ctx.restore();
    }
    ctx.restore();
  }

  function dibujarMasaFallback(ctx, w, h, t, valor) {
    preparar(ctx, w, h);
    const numValor = Number(valor) || 1;
    ctx.fillStyle = '#5266e8';
    for (let i = 0; i < 7; i++) {
      const x = w * .3 + i * 35, y = 70 + Math.abs(Math.sin(t * (1 + numValor / 100) + i)) * 90;
      ctx.fillRect(x, y, 25, 25);
    }
    ctx.fillStyle = '#263243'; ctx.font = '800 14px system-ui'; ctx.textAlign = 'center';
    ctx.fillText(`Masa dinámica · ${formatearVisual(valor)} unidades`, w / 2, 28);
  }

  function dibujarVolumenFallback(ctx, w, h, t, valor) {
    preparar(ctx, w, h);
    const numValor = Number(valor) || 1;
    ctx.fillStyle = 'rgba(82,102,232,.25)'; ctx.fillRect(40, h * .35, w - 80, h * .5);
    for (let i = 0; i < 25; i++) {
      ctx.fillStyle = '#5266e8'; ctx.beginPath();
      ctx.arc(55 + (i % 10) * 45, h * .45 + Math.sin(t * 2 + i) * (10 + Math.min(numValor / 10, 40)) + Math.floor(i / 10) * 35, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function formatearVisual(v) {
    const n = Number(v);
    return Number.isFinite(n) ? (Math.round(n * 100) / 100).toString() : '1';
  }

  function actualizar(magnitud, valor) {
    document.querySelectorAll('.escena-magnitud').forEach(escena => {
      if (!escena.classList.contains(`escena-${magnitud}`)) return;
      const canvas = escena.querySelector('canvas');
      const estado = ESTADOS.get(canvas);
      if (estado) estado.valor = Number(valor) || 1;
    });
  }

  function instalarEnContenidos() {
    const paneles = document.querySelectorAll('.panel-magnitud');
    paneles.forEach(panel => {
      const magnitud = panel.id.replace('panel-', '');
      crearEscena(panel, magnitud, { valor: 1 });
    });
    document.querySelectorAll('.boton-pestana').forEach(btn => btn.addEventListener('click', () => actualizar(btn.dataset.magnitud, 1)));
  }

  function instalarEnActividad() {
    const tarjeta = document.querySelector('.chart-card');
    const selector = document.getElementById('selector-magnitud');
    const input = document.getElementById('input-valor-origen');
    if (!tarjeta || !selector) return;

    crearEscena(tarjeta, selector.value, { valor: input?.value || 1 });

    function refrescar() {
      crearEscena(tarjeta, selector.value, { valor: input?.value || 1 });
      const canvas = tarjeta.querySelector('.canvas-magnitud');
      const estado = ESTADOS.get(canvas);
      if (estado) estado.valor = Number(input?.value) || 1;
    }

    selector.addEventListener('change', refrescar);
    input?.addEventListener('input', () => actualizar(selector.value, input.value));
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.panel-magnitud')) instalarEnContenidos();
    if (document.querySelector('.chart-card')) instalarEnActividad();
  });
})();