const API_URL = "http://localhost:8081/auth";

const TOKEN_KEY = "token";
const USER_KEY = "grenlus_usuario";

// =====================================================
// LOGIN
// =====================================================

export async function login(
    username,
    password
) {

    const response =
        await fetch(
            `${API_URL}/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    username,
                    password
                })
            }
        );

    if (!response.ok) {

        let mensaje =
            "Usuario o contraseña incorrectos.";

        try {

            const data =
                await response.json();

            mensaje =
                data.message ||
                mensaje;

        } catch {
            // mantenemos mensaje default
        }

        throw new Error(
            mensaje
        );
    }

    const data =
        await response.json();

    // Primero guardamos el token
    localStorage.setItem(
        TOKEN_KEY,
        data.token
    );

    // Luego obtenemos usuario + roles
    const usuario =
        await obtenerUsuarioActual();

    localStorage.setItem(
        USER_KEY,
        JSON.stringify(
            usuario
        )
    );

    window.dispatchEvent(
        new Event(
            "grenlus-auth-changed"
        )
    );

    return data;
}


// =====================================================
// OBTENER USUARIO DESDE BACKEND
// =====================================================

export async function obtenerUsuarioActual() {

    const token =
        getToken();

    if (!token) {
        return null;
    }

    const response =
        await fetch(
            `${API_URL}/me`,
            {
                method: "GET",

                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

    if (!response.ok) {

        throw new Error(
            "No se pudo obtener la información del usuario."
        );
    }

    return response.json();
}


// =====================================================
// REGISTRO
// =====================================================

export async function register({
    username,
    password,
    nombre
}) {

    const response =
        await fetch(
            `${API_URL}/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    username,
                    password,
                    nombre
                })
            }
        );

    if (!response.ok) {

        let mensaje =
            "No se pudo crear la cuenta.";

        try {

            const data =
                await response.json();

            mensaje =
                data.message ||
                mensaje;

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

    const contentType =
        response.headers.get(
            "content-type"
        );

    if (
        contentType &&
        contentType.includes(
            "application/json"
        )
    ) {

        return response.json();
    }

    return null;
}


// =====================================================
// LOGOUT
// =====================================================

export function logout() {

    localStorage.removeItem(
        TOKEN_KEY
    );

    localStorage.removeItem(
        USER_KEY
    );

    window.dispatchEvent(
        new Event(
            "grenlus-auth-changed"
        )
    );
}


// =====================================================
// TOKEN
// =====================================================

export function getToken() {

    return localStorage.getItem(
        TOKEN_KEY
    );
}


// =====================================================
// USUARIO
// =====================================================

export function getUsuario() {

    try {

        const raw =
            localStorage.getItem(
                USER_KEY
            );

        if (!raw) {
            return null;
        }

        return JSON.parse(
            raw
        );

    } catch (error) {

        console.error(
            "No se pudo recuperar el usuario:",
            error
        );

        return null;
    }
}


// =====================================================
// AUTENTICACIÓN
// =====================================================

export function isAuthenticated() {

    return Boolean(
        getToken()
    );
}


// =====================================================
// ROLES
// =====================================================

export function isAdmin() {

    const usuario =
        getUsuario();

    if (
        !usuario ||
        !Array.isArray(usuario.roles)
    ) {

        return false;
    }

    return usuario.roles.includes(
        "ROLE_ADMIN"
    );
}