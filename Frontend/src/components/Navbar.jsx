import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    getUsuario,
    isAuthenticated,
    isAdmin,
    logout
} from "../services/authService";

import "./Navbar.css";

export default function Navbar() {

    const navigate =
        useNavigate();

    const [
        open,
        setOpen
    ] = useState(false);

    const [
        autenticado,
        setAutenticado
    ] = useState(
        isAuthenticated()
    );

    const [
        usuario,
        setUsuario
    ] = useState(
        getUsuario()
    );

    const [
        admin,
        setAdmin
    ] = useState(
        isAdmin()
    );

    useEffect(() => {

        function actualizarSesion() {

            setAutenticado(
                isAuthenticated()
            );

            setUsuario(
                getUsuario()
            );

            setAdmin(
                isAdmin()
            );
        }

        window.addEventListener(
            "grenlus-auth-changed",
            actualizarSesion
        );

        window.addEventListener(
            "storage",
            actualizarSesion
        );

        return () => {

            window.removeEventListener(
                "grenlus-auth-changed",
                actualizarSesion
            );

            window.removeEventListener(
                "storage",
                actualizarSesion
            );
        };

    }, []);

    function cerrarSesion() {

        logout();

        setOpen(false);

        navigate("/");
    }

    function cerrarMenu() {

        setOpen(false);
    }

    return (

        <header
            className={
                `site-navbar ${
                    open
                        ? "open"
                        : ""
                }`
            }
        >

            <div className="navbar-inner">

                {/* =========================
                    LOGO
                ========================= */}

                <div className="navbar-left">

                    <Link
                        to="/"
                        className="logo"
                        onClick={cerrarMenu}
                    >
                        GRENLUS
                    </Link>

                </div>

                {/* =========================
                    NAVEGACIÓN
                ========================= */}

                <nav className="nav">

                    <ul>

                        <li>

                            <Link
                                to="/"
                                onClick={cerrarMenu}
                            >
                                Inicio
                            </Link>

                        </li>

                        <li>

                            <Link
                                to="/indumentaria"
                                onClick={cerrarMenu}
                            >
                                Indumentaria
                            </Link>

                        </li>

                        <li>

                            <Link
                                to="/carteleria"
                                onClick={cerrarMenu}
                            >
                                Cartelería
                            </Link>

                        </li>

                    </ul>

                </nav>

                {/* =========================
                    ACCIONES
                ========================= */}

                <div className="actions">

                    {autenticado ? (

                        <div className="navbar-user">

                            <span className="navbar-greeting">

                                Hola,

                                <strong>

                                    {usuario?.username ||
                                        "usuario"}

                                </strong>

                            </span>

                            {/* =========================
                                CLIENTE
                            ========================= */}

                            <Link
                                to="/mis-compras"
                                className="navbar-panel-button"
                                onClick={cerrarMenu}
                            >
                                Mis compras
                            </Link>

                            {/* =========================
                                SOLO ADMIN
                            ========================= */}

                            {admin && (

                                <Link
                                    to="/admin"
                                    className="navbar-panel-button"
                                    onClick={cerrarMenu}
                                >
                                    Mi panel
                                </Link>

                            )}

                            <button
                                type="button"
                                className="navbar-logout"
                                onClick={cerrarSesion}
                            >
                                Salir
                            </button>

                        </div>

                    ) : (

                        <Link
                            to="/login"
                            className="navbar-login"
                            onClick={cerrarMenu}
                        >
                            Iniciar sesión
                        </Link>

                    )}

                    {/* =========================
                        CARRITO
                    ========================= */}

                    <Link
                        to="/carrito"
                        className="navbar-cart"
                        aria-label="Ir al carrito"
                        title="Carrito"
                        onClick={cerrarMenu}
                    >

                        <svg
                            className="navbar-cart-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >

                            <path
                                d="M3 4H5L7.2 14.1C7.39 14.97 8.16 15.6 9.05 15.6H17.6C18.45 15.6 19.2 15.03 19.43 14.21L21 8.5H6.15"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            <circle
                                cx="9.5"
                                cy="19"
                                r="1.4"
                                fill="currentColor"
                            />

                            <circle
                                cx="18"
                                cy="19"
                                r="1.4"
                                fill="currentColor"
                            />

                        </svg>

                    </Link>

                    {/* =========================
                        BURGER
                    ========================= */}

                    <button
                        type="button"
                        className="burger"
                        aria-label="Abrir menú"
                        aria-expanded={open}
                        onClick={() =>
                            setOpen(
                                actual =>
                                    !actual
                            )
                        }
                    >

                        <span />
                        <span />
                        <span />

                    </button>

                </div>

            </div>

        </header>
    );
}