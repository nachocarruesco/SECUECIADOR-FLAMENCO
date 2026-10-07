/*
 * ============================================================
 * logs.js
 * ============================================================
 *
 * Primera versión del sistema de logs.
 *
 * Su única función en esta fase es:
 *
 *     DATOS JAVASCRIPT
 *           ↓
 *      TABLA HTML
 *
 * No construye datos musicales.
 * No modifica los datos.
 * No reproduce audio.
 * No utiliza Canvas.
 *
 * Los datos que aparecen aquí son TEMPORALES y sirven
 * únicamente para comprobar que el mecanismo de visualización
 * funciona.
 *
 * Más adelante:
 *
 *     constructor.js
 *            ↓
 *     estructura / configuracion
 *            ↓
 *          logs.js
 *
 * ============================================================
 */


/*
 * ============================================================
 * DATOS DE PRUEBA: ESTRUCTURA
 * ============================================================
 */

function mostrarEstructura() {

    if (!window.estructura) {

        console.warn(
            "Todavía no existe window.estructura"
        );

        return;

    }

    mostrarTabla(
        [
            {
                bpm: window.estructura.bpm,
                divisiones: window.estructura.divisiones,
                compases: window.estructura.compases,
                laps: window.estructura.laps
            }
        ],
        logs,
        "Estructura general"
    );


    mostrarTabla(
        window.estructura.posiciones,
        logs,
        "Posiciones de la estructura"
    );

}


/*
 * ============================================================
 * DATOS DE PRUEBA: CONFIGURACIÓN
 * ============================================================
 *
 * Aquí tenemos TODOS los eventos de dos laps.
 *
 * En el constructor definitivo habrá tantos laps como indique
 * la configuración del ejercicio.
 * ============================================================
 */

const configuracion = [

    {
        lap: 1,
        posicion: 1,
        evento: 1,
        tipo: "G",
        intensidad: "H",
        origen: "base"
    },

    {
        lap: 1,
        posicion: 2,
        evento: 2,
        tipo: "MUTE",
        intensidad: "-",
        origen: "base"
    },

    {
        lap: 1,
        posicion: 3,
        evento: 3,
        tipo: "MUTE",
        intensidad: "-",
        origen: "base"
    },

    {
        lap: 1,
        posicion: 4,
        evento: 4,
        tipo: "MUTE",
        intensidad: "-",
        origen: "base"
    },

    {
        lap: 1,
        posicion: 5,
        evento: 5,
        tipo: "G",
        intensidad: "M",
        origen: "base"
    },

    {
        lap: 1,
        posicion: 6,
        evento: 6,
        tipo: "MUTE",
        intensidad: "-",
        origen: "base"
    },

    {
        lap: 1,
        posicion: 7,
        evento: 7,
        tipo: "C",
        intensidad: "H",
        origen: "base"
    },

    {
        lap: 1,
        posicion: 8,
        evento: 8,
        tipo: "MUTE",
        intensidad: "-",
        origen: "base"
    },

    {
        lap: 2,
        posicion: 1,
        evento: 9,
        tipo: "G",
        intensidad: "H",
        origen: "base"
    },

    {
        lap: 2,
        posicion: 2,
        evento: 10,
        tipo: "MUTE",
        intensidad: "-",
        origen: "base"
    },

    {
        lap: 2,
        posicion: 3,
        evento: 11,
        tipo: "MUTE",
        intensidad: "-",
        origen: "base"
    },

    {
        lap: 2,
        posicion: 4,
        evento: 12,
        tipo: "MUTE",
        intensidad: "-",
        origen: "base"
    },

    {
        lap: 2,
        posicion: 5,
        evento: 13,
        tipo: "G",
        intensidad: "M",
        origen: "base"
    },

    {
        lap: 2,
        posicion: 6,
        evento: 14,
        tipo: "MUTE",
        intensidad: "-",
        origen: "base"
    },

    {
        lap: 2,
        posicion: 7,
        evento: 15,
        tipo: "C",
        intensidad: "H",
        origen: "base"
    },

    {
        lap: 2,
        posicion: 8,
        evento: 16,
        tipo: "MUTE",
        intensidad: "-",
        origen: "base"
    }

];


/*
 * ============================================================
 * CREAR TABLA HTML
 * ============================================================
 *
 * ENTRADA:
 *
 *     array de objetos
 *
 * SALIDA:
 *
 *     elemento <table>
 *
 * Esta función no conoce absolutamente nada sobre flamenco.
 * Es una herramienta genérica de visualización.
 * ============================================================
 */

function crearTablaHTML(datos) {

    if (!Array.isArray(datos)) {

        throw new TypeError(
            "crearTablaHTML() necesita recibir un array"
        );

    }


    if (datos.length === 0) {

        const tabla = document.createElement("table");

        const fila = document.createElement("tr");

        const celda = document.createElement("td");

        celda.textContent = "Sin datos";

        fila.appendChild(celda);

        tabla.appendChild(fila);

        return tabla;

    }


    const tabla = document.createElement("table");


    /*
     * CABECERA
     *
     * Las columnas salen de las propiedades del primer objeto.
     */

    const thead = document.createElement("thead");

    const filaCabecera = document.createElement("tr");

    const columnas = Object.keys(datos[0]);


    columnas.forEach(columna => {

        const th = document.createElement("th");

        th.textContent = columna;

        filaCabecera.appendChild(th);

    });


    thead.appendChild(filaCabecera);

    tabla.appendChild(thead);


    /*
     * CUERPO
     */

    const tbody = document.createElement("tbody");


    datos.forEach(registro => {

        const fila = document.createElement("tr");


        columnas.forEach(columna => {

            const td = document.createElement("td");

            td.textContent = registro[columna];

            fila.appendChild(td);

        });


        tbody.appendChild(fila);

    });


    tabla.appendChild(tbody);


    return tabla;

}


/*
 * ============================================================
 * MOSTRAR TABLA
 * ============================================================
 */

function mostrarTabla(
    datos,
    contenedor,
    titulo
) {

    const encabezado =
        document.createElement("h2");

    encabezado.textContent =
        titulo;


    const tabla =
        crearTablaHTML(datos);


    contenedor.appendChild(
        encabezado
    );


    contenedor.appendChild(
        tabla
    );

}


/*
 * ============================================================
 * CONTENEDOR DEL LOG
 * ============================================================
 *
 * Buscamos un elemento:
 *
 *     <div id="logs"></div>
 *
 * Si todavía no existe, lo creamos.
 * ============================================================
 */

let contenedorLogs =
    document.getElementById("logs");


if (!contenedorLogs) {

    contenedorLogs =
        document.createElement("div");

    contenedorLogs.id =
        "logs";

    document.body.appendChild(
        contenedorLogs
    );

}


/*
 * ============================================================
 * MOSTRAR ESTRUCTURA
 * ============================================================
 *
 * Primera tabla:
 *
 *     bpm
 *     divisiones
 *     compases
 *     laps
 * ============================================================
 */

mostrarTabla(

    [
        {
            bpm: estructura.bpm,
            divisiones: estructura.divisiones,
            compases: estructura.compases,
            laps: estructura.laps
        }
    ],

    contenedorLogs,

    "Estructura"

);


/*
 * ============================================================
 * MOSTRAR POSICIONES Y ACENTOS
 * ============================================================
 *
 * Esto sigue formando parte de "estructura".
 *
 * Simplemente lo mostramos en otra tabla para poder
 * inspeccionarlo mejor durante el desarrollo.
 * ============================================================
 */

mostrarTabla(

    estructura.posiciones,

    contenedorLogs,

    "Posiciones de la estructura"

);


/*
 * ============================================================
 * MOSTRAR CONFIGURACIÓN
 * ============================================================
 */

mostrarTabla(

    configuracion,

    contenedorLogs,

    "Configuración"

);
