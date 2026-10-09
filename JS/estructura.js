/*
 * ============================================================
 * ESTRUCTURA.JS — construcción de estructura y patrón métrico
 * ============================================================
 *
 * RESPONSABILIDAD
 * ---------------
 * 1. Leer la definición del compás.
 * 2. Leer los valores predeterminados disponibles.
 * 3. Leer el patrón de claqueta, aunque esté desactivada.
 * 4. Publicar las tablas para diagnóstico y el objeto efectivo
 *    que siguen consumiendo los módulos existentes.
 * 5. Coordinar configuración → validación → secuencia → logs.
 *
 * TABLAS PUBLICADAS
 * -----------------
 * window.tablaEstructura:
 *   bpm | divisiones | compases | laps | claqueta_si_no | origen
 *
 * window.posicionesEstructura:
 *   posicion | acento | claqueta
 *
 * window.estructura se conserva como objeto de compatibilidad
 * para no romper configuracion.js, validacion.js ni
 * secuenciador.js en este paso incremental.
 * ============================================================
 */

async function construirEstructura() {
    // Cargamos las tres fuentes necesarias para estas tablas.
    const [respuestaCompases, respuestaDefaults, respuestaClaqueta] =
        await Promise.all([
            fetch("config/compas.json"),
            fetch("config/defaults/default_rumbas.json"),
            fetch("presets/rumba/claqueta.json")
        ]);

    if (!respuestaCompases.ok) {
        throw new Error("No se pudo cargar config/compas.json");
    }
    if (!respuestaDefaults.ok) {
        throw new Error("No se pudo cargar config/defaults/default_rumbas.json");
    }
    if (!respuestaClaqueta.ok) {
        throw new Error("No se pudo cargar presets/rumba/claqueta.json");
    }

    const definicionesCompas = await respuestaCompases.json();
    const defaults = await respuestaDefaults.json();
    const patronClaqueta = await respuestaClaqueta.json();

    // En esta fase el proyecto sigue utilizando el compás 4/4.
    const nombreCompas = "4_4";
    const compas = definicionesCompas[nombreCompas];
    if (!compas) {
        throw new Error(`No existe el compás "${nombreCompas}" en compas.json`);
    }

    // ---------------------------------------------------------
    // 1. Valores efectivos y procedencia de cada campo
    // ---------------------------------------------------------
    // No todos los campos proceden del mismo archivo. Por eso,
    // `origen` en el modelo interno es un objeto con una entrada
    // por campo, en lugar de atribuir toda la fila a un único
    // archivo de forma incorrecta.
    //
    // En esta fase todavía no existen overrides explícitos de
    // preset, ejercicio o usuario para BPM y claqueta. Se usan
    // los valores predeterminados actuales y se registra su
    // procedencia real. Las capas superiores se incorporarán
    // después sin cambiar el formato de `window.estructura`.
    // ---------------------------------------------------------

    const bpm = Number(defaults.bpm?.default ?? 100);
    const divisiones = Number(compas.subdivisiones);
    const compases = 1;
    const laps = 4;
    const claquetaSiNo = Boolean(defaults.claqueta?.enabled ?? true);

    const origen = {
        bpm: "config/defaults/default_rumbas.json",
        divisiones: "config/compas.json",
        compases: "JS/estructura.js",
        laps: "JS/estructura.js",
        claqueta_si_no: "config/defaults/default_rumbas.json"
    };

    // La tabla visible mantiene una fila con los valores efectivos.
    // Su columna `origen` resume la procedencia campo por campo;
    // el mapa detallado permanece disponible en window.estructura.
    const tablaEstructura = [{
        bpm,
        divisiones,
        compases,
        laps,
        claqueta_si_no: claquetaSiNo ? "ON" : "OFF",
        origen: Object.entries(origen)
            .map(([campo, fuente]) => `${campo}: ${fuente}`)
            .join("; ")
    }];

    /*
     * TABLA 2: una fila por subdivisión.
     * Los JSON de patrones empiezan en la posición 0; la tabla
     * interna empieza en 1. Por eso la clave se obtiene con
     * `posicion - 1`. El patrón se conserva aunque la claqueta
     * esté OFF: el interruptor afecta a la ejecución, no al dato.
     */
    const posicionesEstructura = [];

    for (let posicion = 1; posicion <= divisiones; posicion++) {
        const step = posicion - 1;
        const etiqueta = (compas.etiquetas_default || [])
            .find(item => item.step === step);

        const eventosClaqueta = patronClaqueta[String(step)] || [];
        const claqueta = eventosClaqueta.length
            ? eventosClaqueta.map(evento => `${evento.type}:${evento.accent}`).join(", ")
            : "—";

        posicionesEstructura.push({
            posicion,
            acento: etiqueta ? etiqueta.texto : "—",
            claqueta
        });
    }

    // Tabla de diagnóstico disponible para logs.js.
    window.tablaEstructura = tablaEstructura;
    window.posicionesEstructura = posicionesEstructura;

    // Objeto efectivo compatible con los módulos actuales.
    // `posiciones` apunta a la misma tabla, no a una copia divergente.
    const estructura = {
        bpm,
        divisiones,
        compases,
        laps,
        // Booleano real para lógica del programa; la tabla lo
        // presenta como ON/OFF únicamente para facilitar lectura.
        claqueta_si_no: claquetaSiNo,
        // Procedencia de cada campo, utilizable por validación,
        // resolución de prioridades y trazabilidad posteriores.
        origen,
        posiciones: posicionesEstructura
    };

    window.estructura = estructura;
    return estructura;
}

window.construirEstructura = construirEstructura;

/*
 * ORQUESTACIÓN
 * -------------
 * El orden es intencionado: las operaciones de carga de JSON son
 * asíncronas, así que configuración no debe empezar antes de que
 * estructura haya terminado.
 */
construirEstructura()
    .then(() => {
        console.log("Estructura construida correctamente");
        return construirConfiguracion();
    })
    .then(() => {
        console.log("Configuración construida correctamente");

        const resultadoValidacion = validarEstructuraConfiguracion(
            window.estructura,
            window.configuracion
        );
        console.log("Resultado de validación:", resultadoValidacion);

        if (!resultadoValidacion.valido) {
            throw new Error("La validación de estructura y configuración ha fallado.");
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
        console.error("Error construyendo los datos:", error);
    });
