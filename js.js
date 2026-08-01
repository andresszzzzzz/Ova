document.addEventListener("DOMContentLoaded", () => {
    // Definición de unidades y factores de conversión hacia una unidad base
    const unidadesData = {
        tiempo: {
            base: "s",
            unidades: {
                s: { nombre: "Segundos (s)", factor: 1 },
                min: { nombre: "Minutos (min)", factor: 60 },
                h: { nombre: "Horas (h)", factor: 3600 },
                d: { nombre: "Días (d)", factor: 86400 }
            }
        },
        longitud: {
            base: "m",
            unidades: {
                mm: { nombre: "Milímetros (mm)", factor: 0.001 },
                cm: { nombre: "Centímetros (cm)", factor: 0.01 },
                m: { nombre: "Metros (m)", factor: 1 },
                km: { nombre: "Kilómetros (km)", factor: 1000 }
            }
        },
        masa: {
            base: "g",
            unidades: {
                mg: { nombre: "Miligramos (mg)", factor: 0.001 },
                g: { nombre: "Gramos (g)", factor: 1 },
                kg: { nombre: "Kilogramos (kg)", factor: 1000 },
                lb: { nombre: "Libras (lb)", factor: 453.592 }
            }
        },
        volumen: {
            base: "L",
            unidades: {
                ml: { nombre: "Mililitros (ml)", factor: 0.001 },
                cm3: { nombre: "Centímetros cúbicos (cm³)", factor: 0.001 },
                L: { nombre: "Litros (L)", factor: 1 },
                oz: { nombre: "Onzas líquidas (oz)", factor: 0.0295735 }
            }
        }
    };

    // Elementos del DOM del conversor
    const magnitudeSelect = document.getElementById("magnitudeSelect");
    const unitFrom = document.getElementById("unitFrom");
    const unitTo = document.getElementById("unitTo");
    const inputValue = document.getElementById("inputValue");
    const convertBtn = document.getElementById("convertBtn");
    const converterResult = document.getElementById("converterResult");
    const resultValueText = document.getElementById("resultValueText");
    const resultStepText = document.getElementById("resultStepText");
    const resultBeginnerText = document.getElementById("resultBeginnerText");

    // Elementos del Modal Personalizado
    const customModal = document.getElementById("customModal");
    const modalMessage = document.getElementById("modalMessage");
    const modalCloseBtn = document.getElementById("modalCloseBtn");

    function mostrarModal(mensaje) {
        modalMessage.textContent = mensaje;
        customModal.classList.remove("hidden");
    }

    modalCloseBtn.addEventListener("click", () => {
        customModal.classList.add("hidden");
    });

    // Actualizar selectores de unidades dinámicamente
    function actualizarUnidades() {
        const magnitudSeleccionada = magnitudeSelect.value;
        const unidades = unidadesData[magnitudSeleccionada].unidades;

        unitFrom.innerHTML = "";
        unitTo.innerHTML = "";

        for (let key in unidades) {
            let option1 = document.createElement("option");
            option1.value = key;
            option1.textContent = unidades[key].nombre;
            unitFrom.appendChild(option1);

            let option2 = document.createElement("option");
            option2.value = key;
            option2.textContent = unidades[key].nombre;
            unitTo.appendChild(option2);
        }
        if (unitTo.options.length > 1) {
            unitTo.selectedIndex = 1;
        }
    }

    magnitudeSelect.addEventListener("change", actualizarUnidades);
    actualizarUnidades();

    // Lógica del Conversor con explicación detallada paso a paso
    convertBtn.addEventListener("click", () => {
        const valorRaw = inputValue.value.trim();

        // Validación estricta sin alertas nativas
        if (valorRaw === "" || isNaN(valorRaw)) {
            mostrarModal("Por favor, ingrese un valor numérico válido para realizar la conversión.");
            return;
        }

        const cantidad = parseFloat(valorRaw);
        const magnitud = magnitudeSelect.value;
        const uFromKey = unitFrom.value;
        const uToKey = unitTo.value;

        const datosMag = unidadesData[magnitud];
        const factorOrigen = datosMag.unidades[uFromKey].factor;
        const factorDestino = datosMag.unidades[uToKey].factor;

        // Cálculo operativo
        const valorEnBase = cantidad * factorOrigen;
        const resultadoFinal = valorEnBase / factorDestino;

        const nombreOrigen = datosMag.unidades[uFromKey].nombre;
        const nombreDestino = datosMag.unidades[uToKey].nombre;

        // Mostrar resultados
        resultValueText.textContent = `${cantidad} ${nombreOrigen} = ${resultadoFinal.toFixed(4)} ${nombreDestino}`;

        resultStepText.innerHTML = `1. Se transformó la unidad de origen (${nombreOrigen}) a su equivalente en la unidad base multiplicando por su factor (${factorOrigen}). Resultado intermedio: ${valorEnBase} ${datosMag.base}.<br>` +
            `2. Se dividió dicho valor entre el factor de la unidad de destino (${nombreDestino}, factor: ${factorDestino}) obteniendo el valor final exacto.`;

        resultBeginnerText.textContent = `Para alguien que inicia: Imagina que llevas todas tus unidades a una medida estándar (${datosMag.base}) para poder compararlas con facilidad, y luego las divides entre el tamaño de la nueva unidad a la que quieres llegar.`;

        converterResult.classList.remove("hidden");
    });

    // Inicialización de simulación física con Matter.js
    function initPhysicsSimulation() {
        const container = document.getElementById("physics-canvas-container");
        if (!container || typeof Matter === "undefined") return;

        const { Engine, Render, Runner, Bodies, Composite } = Matter;

        const engine = Engine.create();
        const render = Render.create({
            element: container,
            engine: engine,
            options: {
                width: container.clientWidth || 400,
                height: 180,
                wireframes: false,
                background: '#090d16'
            }
        });

        Render.run(render);
        const runner = Runner.create();
        Runner.run(runner, engine);

        // Añadir suelo, paredes y cuerpos flotantes representando magnitudes
        const ground = Bodies.rectangle(200, 170, 400, 20, { isStatic: true, render: { fillStyle: '#39A900' } });
        const wall1 = Bodies.rectangle(0, 90, 20, 180, { isStatic: true, render: { fillStyle: '#334155' } });
        const wall2 = Bodies.rectangle(400, 90, 20, 180, { isStatic: true, render: { fillStyle: '#334155' } });

        const block1 = Bodies.circle(120, 40, 20, { restitution: 0.8, render: { fillStyle: '#22c55e' } });
        const block2 = Bodies.circle(200, 20, 25, { restitution: 0.6, render: { fillStyle: '#00324D' } });
        const block3 = Bodies.rectangle(280, 30, 30, 30, { restitution: 0.5, render: { fillStyle: '#39A900' } });

        Composite.add(engine.world, [ground, wall1, wall2, block1, block2, block3]);
    }
    initPhysicsSimulation();

    // BANCO DE 10 PREGUNTAS DE EVALUACIÓN
    const preguntasEvaluacion = [
        {
            pregunta: "1. ¿Cuántos segundos equivalen a 3 minutos?",
            opciones: ["a) 90 segundos", "b) 180 segundos", "c) 300 segundos"],
            correcta: 1,
            explicacion: "Se multiplica 3 minutos por 60 segundos que tiene cada minuto (3 * 60 = 180)."
        },
        {
            pregunta: "2. Al convertir 2.5 metros a centímetros, el resultado correcto es:",
            opciones: ["a) 25 cm", "b) 250 cm", "c) 2500 cm"],
            correcta: 1,
            explicacion: "1 metro equivale a 100 centímetros, por lo tanto 2.5 * 100 = 250 cm."
        },
        {
            pregunta: "3. ¿Cuál es el equivalente de 1 Kilogramo en gramos?",
            opciones: ["a) 100 gramos", "b) 1000 gramos", "c) 10,000 gramos"],
            correcta: 1,
            explicacion: "El prefijo 'kilo-' indica un factor multiplicador de 1000 gramos."
        },
        {
            pregunta: "4. En volumen, ¿a cuánto equivale 1 Litro en mililitros (ml)?",
            opciones: ["a) 10 ml", "b) 100 ml", "c) 1000 ml"],
            correcta: 2,
            explicacion: "Un litro contiene exactamente 1000 mililitros (y 1000 cm³)."
        },
        {
            pregunta: "5. ¿Qué magnitud física mide el espacio tridimensional ocupado por un cuerpo?",
            opciones: ["a) Longitud", "b) Volumen", "c) Masa"],
            correcta: 1,
            explicacion: "El volumen cuantifica el espacio físico ocupado por materia en tres dimensiones."
        },
        {
            pregunta: "6. Si tienes 500 mililitros de agua, ¿cuántos Litros representa?",
            opciones: ["a) 0.5 Litros", "b) 5 Litros", "c) 50 Litros"],
            correcta: 0,
            explicacion: "Se divide 500 entre 1000 para pasar de mililitros a litros, obteniendo 0.5 L."
        },
        {
            pregunta: "7. ¿Cuál es la equivalencia exacta de 1 centímetro cúbico (cm³) en mililitros?",
            opciones: ["a) 0.1 ml", "b) 1 ml", "c) 10 ml"],
            correcta: 1,
            explicacion: "Por definición de capacidad volumétrica, 1 cm³ es exactamente igual a 1 ml."
        },
        {
            pregunta: "8. Para convertir 7200 segundos a horas, ¿qué operación se debe realizar?",
            opciones: ["a) Dividir entre 60 y luego entre 60", "b) Multiplicar por 60", "c) Dividir solo entre 24"],
            correcta: 0,
            explicacion: "Se divide entre 60 para llegar a minutos, y luego entre 60 para llegar a horas (7200 / 3600 = 2 h)."
        },
        {
            pregunta: "9. ¿A cuántos gramos equivale aproximadamente una libra (lb)?",
            opciones: ["a) 250 g", "b) 453.59 g", "c) 1000 g"],
            correcta: 1,
            explicacion: "Una libra estándar equivale a 453.592 gramos o 0.45359 kg."
        },
        {
            pregunta: "10. ¿Por qué es importante dominar los factores de conversión en la industria?",
            opciones: ["a) Para evitar errores graves de cálculo en diseño y formulaciones", "b) Únicamente para pasar exámenes teóricos", "c) No tiene aplicación práctica real"],
            correcta: 0,
            explicacion: "Garantiza la correcta ejecución de fórmulas, dosificaciones y normativas técnicas y de seguridad."
        }
    ];

    const quizContainer = document.getElementById("quizContainer");
    const submitQuizBtn = document.getElementById("submitQuizBtn");
    const quizScoreContainer = document.getElementById("quizScoreContainer");

    // Renderizar cuestionario
    function renderQuiz() {
        if (!quizContainer) return;
        quizContainer.innerHTML = "";
        preguntasEvaluacion.forEach((q, index) => {
            const qDiv = document.createElement("div");
            qDiv.className = "quiz-question";
            qDiv.innerHTML = `<p><strong>${q.pregunta}</strong></p>`;

            const optionsDiv = document.createElement("div");
            optionsDiv.className = "quiz-options";

            q.opciones.forEach((opt, optIndex) => {
                optionsDiv.innerHTML += `
                    <label>
                        <input type="radio" name="pregunta_${index}" value="${optIndex}">
                        ${opt}
                    </label>
                `;
            });

            qDiv.appendChild(optionsDiv);
            qDiv.innerHTML += `<div id="feedback_${index}" class="feedback-inline"></div>`;
            quizContainer.appendChild(qDiv);
        });
    }

    renderQuiz();

    // Calificar evaluación
    submitQuizBtn.addEventListener("click", () => {
        let aciertos = 0;
        let respondidasTotales = 0;

        preguntasEvaluacion.forEach((q, index) => {
            const seleccionada = document.querySelector(`input[name="pregunta_${index}"]:checked`);
            const feedbackDiv = document.getElementById(`feedback_${index}`);

            if (seleccionada) {
                respondidasTotales++;
                const val = parseInt(seleccionada.value);
                if (val === q.correcta) {
                    aciertos++;
                    feedbackDiv.textContent = "¡Respuesta Correcta!";
                    feedbackDiv.className = "feedback-inline correct";
                } else {
                    feedbackDiv.textContent = `Respuesta Incorrecta. Explicación: ${q.explicacion}`;
                    feedbackDiv.className = "feedback-inline incorrect";
                }
            } else {
                feedbackDiv.textContent = "No seleccionaste ninguna opción.";
                feedbackDiv.className = "feedback-inline incorrect";
            }
        });

        if (respondidasTotales < preguntasEvaluacion.length) {
            mostrarModal("Por favor, responda todas las preguntas antes de calificar la evaluación.");
            return;
        }

        quizScoreContainer.innerHTML = `<h3>Calificación Final: ${aciertos} de ${preguntasEvaluacion.length}</h3>`;
        quizScoreContainer.className = "result-display";
        quizScoreContainer.scrollIntoView({ behavior: 'smooth' });
    });
});