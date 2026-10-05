import { API_BASE_URL } from "./apiConfig";

const API_URL = API_BASE_URL;

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
// ADMIN - LISTAR ENVÃOS
// =====================================================

/*
 * estado es opcional.
 *
 * Sin estado trae todos los pedidos
 * con envÃ­o a domicilio.
 */
export async function getEnvios(
    estado,
    archivados = false
) {

    const parametros = new URLSearchParams();

    if (estado && estado !== "TODOS") {
        parametros.set("estado", estado);
    }

    if (archivados) {
        parametros.set("archivados", "true");
    }

    const query =
        parametros.size > 0
            ? `?${parametros.toString()}`
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
            "No se pudieron cargar los envÃ­os."
        );
    }

    return response.json();
}

// =====================================================
// ADMIN - OBTENER UN ENVÃO
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
            "No se pudo cargar el envÃ­o."
        );
    }

    return response.json();
}

export async function getPortalMiCorreo() {
    const response = await fetch(`${API_URL}/envios/correo/portal`, {
        method: "GET",
        headers: getAuthHeaders()
    });

    if (!response.ok) {
        await manejarError(
            response,
            "No se pudo obtener el portal MiCorreo."
        );
    }

    return response.json();
}

// =====================================================
// ADMIN - ACTUALIZAR ENVÃO
// =====================================================

/*
 * Sirve para avanzar el estado, para cargar
 * el cÃ³digo de seguimiento, o para las dos
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
            "No se pudo actualizar el envÃ­o."
        );
    }

    return response.json();
}

// =====================================================
// CLIENTE - MIS ENVÃOS
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
            "No se pudieron cargar tus envÃ­os."
        );
    }

    return response.json();
}
