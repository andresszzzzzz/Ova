document.addEventListener("DOMContentLoaded", () => {
    const unidadesData = {
        tiempo: {
            base: "segundo",
            unidades: {
                s: { nombre: "Segundo (s)", factor: 1 },
                min: { nombre: "Minuto (min)", factor: 60 },
                h: { nombre: "Hora (h)", factor: 3600 }
            }
        },
        longitud: {
            base: "metro",
            unidades: {
                mm: { nombre: "Milímetro (mm)", factor: 0.001 },
                cm: { nombre: "Centímetro (cm)", factor: 0.01 },
                m: { nombre: "Metro (m)", factor: 1 },
                km: { nombre: "Kilómetro (km)", factor: 1000 }
            }
        },
        masa: {
            base: "gramo",
            unidades: {
                mg: { nombre: "Miligramo (mg)", factor: 0.001 },
                g: { nombre: "Gramo (g)", factor: 1 },
                kg: { nombre: "Kilogramo (kg)", factor: 1000 },
                t: { nombre: "Tonelada (t)", factor: 1000000 }
            }
        },
        volumen: {
            base: "mililitro",
            unidades: {
                mL: { nombre: "Mililitros (mL)", factor: 1 },
                cm3: { nombre: "Centímetros cúbicos (cm³)", factor: 1 },
                L: { nombre: "Litros (L)", factor: 1000 },
                oz: { nombre: "Onzas (oz)", factor: 29.5735296 }
            }
        }
    };

    const magnitudSelect = document.getElementById("magnitud-select");
    const valorInput = document.getElementById("valor-input");
    const origenSelect = document.getElementById("origen-select");
    const destinoSelect = document.getElementById("destino-select");
    const btnConvertir = document.getElementById("btn-convertir");
    const resultadoContainer = document.getElementById("resultado-container");
    const textoResultado = document.getElementById("texto-resultado");
    const explicacionDetalle = document.getElementById("explicacion-detalle");

    const customModal = document.getElementById("custom-modal");
    const modalMensaje = document.getElementById("modal-mensaje");
    const modalCerrar = document.getElementById("modal-cerrar");

    function mostrarModal(mensaje) {
        modalMensaje.textContent = mensaje;
        customModal.style.display = "flex";
    }

    modalCerrar.addEventListener("click", () => {
        customModal.style.display = "none";
    });

    function actualizarSelectsUnidades() {
        const magnitudActual = magnitudSelect.value;
        const unidades = unidadesData[magnitudActual].unidades;

        origenSelect.innerHTML = "";
        destinoSelect.innerHTML = "";

        for (let clave in unidades) {
            let opt1 = document.createElement("option");
            opt1.value = clave;
            opt1.textContent = unidades[clave].nombre;
            origenSelect.appendChild(opt1);

            let opt2 = document.createElement("option");
            opt2.value = clave;
            opt2.textContent = unidades[clave].nombre;
            destinoSelect.appendChild(opt2);
        }

        if (destinoSelect.options.length > 1) {
            destinoSelect.selectedIndex = 1;
        }
    }

    magnitudSelect.addEventListener("change", actualizarSelectsUnidades);
    actualizarSelectsUnidades();

    function realizarConversion() {
        const magnitudActual = magnitudSelect.value;
        const valorStr = valorInput.value.trim();

        if (valorStr === "" || isNaN(valorStr)) {
            mostrarModal("Por favor, ingrese un valor numérico válido para realizar la conversión.");
            return;
        }

        const valor = parseFloat(valorStr);
        const unidadOrigenKey = origenSelect.value;
        const unidadDestinoKey = destinoSelect.value;

        const infoMagnitud = unidadesData[magnitudActual];
        const unidadOrigen = infoMagnitud.unidades[unidadOrigenKey];
        const unidadDestino = infoMagnitud.unidades[unidadDestinoKey];

        const valorEnBase = valor * unidadOrigen.factor;
        const resultadoFinal = valorEnBase / unidadDestino.factor;

        resultadoContainer.style.display = "block";
        textoResultado.textContent = `${valor} ${unidadOrigenKey} equivalen a ${resultadoFinal.toFixed(4)} ${unidadDestinoKey}`;

        let htmlExplicacion = `
            <p><strong>1. Unidad base seleccionada:</strong> Para esta magnitud (${magnitudActual}), la unidad base de referencia es el <strong>${infoMagnitud.base}</strong>.</p>
            <p><strong>2. ¿Por qué se convierte primero a la unidad base?:</strong> Estandarizar a una unidad común universal evita errores complejos y simplifica cualquier transformación entre múltiples escalas.</p>
            <p><strong>3. Operación paso 1 (Conversión a base):</strong> Se toma el valor ingresado (${valor}) de <em>${unidadOrigen.nombre}</em> y se multiplica por su factor de equivalencia base (${unidadOrigen.factor}), obteniendo: <strong>${valorEnBase} ${infoMagnitud.base}(s)</strong>.</p>
            <p><strong>4. Operación paso 2 (Conversión a destino):</strong> Para llevar los ${infoMagnitud.base}(s) a la unidad de destino <em>${unidadDestino.nombre}</em>, se realiza la división entre el factor de la unidad de destino (${unidadDestino.factor}).</p>
            <p><strong>5. Resultado final:</strong> ${valorEnBase} / ${unidadDestino.factor} = <strong>${resultadoFinal.toFixed(4)} ${unidadDestinoKey}</strong>.</p>
        `;

        explicacionDetalle.innerHTML = htmlExplicacion;
    }

    btnConvertir.addEventListener("click", realizarConversion);

    const preguntasEvaluacion = [
        {
            pregunta: "1. ¿A cuántos segundos equivalen 3 minutos?",
            opciones: ["120 s", "180 s", "300 s", "60 s"],
            correcta: 1,
            explicacion: "Cada minuto tiene 60 segundos. Se multiplica 3 x 60 = 180 segundos."
        },
        {
            pregunta: "2. Convierte 2.5 metros a centímetros:",
            opciones: ["25 cm", "250 cm", "2500 cm", "2.5 cm"],
            correcta: 1,
            explicacion: "1 metro equivale a 100 centímetros. Se multiplica 2.5 x 100 = 250 cm."
        },
        {
            pregunta: "3. ¿Cuántos gramos hay en 1.5 kilogramos?",
            opciones: ["150 g", "1500 g", "15 g", "15000 g"],
            correcta: 1,
            explicacion: "1 kilogramo equivale a 1000 gramos. Se multiplica 1.5 x 1000 = 1500 g."
        },
        {
            pregunta: "4. ¿A cuántos mililitros equivalen 2 litros?",
            opciones: ["200 mL", "2000 mL", "20 mL", "20000 mL"],
            correcta: 1,
            explicacion: "1 litro tiene 1000 mililitros. Se multiplica 2 x 1000 = 2000 mL."
        },
        {
            pregunta: "5. ¿Cuál es la equivalencia correcta de un centímetro cúbico (cm³) en volumen?",
            opciones: ["1 cm³ equivale a 1 mL", "1 cm³ equivale a 1 Litro", "1 cm³ equivale a 10 mL", "1 cm³ equivale a 100 mL"],
            correcta: 0,
            explicacion: "Por definición volumétrica estándar, 1 centímetro cúbico (cm³) es exactamente igual a 1 mililitro (mL)."
        },
        {
            pregunta: "6. Convierte 5000 metros a kilómetros:",
            opciones: ["50 km", "5 km", "0.5 km", "500 km"],
            correcta: 1,
            explicacion: "1 kilómetro tiene 1000 metros. Se divide 5000 / 1000 = 5 km."
        },
        {
            pregunta: "7. ¿Cuántos segundos hay en 2 horas?",
            opciones: ["3600 s", "1200 s", "7200 s", "6000 s"],
            correcta: 2,
            explicacion: "1 hora tiene 3600 segundos. Se multiplica 2 x 3600 = 7200 segundos."
        },
        {
            pregunta: "8. ¿Cuántos miligramos hay en 3 gramos?",
            opciones: ["30 mg", "300 mg", "3000 mg", "30000 mg"],
            correcta: 2,
            explicacion: "1 gramo tiene 1000 miligramos. Se multiplica 3 x 1000 = 3000 mg."
        },
        {
            pregunta: "9. Si tienes 1000 centímetros cúbicos (cm³), ¿a cuántos litros equivale?",
            opciones: ["0.1 Litros", "1 Litro", "10 Litros", "100 Litros"],
            correcta: 1,
            explicacion: "1000 cm³ equivalen a 1000 mL, y 1000 mL divididos entre 1000 dan exactamente 1 Litro."
        },
        {
            pregunta: "10. ¿Cuál es la unidad base oficial en el Sistema Internacional para medir la masa?",
            opciones: ["Gramo (g)", "Kilogramo (kg)", "Tonelada (t)", "Miligramo (mg)"],
            correcta: 1,
            explicacion: "La unidad básica oficial de masa en el Sistema Internacional de Unidades (SI) es el kilogramo (kg)."
        }
    ];

    const quizContainer = document.getElementById("quiz-container");
    const btnEvaluar = document.getElementById("btn-evaluar");
    const calificacionResultado = document.getElementById("calificacion-resultado");

    function construirQuiz() {
        let output = "";
        preguntasEvaluacion.forEach((q, index) => {
            output += `<div class="pregunta-item" id="pregunta-${index}">`;
            output += `<p><strong>${q.pregunta}</strong></p>`;
            q.opciones.forEach((opcion, opIndex) => {
                output += `
                    <label style="display:block; margin: 4px 0; cursor:pointer;">
                        <input type="radio" name="p-${index}" value="${opIndex}"> ${opcion}
                    </label>
                `;
            });
            output += `<div class="retroalimentacion" id="retro-${index}" style="display:none;"></div>`;
            output += `</div>`;
        });
        quizContainer.innerHTML = output;
    }

    construirQuiz();

    btnEvaluar.addEventListener("click", () => {
        let aciertos = 0;
        preguntasEvaluacion.forEach((q, index) => {
            const opcionesSeleccionadas = document.querySelector(`input[name="p-${index}"]:checked`);
            const divRetro = document.getElementById(`retro-${index}`);
            divRetro.style.display = "block";

            if (opcionesSeleccionadas) {
                const respuestaUsuario = parseInt(opcionesSeleccionadas.value);
                if (respuestaUsuario === q.correcta) {
                    aciertos++;
                    divRetro.className = "retroalimentacion retro-correcta";
                    divRetro.textContent = `¡Correcto! ${q.explicacion}`;
                } else {
                    divRetro.className = "retroalimentacion retro-incorrecta";
                    divRetro.textContent = `Incorrecto. La respuesta correcta era "${q.opciones[q.correcta]}". Explicación: ${q.explicacion}`;
                }
            } else {
                divRetro.className = "retroalimentacion retro-incorrecta";
                divRetro.textContent = `No respondiste esta pregunta. La respuesta correcta era "${q.opciones[q.correcta]}". Explicación: ${q.explicacion}`;
            }
        });

        calificacionResultado.style.display = "block";
        calificacionResultado.innerHTML = `<h3>Calificación Final: ${aciertos} de 10 aciertos (${(aciertos * 10)}%)</h3>`;
    });
});