import {
    useState
} from "react";

import {
    useNavigate,
    Link
} from "react-router-dom";

import {
    login,
    getUsuario
} from "../services/authService";

import "./Login.css";

export default function Login() {

    const navigate =
        useNavigate();

    const [
        username,
        setUsername
    ] = useState("");

    const [
        password,
        setPassword
    ] = useState("");

    const [
        error,
        setError
    ] = useState("");

    const [
        loading,
        setLoading
    ] = useState(false);

    // =====================================================
    // LOGIN
    // =====================================================

    async function handleSubmit(e) {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const data =
                await login(
                    username.trim(),
                    password
                );

            console.log(
                "Login correcto:",
                data
            );

            /*
             * authService ya guardó:
             *
             * {
             *   username,
             *   roles
             * }
             *
             * después de consultar /auth/me
             */
            const usuario =
                getUsuario();

            const roles =
                Array.isArray(
                    usuario?.roles
                )
                    ? usuario.roles
                    : [];

            const esAdmin =
                roles.includes(
                    "ROLE_ADMIN"
                );

            // =================================================
            // REDIRECCIÓN SEGÚN ROL
            // =================================================

            if (esAdmin) {

                navigate(
                    "/admin",
                    {
                        replace: true
                    }
                );

            } else {

                navigate(
                    "/mis-compras",
                    {
                        replace: true
                    }
                );
            }

        } catch (error) {

            console.error(
                error
            );

            setError(
                error.message ||
                "No se pudo iniciar sesión."
            );

        } finally {

            setLoading(false);
        }
    }

    // =====================================================
    // VISTA
    // =====================================================

    return (

        <main className="login-page">

            <div className="login-container">

                {/* =========================
                    HEADER
                ========================= */}

                <div className="login-header">

                    <h1>
                        Bienvenido
                    </h1>

                    <p>
                        Ingresá a tu cuenta de Grenlus
                    </p>

                </div>

                {/* =========================
                    FORMULARIO
                ========================= */}

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-group">

                        <label htmlFor="username">
                            Usuario
                        </label>

                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) =>
                                setUsername(
                                    e.target.value
                                )
                            }
                            placeholder="Ingresá tu usuario"
                            autoComplete="username"
                            required
                        />

                    </div>

                    <div className="form-group">

                        <label htmlFor="password">
                            Contraseña
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            placeholder="Ingresá tu contraseña"
                            autoComplete="current-password"
                            required
                        />

                    </div>

                    {error && (

                        <p className="login-error">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Ingresando..."
                            : "Ingresar"}
                    </button>

                </form>

                {/* =========================
                    REGISTRO
                ========================= */}

                <div className="login-register">

                    <p>
                        ¿No tenés una cuenta?
                    </p>

                    <Link to="/registro">
                        Crear una cuenta
                    </Link>

                </div>

                {/* =========================
                    VOLVER
                ========================= */}

                <div className="boton-back">

                    <Link to="/">
                        Volver a la página principal
                    </Link>

                </div>

            </div>

        </main>
    );
}