// ==========================================
// 1. BASE DE DATOS DE MAGNITUDES Y FACTORES
// ==========================================
const unidades = {
    tiempo: [
        { id: 's', nombre: 'Segundos (s)', factor: 1 },
        { id: 'min', nombre: 'Minutos (min)', factor: 60 },
        { id: 'h', nombre: 'Horas (h)', factor: 3600 },
        { id: 'dia', nombre: 'Días', factor: 86400 }
    ],
    longitud: [
        { id: 'm', nombre: 'Metros (m)', factor: 1 },
        { id: 'cm', nombre: 'Centímetros (cm)', factor: 0.01 },
        { id: 'km', nombre: 'Kilómetros (km)', factor: 1000 },
        { id: 'in', nombre: 'Pulgadas (in)', factor: 0.0254 }
    ],
    masa: [
        { id: 'kg', nombre: 'Kilogramos (kg)', factor: 1 },
        { id: 'g', nombre: 'Gramos (g)', factor: 0.001 },
        { id: 'lb', nombre: 'Libras (lb)', factor: 0.453592 },
        { id: 'oz', nombre: 'Onzas (oz)', factor: 0.0283495 }
    ],
    volumen: [
        { id: 'l', nombre: 'Litros (L)', factor: 1 },
        { id: 'ml', nombre: 'Mililitros (mL)', factor: 0.001 },
        { id: 'cm3', nombre: 'Centímetros Cúbicos (cm³)', factor: 0.001 }
    ]
};

// ==========================================
// 2. INICIALIZACIÓN AL CARGAR LA PÁGINA
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    actualizarOpcionesUnidades();
    cargarEvaluacion();
    iniciarFisicasMatterJS(); // Motor físico
});

// ==========================================
// 3. NAVEGACIÓN CONTINUA Y PESTAÑAS
// ==========================================
function irASeccion(idSeccion) {
    const seccion = document.getElementById(idSeccion);
    if (seccion) {
        // Calculamos la posición considerando el header fijo para que no tape el título
        const headerOffset = 140;
        const elementPosition = seccion.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
}

function abrirTab(idTab) {
    // Ocultar todos los contenidos de las pestañas
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    // Quitar la clase active de todos los botones de las pestañas
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    // Mostrar la pestaña seleccionada
    document.getElementById(idTab).classList.add('active');
    event.target.classList.add('active');
}

// ==========================================
// 4. MODAL DE VALIDACIÓN PROPIO (Regla: No usar alert)
// ==========================================
function mostrarModal(titulo, mensaje, icono = '⚠️') {
    document.getElementById('modal-titulo').innerText = titulo;
    document.getElementById('modal-mensaje').innerText = mensaje;
    document.getElementById('modal-icon').innerText = icono;
    document.getElementById('modal-custom').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal-custom').style.display = 'none';
}

// ==========================================
// 5. SIMULADOR EN TIEMPO REAL
// ==========================================
function actualizarOpcionesUnidades() {
    const mag = document.getElementById('magnitud-select').value;
    const lista = unidades[mag];
    const selectOri = document.getElementById('origen-select');
    const selectDes = document.getElementById('destino-select');

    selectOri.innerHTML = '';
    selectDes.innerHTML = '';

    lista.forEach(u => {
        selectOri.options.add(new Option(u.nombre, u.id));
        selectDes.options.add(new Option(u.nombre, u.id));
    });

    if (lista.length > 1) selectDes.selectedIndex = 1;
    calcularConversionRealTime();
}

function calcularConversionRealTime() {
    const inputEl = document.getElementById('valor-input');
    const resTexto = document.getElementById('resultado-texto');
    const val = parseFloat(inputEl.value);

    if (inputEl.value === '' || isNaN(val)) {
        resTexto.innerText = 'Esperando que escribas una cantidad...';
        resTexto.style.color = 'var(--text-muted)';
        return;
    }

    if (val < 0) {
        mostrarModal('Valor Inválido', 'Las magnitudes trabajadas en este simulador requieren valores positivos. Por favor, intenta con un número mayor a cero.', '🚫');
        inputEl.value = '';
        return;
    }

    const mag = document.getElementById('magnitud-select').value;
    const idOri = document.getElementById('origen-select').value;
    const idDes = document.getElementById('destino-select').value;

    const uOri = unidades[mag].find(u => u.id === idOri);
    const uDes = unidades[mag].find(u => u.id === idDes);

    // La matemática de la conversión: Convertimos a la unidad base y luego dividimos por el factor destino
    const calculo = (val * uOri.factor) / uDes.factor;

    // Animación visual suave al calcular
    resTexto.style.opacity = '0';
    setTimeout(() => {
        resTexto.innerText = `${calculo.toFixed(4)} ${uDes.id}`;
        resTexto.style.color = 'var(--accent)';
        resTexto.style.opacity = '1';
    }, 150);
}

// ==========================================
// 6. EVALUACIÓN EXPLICATIVA DESDE CERO
// ==========================================
const preguntas = [
    {
        id: 1, p: "1. ¿Cuántos segundos hay en 2 minutos?", ops: ["60 s", "120 s", "180 s"], c: 1,
        exp: "Por qué: Cada minuto tiene adentro 60 segundos. Como vamos a una unidad más pequeña, multiplicamos. Fórmula: 2 × 60 = 120."
    },

    {
        id: 2, p: "2. Tienes 500 cm. ¿Cuántos metros son?", ops: ["5 m", "50 m", "0.5 m"], c: 0,
        exp: "Por qué: Para armar 1 metro necesitas juntar 100 cm. Vamos de pequeño a grande, así que agrupamos dividiendo. Fórmula: 500 ÷ 100 = 5."
    },

    {
        id: 3, p: "3. ¿A cuántos gramos equivalen 2 kg?", ops: ["200 g", "2000 g", "20 g"], c: 1,
        exp: "Por qué: La palabra 'Kilo' significa mil. 1 Kilo tiene 1000 gramos. De grande a pequeño, multiplicamos. Fórmula: 2 × 1000 = 2000."
    },

    {
        id: 4, p: "4. ¿Cuántos mililitros (mL) caben en 1.5 Litros?", ops: ["150 mL", "1500 mL", "15000 mL"], c: 1,
        exp: "Por qué: En 1 litro caben exactamente 1000 mililitros. Al ir de litro a mililitro multiplicamos. Fórmula: 1.5 × 1000 = 1500."
    },

    {
        id: 5, p: "5. ¿Cuántos segundos han pasado si esperas 1 hora?", ops: ["60 s", "600 s", "3600 s"], c: 2,
        exp: "Por qué: Primero pasamos a minutos (1 hora = 60 min). Luego los minutos a segundos (60 min × 60 seg = 3600 segundos en total)."
    },

    {
        id: 6, p: "6. Regla médica: ¿1 centímetro cúbico (cm³) de agua equivale a cuánto?", ops: ["1 mL", "10 mL", "100 mL"], c: 0,
        exp: "Por qué: Esta es una regla universal para que no te confundas: el cm³ y el mililitro (mL) miden exactamente el mismo espacio físico."
    },

    {
        id: 7, p: "7. Vas a caminar 0.5 km (medio kilómetro). ¿Cuántos metros caminarás?", ops: ["50 m", "500 m", "5000 m"], c: 1,
        exp: "Por qué: Un kilómetro completo son 1000 metros. Así que multiplicamos por mil. Fórmula: 0.5 × 1000 = 500 metros."
    },

    {
        id: 8, p: "8. ¿Cuántas horas tiene 1 día completo?", ops: ["12 h", "24 h", "48 h"], c: 1,
        exp: "Por qué: Aunque a veces digamos 'medio día' o veamos el reloj en formato 12 horas, la tierra tarda 24 horas continuas en dar su giro completo."
    },

    {
        id: 9, p: "9. Compraste 1000 gramos de carne. ¿Cuántos kilos son?", ops: ["1 kg", "10 kg", "0.1 kg"], c: 0,
        exp: "Por qué: El gramo es pequeñito. Para armar un paquete de 1 Kilo necesitas exactamente 1000 gramos. Agrupamos dividiendo: 1000 ÷ 1000 = 1."
    },

    {
        id: 10, p: "10. ¿Cuántos centímetros debes dibujar para trazar 1 metro?", ops: ["10 cm", "100 cm", "1000 cm"], c: 1,
        exp: "Por qué: La palabra 'centi' viene de cien. Se necesitan cien partes pequeñitas de un metro (centímetros) para formar el metro completo."
    }
];

function cargarEvaluacion() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = '';

    preguntas.forEach((q, idx) => {
        let opcionesHTML = q.ops.map((op, i) => `
      <label class="opcion-label" onclick="evaluarPregunta(${q.id}, ${i})">
        <input type="radio" name="p_${q.id}" value="${i}"> ${op}
      </label>
    `).join('');

        container.innerHTML += `
      <div class="pregunta-card">
        <p><strong>${q.p}</strong></p>
        ${opcionesHTML}
        <div id="retro_${q.id}" class="retro-feedback"></div>
      </div>
    `;
    });
}

// Retroalimentación al instante por clic
function evaluarPregunta(idPregunta, idRespuesta) {
    const q = preguntas.find(p => p.id === idPregunta);
    const retroDiv = document.getElementById(`retro_${q.id}`);

    retroDiv.style.display = 'block';
    if (idRespuesta === q.c) {
        retroDiv.className = 'retro-feedback retro-exito';
        retroDiv.innerHTML = `<strong>¡Excelente! 🌟</strong>`;
    } else {
        retroDiv.className = 'retro-feedback retro-error';
        retroDiv.innerHTML = `<strong>Tranquilo, revisemos:</strong> ${q.exp}`;
    }
}

function evaluarCuestionarioFinal() {
    const respondidas = document.querySelectorAll('input[type="radio"]:checked').length;
    if (respondidas < preguntas.length) {
        mostrarModal('Evaluación Incompleta', `Has respondido ${respondidas} de 10 preguntas. Intenta completarlas todas para reforzar lo aprendido.`, '📝');
    } else {
        mostrarModal('¡Felicidades!', 'Has completado todas las actividades interactivas de este módulo de magnitudes físicas.', '🏆');
    }
}

// ==========================================
// 7. ANIMACIÓN MULTIMEDIA CON MATTER.JS (Entorno Físico)
// ==========================================
function iniciarFisicasMatterJS() {
    const container = document.getElementById('matter-container');
    if (!container) return;

    const Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite,
        Mouse = Matter.Mouse,
        MouseConstraint = Matter.MouseConstraint;

    const engine = Engine.create();
    const cw = container.clientWidth;
    const ch = container.clientHeight;

    const render = Render.create({
        element: container,
        engine: engine,
        options: { width: cw, height: ch, wireframes: false, background: 'transparent' }
    });

    // Creación de objetos físicos: Paredes para contener los objetos
    const suelo = Bodies.rectangle(cw / 2, ch, cw, 40, { isStatic: true, render: { fillStyle: '#333' } });
    const paredIzq = Bodies.rectangle(0, ch / 2, 40, ch, { isStatic: true, render: { fillStyle: '#333' } });
    const paredDer = Bodies.rectangle(cw, ch / 2, 40, ch, { isStatic: true, render: { fillStyle: '#333' } });

    // Objetos para interactuar (Representan Masa y Volumen visualmente)
    const bloqueMasa = Bodies.rectangle(cw / 2 - 50, 50, 80, 80, { render: { fillStyle: '#39a900' } }); // Cuadrado verde
    const bloqueVolumen = Bodies.circle(cw / 2 + 50, 10, 45, { render: { fillStyle: '#03dac6' } }); // Círculo azul

    Composite.add(engine.world, [suelo, paredIzq, paredDer, bloqueMasa, bloqueVolumen]);

    // Permitir interactividad con el Mouse (Arrastrar y soltar)
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: { stiffness: 0.2, render: { visible: false } }
    });

    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    // Iniciar la simulación física
    Render.run(render);
    Runner.run(Runner.create(), engine);
}