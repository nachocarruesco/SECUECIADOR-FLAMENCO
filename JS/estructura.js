/*
==================================================
ESTRUCTURA.JS

Construye la tabla "estructura" a partir de
config/compas.json.

RESPONSABILIDAD DE ESTE ARCHIVO
-------------------------------

Este archivo NO construye la configuración de
eventos.

Su única responsabilidad en esta fase es:

    compas.json
        ↓
    estructura

La estructura contiene la información métrica
general que necesitarán posteriormente el
secuenciador y el programador.

Los eventos concretos pertenecen a "configuracion"
y se construirán en otro paso.

--------------------------------------------------

DATOS DE ENTRADA
--------------------------------------------------

Se lee:

    config/compas.json

Por ahora utilizamos explícitamente:

    4_4

El siguiente paso podrá hacer que el constructor
reciba dinámicamente el compás seleccionado.

--------------------------------------------------

DATOS DE SALIDA
--------------------------------------------------

Se genera:

    window.estructura

con esta forma:

    {
        bpm,
        divisiones,
        compases,
        laps,
        posiciones: [
            {
                posicion,
                acento
            }
        ]
    }

--------------------------------------------------
*/


/*
==================================================
CONSTRUIR ESTRUCTURA
==================================================
*/

async function construirEstructura() {

    /*
    ------------------------------------------------
    1. LEER EL ARCHIVO JSON
    ------------------------------------------------

    fetch() obtiene el archivo desde el servidor.

    response.json() convierte el texto JSON en
    un objeto JavaScript que podemos consultar.

    ------------------------------------------------
    */

    const respuesta = await fetch(
        "config/compas.json"
    );


    /*
    ------------------------------------------------
    Comprobamos que el servidor ha respondido
    correctamente.
    ------------------------------------------------
    */

    if (!respuesta.ok) {

        throw new Error(
            "No se pudo cargar config/compas.json"
        );

    }


    /*
    ------------------------------------------------
    2. CONVERTIR JSON → OBJETO JAVASCRIPT
    ------------------------------------------------
    */

    const compases = await respuesta.json();


    /*
    ------------------------------------------------
    3. SELECCIONAR EL COMPÁS
    ------------------------------------------------

    De momento trabajamos con 4/4.

    Más adelante este valor NO estará escrito aquí,
    sino que vendrá de la selección del usuario /
    familia / ejercicio.

    ------------------------------------------------
    */

    const compas = compases["4_4"];


    /*
    ------------------------------------------------
    Comprobación de seguridad.
    ------------------------------------------------
    */

    if (!compas) {

        throw new Error(
            "El compás 4_4 no existe en compas.json"
        );

    }


    /*
    ------------------------------------------------
    4. CREAR LAS POSICIONES
    ------------------------------------------------

    compas.json utiliza índices empezando en 0:

        0 1 2 3 4 5 6 7

    Nuestra estructura utiliza posiciones
    musicales empezando en 1:

        1 2 3 4 5 6 7 8

    Por eso sumamos 1.

    El acento se obtiene de las etiquetas
    métricas del compás.

    Por ejemplo:

        step 0 → etiqueta "1"
        step 4 → etiqueta "3"

    Las demás posiciones quedan sin etiqueta.

    IMPORTANTE:

    Aquí NO estamos hablando todavía de intensidad
    sonora.

    "acento" describe la posición métrica.

    ------------------------------------------------
    */

    const posiciones = [];


    for (
        let step = 0;
        step < compas.subdivisiones;
        step++
    ) {

        /*
        Buscamos si existe una etiqueta para
        esta subdivisión.
        */

        const etiqueta =
            compas.etiquetas_default.find(
                item =>
                    item.step === step
            );


        /*
        Si existe etiqueta:

            "1"
            "2"
            "3"
            "4"

        usamos ese valor.

        Si no existe:

            "-"

        ------------------------------------------------
        */

        const acento =
            etiqueta
                ? etiqueta.texto
                : "-";


        /*
        Creamos la fila de estructura.
        */

        posiciones.push({

            posicion: step + 1,

            acento: acento

        });

    }


    /*
    ------------------------------------------------
    5. CONSTRUIR LA ESTRUCTURA COMPLETA
    ------------------------------------------------

    "laps" todavía no procede del ejercicio.

    Lo ponemos provisionalmente en 1 porque en esta
    fase estamos construyendo únicamente la estructura
    métrica.

    Cuando construyamos el ejercicio completo,
    "laps" será determinado por la configuración
    completa del ejercicio.

    ------------------------------------------------
    */

    const estructura = {

        bpm: 100,

        divisiones:
            compas.subdivisiones,

        compases:
            1,

        laps:
            1,

        posiciones:
            posiciones

    };


    /*
    ------------------------------------------------
    6. PUBLICAR EL RESULTADO
    ------------------------------------------------

    window.estructura hace que el resultado quede
    disponible para los demás módulos.

    Por tanto:

        estructura.js
             ↓
        window.estructura
             ↓
        logs.js

    Más adelante:

        window.estructura
             ↓
        secuenciador
             ↓
        programador
             ↓
        disparador

    ------------------------------------------------
    */

    window.estructura =
        estructura;


    /*
    ------------------------------------------------
    7. DEVOLVER TAMBIÉN EL RESULTADO
    ------------------------------------------------

    Esto permite que otro código pueda hacer:

        const estructura =
            await construirEstructura();

    aunque el programa también la haya publicado
    en window.estructura.

    ------------------------------------------------
    */

    return estructura;

}


/*
==================================================
INICIAR CONSTRUCCIÓN
==================================================
*/

construirEstructura()

    .then(() => {

        console.log(
            "Estructura construida correctamente"
        );

        /*
         * estructura ya existe en este momento.
         *
         * Por eso ahora es seguro pedir a logs.js
         * que la muestre.
         */

        mostrarDatos();

    })

    .catch(error => {

        console.error(
            "Error construyendo estructura:",
            error
        );

    });
