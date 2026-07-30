//============================
// INFORMACIÓN DE LOS TEMAS
//============================

function mostrarTema(tipo) {

    let titulo = document.getElementById("tituloTema");
    let descripcion = document.getElementById("descripcionTema");
    let contenido = document.getElementById("contenidoTema");

    if (tipo === "tiempo") {

        titulo.innerHTML = "⏱ Tiempo";

        descripcion.innerHTML = "El tiempo permite medir la duración de un evento o una actividad.";

        contenido.innerHTML = `

            <h4>¿Para qué sirve?</h4>

            <p>
                Se utiliza para medir cuánto dura una actividad,
                un viaje, una clase o cualquier acontecimiento.
            </p>

            <h4>Unidades principales</h4>

            <ul>
                <li>1 minuto = 60 segundos</li>
                <li>1 hora = 60 minutos</li>
                <li>1 día = 24 horas</li>
            </ul>

            <h4>¿Cómo convertir?</h4>

            <p>
                Si pasas a una unidad más pequeña, multiplica.<br>
                Si pasas a una unidad más grande, divide.
            </p>

            <h4>Ejemplo</h4>

            <p>
                2 horas → minutos<br>
                2 × 60 = <strong>120 minutos</strong>
            </p>

        `;

    }

    if (tipo === "longitud") {

        titulo.innerHTML = "📏 Longitud";

        descripcion.innerHTML = "La longitud sirve para medir la distancia entre dos puntos.";

        contenido.innerHTML = `

            <h4>¿Para qué sirve?</h4>

            <p>
                Permite medir carreteras, edificios,
                personas, mesas y cualquier distancia.
            </p>

            <h4>Unidades principales</h4>

            <ul>
                <li>1 kilómetro = 1000 metros</li>
                <li>1 metro = 100 centímetros</li>
                <li>1 centímetro = 10 milímetros</li>
            </ul>

            <h4>¿Cómo convertir?</h4>

            <p>
                Si pasas a una unidad más pequeña, multiplica.<br>
                Si pasas a una unidad más grande, divide.
            </p>

            <h4>Ejemplo</h4>

            <p>
                5 metros → centímetros<br>
                5 × 100 = <strong>500 centímetros</strong>
            </p>

        `;

    }

    if (tipo === "masa") {

        titulo.innerHTML = "⚖ Masa";

        descripcion.innerHTML = "La masa representa la cantidad de materia que tiene un objeto.";

        contenido.innerHTML = `

            <h4>¿Para qué sirve?</h4>

            <p>
                Se utiliza para pesar alimentos,
                personas, animales y objetos.
            </p>

            <h4>Unidades principales</h4>

            <ul>
                <li>1 kilogramo = 1000 gramos</li>
                <li>1 gramo = 1000 miligramos</li>
            </ul>

            <h4>¿Cómo convertir?</h4>

            <p>
                Si pasas a una unidad más pequeña, multiplica.<br>
                Si pasas a una unidad más grande, divide.
            </p>

            <h4>Ejemplo</h4>

            <p>
                4 kg → gramos<br>
                4 × 1000 = <strong>4000 gramos</strong>
            </p>

        `;

    }

    if (tipo === "volumen") {

        titulo.innerHTML = "🧪 Volumen";

        descripcion.innerHTML = "El volumen mide el espacio que ocupa un líquido o un objeto.";

        contenido.innerHTML = `

            <h4>¿Para qué sirve?</h4>

            <p>
                Se utiliza para medir líquidos
                como agua, leche, jugos o combustible.
            </p>

            <h4>Unidades principales</h4>

            <ul>
                <li>1 litro = 1000 mililitros</li>
            </ul>

            <h4>¿Cómo convertir?</h4>

            <p>
                Si pasas a una unidad más pequeña, multiplica.<br>
                Si pasas a una unidad más grande, divide.
            </p>

            <h4>Ejemplo</h4>

            <p>
                3 litros → mililitros<br>
                3 × 1000 = <strong>3000 mililitros</strong>
            </p>

        `;

    }

}

//============================
// CONVERSOR
//============================

const unidades = {

    longitud: ["Milímetro", "Centímetro", "Metro", "Kilómetro"],

    masa: ["Miligramo", "Gramo", "Kilogramo"],

    tiempo: ["Segundo", "Minuto", "Hora", "Día"],

    volumen: ["Mililitro", "Litro"]

};

function cargarUnidades() {

    let magnitud = document.getElementById("magnitud").value;

    let origen = document.getElementById("origen");

    let destino = document.getElementById("destino");

    origen.innerHTML = "";
    destino.innerHTML = "";

    unidades[magnitud].forEach(function (unidad) {

        origen.innerHTML += `<option>${unidad}</option>`;
        destino.innerHTML += `<option>${unidad}</option>`;

    });

}

//============================
// CONVERSIONES
//============================

function convertir() {

    let valor = parseFloat(document.getElementById("valor").value);

    let magnitud = document.getElementById("magnitud").value;

    let origen = document.getElementById("origen").value;

    let destino = document.getElementById("destino").value;

    let resultado = document.getElementById("resultado");

    let explicacion = document.getElementById("explicacion");

    if (isNaN(valor)) {

        resultado.innerHTML = "Ingrese un valor válido.";
        explicacion.innerHTML = "";

        return;

    }

    if (origen === destino) {

        resultado.innerHTML = valor + " " + destino;

        explicacion.innerHTML = `
        1. El valor ya estaba en <strong>${destino}</strong>.<br><br>
        2. No fue necesario realizar ninguna conversión.
        `;

        return;

    }

    let base;
    let conversion;

    // LONGITUD

    if (magnitud === "longitud") {

        const factores = {

            "Milímetro": 0.001,
            "Centímetro": 0.01,
            "Metro": 1,
            "Kilómetro": 1000

        };

        base = valor * factores[origen];
        conversion = base / factores[destino];

    }

    // MASA

    if (magnitud === "masa") {

        const factores = {

            "Miligramo": 0.001,
            "Gramo": 1,
            "Kilogramo": 1000

        };

        base = valor * factores[origen];
        conversion = base / factores[destino];

    }

    // TIEMPO

    if (magnitud === "tiempo") {

        const factores = {

            "Segundo": 1,
            "Minuto": 60,
            "Hora": 3600,
            "Día": 86400

        };

        base = valor * factores[origen];
        conversion = base / factores[destino];

    }

    // VOLUMEN

    if (magnitud === "volumen") {

        const factores = {

            "Mililitro": 1,
            "Litro": 1000

        };

        base = valor * factores[origen];
        conversion = base / factores[destino];

    }

    resultado.innerHTML = conversion.toFixed(2) + " " + destino;

    let operacion = "";
    let equivalencia = "";

    // LONGITUD

    if (magnitud === "longitud") {

        if (origen === "Kilómetro" && destino === "Metro") {
            operacion = "Multiplicamos por 1000";
            equivalencia = "1 kilómetro = 1000 metros";
        }
        else if (origen === "Metro" && destino === "Kilómetro") {
            operacion = "Dividimos entre 1000";
            equivalencia = "1000 metros = 1 kilómetro";
        }
        else if (origen === "Metro" && destino === "Centímetro") {
            operacion = "Multiplicamos por 100";
            equivalencia = "1 metro = 100 centímetros";
        }
        else if (origen === "Centímetro" && destino === "Metro") {
            operacion = "Dividimos entre 100";
            equivalencia = "100 centímetros = 1 metro";
        }
        else if (origen === "Centímetro" && destino === "Milímetro") {
            operacion = "Multiplicamos por 10";
            equivalencia = "1 centímetro = 10 milímetros";
        }
        else if (origen === "Milímetro" && destino === "Centímetro") {
            operacion = "Dividimos entre 10";
            equivalencia = "10 milímetros = 1 centímetro";
        }

    }

    // MASA

    if (magnitud === "masa") {

        if (origen === "Kilogramo" && destino === "Gramo") {
            operacion = "Multiplicamos por 1000";
            equivalencia = "1 kilogramo = 1000 gramos";
        }
        else if (origen === "Gramo" && destino === "Kilogramo") {
            operacion = "Dividimos entre 1000";
            equivalencia = "1000 gramos = 1 kilogramo";
        }
        else if (origen === "Gramo" && destino === "Miligramo") {
            operacion = "Multiplicamos por 1000";
            equivalencia = "1 gramo = 1000 miligramos";
        }
        else if (origen === "Miligramo" && destino === "Gramo") {
            operacion = "Dividimos entre 1000";
            equivalencia = "1000 miligramos = 1 gramo";
        }

    }

    // TIEMPO

    if (magnitud === "tiempo") {

        if (origen === "Hora" && destino === "Minuto") {
            operacion = "Multiplicamos por 60";
            equivalencia = "1 hora = 60 minutos";
        }
        else if (origen === "Minuto" && destino === "Hora") {
            operacion = "Dividimos entre 60";
            equivalencia = "60 minutos = 1 hora";
        }
        else if (origen === "Minuto" && destino === "Segundo") {
            operacion = "Multiplicamos por 60";
            equivalencia = "1 minuto = 60 segundos";
        }
        else if (origen === "Segundo" && destino === "Minuto") {
            operacion = "Dividimos entre 60";
            equivalencia = "60 segundos = 1 minuto";
        }
        else if (origen === "Hora" && destino === "Segundo") {
            operacion = "Multiplicamos por 3600";
            equivalencia = "1 hora = 3600 segundos";
        }
        else if (origen === "Segundo" && destino === "Hora") {
            operacion = "Dividimos entre 3600";
            equivalencia = "3600 segundos = 1 hora";
        }
        else if (origen === "Día" && destino === "Hora") {
            operacion = "Multiplicamos por 24";
            equivalencia = "1 día = 24 horas";
        }
        else if (origen === "Hora" && destino === "Día") {
            operacion = "Dividimos entre 24";
            equivalencia = "24 horas = 1 día";
        }

    }

    // VOLUMEN

    if (magnitud === "volumen") {

        if (origen === "Litro" && destino === "Mililitro") {
            operacion = "Multiplicamos por 1000";
            equivalencia = "1 litro = 1000 mililitros";
        }
        else if (origen === "Mililitro" && destino === "Litro") {
            operacion = "Dividimos entre 1000";
            equivalencia = "1000 mililitros = 1 litro";
        }

    }

    explicacion.innerHTML = `

<strong>Paso 1:</strong><br>
El valor inicial es <strong>${valor} ${origen}</strong>.

<br><br>

<strong>Paso 2:</strong><br>
Sabemos que:

<br><br>

<strong>${equivalencia}</strong>

<br><br>

${operacion}.

<br><br>

<strong>Paso 3:</strong><br>

Realizamos la conversión y obtenemos:

<br><br>

<strong>${conversion.toFixed(2)} ${destino}</strong>

`;

}

//============================
// CARGAR UNIDADES AL INICIAR
//============================

cargarUnidades();