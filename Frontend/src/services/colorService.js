import { API_BASE_URL } from "./apiConfig";

const API_URL = `${API_BASE_URL}/indumentarias`;

function getHeaders() {

    const token =
        localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

async function manejarError(
    response,
    mensajeDefault
) {

    let mensaje = mensajeDefault;

    try {

        const data = await response.json();

        mensaje = data.message || mensajeDefault;

    } catch {

        try {

            const texto = await response.text();

            if (texto) {
                mensaje = texto;
            }

        } catch {
            // mantenemos mensaje default
        }
    }

    throw new Error(mensaje);
}

// =====================================================
// LISTAR
// =====================================================

export async function getColores(indumentariaId) {

    const response = await fetch(
        `${API_URL}/${indumentariaId}/colores`,
        {
            method: "GET",
            headers: getHeaders()
        }
    );

    if (!response.ok) {
        await manejarError(
            response,
            "No se pudieron cargar los colores."
        );
    }

    return response.json();
}

// =====================================================
// CREAR
// =====================================================

export async function crearColor(
    indumentariaId,
    color
) {

    const response = await fetch(
        `${API_URL}/${indumentariaId}/colores`,
        {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(color)
        }
    );

    if (!response.ok) {
        await manejarError(
            response,
            "No se pudo crear el color."
        );
    }

    return response.json();
}

// =====================================================
// EDITAR
// =====================================================

export async function actualizarColor(
    indumentariaId,
    colorId,
    color
) {

    const response = await fetch(
        `${API_URL}/${indumentariaId}/colores/${colorId}`,
        {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(color)
        }
    );

    if (!response.ok) {
        await manejarError(
            response,
            "No se pudo guardar el color."
        );
    }

    return response.json();
}

// =====================================================
// ELIMINAR
// =====================================================

export async function eliminarColor(
    indumentariaId,
    colorId
) {

    const response = await fetch(
        `${API_URL}/${indumentariaId}/colores/${colorId}`,
        {
            method: "DELETE",
            headers: getHeaders()
        }
    );

    if (!response.ok) {
        await manejarError(
            response,
            "No se pudo eliminar el color."
        );
    }

    return true;
}
