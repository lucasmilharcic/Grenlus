const API_URL =
    "http://127.0.0.1:8081";

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
