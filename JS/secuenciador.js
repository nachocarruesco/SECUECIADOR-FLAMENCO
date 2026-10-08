/*
 * ============================================================
 * SECUENCIADOR.JS
 * ============================================================
 *
 * RESPONSABILIDAD
 * ---------------
 *
 * El secuenciador recibe los datos ya preparados por los
 * módulos anteriores y los convierte en una única secuencia
 * lineal de ejecución.
 *
 *
 * FLUJO GENERAL DEL SISTEMA
 * --------------------------
 *
 * estructura
 *     │
 *     │  aporta: ACENTOS
 *     │
 *     ├──────────────────┐
 *     │                  │
 * configuración          │
 *     │                  │
 *     │  aporta:         │
 *     │  TODOS sus       │
 *     │  eventos         │
 *     │                  │
 *     └────────┬─────────┘
 *              ↓
 *        SECUENCIADOR
 *              ↓
 *       SECUENCIA LINEAL
 *              ↓
 *       paso 1
 *       paso 2
 *       paso 3
 *       paso 4
 *       ...
 *
 *
 * CONCEPTO IMPORTANTE
 * -------------------
 *
 * "paso" NO es una posición musical.
 *
 * "paso" es el número absoluto de ejecución dentro de toda
 * la secuencia.
 *
 * Por tanto, varios eventos pueden pertenecer a la misma:
 *
 *     lap
 *     posicion
 *
 * Por ejemplo:
 *
 *     paso 27 → lap 3, posición 21, evento de configuración
 *     paso 28 → lap 3, posición 21, evento de claqueta
 *     paso 29 → lap 3, posición 21, evento de estructura
 *
 * En ese caso los tres eventos tienen la misma coordenada
 * musical, pero son tres pasos distintos de ejecución.
 *
 *
 * FUENTES
 * -------
 *
 * Actualmente:
 *
 *     estructura
 *         → solamente acento
 *
 *     configuracion
 *         → todos los eventos
 *
 * En el futuro:
 *
 *     claqueta
 *         → todos los eventos
 *
 *     usuario
 *         → todos los eventos
 *
 * El secuenciador NO decide qué hacer con esos eventos.
 *
 * Simplemente los reúne y los ordena.
 *
 * Los módulos posteriores, como sonido, dibujo o disparador,
 * decidirán qué información necesitan utilizar.
 *
 * ============================================================
 */


/*
 * ============================================================
 * FUNCIÓN: construirSecuencia
 * ============================================================
 *
 * ENTRADAS
 * --------
 *
 * estructura
 *     Objeto construido por estructura.js.
 *
 * configuracion
 *     Array construido por configuracion.js.
 *
 *
 * SALIDA
 * ------
 *
 * Array de eventos lineales.
 *
 * Cada elemento representa UN evento que será ejecutado.
 *
 * Todos los elementos tienen un "paso" absoluto.
 *
 * ============================================================
 */

function construirSecuencia(
    estructura,
    configuracion
) {


    /*
     * --------------------------------------------------------
     * 1. Comprobaciones iniciales
     * --------------------------------------------------------
     *
     * Antes de construir nada comprobamos que los datos
     * fundamentales existan.
     *
     * Esto evita errores posteriores mucho menos claros.
     * --------------------------------------------------------
     */

    if (!estructura) {

        throw new Error(
            "No existe la estructura."
        );

    }


    if (!Array.isArray(configuracion)) {

        throw new Error(
            "La configuración no es un array."
        );

    }


    if (!Array.isArray(estructura.posiciones)) {

        throw new Error(
            "La estructura no contiene posiciones."
        );

    }


    /*
     * --------------------------------------------------------
     * 2. Crear la secuencia de salida
     * --------------------------------------------------------
     *
     * Aquí iremos introduciendo todos los eventos.
     *
     * La secuencia será el resultado final que consumirán
     * posteriormente el programador, disparador, audio,
     * canvas, etc.
     * --------------------------------------------------------
     */

    const secuencia = [];


    /*
     * --------------------------------------------------------
     * 3. Contador absoluto de pasos
     * --------------------------------------------------------
     *
     * Empieza en 1.
     *
     * IMPORTANTE:
     *
     * Este contador no se reinicia al cambiar de lap.
     *
     * Ejemplo:
     *
     *     lap 1 → pasos 1-12
     *     lap 2 → pasos 13-24
     *     lap 3 → pasos 25-36
     *
     * El número exacto dependerá de cuántos eventos haya.
     * --------------------------------------------------------
     */

    let paso = 1;


    /*
     * ========================================================
     * 4. RECORRER LA CONFIGURACIÓN
     * ========================================================
     *
     * La configuración ya contiene todos los eventos del
     * ejercicio completo.
     *
     * NO reconstruimos aquí los patrones.
     *
     * NO interpretamos G, C, MUTE, etc.
     *
     * NO decidimos qué significa cada evento.
     *
     * Simplemente convertimos cada fila de configuración en
     * un elemento de la secuencia.
     * ========================================================
     */

    for (
        const registro of configuracion
    ) {


        /*
         * ----------------------------------------------------
         * Cada registro de configuración se convierte en
         * exactamente UN paso de secuencia.
         * ----------------------------------------------------
         *
         * Conservamos las coordenadas musicales:
         *
         *     lap
         *     posicion
         *     evento
         *
         * y también los datos propios del evento:
         *
         *     tipo
         *     intensidad
         *     origen
         *
         * ----------------------------------------------------
         */

        secuencia.push({

            /*
             * Número absoluto de ejecución.
             */
            paso: paso,

            /*
             * Coordenadas musicales.
             */
            lap: registro.lap,
            posicion: registro.posicion,
            evento: registro.evento,

            /*
             * Datos del evento.
             */
            tipo: registro.tipo,
            intensidad: registro.intensidad,
            origen: registro.origen,

            /*
             * Identificamos explícitamente la fuente.
             *
             * Esto será importante cuando tengamos:
             *
             *     configuración
             *     claqueta
             *     usuario
             *     estructura
             *
             * La configuración es una fuente diferente de
             * "origen", porque "origen" ya tiene significado
             * dentro de la propia configuración:
             *
             *     base
             *     cierre
             *     etc.
             */
            fuente: "configuracion"

        });


        /*
         * El siguiente evento recibe el siguiente paso.
         */

        paso++;

    }


    /*
     * ========================================================
     * 5. AÑADIR LOS ACENTOS DE LA ESTRUCTURA
     * ========================================================
     *
     * La estructura no aporta eventos de sonido como G o C.
     *
     * De momento solamente aporta su información de ACENTO.
     *
     * Ejemplo de estructura 4/4:
     *
     *     posición 1 → acento 1
     *     posición 2 → -
     *     posición 3 → acento 2
     *     posición 4 → -
     *     posición 5 → acento 3
     *     posición 6 → -
     *     posición 7 → acento 4
     *     posición 8 → -
     *
     *
     * IMPORTANTE
     * ----------
     *
     * Un acento estructural se convierte aquí en un evento
     * independiente.
     *
     * Por tanto, si en una posición ya existe un evento de
     * configuración, tendremos dos pasos distintos.
     *
     * Ejemplo:
     *
     *     posición 1:
     *
     *       paso X → G
     *       paso X+1 → ACENTO 1
     *
     * Esto es deliberado.
     *
     * Más adelante el programador decidirá cuándo se ejecuta
     * cada paso temporalmente.
     *
     * ========================================================
     */


    /*
     * Recorremos todos los laps.
     *
     * La estructura describe la plantilla métrica de un lap,
     * por lo que sus posiciones se reproducen en cada lap
     * del ejercicio.
     */

    for (
        let lap = 1;
        lap <= estructura.laps;
        lap++
    ) {


        /*
         * ----------------------------------------------------
         * Recorrer las posiciones de la estructura.
         * ----------------------------------------------------
         */

        for (
            const posicionEstructura
            of estructura.posiciones
        ) {


            /*
             * ------------------------------------------------
             * Leer el acento de la posición.
             * ------------------------------------------------
             */

            const acento =
                posicionEstructura.acento;


            /*
             * Si la posición no tiene acento, no añadimos
             * ningún evento de estructura.
             *
             * En nuestra representación:
             *
             *     "-"
             *
             * significa que no hay acento.
             * ------------------------------------------------
             */

            if (
                acento === "-" ||
                acento === null ||
                acento === undefined
            ) {

                continue;

            }


            /*
             * ------------------------------------------------
             * Añadir el evento estructural.
             * ------------------------------------------------
             *
             * Este evento no pertenece a la configuración.
             *
             * Por eso:
             *
             *     fuente = "estructura"
             *
             * El tipo identifica que se trata de un acento
             * estructural.
             * ------------------------------------------------
             */

            secuencia.push({

                /*
                 * Paso absoluto de ejecución.
                 */
                paso: paso,

                /*
                 * Coordenadas musicales.
                 */
                lap: lap,

                posicion:
                    posicionEstructura.posicion,

                /*
                 * El acento estructural no es un evento
                 * procedente de configuración.
                 *
                 * Utilizamos 1 como identificador del evento
                 * estructural dentro de esa posición.
                 */
                evento: 1,

                /*
                 * Tipo de evento.
                 */
                tipo: "ACENTO",

                /*
                 * La información que realmente aporta la
                 * estructura es el valor del acento:
                 *
                 *     1
                 *     2
                 *     3
                 *     4
                 *
                 * Por eso lo guardamos como intensidad.
                 */
                intensidad: acento,

                /*
                 * No procede de base/cierre/etc.
                 */
                origen: "estructura",

                /*
                 * Fuente real de este registro.
                 */
                fuente: "estructura"

            });


            /*
             * Siguiente paso absoluto.
             */

            paso++;

        }

    }


    /*
     * ========================================================
     * 6. ORDENAR LA SECUENCIA
     * ========================================================
     *
     * ATENCIÓN:
     *
     * En este punto hemos añadido primero todos los eventos
     * de configuración y después todos los acentos.
     *
     * Eso todavía NO representa el orden musical correcto.
     *
     * Necesitamos que los eventos queden agrupados por:
     *
     *     lap
     *     posicion
     *
     * y que dentro de una misma posición cada evento conserve
     * el orden en el que fue añadido.
     *
     *
     * Por eso reconstruimos el "paso" después de ordenar.
     * ========================================================
     */


    secuencia.sort(
        (a, b) => {

            /*
             * Primero: lap.
             */
            if (a.lap !== b.lap) {

                return a.lap - b.lap;

            }


            /*
             * Segundo: posición musical.
             */
            if (a.posicion !== b.posicion) {

                return a.posicion - b.posicion;

            }


            /*
             * Si están en la misma posición, mantenemos
             * el orden actual de inserción.
             *
             * Array.prototype.sort() es estable en los
             * navegadores modernos.
             */

            return 0;

        }
    );


    /*
     * --------------------------------------------------------
     * 7. REGENERAR EL PASO ABSOLUTO
     * --------------------------------------------------------
     *
     * Como hemos reordenado los registros, el valor "paso"
     * original ya no es válido.
     *
     * Lo reconstruimos desde 1.
     * --------------------------------------------------------
     */

    secuencia.forEach(
        (registro, indice) => {

            registro.paso = indice + 1;

        }
    );


    /*
     * ========================================================
     * 8. DEVOLVER LA SECUENCIA
     * ========================================================
     *
     * No escribimos aquí:
     *
     *     window.secuencia
     *
     * porque la función debe limitarse a construir y devolver
     * datos.
     *
     * estructura.js es quien decide dónde publicar el resultado:
     *
     *     window.secuencia = secuencia;
     *
     * Esto mantiene separadas las responsabilidades.
     * ========================================================
     */

    return secuencia;

}


/*
 * ============================================================
 * PUBLICAR LA FUNCIÓN
 * ============================================================
 *
 * estructura.js la utilizará mediante:
 *
 *     construirSecuencia(
 *         window.estructura,
 *         window.configuracion
 *     );
 *
 * ============================================================
 */

window.construirSecuencia =
    construirSecuencia;
