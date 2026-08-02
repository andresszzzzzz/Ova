/**
 * animacion.js
 * Usa Canvas 2D para animar y recrear de forma visual el resultado
 * de una conversión: dos barras (valor de origen y valor convertido)
 * que crecen desde la base del lienzo hasta la altura proporcional
 * a su magnitud relativa.
 */

const ANIMACIONES_ACTIVAS = {};

/**
 * Anima dos barras comparativas dentro de un <canvas>.
 * @param {string} idCanvas - id del elemento canvas
 * @param {number} valorOrigen - valor original ingresado
 * @param {number} valorDestino - valor ya convertido
 * @param {string} etiquetaOrigen - texto corto de la unidad de origen
 * @param {string} etiquetaDestino - texto corto de la unidad de destino
 */
function animarBarras(idCanvas, valorOrigen, valorDestino, etiquetaOrigen, etiquetaDestino) {
  const canvas = document.getElementById(idCanvas);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Cancela cualquier animación previa sobre este mismo canvas
  if (ANIMACIONES_ACTIVAS[idCanvas]) {
    cancelAnimationFrame(ANIMACIONES_ACTIVAS[idCanvas]);
  }

  const ancho = canvas.width;
  const alto = canvas.height;
  const margenInferior = 34;
  const alturaMaxima = alto - margenInferior - 16;

  const valorAbsOrigen = Math.abs(valorOrigen);
  const valorAbsDestino = Math.abs(valorDestino);
  const maximoValor = Math.max(valorAbsOrigen, valorAbsDestino, 0.0001);

  const alturaFinalOrigen = (valorAbsOrigen / maximoValor) * alturaMaxima;
  const alturaFinalDestino = (valorAbsDestino / maximoValor) * alturaMaxima;

  const estiloComputado = getComputedStyle(document.documentElement);
  const colorPrimario = estiloComputado.getPropertyValue("--color-primario").trim() || "#1B5E7A";
  const colorAcento = estiloComputado.getPropertyValue("--color-acento").trim() || "#E8A33D";
  const colorTexto = estiloComputado.getPropertyValue("--color-texto").trim() || "#1A1D23";

  const duracionMs = 600;
  let inicio = null;

  function dibujarCuadro(alturaOrigenActual, alturaDestinoActual) {
    ctx.clearRect(0, 0, ancho, alto);

    const anchoBarra = ancho * 0.22;
    const xOrigen = ancho * 0.22 - anchoBarra / 2;
    const xDestino = ancho * 0.72 - anchoBarra / 2;
    const yBase = alto - margenInferior;

    // Línea base
    ctx.strokeStyle = colorTexto;
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.moveTo(16, yBase);
    ctx.lineTo(ancho - 16, yBase);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Barra de origen
    ctx.fillStyle = colorPrimario;
    ctx.fillRect(xOrigen, yBase - alturaOrigenActual, anchoBarra, alturaOrigenActual);

    // Barra de destino
    ctx.fillStyle = colorAcento;
    ctx.fillRect(xDestino, yBase - alturaDestinoActual, anchoBarra, alturaDestinoActual);

    // Etiquetas
    ctx.fillStyle = colorTexto;
    ctx.font = "13px ui-monospace, 'Consolas', monospace";
    ctx.textAlign = "center";
    ctx.fillText(etiquetaOrigen, xOrigen + anchoBarra / 2, yBase + 20);
    ctx.fillText(etiquetaDestino, xDestino + anchoBarra / 2, yBase + 20);
  }

  function paso(marcaTiempo) {
    if (inicio === null) inicio = marcaTiempo;
    const transcurrido = marcaTiempo - inicio;
    const progreso = Math.min(transcurrido / duracionMs, 1);
    // easing suave (ease-out)
    const progresoSuavizado = 1 - Math.pow(1 - progreso, 3);

    dibujarCuadro(
      alturaFinalOrigen * progresoSuavizado,
      alturaFinalDestino * progresoSuavizado
    );

    if (progreso < 1) {
      ANIMACIONES_ACTIVAS[idCanvas] = requestAnimationFrame(paso);
    }
  }

  ANIMACIONES_ACTIVAS[idCanvas] = requestAnimationFrame(paso);
}

/**
 * Dibuja un estado vacío/inicial en el canvas (líneas base sin barras).
 */
function dibujarEstadoInicial(idCanvas) {
  const canvas = document.getElementById(idCanvas);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const estiloComputado = getComputedStyle(document.documentElement);
  const colorTexto = estiloComputado.getPropertyValue("--color-texto").trim() || "#1A1D23";
  ctx.strokeStyle = colorTexto;
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.moveTo(16, canvas.height - 34);
  ctx.lineTo(canvas.width - 16, canvas.height - 34);
  ctx.stroke();
  ctx.globalAlpha = 1;
}
