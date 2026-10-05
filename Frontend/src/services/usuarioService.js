import { getToken } from "./authService";
import { API_BASE_URL } from "./apiConfig";

const API_URL = API_BASE_URL;

export async function registrarUsuario(usuario) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(getToken()
                ? { Authorization: `Bearer ${getToken()}` }
                : {}),
        },
        body: JSON.stringify(usuario),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Error al registrar usuario");
    }

    return await response.json();
}
