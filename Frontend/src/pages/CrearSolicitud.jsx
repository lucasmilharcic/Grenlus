import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
    getProducto
} from "../services/productoService";

import {
    crearSolicitud
} from "../services/solicitudService";

import "./CrearSolicitud.css";

const API_URL =
    "http://localhost:8081";

export default function CrearSolicitud() {

    const { productoId } =
        useParams();

    const [producto, setProducto] =
        useState(null);

    const [nombreCliente, setNombreCliente] =
        useState("");

    const [telefono, setTelefono] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [ciudad, setCiudad] =
        useState("");

    const [cantidad, setCantidad] =
        useState("");

    const [talle, setTalle] =
        useState("");

    const [color, setColor] =
        useState("");

    const [descripcion, setDescripcion] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [enviando, setEnviando] =
        useState(false);

    const [error, setError] =
        useState("");

    const [mensaje, setMensaje] =
        useState("");

    // =====================================================
    // CARGAR PRODUCTO
    // =====================================================

    useEffect(() => {

        async function cargarProducto() {

            try {

                setLoading(true);
                setError("");

                const data =
                    await getProducto(
                        productoId
                    );

                setProducto(data);

            } catch (err) {

                console.error(err);

                setError(
                    "No se pudo cargar el producto."
                );

            } finally {

                setLoading(false);
            }
        }

        cargarProducto();

    }, [productoId]);

    // =====================================================
    // ENVIAR SOLICITUD
    // =====================================================

    async function handleSubmit(e) {

        e.preventDefault();

        setError("");
        setMensaje("");

        if (!nombreCliente.trim()) {

            setError(
                "Ingresá tu nombre."
            );

            return;
        }

        if (!telefono.trim()) {

            setError(
                "Ingresá un número de teléfono o WhatsApp."
            );

            return;
        }

        if (!descripcion.trim()) {

            setError(
                "Contanos qué necesitás y agregá las medidas aproximadas si corresponde."
            );

            return;
        }

        try {

            setEnviando(true);

            await crearSolicitud({

                productoId:
                    Number(productoId),

                nombreCliente:
                    nombreCliente.trim(),

                telefono:
                    telefono.trim(),

                email:
                    email.trim(),

                ciudad:
                    ciudad.trim(),

                cantidad:
                    cantidad
                        ? Number(cantidad)
                        : null,

                talle:
                    talle.trim(),

                color:
                    color.trim(),

                descripcion:
                    descripcion.trim()
            });

            setMensaje(
                "¡Solicitud enviada correctamente! Nos vamos a comunicar con vos."
            );

            setNombreCliente("");
            setTelefono("");
            setEmail("");
            setCiudad("");
            setCantidad("");
            setTalle("");
            setColor("");
            setDescripcion("");

        } catch (err) {

            console.error(
                "Error creando solicitud:",
                err
            );

            setError(
                err.message ||
                "No se pudo enviar la solicitud."
            );

        } finally {

            setEnviando(false);
        }
    }

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <>
                <Navbar />

                <main className="solicitud-page">

                    <div className="solicitud-container">

                        <p>
                            Cargando producto...
                        </p>

                    </div>

                </main>

                <Footer />
            </>
        );
    }

    // =====================================================
    // PRODUCTO NO ENCONTRADO
    // =====================================================

    if (!producto) {

        return (
            <>
                <Navbar />

                <main className="solicitud-page">

                    <div className="solicitud-container">

                        <h1>
                            Producto no encontrado
                        </h1>

                        <p>
                            {error}
                        </p>

                        <Link to="/">
                            Volver al inicio
                        </Link>

                    </div>

                </main>

                <Footer />
            </>
        );
    }

    // =====================================================
    // IMAGEN
    // =====================================================

    const imagen =
        producto.imagenPrincipal ||
        producto.imagen ||
        null;

    const imagenUrl = imagen
        ? imagen.startsWith("http")
            ? imagen
            : `${API_URL}${imagen.startsWith("/")
                ? ""
                : "/"}${imagen}`
        : null;

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <>
            <Navbar />

            <main className="solicitud-page">

                <div className="solicitud-container">

                    {/* ======================================
                        HEADER
                    ====================================== */}

                    <header className="solicitud-header">

                        <span>
                            SOLICITUD DE PRESUPUESTO
                        </span>

                        <h1>
                            {producto.nombre}
                        </h1>

                        <p>
                            Completá tus datos y contanos
                            qué necesitás. Te contactaremos
                            para preparar un presupuesto.
                        </p>

                    </header>

                    {/* ======================================
                        PRODUCTO
                    ====================================== */}

                    <div className="solicitud-producto">

                        <div className="solicitud-producto-image">

                            {imagenUrl ? (

                                <img
                                    src={imagenUrl}
                                    alt={producto.nombre}
                                />

                            ) : (

                                <span>
                                    Sin imagen
                                </span>

                            )}

                        </div>

                        <div>

                            <strong>
                                {producto.nombre}
                            </strong>

                            <p>
                                Cotización personalizada
                            </p>

                        </div>

                    </div>

                    {/* ======================================
                        FORMULARIO
                    ====================================== */}

                    <form
                        className="solicitud-form"
                        onSubmit={handleSubmit}
                    >

                        {/* ==================================
                            DATOS DEL CLIENTE
                        ================================== */}

                        <section className="form-section">

                            <div className="form-section-heading">

                                <span>
                                    01
                                </span>

                                <div>
                                    <h2>
                                        Tus datos
                                    </h2>

                                    <p>
                                        Necesitamos estos datos
                                        para poder contactarte.
                                    </p>
                                </div>

                            </div>

                            <div className="form-grid">

                                <div className="form-group">

                                    <label>
                                        Nombre *
                                    </label>

                                    <input
                                        type="text"
                                        value={nombreCliente}
                                        onChange={(e) =>
                                            setNombreCliente(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Tu nombre"
                                        required
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Teléfono / WhatsApp *
                                    </label>

                                    <input
                                        type="tel"
                                        value={telefono}
                                        onChange={(e) =>
                                            setTelefono(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Ej: 11 1234 5678"
                                        required
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(
                                                e.target.value
                                            )
                                        }
                                        placeholder="tu@email.com"
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Ciudad
                                    </label>

                                    <input
                                        type="text"
                                        value={ciudad}
                                        onChange={(e) =>
                                            setCiudad(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Tu ciudad"
                                    />

                                </div>

                            </div>

                        </section>

                        {/* ==================================
                            PEDIDO
                        ================================== */}

                        <section className="form-section">

                            <div className="form-section-heading">

                                <span>
                                    02
                                </span>

                                <div>

                                    <h2>
                                        Sobre el pedido
                                    </h2>

                                    <p>
                                        Indicá las características
                                        que necesitamos conocer.
                                    </p>

                                </div>

                            </div>

                            <div className="form-grid">

                                <div className="form-group">

                                    <label>
                                        Cantidad
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        value={cantidad}
                                        onChange={(e) =>
                                            setCantidad(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Ej: 10"
                                    />

                                </div>

                                {producto.usaTalles && (

                                    <div className="form-group">

                                        <label>
                                            Talle
                                        </label>

                                        <input
                                            type="text"
                                            value={talle}
                                            onChange={(e) =>
                                                setTalle(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Ej: M"
                                        />

                                    </div>

                                )}

                                {producto.usaColores && (

                                    <div className="form-group">

                                        <label>
                                            Color
                                        </label>

                                        <input
                                            type="text"
                                            value={color}
                                            onChange={(e) =>
                                                setColor(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Ej: Negro"
                                        />

                                    </div>

                                )}

                            </div>

                        </section>

                        {/* ==================================
                            DETALLES
                        ================================== */}

                        <section className="form-section">

                            <div className="form-section-heading">

                                <span>
                                    03
                                </span>

                                <div>

                                    <h2>
                                        Detalles del pedido
                                    </h2>

                                    <p>
                                        Cuantos más detalles nos
                                        des, mejor podremos
                                        preparar el presupuesto.
                                    </p>

                                </div>

                            </div>

                            <div className="form-group">

                                <label>
                                    ¿Qué necesitás? *
                                </label>

                                <textarea
                                    value={descripcion}
                                    onChange={(e) =>
                                        setDescripcion(
                                            e.target.value
                                        )
                                    }
                                    rows="8"
                                    placeholder={
                                        "Contanos qué necesitás.\n\n" +
                                        "Si corresponde, indicá las medidas aproximadas.\n\n" +
                                        "Ejemplo: cartel de aproximadamente 2 metros de ancho x 80 cm de alto, para colocar en el frente del local."
                                    }
                                    required
                                />

                                <small>
                                    Podés indicar medidas,
                                    cantidades, colores,
                                    ubicación, tipo de
                                    personalización y cualquier
                                    otro detalle importante.
                                </small>

                            </div>

                        </section>

                        {/* ==================================
                            MENSAJES
                        ================================== */}

                        {error && (

                            <div className="solicitud-message error">
                                {error}
                            </div>

                        )}

                        {mensaje && (

                            <div className="solicitud-message success">
                                {mensaje}
                            </div>

                        )}

                        {/* ==================================
                            ACCIONES
                        ================================== */}

                        <div className="solicitud-actions">

                            <Link
                                to={`/producto/${productoId}`}
                                className="btn-secondary"
                            >
                                Volver al producto
                            </Link>

                            <button
                                type="submit"
                                disabled={enviando}
                            >
                                {enviando
                                    ? "Enviando..."
                                    : "Enviar solicitud"}
                            </button>

                        </div>

                    </form>

                </div>

            </main>

            <Footer />
        </>
    );
}