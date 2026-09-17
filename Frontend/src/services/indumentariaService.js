const API_URL = "http://127.0.0.1:8081/indumentarias";

function getHeaders() {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

export async function getIndumentarias() {

    const response = await fetch(API_URL, {
        method: "GET",
        headers: getHeaders()
    });

    if (!response.ok) {
        throw new Error("Error al obtener las indumentarias");
    }

    return response.json();
}

export async function getIndumentariaById(id) {

    const response = await fetch(`${API_URL}/${id}`, {
        method: "GET",
        headers: getHeaders()
    });

    if (!response.ok) {
        throw new Error("Error al obtener la indumentaria");
    }

    return response.json();
}

export async function createIndumentaria(indumentaria) {

    const response = await fetch(API_URL, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(indumentaria)
    });

    if (!response.ok) {
        throw new Error("Error al crear la indumentaria");
    }

    return response.json();
}

export async function updateIndumentaria(id, indumentaria) {

    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(indumentaria)
    });

    if (!response.ok) {
        throw new Error("Error al editar la indumentaria");
    }

    return response.json();
}

export async function deleteIndumentaria(id) {

    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getHeaders()
    });

    if (!response.ok) {
        throw new Error("Error al eliminar la indumentaria");
    }
}
