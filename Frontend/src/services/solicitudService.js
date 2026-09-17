const API_URL =
    "http://127.0.0.1:8081/solicitudes";

// =====================================================
// HEADERS
// =====================================================

function getHeaders() {

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
// OBTENER SOLICITUDES
// ADMIN
// =====================================================

export async function getSolicitudes() {

    const response = await fetch(
        API_URL,
        {
            method: "GET",
            headers: getHeaders()
        }
    );

    if (!response.ok) {

        const text =
            await response.text();

        throw new Error(
            text ||
            "No se pudieron obtener las solicitudes"
        );
    }

    return await response.json();
}

// =====================================================
// OBTENER UNA SOLICITUD
// =====================================================

export async function getSolicitudById(id) {

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method: "GET",
            headers: getHeaders()
        }
    );

    if (!response.ok) {

        const text =
            await response.text();

        throw new Error(
            text ||
            "No se pudo obtener la solicitud"
        );
    }

    return await response.json();
}

// =====================================================
// CREAR SOLICITUD
// PÚBLICO
// =====================================================

export async function crearSolicitud(
    solicitud
) {

    const response = await fetch(
        API_URL,
        {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(
                solicitud
            )
        }
    );

    if (!response.ok) {

        const text =
            await response.text();

        throw new Error(
            text ||
            "No se pudo crear la solicitud"
        );
    }

    return await response.json();
}

// =====================================================
// EDITAR SOLICITUD
// ADMIN
// =====================================================

export async function updateSolicitud(
    id,
    solicitud
) {

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(
                solicitud
            )
        }
    );

    if (!response.ok) {

        const text =
            await response.text();

        throw new Error(
            text ||
            "No se pudo editar la solicitud"
        );
    }

    return await response.json();
}

// =====================================================
// ELIMINAR SOLICITUD
// ADMIN
// =====================================================

export async function deleteSolicitud(
    id
) {

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method: "DELETE",
            headers: getHeaders()
        }
    );

    if (!response.ok) {

        const text =
            await response.text();

        throw new Error(
            text ||
            "No se pudo eliminar la solicitud"
        );
    }

    return true;
}
