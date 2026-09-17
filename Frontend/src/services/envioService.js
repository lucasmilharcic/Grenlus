const API_URL =
    "http://127.0.0.1:8081";

// =====================================================
// HEADERS
// =====================================================

function getAuthHeaders() {

    const token =
        localStorage.getItem("token");

    const headers = {
        "Content-Type":
            "application/json"
    };

    if (token) {

        headers.Authorization =
            `Bearer ${token}`;
    }

    return headers;
}

// =====================================================
// ERROR
// =====================================================

async function manejarError(
    response,
    mensajeDefault
) {

    let mensaje =
        mensajeDefault;

    try {

        const data =
            await response.json();

        mensaje =
            data.message ||
            mensajeDefault;

    } catch {

        try {

            const texto =
                await response.text();

            if (texto) {
                mensaje = texto;
            }

        } catch {
            // mantenemos mensaje default
        }
    }

    throw new Error(
        mensaje
    );
}

// =====================================================
// COTIZAR ENVÍO CON ZIPNOVA
// =====================================================

export async function cotizarEnvio(
    datos
) {

    const response =
        await fetch(
            `${API_URL}/envios/cotizar`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(
                        datos
                    )
            }
        );

    if (!response.ok) {

        await manejarError(
            response,
            "No se pudo calcular el envío."
        );
    }

    return response.json();
}

// =====================================================
// ADMIN - LISTAR ENVÍOS
// =====================================================

/*
 * estado es opcional.
 *
 * Sin estado trae todos los pedidos
 * con envío a domicilio.
 */
export async function getEnvios(
    estado
) {

    const query =
        estado && estado !== "TODOS"
            ? `?estado=${estado}`
            : "";

    const response =
        await fetch(
            `${API_URL}/envios${query}`,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

    if (!response.ok) {

        await manejarError(
            response,
            "No se pudieron cargar los envíos."
        );
    }

    return response.json();
}

// =====================================================
// ADMIN - OBTENER UN ENVÍO
// =====================================================

export async function getEnvio(
    pedidoId
) {

    const response =
        await fetch(
            `${API_URL}/envios/${pedidoId}`,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

    if (!response.ok) {

        await manejarError(
            response,
            "No se pudo cargar el envío."
        );
    }

    return response.json();
}

// =====================================================
// ADMIN - ACTUALIZAR ENVÍO
// =====================================================

/*
 * Sirve para avanzar el estado, para cargar
 * el código de seguimiento, o para las dos
 * cosas a la vez.
 */
export async function actualizarEnvio(
    pedidoId,
    datos
) {

    const response =
        await fetch(
            `${API_URL}/envios/${pedidoId}`,
            {
                method: "PUT",
                headers: getAuthHeaders(),

                body:
                    JSON.stringify(
                        datos
                    )
            }
        );

    if (!response.ok) {

        await manejarError(
            response,
            "No se pudo actualizar el envío."
        );
    }

    return response.json();
}

// =====================================================
// CLIENTE - MIS ENVÍOS
// =====================================================

export async function getMisEnvios() {

    const response =
        await fetch(
            `${API_URL}/envios/mis-envios`,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

    if (!response.ok) {

        await manejarError(
            response,
            "No se pudieron cargar tus envíos."
        );
    }

    return response.json();
}
