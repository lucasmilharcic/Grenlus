import {
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
    register
} from "../services/authService";

import "./Register.css";

export default function Register() {

    const navigate =
        useNavigate();

    const [
        nombre,
        setNombre
    ] = useState("");

    const [
        username,
        setUsername
    ] = useState("");

    const [
        password,
        setPassword
    ] = useState("");

    const [
        repetirPassword,
        setRepetirPassword
    ] = useState("");

    const [
        error,
        setError
    ] = useState("");

    const [
        loading,
        setLoading
    ] = useState(false);

    async function handleSubmit(e) {

        e.preventDefault();

        setError("");

        if (!nombre.trim()) {

            setError(
                "Ingresá tu nombre."
            );

            return;
        }

        if (!username.trim()) {

            setError(
                "Ingresá tu email."
            );

            return;
        }

        if (!username.includes("@")) {

            setError(
                "Ingresá un email válido."
            );

            return;
        }

        if (!password) {

            setError(
                "Ingresá una contraseña."
            );

            return;
        }

        if (password.length < 6) {

            setError(
                "La contraseña debe tener al menos 6 caracteres."
            );

            return;
        }

        if (
            password !==
            repetirPassword
        ) {

            setError(
                "Las contraseñas no coinciden."
            );

            return;
        }

        try {

            setLoading(true);

            await register({
                nombre:
                    nombre.trim(),

                username:
                    username.trim(),

                password
            });

            navigate(
                "/login",
                {
                    state: {
                        registroExitoso:
                            true
                    }
                }
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "No se pudo crear la cuenta."
            );

        } finally {

            setLoading(false);
        }
    }

    return (
        <>
            <Navbar />

            <main className="register-page">

                <section className="register-card">

                    <span className="register-eyebrow">
                        CREAR CUENTA
                    </span>

                    <h1>
                        Registrate
                    </h1>

                    <p className="register-subtitle">
                        Creá tu cuenta para ver tus compras
                        y hacer seguimiento de tus pedidos.
                    </p>

                    <form
                        onSubmit={handleSubmit}
                        className="register-form"
                    >

                        <div className="register-field">

                            <label>
                                Nombre
                            </label>

                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) =>
                                    setNombre(
                                        e.target.value
                                    )
                                }
                                placeholder="Tu nombre"
                                autoComplete="name"
                            />

                        </div>

                        <div className="register-field">

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                value={username}
                                onChange={(e) =>
                                    setUsername(
                                        e.target.value
                                    )
                                }
                                placeholder="tu@email.com"
                                autoComplete="email"
                            />

                        </div>

                        <div className="register-field">

                            <label>
                                Contraseña
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="Mínimo 6 caracteres"
                                autoComplete="new-password"
                            />

                        </div>

                        <div className="register-field">

                            <label>
                                Repetir contraseña
                            </label>

                            <input
                                type="password"
                                value={
                                    repetirPassword
                                }
                                onChange={(e) =>
                                    setRepetirPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="Repetí tu contraseña"
                                autoComplete="new-password"
                            />

                        </div>

                        {error && (

                            <div className="register-error">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Creando cuenta..."
                                : "Crear cuenta"}
                        </button>

                    </form>

                    <div className="register-login">

                        <span>
                            ¿Ya tenés cuenta?
                        </span>

                        <Link to="/login">
                            Iniciar sesión
                        </Link>

                    </div>

                </section>

            </main>

            <Footer />
        </>
    );
}