const API_URL = "http://localhost:8081";

// =====================================================
// MERCADO PAGO
// =====================================================

export async function crearPreferenciaMercadoPago(
    pedidoId
) {

    const response =
        await fetch(
            `${API_URL}/pagos/mercadopago/preferencia?pedidoId=${pedidoId}`,
            {
                method: "POST"
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