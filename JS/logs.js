/*
 * ============================================================
 * logs.js
 * ============================================================
 *
 * OBJETIVO DE ESTE ARCHIVO
 * ------------------------
 *
 * Este módulo se encarga únicamente de MOSTRAR datos.
 *
 * NO:
 * - construye la estructura musical
 * - modifica los datos
 * - decide qué eventos existen
 * - reproduce audio
 * - dibuja el canvas
 *
 * SÍ:
 * - recibe datos JavaScript
 * - genera tablas HTML
 * - coloca esas tablas en la página
 *
 * Durante el desarrollo utilizaremos este archivo como una
 * herramienta de observación del sistema.
 *
 * Más adelante, los datos no estarán escritos aquí:
 *
 *     constructor.js
 *            ↓
 *     estructura / configuracion
 *            ↓
 *          logs.js
 *
 * Pero en esta primera versión ponemos unos datos de prueba
 * para comprobar que el mecanismo funciona.
 *
 * ============================================================
 */


/*
 * ============================================================
 * 1. DATOS DE PRUEBA
 * ============================================================
 *
 * ESTOS DATOS SON TEMPORALES.
 *
 * No son todavía los datos que producirá constructor.js.
 *
 * Los usamos solamente para comprobar que logs.js puede
 * recibir una estructura similar a la que tendremos después
 * y representarla correctamente en HTML.
 *
 * ============================================================
 */


/*
 * ------------------------------------------------------------
 * Tabla 1: ESTRUCTURA
 * ------------------------------------------------------------
 *
 * Representa la estructura temporal/métrica del ejercicio.
 *
 * El acento pertenece a la POSICIÓN, no al evento.
 * Por eso está dentro de "posiciones".
 *
 * Esta estructura corresponde a un ejemplo de:
 *
 *     100 BPM
 *     8 divisiones
 *     1 compás
 *     4 laps
 *
 * con acentos en las posiciones 1 y 5.
 * ------------------------------------------------------------
 */

const estructura = {
    bpm: 100,
    divisiones: 8,
    compases: 1,
    laps: 4,

    posiciones: [
        { posicion: 1, acento: "1" },
        { posicion: 2, acento: "-" },
        { posicion: 3, acento: "-" },
        { posicion: 4, acento: "-" },
        { posicion: 5, acento: "3" },
        { posicion: 6, acento: "-" },
        { posicion: 7, acento: "-" },
        { posicion: 8, acento: "-" }
    ]
};


/*
 * ------------------------------------------------------------
 * Tabla 2: CONFIGURACIÓN
 * ------------------------------------------------------------
 *
 * Contiene TODOS los eventos que forman el ejercicio completo.
 *
 * Para esta primera prueba usamos solamente dos laps.
 *
 * Importante:
 *
 *     lap
 *     posición
 *     evento
 *
 * son datos diferentes.
 *
 * "posición" indica dónde estamos musicalmente.
 *
 * "evento" identifica de forma única ese registro.
 *
 * Puede haber varios eventos asociados a una misma posición
 * en versiones posteriores.
 * ------------------------------------------------------------
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
 * 2. FUNCIÓN PARA CREAR UNA TABLA HTML
 * ============================================================
 *
 * Esta función es GENERICA.
 *
 * No sabe qué es una rumba, un compás, un golpe o una claqueta.
 *
 * Simplemente recibe:
 *
 *     datos
 *
 * y genera una tabla a partir de las propiedades de los objetos.
 *
 * Por tanto, esta misma función nos servirá más adelante para
 * mostrar otras estructuras de datos.
 *
 * ENTRADA:
 *
 *     [
 *         { campo1: valor, campo2: valor },
 *         { campo1: valor, campo2: valor }
 *     ]
 *
 * SALIDA:
 *
 *     <table>...</table>
 *
 * ============================================================
 */

function crearTablaHTML(datos) {

    /*
     * Comprobamos que realmente hemos recibido un array.
     *
     * Si no lo es, detenemos la función con un error claro.
     */

    if (!Array.isArray(datos)) {
        throw new TypeError(
            "crearTablaHTML() necesita recibir un array"
        );
    }


    /*
     * Si el array está vacío no podemos obtener los nombres
     * de las columnas a partir del primer registro.
     */

    if (datos.length === 0) {
        const tablaVacia = document.createElement("table");

        const fila = document.createElement("tr");
        const celda = document.createElement("td");

        celda.textContent = "Sin datos";

        fila.appendChild(celda);
        tablaVacia.appendChild(fila);

        return tablaVacia;
    }


    /*
     * --------------------------------------------------------
     * Creamos la tabla.
     * --------------------------------------------------------
     */

    const tabla = document.createElement("table");


    /*
     * --------------------------------------------------------
     * CABECERA
     * --------------------------------------------------------
     *
     * Utilizamos las propiedades del primer objeto para
     * determinar qué columnas existen.
     *
     * Por ejemplo:
     *
     * {
     *     lap: 1,
     *     posicion: 1,
     *     evento: 1,
     *     tipo: "G"
     * }
     *
     * genera:
     *
     * | lap | posicion | evento | tipo |
     *
     * --------------------------------------------------------
     */

    const cabecera = document.createElement("thead");
    const filaCabecera = document.createElement("tr");

    const columnas = Object.keys(datos[0]);

    columnas.forEach(columna => {

        const th = document.createElement("th");

        th.textContent = columna;

        filaCabecera.appendChild(th);
    });

    cabecera.appendChild(filaCabecera);
    tabla.appendChild(cabecera);


    /*
     * --------------------------------------------------------
     * CUERPO
     * --------------------------------------------------------
     *
     * Recorremos todos los registros.
     *
     * Cada objeto del array se convierte en una fila HTML.
     * --------------------------------------------------------
     */

    const cuerpo = document.createElement("tbody");

    datos.forEach(registro => {

        const fila = document.createElement("tr");

        columnas.forEach(columna => {

            const td = document.createElement("td");

            /*
             * Convertimos el valor a texto para mostrarlo.
             *
             * Si en el futuro tenemos objetos o arrays dentro
             * de una celda, aquí podremos decidir cómo
             * representarlos.
             */

            td.textContent = registro[columna];

            fila.appendChild(td);
        });

        cuerpo.appendChild(fila);
    });

    tabla.appendChild(cuerpo);


    /*
     * --------------------------------------------------------
     * Devolvemos la tabla terminada.
     *
     * logs.js NO decide dónde colocarla.
     *
     * La función devuelve el elemento HTML para que otra
     * función pueda colocarlo donde corresponda.
     * --------------------------------------------------------
     */

    return tabla;
}


/*
 * ============================================================
 * 3. FUNCIÓN PARA MOSTRAR UNA TABLA
 * ============================================================
 *
 * Recibe:
 *
 *     datos
 *     contenedor
 *     titulo
 *
 * y coloca dentro del contenedor:
 *
 *     <h2>titulo</h2>
 *     <table>...</table>
 *
 * ============================================================
 */

function mostrarTabla(datos, contenedor, titulo) {

    /*
     * Creamos el título.
     */

    const encabezado = document.createElement("h2");

    encabezado.textContent = titulo;


    /*
     * Generamos la tabla utilizando la función anterior.
     */

    const tabla = crearTablaHTML(datos);


    /*
     * Añadimos ambos elementos al contenedor.
     */

    contenedor.appendChild(encabezado);
    contenedor.appendChild(tabla);
}


/*
 * ============================================================
 * 4. CREAR EL CONTENEDOR DEL LOG
 * ============================================================
 *
 * Buscamos en el HTML un elemento con:
 *
 *     id="logs"
 *
 * Si no existe, lo creamos automáticamente.
 *
 * De esta manera no necesitamos todavía diseñar una interfaz
 * específica para el log.
 * ============================================================
 */

let contenedorLogs = document.getElementById("logs");


if (!contenedorLogs) {

    contenedorLogs = document.createElement("div");

    contenedorLogs.id = "logs";

    document.body.appendChild(contenedorLogs);
}


/*
 * ============================================================
 * 5. MOSTRAR LAS DOS TABLAS
 * ============================================================
 *
 * ESTA ES LA PARTE QUE MÁS NOS INTERESA EN ESTA PRIMERA FASE.
 *
 * Cuando constructor.js empiece a existir, los datos que
 * actualmente están en:
 *
 *     estructura
 *     configuracion
 *
 * dejarán de estar escritos aquí y procederán del constructor.
 *
 * El funcionamiento de logs.js no tendrá que cambiar.
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
 * Para las posiciones de la estructura mostramos una segunda
 * parte dentro del mismo bloque de Estructura.
 *
 * Así podemos ver también la relación:
 *
 * posición → acento
 */

mostrarTabla(
    estructura.posiciones,
    contenedorLogs,
    "Posiciones de la estructura"
);


/*
 * Finalmente mostramos la configuración completa.
 */

mostrarTabla(
    configuracion,
    contenedorLogs,
    "Configuración"
);
```
