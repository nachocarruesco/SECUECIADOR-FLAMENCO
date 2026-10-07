/*
 * ============================================================
 * CONFIGURACION.JS
 * ============================================================
 *
 * RESPONSABILIDAD DE ESTE ARCHIVO
 * -------------------------------
 *
 * Leer un preset de ejercicio y convertirlo en nuestra tabla
 * interna "configuracion".
 *
 * En esta primera fase trabajamos solamente con:
 *
 *     rumba_abierta
 *     lap 1
 *
 * IMPORTANTE:
 * ------------
 * "configuracion" representa TODOS los pasos del ejercicio,
 * incluidos los silencios.
 *
 * La estructura métrica (bpm, divisiones, acentos, etc.)
 * pertenece a "estructura" y NO se copia aquí.
 *
 *
 * FLUJO DE DATOS
 * --------------
 *
 *     rumba_abierta.json
 *             ↓
 *       configuracion.js
 *             ↓
 *       window.configuracion
 *             ↓
 *          logs.js
 *             ↓
 *        tabla HTML
 *
 * El resto de módulos utilizará posteriormente esta misma
 * tabla como entrada para el secuenciador.
 * ============================================================
 */


/*
 * ------------------------------------------------------------
 * 1. FUNCIÓN PRINCIPAL
 * ------------------------------------------------------------
 *
 * Lee el preset y construye un lap completo.
 *
 * Devuelve:
 *
 *     Promise<Array>
 *
 * El array resultante es la tabla "configuracion".
 * ------------------------------------------------------------
 */

async function construirConfiguracion() {

    /*
     * --------------------------------------------------------
     * 1.1. Cargar el preset
     * --------------------------------------------------------
     *
     * El JSON es solamente la fuente de datos.
     * Una vez leído, trabajaremos con objetos JS en memoria.
     * --------------------------------------------------------
     */

    const respuesta = await fetch(
        "presets/rumba/rumba_abierta.json"
    );

    if (!respuesta.ok) {
        throw new Error(
            "No se pudo cargar presets/rumba/rumba_abierta.json"
        );
    }

    const preset = await respuesta.json();


    /*
     * --------------------------------------------------------
     * 1.2. Comprobar que existe la estructura
     * --------------------------------------------------------
     *
     * Necesitamos conocer cuántas posiciones tiene un lap.
     *
     * En este proyecto "estructura" ya ha sido construida por
     * estructura.js.
     * --------------------------------------------------------
     */

    if (!window.estructura) {
        throw new Error(
            "No existe window.estructura"
        );
    }


    const numeroPosiciones =
        window.estructura.divisiones;


    /*
     * --------------------------------------------------------
     * 1.3. Crear la tabla vacía
     * --------------------------------------------------------
     *
     * Aquí construiremos las filas que posteriormente
     * utilizarán el secuenciador.
     * --------------------------------------------------------
     */

    const configuracion = [];


    /*
     * --------------------------------------------------------
     * 1.4. Recorrer todas las posiciones del lap
     * --------------------------------------------------------
     *
     * IMPORTANTE:
     *
     * El preset solamente contiene los golpes.
     *
     * Nuestra tabla interna, en cambio, debe contener también
     * los silencios.
     *
     * Por eso recorremos TODAS las posiciones de la estructura
     * y buscamos si existe un evento en cada una.
     * --------------------------------------------------------
     */

    for (
        let posicion = 1;
        posicion <= numeroPosiciones;
        posicion++
    ) {

        /*
         * El JSON del preset utiliza posiciones empezando
         * desde 0.
         *
         * Nuestra tabla interna utiliza posiciones empezando
         * desde 1.
         *
         * Por tanto:
         *
         *     posicion 1 → índice 0
         *     posicion 2 → índice 1
         *     etc.
         */

        const indicePreset = posicion - 1;


        /*
         * ----------------------------------------------------
         * Buscar eventos en esta posición
         * ----------------------------------------------------
         *
         * "marks" contiene solamente las posiciones donde
         * realmente ocurre algo.
         *
         * Por ejemplo, el preset de rumba abierta contiene:
         *
         *     0 → G
         *     3 → G
         *     6 → C
         *
         * Por eso no todas las posiciones existen en "marks".
         * ----------------------------------------------------
         */

        const eventos =
            preset.marks?.[indicePreset] ?? [];


        /*
         * ----------------------------------------------------
         * Si NO hay eventos:
         * crear una fila MUTE.
         * ----------------------------------------------------
         */

        if (eventos.length === 0) {

            configuracion.push({

                lap: 1,

                posicion: posicion,

                evento: 1,

                tipo: "MUTE",

                intensidad: "-",

                origen: "-"
            });

            continue;
        }


        /*
         * ----------------------------------------------------
         * Si hay eventos:
         *
         * Puede haber uno o varios eventos en la misma
         * posición.
         *
         * Por eso NO suponemos que siempre haya uno.
         *
         * Cada evento genera una fila independiente.
         * ----------------------------------------------------
         */

        eventos.forEach((evento, indiceEvento) => {

            configuracion.push({

                lap: 1,

                posicion: posicion,

                /*
                 * El número de evento comienza en 1.
                 */
                evento: indiceEvento + 1,

                /*
                 * El tipo viene directamente del preset.
                 *
                 * Ejemplo:
                 *     G
                 *     C
                 */
                tipo: evento.type,

                /*
                 * La intensidad también procede directamente
                 * del preset.
                 *
                 * Ejemplo:
                 *     H
                 *     M
                 */
                intensidad: evento.accent,

                /*
                 * En esta primera fase todos los eventos
                 * proceden del patrón base.
                 */
                origen: "base"
            });
        });
    }


    /*
     * --------------------------------------------------------
     * 1.5. Publicar el resultado
     * --------------------------------------------------------
     *
     * Igual que hicimos con "estructura", publicamos la tabla
     * en window para que otros módulos puedan utilizarla.
     *
     * En el futuro:
     *
     *     secuenciador.js
     *     programador.js
     *     logs.js
     *
     * podrán acceder a ella sin volver a leer el JSON.
     * --------------------------------------------------------
     */

    window.configuracion = configuracion;


    /*
     * Devolvemos también el array porque resulta útil para
     * encadenar posteriormente las distintas fases de
     * construcción.
     */

    return configuracion;
}


/*
 * ============================================================
 * 2. CONSTRUIR LA CONFIGURACIÓN
 * ============================================================
 *
 * Esta llamada se ejecuta cuando el archivo se carga.
 *
 * La configuración depende de "estructura", por lo que
 * estructura.js debe haber terminado antes.
 *
 * Por eso esta función se invocará desde estructura.js,
 * después de construir estructura.
 * ============================================================
 */

window.construirConfiguracion = construirConfiguracion;
