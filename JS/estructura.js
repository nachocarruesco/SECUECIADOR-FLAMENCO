/*
 * ============================================================
 * ESTRUCTURA.JS — construcción de estructura y patrón métrico
 * ============================================================
 *
 * TABLA 1 — window.tablaEstructura
 * bpm | divisiones | compases | laps | claqueta_si_no | origen
 *
 * TABLA 2 — window.posicionesEstructura
 * posicion | acento | claqueta
 *
 * window.estructura se mantiene como objeto de compatibilidad
 * para no romper los módulos que ya consumen estos datos.
 * ============================================================
 */

async function construirEstructura() {

    // Cargamos las tres fuentes de datos en paralelo.
    const [
        respuestaCompases,
        respuestaDefaults,
        respuestaClaqueta
    ] = await Promise.all([
        fetch("config/compas.json"),
        fetch("config/defaults/default_rumbas.json"),
        fetch("presets/rumba/claqueta.json")
    ]);

    if (!respuestaCompases.ok) {
        throw new Error("No se pudo cargar config/compas.json");
    }

    if (!respuestaDefaults.ok) {
        throw new Error(
            "No se pudo cargar config/defaults/default_rumbas.json"
        );
    }

    if (!respuestaClaqueta.ok) {
        throw new Error(
            "No se pudo cargar presets/rumba/claqueta.json"
        );
    }

    const definicionesCompas = await respuestaCompases.json();
    const defaults = await respuestaDefaults.json();
    const patronClaqueta = await respuestaClaqueta.json();

    // En esta fase seguimos trabajando con 4/4.
    const nombreCompas = "4_4";
    const compas = definicionesCompas[nombreCompas];

    if (!compas) {
        throw new Error(
            `No existe el compás "${nombreCompas}" en compas.json`
        );
    }

    // Valores generales. BPM y estado de claqueta proceden
    // del archivo de valores predeterminados existente.
    const bpm = Number(defaults.bpm?.default ?? 100);
    const divisiones = Number(compas.subdivisiones);
    const compases = 1;
    const laps = 4;
    const claquetaSiNo = Boolean(
        defaults.claqueta?.enabled ?? true
    );

    /*
     * TABLA 1: estructura general.
     *
     * Indicamos el archivo real de procedencia. Todavía no
     * atribuimos estos valores a preset, ejercicio o usuario.
     */
    const tablaEstructura = [{
        bpm,
        divisiones,
        compases,
        laps,
        claqueta_si_no: claquetaSiNo ? "ON" : "OFF",
        origen: "config/defaults/default_rumbas.json"
    }];

    /*
     * TABLA 2: posiciones de la estructura.
     *
     * Los JSON numeran las posiciones desde cero.
     * Nuestra tabla las numera desde uno.
     *
     * Por eso, para cada posición, el índice JSON es:
     * posicion - 1
     *
     * El patrón de claqueta se conserva aunque esté desactivada.
     * El interruptor ON/OFF no elimina los datos del patrón.
     */
    const posicionesEstructura = [];

    for (
        let posicion = 1;
        posicion <= divisiones;
        posicion++
    ) {
        const step = posicion - 1;

        const etiqueta = (compas.etiquetas_default || [])
            .find(item => item.step === step);

        const eventosClaqueta =
            patronClaqueta[String(step)] || [];

        const claqueta = eventosClaqueta.length
            ? eventosClaqueta
                .map(evento => `${evento.type}:${evento.accent}`)
                .join(", ")
            : "—";

        posicionesEstructura.push({
            posicion,
            acento: etiqueta ? etiqueta.texto : "—",
            claqueta
        });
    }

    // Publicamos las dos tablas para logs.js y otros módulos.
    window.tablaEstructura = tablaEstructura;
    window.posicionesEstructura = posicionesEstructura;

    /*
     * Objeto efectivo de compatibilidad.
     *
     * Los módulos existentes siguen leyendo:
     * window.estructura.bpm
     * window.estructura.divisiones
     * window.estructura.laps
     * window.estructura.posiciones
     *
     * posiciones apunta a la misma tabla publicada arriba.
     */
    const estructura = {
        bpm,
        divisiones,
        compases,
        laps,
        claqueta_si_no: claquetaSiNo,
        posiciones: posicionesEstructura
    };

    window.estructura = estructura;

    return estructura;
}

window.construirEstructura = construirEstructura;


/*
 * ============================================================
 * ORQUESTACIÓN
 * ============================================================
 *
 * Orden obligatorio:
 * 1. Construir estructura.
 * 2. Construir configuración.
 * 3. Validar los datos.
 * 4. Construir secuencia.
 * 5. Mostrar tablas.
 * ============================================================
 */

construirEstructura()

    .then(() => {
        console.log("Estructura construida correctamente");

        return construirConfiguracion();
    })

    .then(() => {
        console.log("Configuración construida correctamente");

        const resultadoValidacion =
            validarEstructuraConfiguracion(
                window.estructura,
                window.configuracion
            );

        console.log(
            "Resultado de validación:",
            resultadoValidacion
        );

        if (!resultadoValidacion.valido) {
            throw new Error(
                "La validación de estructura y configuración ha fallado."
            );
        }

        window.secuencia = construirSecuencia(
            window.estructura,
            window.configuracion
        );

        console.log("Secuencia construida correctamente");
        console.log("Secuencia:", window.secuencia);

        mostrarDatos();
    })

    .catch(error => {
        console.error(
            "Error construyendo los datos:",
            error
        );
    });
