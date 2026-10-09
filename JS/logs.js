/*
 * ============================================================
 * LOGS.JS — representación HTML de las tablas internas
 * ============================================================
 *
 * Este módulo no calcula ni modifica datos musicales.
 * Recibe las tablas de los otros módulos y las representa.
 * ============================================================
 */

function crearTablaHTML(datos) {

    const tabla = document.createElement("table");

    tabla.style.borderCollapse = "collapse";
    tabla.style.marginBottom = "24px";
    tabla.style.width = "100%";

    if (!Array.isArray(datos) || datos.length === 0) {

        const fila = tabla.insertRow();
        const celda = fila.insertCell();

        celda.textContent = "Sin datos";

        return tabla;
    }

    // Las propiedades del primer registro determinan las columnas.
    const columnas = Object.keys(datos[0]);

    const thead = tabla.createTHead();
    const filaCabecera = thead.insertRow();

    columnas.forEach(columna => {

        const th = document.createElement("th");

        th.textContent = columna;
        th.style.border = "1px solid #999";
        th.style.padding = "5px 8px";
        th.style.textAlign = "left";

        filaCabecera.appendChild(th);
    });

    const tbody = tabla.createTBody();

    datos.forEach(registro => {

        const fila = tbody.insertRow();

        columnas.forEach(columna => {

            const td = fila.insertCell();
            const valor = registro[columna];

            td.textContent =
                valor === null ||
                valor === undefined ||
                valor === ""
                    ? "—"
                    : String(valor);

            td.style.border = "1px solid #999";
            td.style.padding = "5px 8px";
        });
    });

    return tabla;
}


/*
 * Añade un título y una tabla al contenedor indicado.
 */
function mostrarTabla(datos, contenedor, titulo) {

    const encabezado = document.createElement("h2");

    encabezado.textContent = titulo;

    contenedor.appendChild(encabezado);
    contenedor.appendChild(crearTablaHTML(datos));
}


/*
 * Busca el contenedor de logs.
 * Si no existe, lo crea.
 */
function obtenerContenedorLogs() {

    let contenedor = document.getElementById("logs");

    if (!contenedor) {

        contenedor = document.createElement("div");
        contenedor.id = "logs";

        document.body.appendChild(contenedor);
    }

    return contenedor;
}


/*
 * ============================================================
 * MOSTRAR DATOS
 * ============================================================
 *
 * TABLA 1: estructura general.
 * TABLA 2: posiciones, acentos y patrón de claqueta.
 * TABLA 3: eventos de todas las vueltas del ejercicio.
 * ============================================================
 */

function mostrarDatos() {

    const contenedor = obtenerContenedorLogs();

    // Evita duplicar tablas si se llama de nuevo a esta función.
    contenedor.replaceChildren();

    if (!window.estructura) {

        console.warn("No existe window.estructura");

        return;
    }

    // TABLA 1
    mostrarTabla(
        window.tablaEstructura || [],
        contenedor,
        "1. Estructura general"
    );

    // TABLA 2
    mostrarTabla(
        window.posicionesEstructura ||
            window.estructura.posiciones ||
            [],
        contenedor,
        "2. Posiciones de la estructura"
    );

    // TABLA 3
    mostrarTabla(
        window.configuracion || [],
        contenedor,
        "3. Configuración del ejercicio"
    );
}


window.crearTablaHTML = crearTablaHTML;
window.mostrarTabla = mostrarTabla;
window.mostrarDatos = mostrarDatos;
