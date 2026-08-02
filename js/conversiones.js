/**
 * conversiones.js
 * Contiene los factores de conversión y las funciones de cálculo
 * para las magnitudes: tiempo, longitud, masa y volumen.
 * Cada magnitud se convierte usando una unidad base intermedia.
 */

// Factores de conversión: "cuántas unidades base equivalen a 1 unidad"
const FACTORES = {
  tiempo: {
    unidadBase: "s",
    unidades: {
      s: { etiqueta: "Segundos (s)", factor: 1 },
      min: { etiqueta: "Minutos (min)", factor: 60 },
      h: { etiqueta: "Horas (h)", factor: 3600 },
      dia: { etiqueta: "Días (día)", factor: 86400 }
    }
  },
  longitud: {
    unidadBase: "m",
    unidades: {
      mm: { etiqueta: "Milímetros (mm)", factor: 0.001 },
      cm: { etiqueta: "Centímetros (cm)", factor: 0.01 },
      m: { etiqueta: "Metros (m)", factor: 1 },
      km: { etiqueta: "Kilómetros (km)", factor: 1000 }
    }
  },
  masa: {
    unidadBase: "g",
    unidades: {
      mg: { etiqueta: "Miligramos (mg)", factor: 0.001 },
      g: { etiqueta: "Gramos (g)", factor: 1 },
      kg: { etiqueta: "Kilogramos (kg)", factor: 1000 },
      lb: { etiqueta: "Libras (lb)", factor: 453.592 }
    }
  },
  volumen: {
    unidadBase: "ml",
    unidades: {
      ml: { etiqueta: "Mililitros (ml)", factor: 1 },
      cm3: { etiqueta: "Centímetros cúbicos (cm³)", factor: 1 },
      l: { etiqueta: "Litros (l)", factor: 1000 },
      oz: { etiqueta: "Onzas (oz)", factor: 29.5735 }
    }
  }
};

/**
 * Convierte un valor numérico de una unidad de origen a una unidad de destino
 * dentro de la misma magnitud.
 * @param {string} magnitud - "tiempo" | "longitud" | "masa" | "volumen"
 * @param {number} valor - Valor numérico a convertir
 * @param {string} unidadOrigen - Clave de la unidad de origen
 * @param {string} unidadDestino - Clave de la unidad de destino
 * @returns {number} Valor convertido
 */
function convertir(magnitud, valor, unidadOrigen, unidadDestino) {
  const datosMagnitud = FACTORES[magnitud];
  if (!datosMagnitud) {
    throw new Error("Magnitud no reconocida: " + magnitud);
  }
  const factorOrigen = datosMagnitud.unidades[unidadOrigen]?.factor;
  const factorDestino = datosMagnitud.unidades[unidadDestino]?.factor;
  if (factorOrigen === undefined || factorDestino === undefined) {
    throw new Error("Unidad no reconocida para la magnitud " + magnitud);
  }
  const valorEnBase = valor * factorOrigen;
  const valorConvertido = valorEnBase / factorDestino;
  return valorConvertido;
}

/**
 * Obtiene las unidades disponibles de una magnitud como arreglo [{clave, etiqueta}]
 */
function obtenerUnidades(magnitud) {
  const datosMagnitud = FACTORES[magnitud];
  if (!datosMagnitud) return [];
  return Object.keys(datosMagnitud.unidades).map((clave) => ({
    clave,
    etiqueta: datosMagnitud.unidades[clave].etiqueta
  }));
}

/**
 * Formatea un número para mostrarlo con máximo 4 decimales, sin ceros sobrantes.
 */
function formatearNumero(numero) {
  if (!isFinite(numero)) return "—";
  const redondeado = Math.round(numero * 10000) / 10000;
  return redondeado.toString();
}
