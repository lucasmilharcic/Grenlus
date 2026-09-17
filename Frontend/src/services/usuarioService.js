import { getToken } from "./authService";

const API_URL = "http://127.0.0.1:8081";

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
