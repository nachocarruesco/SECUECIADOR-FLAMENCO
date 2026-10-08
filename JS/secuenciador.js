/*
 * ============================================================
 * secuenciador.js
 * ============================================================
 *
 * OBJETIVO
 * --------
 * Convertir las tablas estructuradas que ya hemos construido
 * en una secuencia lineal de eventos.
 *
 *
 * ENTRADAS
 * --------
 *
 * window.configuracion
 *
 * Contiene los eventos configurados para todo el ejercicio.
 *
 * Ejemplo:
 *
 * {
 *     lap: 3,
 *     posicion: 4,
 *     evento: 1,
 *     tipo: "G",
 *     intensidad: "M",
 *     origen: "base"
 * }
 *
 *
 * window.estructura
 *
 * Contiene la estructura métrica del ejercicio.
 *
 * De momento el secuenciador solo utilizará:
 *
 *     estructura.posiciones[].acento
 *
 *
 * SALIDA
 * ------
 *
 * window.secuencia
 *
 * Es una lista lineal de eventos.
 *
 * Cada evento conserva sus coordenadas musicales:
 *
 *     paso
 *     lap
 *     posicion
 *     evento
 *
 * y además contiene la información que pueda necesitar
 * posteriormente un módulo consumidor:
 *
 *     tipo
 *     intensidad
 *     origen
 *     acento
 *
 *
 * IMPORTANTE
 * ----------
 *
 * "paso" NO sustituye a lap + posicion + evento.
 *
 * paso:
 *     posición absoluta dentro de toda la secuencia.
 *
 * lap:
 *     vuelta musical.
 *
 * posicion:
 *     posición dentro del lap.
 *
 * evento:
 *     número de evento dentro de esa posición.
 *
 *
 * El secuenciador tampoco calcula tiempo, BPM ni duración.
 *
 * Eso será responsabilidad del PROGRAMADOR.
 * ============================================================
 */


/**
 * Construye la secuencia lineal del ejercicio.
 *
 * ENTRADAS
 * --------
 * estructura
 * configuracion
 *
 * SALIDA
 * ------
 * Array de eventos secuenciados.
 *
 * No modifica las tablas originales.
 */
function construirSecuencia(
    estructura,
    configuracion
) {

    /*
     * --------------------------------------------------------
     * Comprobaciones iniciales
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


    /*
     * --------------------------------------------------------
     * Crear un índice de acentos
     * --------------------------------------------------------
     *
     * La configuración utiliza posiciones 1..N.
     *
     * estructura.posiciones también utiliza posiciones 1..N.
     *
     * Creamos un Map para poder preguntar rápidamente:
     *
     *     ¿qué acento tiene la posición 4?
     *
     * --------------------------------------------------------
     */

    const acentosPorPosicion = new Map();


    estructura.posiciones.forEach(
        (posicion) => {

            acentosPorPosicion.set(
                posicion.posicion,
                posicion.acento
            );
        }
    );


    /*
     * --------------------------------------------------------
     * Crear la secuencia
     * --------------------------------------------------------
     */

    const secuencia = [];


    /*
     * "paso" es el índice absoluto de ejecución.
     *
     * Empieza en 1 porque estamos trabajando con posiciones
     * musicales humanas y no con índices internos de array.
     */
    let paso = 1;


    /*
     * --------------------------------------------------------
     * Recorrer configuración
     * --------------------------------------------------------
     *
     * La configuración ya está ordenada por:
     *
     *     lap
     *     posicion
     *     evento
     *
     * Por tanto, no necesitamos volver a ordenar ni interpretar
     * musicalmente los datos.
     *
     * El secuenciador simplemente los convierte en una
     * secuencia lineal.
     * --------------------------------------------------------
     */

    configuracion.forEach(
        (fila) => {

            /*
             * Obtener el acento correspondiente a esta
             * posición musical.
             *
             * IMPORTANTE:
             *
             * El acento pertenece a la estructura.
             * No estamos copiando un acento almacenado en
             * configuración.
             */
            const acento =
                acentosPorPosicion.get(
                    fila.posicion
                );


            /*
             * Crear el evento secuenciado.
             *
             * Conservamos las coordenadas originales y
             * añadimos "paso".
             */
            const eventoSecuenciado = {

                /*
                 * Coordenada absoluta dentro del ejercicio.
                 */
                paso: paso,

                /*
                 * Coordenadas musicales originales.
                 */
                lap: fila.lap,
                posicion: fila.posicion,
                evento: fila.evento,

                /*
                 * Información del evento procedente de
                 * configuración.
                 */
                tipo: fila.tipo,
                intensidad: fila.intensidad,
                origen: fila.origen,

                /*
                 * Información procedente de estructura.
                 */
                acento: acento
            };


            /*
             * Añadir el nuevo registro a la secuencia.
             */
            secuencia.push(
                eventoSecuenciado
            );


            /*
             * El siguiente evento tendrá el siguiente paso
             * absoluto.
             */
            paso++;
        }
    );


    /*
     * --------------------------------------------------------
     * Devolver resultado
     * --------------------------------------------------------
     */

    return secuencia;
}


/*
 * ============================================================
 * PUBLICAR LA FUNCIÓN
 * ============================================================
 *
 * Otros módulos podrán hacer:
 *
 *     window.construirSecuencia(...)
 *
 * ============================================================
 */

window.construirSecuencia =
    construirSecuencia;
