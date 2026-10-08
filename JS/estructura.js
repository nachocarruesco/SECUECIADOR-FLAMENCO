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
==================================================
INICIAR CONSTRUCCIÓN DE LOS DATOS
==================================================

El orden es IMPORTANTE.

Tenemos una cadena de construcción:

    1. estructura
           ↓
    2. configuración
           ↓
    3. validación
           ↓
    4. secuencia

Cada fase espera a que la anterior haya terminado.

Esto es especialmente importante porque estructura.js
utiliza fetch(), que es asíncrono.
==================================================
*/


construirEstructura()

    /*
    ------------------------------------------------
    FASE 1
    ------------------------------------------------

    construirEstructura() termina cuando:

        window.estructura

    ya existe y está completamente construida.
    ------------------------------------------------
    */

    .then(() => {

        console.log(
            "Estructura construida correctamente"
        );


        /*
        ------------------------------------------------
        FASE 2
        ------------------------------------------------

        Ahora que estructura ya existe, podemos
        construir la configuración completa.

        configuracion.js utilizará:

            window.estructura
        ------------------------------------------------
        */

        return construirConfiguracion();

    })


    /*
    ------------------------------------------------
    FASE 3
    ------------------------------------------------

    construirConfiguracion() ya ha terminado.

    Ahora existen:

        window.estructura
        window.configuracion

    y podemos validar ambas.
    ------------------------------------------------
    */

    .then(() => {

        console.log(
            "Configuración construida correctamente"
        );


        const resultadoValidacion =
            validarEstructuraConfiguracion(
                window.estructura,
                window.configuracion
            );


        console.log(
            "Resultado de validación:",
            resultadoValidacion
        );


        /*
        ------------------------------------------------
        Si la validación falla, detenemos el proceso.
        ------------------------------------------------
        */

        if (!resultadoValidacion.valido) {

            throw new Error(
                "La validación de estructura y " +
                "configuración ha fallado."
            );
        }


        /*
        ------------------------------------------------
        FASE 4
        ------------------------------------------------

        Solo construimos la secuencia cuando las
        tablas anteriores han demostrado ser coherentes.
        ------------------------------------------------
        */

        const secuencia =
            construirSecuencia(
                window.estructura,
                window.configuracion
            );


        /*
        Publicamos la secuencia para los módulos
        posteriores.
        */

        window.secuencia =
            secuencia;


        console.log(
            "Secuencia construida correctamente"
        );


        console.log(
            "Secuencia:",
            window.secuencia
        );


        /*
        ------------------------------------------------
        Finalmente mostramos los datos en pantalla.
        ------------------------------------------------
        */

        mostrarDatos();

    })


    /*
    ------------------------------------------------
    CAPTURA DE ERRORES
    ------------------------------------------------

    Cualquier error producido en cualquiera de las
    cuatro fases termina aquí.
    ------------------------------------------------
    */

    .catch(error => {

        console.error(
            "Error construyendo los datos:",
            error
        );

    });

