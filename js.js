//============================
// INFORMACIÓN DE LOS TEMAS
//============================

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


//============================
// CONVERSOR
//============================

const unidades={

    longitud:["Milímetro","Centímetro","Metro","Kilómetro"],

    masa:["Miligramo","Gramo","Kilogramo"],

    tiempo:["Segundo","Minuto","Hora","Día"],

    volumen:["Mililitro","Litro"]

};


function cargarUnidades(){

    let magnitud=document.getElementById("magnitud").value;

    let origen=document.getElementById("origen");

    let destino=document.getElementById("destino");

    origen.innerHTML="";
    destino.innerHTML="";

    unidades[magnitud].forEach(function(unidad){

        origen.innerHTML+=`<option>${unidad}</option>`;

        destino.innerHTML+=`<option>${unidad}</option>`;

    });

}


//============================
// CONVERSIONES
//============================

function convertir(){

    let valor=parseFloat(document.getElementById("valor").value);

    let magnitud=document.getElementById("magnitud").value;

    let origen=document.getElementById("origen").value;

    let destino=document.getElementById("destino").value;

    let resultado=document.getElementById("resultado");

    if(isNaN(valor)){

        resultado.innerHTML="Ingrese un valor.";

        return;

    }

    if(origen===destino){

        resultado.innerHTML=valor+" "+destino;

        return;

    }

    resultado.innerHTML="Conversión disponible en el siguiente commit.";

}


//CARGA LAS UNIDADES AL INICIAR

cargarUnidades();