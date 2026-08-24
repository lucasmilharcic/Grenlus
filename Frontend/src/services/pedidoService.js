const API_URL = "http://localhost:8081";

// =====================================================
// HEADERS
// =====================================================

function getAuthHeaders() {

    const token =
        localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json"
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

            const text =
                await response.text();

            if (text) {
                mensaje = text;
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
// CREAR PEDIDO
// =====================================================

export async function crearPedido(
    pedido
) {

    const response =
        await fetch(
            `${API_URL}/pedidos`,
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(
                    pedido
                )
            }
        );

    if (!response.ok) {

        await manejarError(
            response,
            "No se pudo crear el pedido."
        );
    }

    return response.json();
}

// =====================================================
// ADMIN - LISTAR PEDIDOS
// =====================================================

export async function getPedidos() {

    const response =
        await fetch(
            `${API_URL}/pedidos`,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

    if (!response.ok) {

        await manejarError(
            response,
            "No se pudieron cargar los pedidos."
        );
    }

    return response.json();
}

// =====================================================
// ADMIN - OBTENER PEDIDO
// =====================================================

export async function getPedido(id) {

    const response =
        await fetch(
            `${API_URL}/pedidos/${id}`,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

    if (!response.ok) {

        await manejarError(
            response,
            "No se pudo cargar el pedido."
        );
    }

    return response.json();
}

// =====================================================
// MIS COMPRAS
// =====================================================

export async function getMisCompras() {

    const response =
        await fetch(
            `${API_URL}/pedidos/mis-compras`,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

    if (!response.ok) {

        await manejarError(
            response,
            "No se pudieron cargar tus compras."
        );
    }

    return response.json();
}

// =====================================================
// ADMIN - APROBAR TRANSFERENCIA
// =====================================================

export async function aprobarTransferencia(
    pedidoId
) {

    const response =
        await fetch(
            `${API_URL}/pagos/transferencia/${pedidoId}/aprobar`,
            {
                method: "PUT",
                headers: getAuthHeaders()
            }
        );

    if (!response.ok) {

        await manejarError(
            response,
            "No se pudo aprobar la transferencia."
        );
    }

    return true;
}

// =====================================================
// ADMIN - RECHAZAR TRANSFERENCIA
// =====================================================

export async function rechazarTransferencia(
    pedidoId
) {

    const response =
        await fetch(
            `${API_URL}/pagos/transferencia/${pedidoId}/rechazar`,
            {
                method: "PUT",
                headers: getAuthHeaders()
            }
        );

    if (!response.ok) {

        await manejarError(
            response,
            "No se pudo rechazar la transferencia."
        );
    }

    return true;
}

// =====================================================
// URL DE ARCHIVOS
// =====================================================

export function obtenerUrlArchivoPedido(
    ruta
) {

    if (!ruta) {
        return null;
    }

    const valor =
        String(ruta).trim();

    if (
        valor.startsWith("http://") ||
        valor.startsWith("https://") ||
        valor.startsWith("blob:")
    ) {

        return valor;
    }

    if (
        valor.startsWith("/")
    ) {

        return `${API_URL}${valor}`;
    }

    return `${API_URL}/${valor}`;
}