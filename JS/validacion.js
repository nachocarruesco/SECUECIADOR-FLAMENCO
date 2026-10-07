/*
 * ============================================================
 * validacion.js
 * ============================================================
 *
 * OBJETIVO
 * --------
 * Comprueba que las dos tablas principales del sistema:
 *
 *     window.estructura
 *     window.configuracion
 *
 * son coherentes entre sí.
 *
 * Este módulo NO construye ni modifica ningún dato.
 * Solo lee las estructuras ya construidas y devuelve un
 * resultado de validación.
 *
 *
 * FLUJO DE DATOS
 * ---------------
 *
 * estructura.js
 *      ↓
 * window.estructura
 *
 * configuracion.js
 *      ↓
 * window.configuracion
 *
 * validacion.js
 *      ↓
 * resultado de validación
 *      ↓
 * logs.js
 *
 *
 * La idea es que este archivo actúe como una especie de
 * "control de integridad" antes de pasar al secuenciador.
 * ============================================================
 */


/**
 * Valida la coherencia entre estructura y configuración.
 *
 * ENTRADAS
 * --------
 * estructura:
 *     Objeto generado por estructura.js.
 *
 * configuracion:
 *     Array generado por configuracion.js.
 *
 *
 * SALIDA
 * ------
 * Devuelve un objeto:
 *
 * {
 *     valido: true/false,
 *     errores: [],
 *     avisos: []
 * }
 *
 * No modifica ninguna de las dos entradas.
 */
function validarEstructuraConfiguracion(
    estructura,
    configuracion
) {

    const errores = [];
    const avisos = [];


    /*
     * --------------------------------------------------------
     * 1. Comprobar que existen los datos de entrada
     * --------------------------------------------------------
     */

    if (!estructura) {
        errores.push(
            "No existe la estructura."
        );
    }

    if (!Array.isArray(configuracion)) {
        errores.push(
            "La configuración no existe o no es un array."
        );
    }

    /*
     * Si ya tenemos un error estructural grave, no tiene
     * sentido continuar leyendo propiedades que pueden no
     * existir.
     */
    if (errores.length > 0) {

        return {
            valido: false,
            errores,
            avisos
        };
    }


    /*
     * --------------------------------------------------------
     * 2. Obtener las dimensiones esperadas
     * --------------------------------------------------------
     *
     * estructura.laps
     *     Número total de vueltas del ejercicio.
     *
     * estructura.divisiones
     *     Número de posiciones de cada lap.
     *
     * Ejemplo:
     *
     *     laps = 4
     *     divisiones = 8
     *
     * significa:
     *
     *     4 laps × 8 posiciones
     *
     * --------------------------------------------------------
     */

    const lapsEsperados = estructura.laps;
    const divisionesEsperadas = estructura.divisiones;


    if (
        !Number.isInteger(lapsEsperados) ||
        lapsEsperados < 1
    ) {
        errores.push(
            "estructura.laps no es un número entero válido."
        );
    }

    if (
        !Number.isInteger(divisionesEsperadas) ||
        divisionesEsperadas < 1
    ) {
        errores.push(
            "estructura.divisiones no es un número entero válido."
        );
    }


    /*
     * Si las dimensiones de la estructura no son válidas,
     * no podemos hacer las comprobaciones siguientes.
     */
    if (errores.length > 0) {

        return {
            valido: false,
            errores,
            avisos
        };
    }


    /*
     * --------------------------------------------------------
     * 3. Obtener los laps presentes en configuración
     * --------------------------------------------------------
     *
     * Un mismo lap puede tener varias filas porque puede
     * haber varios eventos en una misma posición.
     *
     * Por eso NO contamos simplemente filas.
     *
     * Ejemplo:
     *
     * lap 1 / posicion 1 / evento 1
     * lap 1 / posicion 1 / evento 2
     *
     * son dos eventos pero una sola posición musical.
     *
     * --------------------------------------------------------
     */

    const posicionesPorLap = new Map();

    configuracion.forEach((fila) => {

        const lap = fila.lap;
        const posicion = fila.posicion;

        if (!posicionesPorLap.has(lap)) {
            posicionesPorLap.set(
                lap,
                new Set()
            );
        }

        posicionesPorLap
            .get(lap)
            .add(posicion);
    });


    /*
     * --------------------------------------------------------
     * 4. Comprobar que existen todos los laps
     * --------------------------------------------------------
     *
     * Esperamos:
     *
     *     1
     *     2
     *     3
     *     4
     *
     * si estructura.laps === 4.
     * --------------------------------------------------------
     */

    for (
        let lap = 1;
        lap <= lapsEsperados;
        lap++
    ) {

        if (!posicionesPorLap.has(lap)) {

            errores.push(
                `Falta el lap ${lap} en la configuración.`
            );
        }
    }


    /*
     * --------------------------------------------------------
     * 5. Comprobar que no existen laps inesperados
     * --------------------------------------------------------
     *
     * Por ejemplo, si estructura dice 4 laps pero aparecen
     * filas correspondientes al lap 5, tenemos una
     * inconsistencia.
     * --------------------------------------------------------
     */

    for (const lap of posicionesPorLap.keys()) {

        if (
            !Number.isInteger(lap) ||
            lap < 1 ||
            lap > lapsEsperados
        ) {

            errores.push(
                `Existe un lap inesperado: ${lap}.`
            );
        }
    }


    /*
     * --------------------------------------------------------
     * 6. Comprobar las posiciones de cada lap
     * --------------------------------------------------------
     *
     * Cada lap debe contener exactamente:
     *
     *     1 ... estructura.divisiones
     *
     * En nuestro ejemplo:
     *
     *     1 2 3 4 5 6 7 8
     *
     * --------------------------------------------------------
     */

    for (
        let lap = 1;
        lap <= lapsEsperados;
        lap++
    ) {

        const posiciones =
            posicionesPorLap.get(lap);

        /*
         * Si el lap no existe ya hemos generado el error
         * correspondiente anteriormente.
         */
        if (!posiciones) {
            continue;
        }


        /*
         * Comprobar posiciones que faltan.
         */
        for (
            let posicion = 1;
            posicion <= divisionesEsperadas;
            posicion++
        ) {

            if (!posiciones.has(posicion)) {

                errores.push(
                    `Falta la posición ${posicion} ` +
                    `en el lap ${lap}.`
                );
            }
        }


        /*
         * Comprobar posiciones que sobran.
         */
        for (const posicion of posiciones) {

            if (
                !Number.isInteger(posicion) ||
                posicion < 1 ||
                posicion > divisionesEsperadas
            ) {

                errores.push(
                    `Posición inesperada ${posicion} ` +
                    `en el lap ${lap}.`
                );
            }
        }
    }


    /*
     * --------------------------------------------------------
     * 7. Comprobar la estructura básica de cada fila
     * --------------------------------------------------------
     *
     * Cada registro de configuración debe contener:
     *
     *     lap
     *     posicion
     *     evento
     *     tipo
     *     intensidad
     *     origen
     *
     * --------------------------------------------------------
     */

    configuracion.forEach((fila, indice) => {

        const camposObligatorios = [
            "lap",
            "posicion",
            "evento",
            "tipo",
            "intensidad",
            "origen"
        ];


        camposObligatorios.forEach((campo) => {

            if (!(campo in fila)) {

                errores.push(
                    `Fila ${indice}: falta el campo "${campo}".`
                );
            }
        });


        /*
         * lap, posicion y evento son índices numéricos.
         */
        if (!Number.isInteger(fila.lap)) {

            errores.push(
                `Fila ${indice}: "lap" no es entero.`
            );
        }

        if (!Number.isInteger(fila.posicion)) {

            errores.push(
                `Fila ${indice}: "posicion" no es entero.`
            );
        }

        if (!Number.isInteger(fila.evento)) {

            errores.push(
                `Fila ${indice}: "evento" no es entero.`
            );
        }
    });


    /*
     * --------------------------------------------------------
     * 8. Comprobar numeración de eventos
     * --------------------------------------------------------
     *
     * "evento" es RELATIVO a cada posición.
     *
     * Por tanto, si una posición tiene:
     *
     *     evento 1
     *     evento 2
     *     evento 3
     *
     * la numeración debe empezar en 1 y no debe tener saltos.
     *
     * Esto permite varios eventos simultáneos en una misma
     * posición sin confundirlos con posiciones distintas.
     * --------------------------------------------------------
     */

    const eventosPorPosicion = new Map();

    configuracion.forEach((fila) => {

        const clave =
            `${fila.lap}:${fila.posicion}`;

        if (!eventosPorPosicion.has(clave)) {

            eventosPorPosicion.set(
                clave,
                []
            );
        }

        eventosPorPosicion
            .get(clave)
            .push(fila.evento);
    });


    for (
        const [clave, eventos] of eventosPorPosicion
    ) {

        /*
         * Ordenamos una copia para no modificar
         * la configuración original.
         */
        const ordenados = [...eventos].sort(
            (a, b) => a - b
        );


        ordenados.forEach(
            (evento, indice) => {

                const eventoEsperado =
                    indice + 1;

                if (evento !== eventoEsperado) {

                    errores.push(
                        `Numeración incorrecta de eventos ` +
                        `en ${clave}: ` +
                        `se esperaba ${eventoEsperado} ` +
                        `y aparece ${evento}.`
                    );
                }
            }
        );
    }


    /*
     * --------------------------------------------------------
     * 9. Comprobación informativa de cantidad de filas
     * --------------------------------------------------------
     *
     * No es un error que haya más filas que:
     *
     *     laps × divisiones
     *
     * porque puede haber varios eventos en una misma posición.
     *
     * Por eso esta comprobación solo genera un aviso.
     * --------------------------------------------------------
     */

    const minimoFilasEsperadas =
        lapsEsperados * divisionesEsperadas;

    if (
        configuracion.length <
        minimoFilasEsperadas
    ) {

        avisos.push(
            `La configuración contiene ` +
            `${configuracion.length} filas y ` +
            `se esperaban como mínimo ` +
            `${minimoFilasEsperadas}.`
        );
    }


    /*
     * --------------------------------------------------------
     * 10. Resultado final
     * --------------------------------------------------------
     *
     * Si no hay errores, la estructura y la configuración
     * son coherentes y podemos pasar al siguiente módulo.
     * --------------------------------------------------------
     */

    return {

        valido:
            errores.length === 0,

        errores,

        avisos
    };
}


/*
 * ------------------------------------------------------------
 * PUBLICAR LA FUNCIÓN
 * ------------------------------------------------------------
 *
 * Igual que hacemos con estructura y configuración, la
 * publicamos en window para que otro módulo pueda ejecutarla.
 *
 * Todavía NO la ejecutamos automáticamente aquí.
 *
 * estructura.js será quien decida cuándo los datos están
 * completamente construidos y entonces podrá llamar a:
 *
 *     validarEstructuraConfiguracion(...)
 *
 * ------------------------------------------------------------
 */

window.validarEstructuraConfiguracion =
    validarEstructuraConfiguracion;
