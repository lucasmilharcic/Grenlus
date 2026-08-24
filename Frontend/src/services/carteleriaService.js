const API_URL = "http://localhost:8081/carteleria";

function getHeaders() {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

export async function getCartelerias() {

    const response = await fetch(API_URL, {
        method: "GET",
        headers: getHeaders()
    });

    if (!response.ok) {
        throw new Error("Error al obtener las cartelerías");
    }

    return response.json();
}

export async function getCarteleriaById(id) {

    const response = await fetch(`${API_URL}/${id}`, {
        method: "GET",
        headers: getHeaders()
    });

    if (!response.ok) {
        throw new Error("Error al obtener la cartelería");
    }

    return response.json();
}

export async function createCarteleria(carteleria) {

    const response = await fetch(API_URL, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(carteleria)
    });

    if (!response.ok) {
        throw new Error("Error al crear la cartelería");
    }

    return response.json();
}

export async function updateCarteleria(id, carteleria) {

    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(carteleria)
    });

    if (!response.ok) {
        throw new Error("Error al editar la cartelería");
    }

    // Tu controller actualmente devuelve void
    return;
}

export async function deleteCarteleria(id) {

    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getHeaders()
    });

    if (!response.ok) {
        throw new Error("Error al eliminar la cartelería");
    }
}