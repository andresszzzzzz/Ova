/*
 * magnitudes-visuales.js
 * Capa visual independiente. No modifica las funciones de conversión.
 * Las escenas reciben los valores de la interfaz y solo cambian su
 * representación visual.
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
        <div>
          <span class="escena-icono" aria-hidden="true">${ICONOS[magnitud]}</span>
          <div>
            <strong>${NOMBRES[magnitud]} en acción</strong>
            <small>${descripcion(magnitud)}</small>
          </div>
        </div>
        <span class="escena-chip">Animación física</span>
      </div>
      <canvas class="canvas-magnitud" width="760" height="250"
        aria-label="Animación interactiva de ${NOMBRES[magnitud]}"></canvas>
    `;
    contenedor.prepend(escena);

    const canvas = escena.querySelector('canvas');
    iniciarAnimacion(canvas, magnitud, opciones);

    if (magnitud === 'longitud') instalarArrastreLongitud(canvas, magnitud);
    return escena;
  }

  function descripcion(magnitud) {
    return {
      tiempo: 'El reloj de arena muestra el paso de una cantidad de tiempo y mantiene la arena dentro del vidrio.',
      longitud: 'Arrastra la bolita sobre la regla para cambiar la medida.',
      masa: 'Los pesos se mueven según la cantidad indicada.',
      volumen: 'El nivel y las partículas cambian según el volumen indicado.'
    }[magnitud];
  }

  function iniciarAnimacion(canvas, magnitud, opciones) {
    const ctx = canvas.getContext('2d');
    const estado = {
      activo: true,
      raf: 0,
      motor: null,
      cuerpos: [],
      valor: Number(opciones.valor) || 1,
      valorBase: Number(opciones.valorBase),
      unidad: opciones.unidad || '',
      unidadDestino: opciones.unidadDestino || '',
      factorOrigen: Number(opciones.factorOrigen),
      factorDestino: Number(opciones.factorDestino),
      velocidadVisual: 1,
      arrastrando: false
    };
    if (!Number.isFinite(estado.valorBase)) estado.valorBase = estado.valor;
    actualizarRitmoVisual(estado, magnitud);

    ESTADOS.set(canvas, estado);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ancho = canvas.clientWidth || 760;
    const alto = canvas.clientHeight || 250;
    canvas.width = Math.round(ancho * dpr);
    canvas.height = Math.round(alto * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (magnitud === 'masa' || magnitud === 'volumen') {
      if (window.Matter) iniciarMatter(estado, canvas, magnitud, ancho, alto);
    }

    let inicio = performance.now();
    function frame(t) {
      if (!estado.activo) return;
      const tiempo = (t - inicio) / 1000;
      const tiempoVisual = tiempo * estado.velocidadVisual;
      const valorActual = estado.valor;

      if (magnitud === 'tiempo') dibujarTiempo(ctx, ancho, alto, tiempoVisual, valorActual, estado);
      if (magnitud === 'longitud') dibujarLongitud(ctx, ancho, alto, tiempoVisual, valorActual, estado);
      if (magnitud === 'masa' && !window.Matter) dibujarMasaFallback(ctx, ancho, alto, tiempoVisual, valorActual, estado);
      if (magnitud === 'volumen' && !window.Matter) dibujarVolumenFallback(ctx, ancho, alto, tiempoVisual, valorActual, estado);
      if (magnitud === 'masa' || magnitud === 'volumen') dibujarMatter(ctx, estado, ancho, alto, magnitud, valorActual);

      estado.raf = requestAnimationFrame(frame);
    }
    estado.raf = requestAnimationFrame(frame);

    const observador = new IntersectionObserver(entries => {
      entries.forEach(e => { estado.activo = e.isIntersecting || estado.activo; });
    });
    observador.observe(canvas);
  }

  function actualizarRitmoVisual(estado, magnitud) {
    const origen = Number(estado.factorOrigen);
    const destino = Number(estado.factorDestino);
    if (!Number.isFinite(origen) || !Number.isFinite(destino) || origen <= 0 || destino <= 0) {
      estado.velocidadVisual = 1;
      return;
    }

    // El ritmo depende de la relación entre las unidades: al pasar de una
    // unidad grande a una pequeña (p. ej. h -> min) la animación es lenta;
    // al pasar de una pequeña a una grande (p. ej. s -> min) es rápida.
    const relacion = destino / origen;
    estado.velocidadVisual = Math.max(0.35, Math.min(3.5, Math.sqrt(relacion)));
  }

  function preparar(ctx, ancho, alto) {
    ctx.clearRect(0, 0, ancho, alto);
    const grad = ctx.createLinearGradient(0, 0, ancho, alto);
    grad.addColorStop(0, '#f7f9ff');
    grad.addColorStop(1, '#f5f0ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, ancho, alto);
    ctx.strokeStyle = 'rgba(82,102,232,.07)';
    ctx.lineWidth = 1;
    for (let x = 0; x < ancho; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, alto); ctx.stroke();
    }
    for (let y = 0; y < alto; y += 32) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ancho, y); ctx.stroke();
    }
  }

  function dibujarEtiquetaMedida(ctx, w, valor, estado) {
    const unidad = estado.unidad ? ` ${estado.unidad}` : ' unidades';
    ctx.fillStyle = '#263243';
    ctx.font = '800 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`Medida: ${formatearVisual(valor)}${unidad}`, w / 2, 28);
  }

  function dibujarTiempo(ctx, w, h, t, valor, estado) {
    preparar(ctx, w, h);

    const cx = w * .5;
    const top = 42;
    const bottom = h - 42;
    const neck = h * .5;
    const glassW = Math.min(170, w * .25);
    const topY = top + 10;
    const bottomY = bottom - 10;
    const neckGap = 10;
    const topOuter = glassW / 2;
    const neckHalf = 14;

    // Marco del reloj de arena.
    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#5266e8';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(82,102,232,.16)';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(cx - topOuter, top);
    ctx.lineTo(cx + topOuter, top);
    ctx.lineTo(cx + neckHalf, neck - neckGap);
    ctx.lineTo(cx - neckHalf, neck - neckGap);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - neckHalf, neck + neckGap);
    ctx.lineTo(cx + neckHalf, neck + neckGap);
    ctx.lineTo(cx + topOuter, bottom);
    ctx.lineTo(cx - topOuter, bottom);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // La animación representa el traspaso de arena de la cámara superior
    // a la inferior. La cámara inferior siempre conserva arena visible.
    const faseVelocidad = .42 + Math.min(Math.abs(Number(valor) || 1) / 140, 2.4);
    const fase = (t * faseVelocidad) % 2;
    const transferencia = fase <= 1 ? fase : 2 - fase;

    // Márgenes suficientemente visibles para que ninguna de las cámaras
    // parezca vacía durante el ciclo.
    const minimoArena = 0.22;
    const maximoArena = 0.82;
    const nivelSuperior = maximoArena - (maximoArena - minimoArena) * transferencia;
    const nivelInferior = minimoArena + (maximoArena - minimoArena) * transferencia;

    const topChamberTop = topY + 2;
    const topChamberBottom = neck - neckGap - 4;
    const bottomChamberTop = neck + neckGap + 4;
    const bottomChamberBottom = bottomY;
    const topHeight = Math.max(1, topChamberBottom - topChamberTop);
    const bottomHeight = Math.max(1, bottomChamberBottom - bottomChamberTop);

    const topLevel = topChamberBottom - topHeight * nivelSuperior;
    const bottomLevel = bottomChamberBottom - bottomHeight * nivelInferior;

    // ---------- ARENA SUPERIOR ----------
    // Se recorta exactamente a la forma interior del vidrio.
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - topOuter + 7, topChamberTop);
    ctx.lineTo(cx + topOuter - 7, topChamberTop);
    ctx.lineTo(cx + neckHalf - 3, topChamberBottom);
    ctx.lineTo(cx - neckHalf + 3, topChamberBottom);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = '#f4b942';
    ctx.fillRect(cx - topOuter, topLevel, glassW, topChamberBottom - topLevel + 6);

    // Superficie de la arena superior.
    const anchoSuperficie = Math.max(10, (topOuter - 7) * (1 - (topLevel - topChamberTop) / topHeight) + 12);
    ctx.fillStyle = '#e8a82f';
    ctx.beginPath();
    ctx.ellipse(cx, topLevel + 1, anchoSuperficie, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ---------- ARENA INFERIOR ----------
    // Se dibuja como un volumen trapezoidal que crece desde el fondo.
    // Esto evita depender de un rectángulo que pueda quedar fuera del clip.
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - neckHalf + 3, bottomChamberTop);
    ctx.lineTo(cx + neckHalf - 3, bottomChamberTop);
    ctx.lineTo(cx + topOuter - 7, bottomChamberBottom);
    ctx.lineTo(cx - topOuter + 7, bottomChamberBottom);
    ctx.closePath();
    ctx.clip();

    const arenaBottom = bottomChamberBottom + 2;
    const anchoBase = Math.max(22, topOuter * 1.55);
    const anchoSuperficieInferior = Math.max(12, 18 + nivelInferior * (topOuter - 18));

    ctx.fillStyle = '#f4b942';
    ctx.beginPath();
    ctx.moveTo(cx - anchoSuperficieInferior, bottomLevel);
    ctx.lineTo(cx + anchoSuperficieInferior, bottomLevel);
    ctx.lineTo(cx + anchoBase, arenaBottom);
    ctx.lineTo(cx - anchoBase, arenaBottom);
    ctx.closePath();
    ctx.fill();

    // Una pequeña superficie visible da sensación de acumulación de arena.
    ctx.fillStyle = '#e8a82f';
    ctx.beginPath();
    ctx.ellipse(cx, bottomLevel + 2, anchoSuperficieInferior, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ---------- CUELLO Y FLUJO ----------
    // El chorro conecta las dos cámaras y cambia ligeramente con la velocidad.
    const flujoActivo = transferencia > 0.04 && transferencia < 0.96;
    if (flujoActivo) {
      ctx.fillStyle = '#f4b942';
      const grosor = 3 + Math.min(3, Math.abs(Number(valor) || 1) / 80);
      ctx.fillRect(cx - grosor / 2, neck - 1, grosor, 30);
    }

    // Partículas que caen por el cuello y partículas asentadas en ambas cámaras.
    ctx.fillStyle = '#e8a82f';
    const cantidad = Math.min(28, Math.max(8, Math.round(Math.abs(Number(valor) || 1) / 5)));
    for (let i = 0; i < cantidad; i++) {
      const semilla = i * 23.7;
      const cae = (t * (0.8 + (i % 4) * 0.12) + i * 0.19) % 1;
      let px;
      let py;

      if (i % 3 === 0 && flujoActivo) {
        px = cx + Math.sin(semilla) * 5;
        py = neck - 1 + cae * 34;
      } else if (i % 2 === 0) {
        const y = topLevel + 4 + ((semilla * 3) % Math.max(8, topChamberBottom - topLevel - 6));
        const apertura = Math.max(5, topOuter - 10) * Math.max(.15, (topChamberBottom - y) / topHeight);
        px = cx + Math.sin(semilla + t * .6) * Math.max(3, apertura - 3);
        py = y;
      } else {
        const y = bottomLevel + 5 + ((semilla * 2) % Math.max(8, bottomChamberBottom - bottomLevel - 8));
        const apertura = Math.max(8, topOuter - 14);
        px = cx + Math.sin(semilla + t * .45) * apertura * .7;
        py = y;
      }

      ctx.beginPath();
      ctx.arc(px, py, 2.1, 0, Math.PI * 2);
      ctx.fill();
    }

    dibujarEtiquetaMedida(ctx, w, valor, estado);
    ctx.fillStyle = '#697483';
    ctx.font = '700 12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('La arena permanece dentro del vidrio', w / 2, h - 14);
  }

  function dibujarLongitud(ctx, w, h, t, valor, estado) {
    preparar(ctx, w, h);
    const x0 = 55, x1 = w - 55, y = h * .56;
    const numValor = Math.max(0, Number(valor) || 0);

    let maxEscala = 20;
    if (numValor > 20) maxEscala = Math.ceil(numValor * 1.15 / 10) * 10;
    if (maxEscala < 20) maxEscala = 20;

    ctx.lineCap = 'round';
    ctx.strokeStyle = '#5266e8';
    ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();

    const pasos = 10;
    for (let i = 0; i <= pasos; i++) {
      const x = x0 + (x1 - x0) * (i / pasos);
      const alto = i % 2 === 0 ? 25 : 14;
      ctx.strokeStyle = '#263243';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, y - alto); ctx.lineTo(x, y + alto); ctx.stroke();

      const etiquetaValor = maxEscala * (i / pasos);
      const etiquetaTexto = etiquetaValor >= 1000 ? `${Math.round(etiquetaValor / 100) / 10}k` : formatearVisual(etiquetaValor);
      ctx.fillStyle = '#5266e8';
      ctx.font = '700 11px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(etiquetaTexto, x, y + 43);
    }

    const proporcion = maxEscala > 0 ? Math.min(numValor / maxEscala, 1) : 0;
    const pos = x0 + (x1 - x0) * proporcion;

    if (!estado.arrastrando) {
      const intensidadMovimiento = numValor > 500 ? Math.sin(t * 3) * 4 : (numValor > 50 ? Math.sin(t * 2) * 2 : 0);
      ctx.fillStyle = '#8b5cf6';
      ctx.shadowColor = 'rgba(139,92,246,.35)';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(pos + intensidadMovimiento, y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath(); ctx.arc(pos, y, 17, 0, Math.PI * 2); ctx.fill();
    }

    dibujarEtiquetaMedida(ctx, w, valor, estado);
    ctx.fillStyle = '#697483';
    ctx.font = '700 12px system-ui';
    ctx.fillText('Arrastra la bolita para cambiar la medida', w / 2, h - 12);

    // El cursor comunica que la bolita es interactiva.
    ctx.canvas.style.cursor = estado.arrastrando ? 'grabbing' : 'grab';
  }

  function instalarArrastreLongitud(canvas, magnitud) {
    const estado = ESTADOS.get(canvas);
    if (!estado) return;

    function coordenadaX(evento) {
      const rect = canvas.getBoundingClientRect();
      return evento.clientX - rect.left;
    }

    function actualizarDesdeX(x) {
      const x0 = 55;
      const x1 = (canvas.clientWidth || 760) - 55;
      const proporcion = Math.max(0, Math.min(1, (x - x0) / (x1 - x0)));
      let maxEscala = Math.max(20, Math.ceil(Math.max(estado.valor, 20) * 1.15 / 10) * 10);
      const nuevoValor = proporcion * maxEscala;
      estado.valor = Math.round(nuevoValor * 100) / 100;
      estado.valorBase = estado.valor;
      canvas.dispatchEvent(new CustomEvent('magnitud:arrastre', {
        detail: { magnitud, valor: estado.valor, unidad: estado.unidad }
      }));
    }

    canvas.addEventListener('pointerdown', evento => {
      const rect = canvas.getBoundingClientRect();
      const x = evento.clientX - rect.left;
      const y = evento.clientY - rect.top;
      const x0 = 55, x1 = (canvas.clientWidth || 760) - 55;
      const maxEscala = Math.max(20, Math.ceil(Math.max(estado.valor, 20) * 1.15 / 10) * 10);
      const pos = x0 + (x1 - x0) * Math.min(estado.valor / maxEscala, 1);

      if (Math.abs(x - pos) <= 28 && Math.abs(y - (canvas.clientHeight * .56)) <= 35) {
        estado.arrastrando = true;
        canvas.setPointerCapture(evento.pointerId);
        actualizarDesdeX(x);
      }
    });

    canvas.addEventListener('pointermove', evento => {
      if (estado.arrastrando) actualizarDesdeX(coordenadaX(evento));
    });

    const terminar = evento => {
      if (!estado.arrastrando) return;
      estado.arrastrando = false;
      try { canvas.releasePointerCapture(evento.pointerId); } catch (_) {}
    };
    canvas.addEventListener('pointerup', terminar);
    canvas.addEventListener('pointercancel', terminar);
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
        peso.magnitudVisual = i + 1;
        estado.cuerpos.push(peso);
        World.add(engine.world, peso);
      }
      const barra = Bodies.rectangle(w * .5, h - 55, w * .55, 10, { isStatic: true, angle: -.05 });
      World.add(engine.world, barra);
      estado.cuerpos.push(barra);
    } else {
      const paredes = [
        Bodies.rectangle(30, h / 2, 12, h, { isStatic: true }),
        Bodies.rectangle(w - 30, h / 2, 12, h, { isStatic: true }),
        Bodies.rectangle(w / 2, h - 25, w - 60, 12, { isStatic: true })
      ];
      World.add(engine.world, paredes);
      for (let i = 0; i < 24; i++) {
        const p = Bodies.circle(80 + (i % 8) * 40, h - 45 - Math.floor(i / 8) * 18, 5 + (i % 3), {
          restitution: .45, friction: .05
        });
        estado.cuerpos.push(p);
        World.add(engine.world, p);
      }
    }
    Engine.run(engine);
  }

  function dibujarMatter(ctx, estado, w, h, magnitud, valor) {
    if (!estado.motor) return;
    const { bodies } = estado.motor.world;
    preparar(ctx, w, h);
    const numBase = Number.isFinite(estado.valorBase) ? Math.max(0, estado.valorBase) : Math.max(0, Number(valor) || 1);

    if (magnitud === 'masa') {
      estado.motor.gravity.y = Math.min((0.2 + numBase / 5000) * estado.velocidadVisual, 1.8);
    } else {
      estado.motor.gravity.y = Math.min((0.05 + numBase / 5000) * estado.velocidadVisual, 0.8);
    }

    // Para que la escena responda al valor: más cantidad física = más cuerpos visibles.
    const maxVisibles = magnitud === 'masa'
      ? Math.min(7, Math.max(1, Math.round(Math.log10(numBase + 1) * 2)))
      : Math.min(24, Math.max(3, Math.round(Math.log10(numBase + 1) * 7)));

    ctx.save();
    if (magnitud === 'masa') {
      ctx.fillStyle = '#eef1ff';
      ctx.fillRect(w * .19, h - 69, w * .62, 16);
      ctx.fillStyle = '#5266e8';
      ctx.font = '800 14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`Masa · ${formatearVisual(valor)}${estado.unidad ? ` ${estado.unidad}` : ''}`, w / 2, 28);
    } else {
      const nivel = Math.min(.78, .18 + Math.log10(numBase + 1) * .16);
      const top = h * (0.9 - nivel);
      ctx.fillStyle = 'rgba(82,102,232,.13)';
      ctx.fillRect(36, top, w - 72, h * .62 - (top - h * .25));
      ctx.strokeStyle = '#5266e8';
      ctx.lineWidth = 3;
      ctx.strokeRect(36, h * .25, w - 72, h * .62);
      ctx.fillStyle = '#5266e8';
      ctx.font = '800 14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`Volumen · ${formatearVisual(valor)}${estado.unidad ? ` ${estado.unidad}` : ''}`, w / 2, 28);
    }

    let visibles = 0;
    for (const cuerpo of bodies) {
      if (cuerpo.isStatic) continue;
      if (visibles >= maxVisibles) continue;
      visibles++;
      ctx.save();
      ctx.translate(cuerpo.position.x, cuerpo.position.y);
      ctx.rotate(cuerpo.angle);
      ctx.fillStyle = magnitud === 'masa' ? '#8b5cf6' : '#5266e8';
      ctx.beginPath();
      if (magnitud === 'masa') ctx.roundRect(-14, -14, 28, 28, 6);
      else ctx.arc(0, 0, cuerpo.circleRadius || 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  function dibujarMasaFallback(ctx, w, h, t, valor, estado) {
    preparar(ctx, w, h);
    const numBase = Math.max(1, Number(estado.valorBase) || Number(valor) || 1);
    const cantidad = Math.min(7, Math.max(1, Math.round(Math.log10(numBase + 1) * 2)));
    ctx.fillStyle = '#5266e8';
    for (let i = 0; i < cantidad; i++) {
      const x = w * .3 + i * 35;
      const y = 70 + Math.abs(Math.sin(t * (1 + numBase / 100) + i)) * 90;
      ctx.fillRect(x, y, 25, 25);
    }
    dibujarEtiquetaMedida(ctx, w, valor, estado);
  }

  function dibujarVolumenFallback(ctx, w, h, t, valor, estado) {
    preparar(ctx, w, h);
    const numBase = Math.max(1, Number(estado.valorBase) || Number(valor) || 1);
    const nivel = Math.min(.72, .16 + Math.log10(numBase + 1) * .16);
    const top = h * (0.9 - nivel);
    ctx.fillStyle = 'rgba(82,102,232,.25)';
    ctx.fillRect(40, top, w - 80, h * .85 - top);
    const cantidad = Math.min(25, Math.max(3, Math.round(Math.log10(numBase + 1) * 8)));
    for (let i = 0; i < cantidad; i++) {
      ctx.fillStyle = '#5266e8';
      ctx.beginPath();
      ctx.arc(
        55 + (i % 10) * 45,
        top + 25 + Math.abs(Math.sin(t * 2 + i)) * Math.max(8, (h * .85 - top) - 25) + Math.floor(i / 10) * 12,
        5, 0, Math.PI * 2
      );
      ctx.fill();
    }
    dibujarEtiquetaMedida(ctx, w, valor, estado);
  }

  function formatearVisual(v) {
    const n = Number(v);
    return Number.isFinite(n) ? (Math.round(n * 100) / 100).toString() : '1';
  }

  function actualizar(magnitud, valor, opciones = {}) {
    document.querySelectorAll('.escena-magnitud').forEach(escena => {
      if (!escena.classList.contains(`escena-${magnitud}`)) return;
      const canvas = escena.querySelector('canvas');
      const estado = ESTADOS.get(canvas);
      if (!estado) return;
      if (valor !== undefined && valor !== null && valor !== '') estado.valor = Number(valor) || 1;
      if (opciones.valorBase !== undefined) estado.valorBase = Number(opciones.valorBase);
      if (opciones.unidad !== undefined) estado.unidad = opciones.unidad || '';
      if (opciones.unidadDestino !== undefined) estado.unidadDestino = opciones.unidadDestino || '';
      if (opciones.factorOrigen !== undefined) estado.factorOrigen = Number(opciones.factorOrigen);
      if (opciones.factorDestino !== undefined) estado.factorDestino = Number(opciones.factorDestino);
      actualizarRitmoVisual(estado, magnitud);
    });
  }

  function extraerClaveUnidad(texto, magnitud) {
    const textoNormalizado = String(texto || '').toLowerCase();
    const unidades = FACTORES?.[magnitud]?.unidades || {};
    const claves = Object.keys(unidades).sort((a, b) => b.length - a.length);
    return claves.find(clave => {
      const etiqueta = unidades[clave].etiqueta.toLowerCase();
      const simbolo = etiqueta.match(/\(([^)]+)\)/)?.[1] || clave;
      return textoNormalizado.includes(simbolo.toLowerCase()) || textoNormalizado.includes(clave.toLowerCase());
    }) || '';
  }

  function instalarEnContenidos() {
    const paneles = document.querySelectorAll('.panel-magnitud');
    paneles.forEach(panel => {
      const magnitud = panel.id.replace('panel-', '');
      const ejemplo = panel.querySelector('[data-ejemplo-canvas]');
      const valor = ejemplo?.dataset.valorOrigen || 1;
      const unidadTexto = ejemplo?.dataset.etiquetaOrigen || '';
      const destinoTexto = ejemplo?.dataset.etiquetaDestino || '';
      const unidad = extraerClaveUnidad(unidadTexto, magnitud);
      const unidadDestino = extraerClaveUnidad(destinoTexto, magnitud);
      const factorOrigen = FACTORES?.[magnitud]?.unidades?.[unidad]?.factor;
      const factorDestino = FACTORES?.[magnitud]?.unidades?.[unidadDestino]?.factor;
      crearEscena(panel, magnitud, { valor, unidad, unidadDestino, factorOrigen, factorDestino });
    });

    document.querySelectorAll('.boton-pestana').forEach(btn => btn.addEventListener('click', () => {
      const panel = document.getElementById(`panel-${btn.dataset.magnitud}`);
      const ejemplo = panel?.querySelector('[data-ejemplo-canvas]');
      const unidad = extraerClaveUnidad(ejemplo?.dataset.etiquetaOrigen || '', btn.dataset.magnitud);
      const unidadDestino = extraerClaveUnidad(ejemplo?.dataset.etiquetaDestino || '', btn.dataset.magnitud);
      actualizar(btn.dataset.magnitud, ejemplo?.dataset.valorOrigen || 1, {
        unidad,
        unidadDestino,
        factorOrigen: FACTORES?.[btn.dataset.magnitud]?.unidades?.[unidad]?.factor,
        factorDestino: FACTORES?.[btn.dataset.magnitud]?.unidades?.[unidadDestino]?.factor
      });
    }));
  }

  function instalarEnActividad() {
    const tarjeta = document.querySelector('.chart-card');
    const selector = document.getElementById('selector-magnitud');
    const input = document.getElementById('input-valor-origen');
    const origen = document.getElementById('selector-unidad-origen');
    const destino = document.getElementById('selector-unidad-destino');
    if (!tarjeta || !selector) return;

    function numeroActual() {
      const n = parseFloat((input?.value || '1').replace(',', '.'));
      return Number.isFinite(n) ? n : 1;
    }

    function actualizarEscena() {
      const valor = numeroActual();
      const unidad = origen?.value || '';
      const base = typeof FACTORES !== 'undefined' ? FACTORES?.[selector.value]?.unidades?.[unidad]?.factor : undefined;
      const unidadDestino = destino?.value || '';
      const factorDestino = typeof FACTORES !== 'undefined' ? FACTORES?.[selector.value]?.unidades?.[unidadDestino]?.factor : undefined;
      crearEscena(tarjeta, selector.value, {
        valor,
        valorBase: Number.isFinite(base) ? valor * base : valor,
        unidad,
        unidadDestino,
        factorOrigen: base,
        factorDestino
      });
    }

    actualizarEscena();

    function refrescar() {
      const valor = numeroActual();
      const unidad = origen?.value || '';
      const base = typeof FACTORES !== 'undefined' ? FACTORES?.[selector.value]?.unidades?.[unidad]?.factor : undefined;
      const unidadDestino = destino?.value || '';
      const factorDestino = typeof FACTORES !== 'undefined' ? FACTORES?.[selector.value]?.unidades?.[unidadDestino]?.factor : undefined;
      actualizar(selector.value, valor, {
        valorBase: Number.isFinite(base) ? valor * base : valor,
        unidad,
        unidadDestino,
        factorOrigen: base,
        factorDestino
      });
    }

    selector.addEventListener('change', () => setTimeout(actualizarEscena, 0));
    origen?.addEventListener('change', refrescar);
    destino?.addEventListener('change', refrescar);
    input?.addEventListener('input', refrescar);

    tarjeta.addEventListener('magnitud:arrastre', evento => {
      if (evento.detail.magnitud !== 'longitud' || !input) return;
      input.value = formatearVisual(evento.detail.valor);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.panel-magnitud')) instalarEnContenidos();
    if (document.querySelector('.chart-card')) instalarEnActividad();
  });
})();
