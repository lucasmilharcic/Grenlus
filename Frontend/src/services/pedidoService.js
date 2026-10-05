import { API_BASE_URL } from "./apiConfig";

const API_URL = API_BASE_URL;
const GUEST_ORDERS_KEY = "grenlus_guest_orders";

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

export async function consultarPedidoInvitado(
    pedidoId,
    tokenAcceso
) {

    const response = await fetch(
        `${API_URL}/pedidos/invitado/${encodeURIComponent(pedidoId)}`,
        {
            method: "GET",
            headers: {
                "X-Guest-Order-Token": tokenAcceso
            }
        }
    );

    if (!response.ok) {
        await manejarError(
            response,
            "No se pudo consultar el pedido. Revisá el número y el código de acceso."
        );
    }

    return response.json();
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

export async function getPedidos(archivados = false) {

    const query =
        archivados
            ? "?archivados=true"
            : "";

    const response =
        await fetch(
            `${API_URL}/pedidos${query}`,
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

export async function actualizarArchivoPedido(
    pedidoId,
    archivado
) {

    const response =
        await fetch(
            `${API_URL}/pedidos/${pedidoId}/archivo?archivado=${archivado}`,
            {
                method: "PUT",
                headers: getAuthHeaders()
            }
        );

    if (!response.ok) {

        await manejarError(
            response,
            "No se pudo actualizar el archivo del pedido."
        );
    }

    return true;
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

export function guardarAccesoPedidoInvitado(pedido) {

    if (!pedido?.id || !pedido?.guestAccessToken) {
        return;
    }

    let pedidosGuardados = [];
    const guardado = localStorage.getItem(GUEST_ORDERS_KEY);

    if (guardado) {
        try {
            const datos = JSON.parse(guardado);
            if (!Array.isArray(datos)) {
                throw new Error("Formato de historial invitado inválido.");
            }
            pedidosGuardados = datos.filter(
                item => item?.pedidoId && item?.tokenAcceso
            );
        } catch (error) {
            console.error("No se pudo leer el historial de pedidos invitados:", error);
            throw new Error(
                "No se pudo guardar el acceso a tu pedido en este navegador. Conservá abierta esta página.",
                { cause: error }
            );
        }
    }

    const actualizados = pedidosGuardados.filter(
        item => String(item.pedidoId) !== String(pedido.id)
    );
    actualizados.push({
        pedidoId: pedido.id,
        tokenAcceso: pedido.guestAccessToken
    });

    try {
        localStorage.setItem(
            GUEST_ORDERS_KEY,
            JSON.stringify(actualizados)
        );
    } catch (error) {
        console.error("No se pudo persistir el acceso al pedido invitado:", error);
        throw new Error(
            "No se pudo guardar el acceso a tu pedido en este navegador. Conservá abierta esta página.",
            { cause: error }
        );
    }
}

export function obtenerTokenPedidoInvitado(pedidoId) {
    const guardado = localStorage.getItem(GUEST_ORDERS_KEY);

    if (!guardado) {
        return null;
    }

    let pedidosGuardados;
    try {
        pedidosGuardados = JSON.parse(guardado);
    } catch (error) {
        console.error("No se pudo leer el historial de pedidos invitados:", error);
        throw new Error(
            "No se pudo acceder al pedido guardado en este navegador.",
            { cause: error }
        );
    }

    if (!Array.isArray(pedidosGuardados)) {
        throw new Error(
            "El historial de pedidos de este navegador no tiene un formato válido."
        );
    }

    const pedido = pedidosGuardados.find(
        item => String(item?.pedidoId) === String(pedidoId)
    );

    return pedido?.tokenAcceso || null;
}

export async function actualizarMetodoPagoPedidoInvitado(
    pedidoId,
    metodoPago,
    tokenAcceso
) {
    const response = await fetch(
        `${API_URL}/pedidos/invitado/${encodeURIComponent(pedidoId)}/metodo-pago?metodoPago=${encodeURIComponent(metodoPago)}`,
        {
            method: "PUT",
            headers: {
                "X-Guest-Order-Token": tokenAcceso
            }
        }
    );

    if (!response.ok) {
        await manejarError(
            response,
            "No se pudo actualizar el medio de pago."
        );
    }

    return response.json();
}

export async function actualizarMetodoPagoPedidoCuenta(
    pedidoId,
    metodoPago
) {
    const response = await fetch(
        `${API_URL}/pedidos/mis-compras/${encodeURIComponent(pedidoId)}/metodo-pago?metodoPago=${encodeURIComponent(metodoPago)}`,
        {
            method: "PUT",
            headers: getAuthHeaders()
        }
    );

    if (!response.ok) {
        await manejarError(
            response,
            "No se pudo actualizar el medio de pago."
        );
    }

    return response.json();
}

export async function getMisComprasInvitado() {

    const guardado = localStorage.getItem(GUEST_ORDERS_KEY);

    if (!guardado) {
        return [];
    }

    let pedidosGuardados;
    try {
        pedidosGuardados = JSON.parse(guardado);
    } catch (error) {
        console.error("No se pudo leer el historial de pedidos invitados:", error);
        throw new Error(
            "No se pudo leer el historial de pedidos de este navegador.",
            { cause: error }
        );
    }

    if (!Array.isArray(pedidosGuardados)) {
        throw new Error(
            "El historial de pedidos de este navegador no tiene un formato válido."
        );
    }

    const pedidosConAcceso = pedidosGuardados.filter(
        item =>
            /^\d+$/.test(String(item?.pedidoId)) &&
            typeof item?.tokenAcceso === "string" &&
            item.tokenAcceso.length > 0
    );
    const idsDeEntradasInvalidas = pedidosGuardados.length > pedidosConAcceso.length;
    const resultados = await Promise.all(
        pedidosConAcceso.map(async item => {
            const response = await fetch(
                `${API_URL}/pedidos/invitado/${encodeURIComponent(item.pedidoId)}`,
                {
                    method: "GET",
                    headers: {
                        "X-Guest-Order-Token": item.tokenAcceso
                    }
                }
            );

            if (response.status === 404) {
                return {
                    pedidoId: item.pedidoId,
                    pedido: null
                };
            }

            if (!response.ok) {
                await manejarError(
                    response,
                    `No se pudo consultar el pedido #${item.pedidoId}.`
                );
            }

            return {
                pedidoId: item.pedidoId,
                pedido: await response.json()
            };
        })
    );

    const idsNoEncontrados = new Set(
        resultados
            .filter(resultado => resultado.pedido === null)
            .map(resultado => String(resultado.pedidoId))
    );

    if (idsNoEncontrados.size > 0 || idsDeEntradasInvalidas) {
        try {
            localStorage.setItem(
                GUEST_ORDERS_KEY,
                JSON.stringify(
                    pedidosGuardados.filter(
                        item =>
                            /^\d+$/.test(String(item?.pedidoId)) &&
                            typeof item?.tokenAcceso === "string" &&
                            item.tokenAcceso.length > 0 &&
                            !idsNoEncontrados.has(String(item.pedidoId))
                    )
                )
            );
        } catch (error) {
            console.error("No se pudieron limpiar pedidos invitados inexistentes:", error);
            throw new Error(
                "No se pudo actualizar el historial de pedidos guardado en este navegador.",
                { cause: error }
            );
        }
    }

    return resultados
        .map(resultado => resultado.pedido)
        .filter(Boolean);
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

    return response.json();
}

export async function aprobarPagoManualmente(
    pedidoId
) {

    const response =
        await fetch(
            `${API_URL}/pagos/${pedidoId}/aprobar-manual`,
            {
                method: "PUT",
                headers: getAuthHeaders()
            }
        );

    if (!response.ok) {

        await manejarError(
            response,
            "No se pudo confirmar manualmente el pago."
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
