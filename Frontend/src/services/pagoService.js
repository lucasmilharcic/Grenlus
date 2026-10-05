import { API_BASE_URL } from "./apiConfig";

const API_URL = API_BASE_URL;

// =====================================================
// MERCADO PAGO
// =====================================================

export async function crearPreferenciaMercadoPago(
    pedidoId
) {

    const token = localStorage.getItem("token");
    const response =
        await fetch(
            `${API_URL}/pagos/mercadopago/preferencia?pedidoId=${pedidoId}`,
            {
                method: "POST",
                headers: token
                    ? { Authorization: `Bearer ${token}` }
                    : {}
            }
        );

    if (!response.ok) {

        let mensaje =
            "No se pudo iniciar Mercado Pago.";

        try {

            const data =
                await response.json();

            mensaje =
                data.message || mensaje;

        } catch {
            // dejamos mensaje default
        }

        throw new Error(mensaje);
    }

    return response.json();
}

export async function crearPreferenciaMercadoPagoInvitado(
    pedidoId,
    tokenAcceso
) {
    const response = await fetch(
        `${API_URL}/pagos/mercadopago/preferencia-invitado?pedidoId=${encodeURIComponent(pedidoId)}`,
        {
            method: "POST",
            headers: {
                "X-Guest-Order-Token": tokenAcceso
            }
        }
    );

    if (!response.ok) {
        let mensaje = "No se pudo iniciar Mercado Pago.";

        try {
            const data = await response.json();
            mensaje = data.message || mensaje;
        } catch {
            // dejamos mensaje default
        }

        throw new Error(mensaje);
    }

    return response.json();
}

export async function crearPreferenciaMercadoPagoCuenta(pedidoId) {
    const token = localStorage.getItem("token");
    const response = await fetch(
        `${API_URL}/pagos/mercadopago/preferencia-cuenta?pedidoId=${encodeURIComponent(pedidoId)}`,
        {
            method: "POST",
            headers: token
                ? { Authorization: `Bearer ${token}` }
                : {}
        }
    );

    if (!response.ok) {
        let mensaje = "No se pudo iniciar Mercado Pago.";
        try {
            const data = await response.json();
            mensaje = data.message || mensaje;
        } catch {
            // dejamos mensaje default
        }
        throw new Error(mensaje);
    }

    return response.json();
}

// =====================================================
// TRANSFERENCIA
// =====================================================

export async function getDatosTransferencia() {

    const response =
        await fetch(
            `${API_URL}/pagos/transferencia/datos`
        );

    if (!response.ok) {

        throw new Error(
            "No se pudieron obtener los datos para la transferencia."
        );
    }

    return response.json();
}

export async function subirComprobanteTransferencia(
    pedidoId,
    archivo
) {

    const formData =
        new FormData();

    formData.append(
        "archivo",
        archivo
    );

    const response =
        await fetch(
            `${API_URL}/pagos/transferencia/${pedidoId}/comprobante`,
            {
                method: "POST",
                body: formData
            }
        );

    if (!response.ok) {

        let mensaje =
            "No se pudo subir el comprobante.";

        try {

            const data =
                await response.json();

            mensaje =
                data.message || mensaje;

        } catch {
            // mensaje default
        }

        throw new Error(mensaje);
    }

    return response.json();
}

export async function subirComprobanteTransferenciaInvitado(
    pedidoId,
    archivo,
    tokenAcceso
) {
    const formData = new FormData();
    formData.append("archivo", archivo);

    const response = await fetch(
        `${API_URL}/pagos/transferencia/${encodeURIComponent(pedidoId)}/comprobante-invitado`,
        {
            method: "POST",
            headers: {
                "X-Guest-Order-Token": tokenAcceso
            },
            body: formData
        }
    );

    if (!response.ok) {
        let mensaje = "No se pudo subir el comprobante.";

        try {
            const data = await response.json();
            mensaje = data.message || mensaje;
        } catch {
            // dejamos mensaje default
        }

        throw new Error(mensaje);
    }

    return response.json();
}

export async function subirComprobanteTransferenciaCuenta(
    pedidoId,
    archivo
) {
    const formData = new FormData();
    formData.append("archivo", archivo);
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/pagos/transferencia/${encodeURIComponent(pedidoId)}/comprobante-cuenta`,
        {
            method: "POST",
            headers: token
                ? { Authorization: `Bearer ${token}` }
                : {},
            body: formData
        }
    );

    if (!response.ok) {
        let mensaje = "No se pudo subir el comprobante.";
        try {
            const data = await response.json();
            mensaje = data.message || mensaje;
        } catch {
            // dejamos mensaje default
        }
        throw new Error(mensaje);
    }

    return response.json();
}

// =====================================================
// ADMIN TRANSFERENCIAS
// =====================================================

function getAdminHeaders() {

    const token =
        localStorage.getItem("token");

    return token
        ? {
              Authorization:
                  `Bearer ${token}`
          }
        : {};
}

export async function aprobarTransferencia(
    pedidoId
) {

    const response =
        await fetch(
            `${API_URL}/pagos/transferencia/${pedidoId}/aprobar`,
            {
                method: "PUT",
                headers: getAdminHeaders()
            }
        );

    if (!response.ok) {

        throw new Error(
            "No se pudo aprobar la transferencia."
        );
    }
}

export async function rechazarTransferencia(
    pedidoId
) {

    const response =
        await fetch(
            `${API_URL}/pagos/transferencia/${pedidoId}/rechazar`,
            {
                method: "PUT",
                headers: getAdminHeaders()
            }
        );

    if (!response.ok) {

        throw new Error(
            "No se pudo rechazar la transferencia."
        );
    }
}
