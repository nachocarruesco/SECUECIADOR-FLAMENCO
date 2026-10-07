/*
 * ============================================================
 * CONFIGURACION.JS
 * ============================================================
 *
 * RESPONSABILIDAD
 * ---------------
 *
 * Construir la tabla interna "configuracion" del ejercicio
 * completo.
 *
 * En esta fase la secuencia del ejercicio viene determinada
 * por:
 *
 *     ejercicio_rumba_1.json
 *
 * que contiene:
 *
 *     3 vueltas de rumba_abierta
 *     1 vuelta de cierre_rumba
 *
 *
 * IMPORTANTE
 * ----------
 *
 * "estructura" describe cómo es UNA vuelta:
 *
 *     - número de posiciones
 *     - acentos métricos
 *     - divisiones
 *     - etc.
 *
 * "configuracion" describe QUÉ OCURRE en TODAS las vueltas
 * del ejercicio.
 *
 *
 * Por tanto:
 *
 *     estructura → descripción métrica común
 *     configuracion → eventos concretos del ejercicio
 *
 *
 * FLUJO
 * -----
 *
 * ejercicio_rumba_1.json
 *          ↓
 *       sequence
 *          ↓
 *   cargar cada preset
 *          ↓
 * construir todas las vueltas
 *          ↓
 * window.configuracion
 *
 *
 * FORMATO DE CADA FILA
 * --------------------
 *
 *     lap
 *     posicion
 *     evento
 *     tipo
 *     intensidad
 *     origen
 *
 * Ejemplo:
 *
 *     1 | 1 | 1 | G | H | base
 *
 * El campo "acento" NO aparece aquí.
 *
 * El acento pertenece a estructura porque describe
 * la métrica de la posición, no el evento.
 * ============================================================
 */


/*
 * ------------------------------------------------------------
 * 1. CONSTRUIR CONFIGURACIÓN
 * ------------------------------------------------------------
 */

async function construirConfiguracion() {

    /*
     * --------------------------------------------------------
     * 1.1. Cargar la definición del ejercicio
     * --------------------------------------------------------
     *
     * Este JSON NO contiene directamente los golpes.
     *
     * Contiene la secuencia que debemos ejecutar.
     *
     * Ejemplo:
     *
     *     rumba_abierta × 3
     *     cierre_rumba  × 1
     * --------------------------------------------------------
     */

    const respuestaEjercicio = await fetch(
        "config/defaults/ejercicio_rumba_1.json"
    );

    if (!respuestaEjercicio.ok) {
        throw new Error(
            "No se pudo cargar config/defaults/ejercicio_rumba_1.json"
        );
    }

    const ejercicio =
        await respuestaEjercicio.json();


    /*
     * --------------------------------------------------------
     * 1.2. Comprobar que existe la estructura
     * --------------------------------------------------------
     *
     * Necesitamos saber cuántas posiciones tiene cada vuelta.
     *
     * En nuestro caso:
     *
     *     divisiones = 8
     *
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
     * 1.3. Tabla final
     * --------------------------------------------------------
     *
     * Aquí acumularemos TODAS las filas de TODAS las vueltas.
     *
     * Esta será posteriormente la fuente de datos del
     * secuenciador.
     * --------------------------------------------------------
     */

    const configuracion = [];


    /*
     * --------------------------------------------------------
     * 1.4. Contador de vueltas
     * --------------------------------------------------------
     *
     * "lapActual" representa el número real de vuelta dentro
     * del ejercicio completo.
     *
     * Empieza en 1.
     * --------------------------------------------------------
     */

    let lapActual = 1;


    /*
     * --------------------------------------------------------
     * 1.5. Recorrer la secuencia del ejercicio
     * --------------------------------------------------------
     *
     * Por ejemplo:
     *
     * sequence[0]:
     *     rumba_abierta × 3
     *
     * sequence[1]:
     *     cierre_rumba × 1
     *
     * --------------------------------------------------------
     */

    for (const bloque of ejercicio.sequence) {

        /*
         * Nombre del preset que debemos cargar.
         */
        const nombreEjercicio =
            bloque.exercise;


        /*
         * Número de vueltas que debe ocupar este preset.
         */
        const numeroLaps =
            bloque.laps;


        /*
         * ----------------------------------------------------
         * 1.5.1. Cargar el preset correspondiente
         * ----------------------------------------------------
         *
         * Todos los presets de rumba están en:
         *
         *     presets/rumba/
         *
         * y el nombre del ejercicio coincide con el nombre
         * del archivo.
         *
         * Ejemplo:
         *
         *     rumba_abierta
         *          ↓
         *     rumba_abierta.json
         * ----------------------------------------------------
         */

        const respuestaPreset = await fetch(
            `presets/rumba/${nombreEjercicio}.json`
        );


        if (!respuestaPreset.ok) {
            throw new Error(
                `No se pudo cargar el preset: ${nombreEjercicio}`
            );
        }


        const preset =
            await respuestaPreset.json();


        /*
         * ----------------------------------------------------
         * 1.5.2. Construir las vueltas de este bloque
         * ----------------------------------------------------
         *
         * Si:
         *
         *     numeroLaps = 3
         *
         * construiremos:
         *
         *     lap 1
         *     lap 2
         *     lap 3
         *
         * usando el mismo preset.
         * ----------------------------------------------------
         */

        for (
            let repeticion = 0;
            repeticion < numeroLaps;
            repeticion++
        ) {


            /*
             * ------------------------------------------------
             * Recorrer TODAS las posiciones de la vuelta.
             * ------------------------------------------------
             *
             * Esto es importante:
             *
             * El preset solo contiene las posiciones donde
             * ocurre un evento.
             *
             * Nuestra tabla contiene también los silencios.
             * ------------------------------------------------
             */

            for (
                let posicion = 1;
                posicion <= numeroPosiciones;
                posicion++
            ) {


                /*
                 * --------------------------------------------
                 * El preset utiliza posiciones empezando en 0.
                 *
                 * Nuestra tabla utiliza posiciones empezando
                 * en 1.
                 *
                 * Por eso:
                 *
                 *     posición 1 → índice 0
                 *     posición 2 → índice 1
                 *     ...
                 * --------------------------------------------
                 */

                const indicePreset =
                    posicion - 1;


                /*
                 * --------------------------------------------
                 * Buscar los eventos de esta posición.
                 *
                 * Si no existe la posición en "marks",
                 * obtenemos un array vacío.
                 * --------------------------------------------
                 */

                const eventos =
                    preset.marks?.[indicePreset] ?? [];


                /*
                 * --------------------------------------------
                 * Si no hay eventos:
                 *
                 * creamos explícitamente una fila MUTE.
                 *
                 * Así configuracion contiene TODOS los pasos.
                 * --------------------------------------------
                 */

                if (eventos.length === 0) {

                    configuracion.push({

                        /*
                         * Número de vuelta dentro del ejercicio.
                         */
                        lap: lapActual,

                        /*
                         * Posición dentro de esa vuelta.
                         */
                        posicion: posicion,

                        /*
                         * El silencio ocupa un único evento.
                         */
                        evento: 1,

                        /*
                         * No hay sonido.
                         */
                        tipo: "MUTE",

                        /*
                         * No hay intensidad.
                         */
                        intensidad: "-",

                        /*
                         * El silencio no procede de un patrón
                         * concreto.
                         */
                        origen: "-"
                    });


                    continue;
                }


                /*
                 * --------------------------------------------
                 * Si hay uno o varios eventos:
                 *
                 * cada evento genera una fila.
                 *
                 * El contador "evento" comienza nuevamente
                 * en 1 para cada posición.
                 * --------------------------------------------
                 */

                eventos.forEach(
                    (evento, indiceEvento) => {

                        configuracion.push({

                            /*
                             * Vuelta actual.
                             */
                            lap: lapActual,

                            /*
                             * Posición dentro de la vuelta.
                             */
                            posicion: posicion,

                            /*
                             * Número del evento dentro de
                             * esta posición.
                             *
                             * No es un contador global.
                             */
                            evento: indiceEvento + 1,

                            /*
                             * Tipo de sonido del preset.
                             */
                            tipo: evento.type,

                            /*
                             * Marca de intensidad del audio.
                             */
                            intensidad: evento.accent,

                            /*
                             * Procedencia del evento.
                             *
                             * En este caso procede del preset
                             * base que forma esta vuelta.
                             *
                             * Más adelante podremos tener,
                             * por ejemplo:
                             *
                             *     base
                             *     cierre
                             *     usuario
                             *     claqueta
                             */
                            origen:
                                nombreEjercicio === "cierre_rumba"
                                    ? "cierre"
                                    : "base"
                        });
                    }
                );
            }


            /*
             * ------------------------------------------------
             * Hemos terminado una vuelta completa.
             *
             * Pasamos a la siguiente.
             * ------------------------------------------------
             */

            lapActual++;
        }
    }


    /*
     * --------------------------------------------------------
     * 1.6. Publicar la configuración
     * --------------------------------------------------------
     *
     * A partir de aquí otros módulos no necesitan volver a
     * leer los JSON.
     *
     * Trabajarán directamente con:
     *
     *     window.configuracion
     * --------------------------------------------------------
     */

    window.configuracion =
        configuracion;


    /*
     * Devolvemos también la tabla para poder encadenar
     * posteriormente esta fase con otras.
     */

    return configuracion;
}


/*
 * ============================================================
 * 2. PUBLICAR LA FUNCIÓN
 * ============================================================
 *
 * estructura.js necesita poder llamar a esta función después
 * de haber construido window.estructura.
 * ============================================================
 */

window.construirConfiguracion =
    construirConfiguracion;
