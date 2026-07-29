function mostrarTema(tipo){

    let titulo=document.getElementById("tituloTema");
    let descripcion=document.getElementById("descripcionTema");

    if(tipo==="tiempo"){

        titulo.innerHTML="⏱ Tiempo";

        descripcion.innerHTML="El tiempo mide la duración de los acontecimientos. Sus unidades más utilizadas son segundos, minutos, horas y días.";

    }

    if(tipo==="longitud"){

        titulo.innerHTML="📏 Longitud";

        descripcion.innerHTML="La longitud permite medir distancias. Las unidades más utilizadas son milímetros, centímetros, metros y kilómetros.";

    }

    if(tipo==="masa"){

        titulo.innerHTML="⚖ Masa";

        descripcion.innerHTML="La masa representa la cantidad de materia que posee un cuerpo. Se mide en miligramos, gramos y kilogramos.";

    }

    if(tipo==="volumen"){

        titulo.innerHTML="🧪 Volumen";

        descripcion.innerHTML="El volumen mide el espacio que ocupa un objeto o un líquido. Se expresa principalmente en mililitros y litros.";

    }

}