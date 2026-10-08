/*
 * ============================================================
 * ESTRUCTURA.JS
 * ============================================================
 *
 * RESPONSABILIDAD DE ESTE MÓDULO
 * ------------------------------
 *
 * Construir la estructura métrica del ejercicio a partir de
 * config/compas.json.
 *
 * La estructura contiene, de momento:
 *
 *   - bpm
 *   - divisiones
 *   - compases
 *   - laps
 *   - posiciones
 *
 * Cada posición contiene:
 *
 *   - posicion
 *   - acento
 *
 * El ACENTO pertenece a la estructura métrica.
 * No se copia dentro de cada evento de configuración.
 *
 *
 * FLUJO DE DATOS
 * --------------
 *
 * config/compas.json
 *        ↓
 * construirEstructura()
 *        ↓
 * window.estructura
 *        ↓
 * construirConfiguracion()
 *        ↓
 * window.configuracion
 *        ↓
 * validarEstructuraConfiguracion()
 *        ↓
 * construirSecuencia()
 *        ↓
 * window.secuencia
 *        ↓
 * mostrarDatos()
 *
 * IMPORTANTE
 * ----------
 *
 * Las funciones construirConfiguracion(),
 * validarEstructuraConfiguracion() y construirSecuencia()
 * están definidas en otros archivos JS.
 *
 * Este archivo solamente coordina su ejecución.
 *
 * ============================================================
 */


/*
 * ============================================================
 * FUNCIÓN: construirEstructura
 * ============================================================
 *
 * Lee config/compas.json y construye la estructura métrica
 * interna que utilizará el resto del sistema.
 *
 * DEVUELVE
 * --------
 *
 * Una Promise que resuelve con el objeto estructura.
 *
 * EFECTO COLATERAL
 * ----------------
 *
 * También publica el resultado en:
 *
 *     window.estructura
 *
 * para que los demás módulos puedan acceder a él.
 *
 * ============================================================
 */

async function construirEstructura() {

    /*
     * --------------------------------------------------------
     * 1. Cargar el archivo de definición de compases
     * --------------------------------------------------------
     */

    const respuesta = await fetch(
        "config/compas.json"
    );

    if (!respuesta.ok) {
        throw new Error(
            "No se pudo cargar config/compas.json"
        );
    }


    /*
     * Convertimos la respuesta HTTP en un objeto JavaScript.
     */

    const compases = await respuesta.json();


    /*
     * --------------------------------------------------------
     * 2. Seleccionar el compás que vamos a utilizar
     * --------------------------------------------------------
     *
     * De momento trabajamos con 4/4.
     *
     * Más adelante esta selección podrá venir de la familia,
     * del ejercicio o de la configuración del usuario.
     * --------------------------------------------------------
     */

    const nombreCompas = "4_4";

    const compas = compases[nombreCompas];


    /*
     * Comprobamos que el compás exista.
     */

    if (!compas) {
        throw new Error(
            `No existe el compás "${nombreCompas}" en compas.json`
        );
    }


    /*
     * --------------------------------------------------------
     * 3. Construir la estructura general
     * --------------------------------------------------------
     *
     * Estos datos describen la estructura completa del ejercicio.
     *
     * De momento utilizamos valores provisionales:
     *
     *   bpm      → 100
     *   compases → 1
     *   laps     → 4
     *
     * Posteriormente estos valores podrán proceder de la
     * configuración real del ejercicio.
     * --------------------------------------------------------
     */

    const estructura = {

        bpm: 100,

        divisiones: compas.subdivisiones,

        compases: 1,

        laps: 4,

        posiciones: []

    };


    /*
     * --------------------------------------------------------
     * 4. Construir las posiciones de la estructura
     * --------------------------------------------------------
     *
     * compas.json utiliza posiciones empezando en 0:
     *
     *   step 0 → posición 1
     *   step 2 → posición 2
     *   step 4 → posición 3
     *   step 6 → posición 4
     *
     * Nuestra tabla interna utiliza posiciones humanas,
     * empezando en 1.
     *
     * Por tanto:
     *
     *   posición interna = step + 1
     *
     * Los pasos que no tienen etiqueta de acento reciben "-".
     * --------------------------------------------------------
     */

    for (
        let posicion = 1;
        posicion <= compas.subdivisiones;
        posicion++
    ) {

        /*
         * La posición interna empieza en 1.
         *
         * Buscamos si compas.json tiene una etiqueta asociada
         * a esta posición.
         */

        const step = posicion - 1;

        const etiqueta =
            compas.etiquetas_default.find(
                item => item.step === step
            );


        /*
         * Si existe etiqueta, utilizamos su texto.
         *
         * Si no existe, la posición no tiene acento estructural.
         */

        const acento =
            etiqueta
                ? etiqueta.texto
                : "-";


        /*
         * Añadimos la posición a la estructura.
         */

        estructura.posiciones.push({

            posicion: posicion,

            acento: acento

        });

    }


    /*
     * --------------------------------------------------------
     * 5. Publicar la estructura
     * --------------------------------------------------------
     *
     * window.estructura será la referencia compartida que
     * utilizarán configuración, validación, secuenciador,
     * logs, etc.
     * --------------------------------------------------------
     */

    window.estructura = estructura;


    /*
     * --------------------------------------------------------
     * 6. Devolver la estructura
     * --------------------------------------------------------
     *
     * Esto permite que la Promise de construirEstructura()
     * continúe hacia el siguiente .then().
     * --------------------------------------------------------
     */

    return estructura;
}


/*
 * ============================================================
 * PUBLICAR LA FUNCIÓN
 * ============================================================
 *
 * Otros módulos pueden utilizar:
 *
 *     construirEstructura()
 *
 * y, si lo necesitan, también:
 *
 *     window.construirEstructura()
 *
 * ============================================================
 */

window.construirEstructura = construirEstructura;


/*
 * ============================================================
 * FLUJO PRINCIPAL DE CONSTRUCCIÓN
 * ============================================================
 *
 * MUY IMPORTANTE:
 *
 * Este bloque controla el orden de construcción.
 *
 * No debemos llamar a construirSecuencia() fuera de esta
 * cadena, porque estructura y configuración se construyen
 * mediante operaciones asíncronas.
 *
 * El orden obligatorio es:
 *
 *     1. estructura
 *     2. configuración
 *     3. validación
 *     4. secuencia
 *     5. logs
 *
 * Cada .then() empieza solamente cuando ha terminado
 * correctamente el paso anterior.
 *
 * ============================================================
 */

construirEstructura()

    /*
     * --------------------------------------------------------
     * PASO 1
     * --------------------------------------------------------
     *
     * construirEstructura() ya ha terminado.
     *
     * En este momento:
     *
     *     window.estructura
     *
     * existe y está disponible.
     * --------------------------------------------------------
     */

    .then(() => {

        console.log(
            "Estructura construida correctamente"
        );


        /*
         * Pasamos ahora a construir la configuración.
         */

        return construirConfiguracion();

    })


    /*
     * --------------------------------------------------------
     * PASO 2
     * --------------------------------------------------------
     *
     * construirConfiguracion() ya ha terminado.
     *
     * En este momento deberían existir:
     *
     *     window.estructura
     *     window.configuracion
     * --------------------------------------------------------
     */

    .then(() => {

        console.log(
            "Configuración construida correctamente"
        );


        /*
         * ----------------------------------------------------
         * PASO 3
         * ----------------------------------------------------
         *
         * Validamos que estructura y configuración sean
         * compatibles.
         *
         * La función de validación está definida en:
         *
         *     JS/validacion.js
         * ----------------------------------------------------
         */

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
         * Si la validación falla, detenemos el proceso.
         *
         * No tiene sentido construir una secuencia a partir
         * de datos que ya sabemos que son inconsistentes.
         */

        if (!resultadoValidacion.valido) {

            throw new Error(
                "La validación de estructura y configuración ha fallado."
            );

        }


        /*
         * ----------------------------------------------------
         * PASO 4
         * ----------------------------------------------------
         *
         * Construimos la secuencia.
         *
         * IMPORTANTE:
         *
         * Llegamos aquí solamente después de haber terminado:
         *
         *     estructura
         *     configuración
         *     validación
         *
         * Por tanto, construirSecuencia() ya puede recibir
         * window.estructura y window.configuracion.
         * ----------------------------------------------------
         */

        const secuencia =
            construirSecuencia(
                window.estructura,
                window.configuracion
            );


        /*
         * Publicamos la secuencia para que otros módulos
         * puedan utilizarla.
         */

        window.secuencia = secuencia;


        console.log(
            "Secuencia construida correctamente"
        );


        console.log(
            "Secuencia:",
            window.secuencia
        );


        /*
         * ----------------------------------------------------
         * PASO 5
         * ----------------------------------------------------
         *
         * Una vez que todos los datos están construidos,
         * mostramos las tablas de diagnóstico.
         *
         * logs.js se limita a representar los datos.
         * ----------------------------------------------------
         */

        mostrarDatos();

    })


    /*
     * --------------------------------------------------------
     * MANEJO CENTRALIZADO DE ERRORES
     * --------------------------------------------------------
     *
     * Cualquier error producido en cualquiera de los pasos
     * anteriores termina aquí.
     * --------------------------------------------------------
     */

    .catch(error => {

        console.error(
            "Error construyendo los datos:",
            error
        );

    });
