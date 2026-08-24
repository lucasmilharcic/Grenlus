import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { useCarrito } from "../context/CarritoContext";

import "./Carrito.css";

const API_URL = "http://localhost:8081";

function formatearPrecio(valor) {

    return new Intl.NumberFormat(
        "es-AR",
        {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0
        }
    ).format(Number(valor || 0));
}

function obtenerImagenUrl(item) {

    const imagen =
        item.imagenPrincipal ||
        item.imagen ||
        null;

    if (!imagen) {
        return null;
    }

    if (imagen.startsWith("http")) {
        return imagen;
    }

    return `${API_URL}${
        imagen.startsWith("/")
            ? ""
            : "/"
    }${imagen}`;
}

export default function Carrito() {

    const {
        items,
        eliminarDelCarrito,
        actualizarCantidad,
        total
    } = useCarrito();

    return (
        <>
            <Navbar />

            <main className="carrito-page">

                <div className="carrito-container">

                    <header className="carrito-header">

                        <span className="carrito-eyebrow">
                            GRENLUS
                        </span>

                        <h1>
                            Tu carrito
                        </h1>

                        <p>
                            Revisá tus productos personalizados antes de continuar con el pago.
                        </p>

                    </header>

                    {items.length === 0 ? (

                        <section className="carrito-vacio">

                            <div className="carrito-vacio-icon">
                                🛒
                            </div>

                            <h2>
                                Tu carrito está vacío
                            </h2>

                            <p>
                                Elegí un producto y personalizalo para comenzar.
                            </p>

                            <Link
                                to="/indumentaria"
                                className="carrito-btn-primary"
                            >
                                Ver productos
                            </Link>

                        </section>

                    ) : (

                        <div className="carrito-layout">

                            <section className="carrito-items">

                                {items.map((item) => {

                                    const imagenUrl =
                                        obtenerImagenUrl(item);

                                    const subtotal =
                                        Number(
                                            item.precioUnitario || 0
                                        ) *
                                        Number(
                                            item.cantidad || 1
                                        );

                                    return (

                                        <article
                                            className="carrito-item"
                                            key={item.carritoId}
                                        >

                                            <div className="carrito-item-media">

                                                {imagenUrl ? (

                                                    <img
                                                        src={imagenUrl}
                                                        alt={item.nombre}
                                                    />

                                                ) : (

                                                    <div className="carrito-sin-imagen">
                                                        Sin imagen
                                                    </div>

                                                )}

                                            </div>

                                            <div className="carrito-item-info">

                                                <div className="carrito-item-top">

                                                    <div>

                                                        <span className="carrito-item-category">
                                                            {item.tipo === "carteleria"
                                                                ? "Cartelería"
                                                                : "Indumentaria"}
                                                        </span>

                                                        <h2>
                                                            {item.nombre}
                                                        </h2>

                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="carrito-eliminar"
                                                        onClick={() =>
                                                            eliminarDelCarrito(
                                                                item.carritoId
                                                            )
                                                        }
                                                    >
                                                        Eliminar
                                                    </button>

                                                </div>

                                                <div className="carrito-config">

                                                    {item.talle && (
                                                        <span>
                                                            Talle:
                                                            <strong>
                                                                {" "}
                                                                {item.talle}
                                                            </strong>
                                                        </span>
                                                    )}

                                                    {item.color && (
                                                        <span>
                                                            Color:
                                                            <strong>
                                                                {" "}
                                                                {item.color}
                                                            </strong>
                                                        </span>
                                                    )}

                                                    {item.tamanoEstampa && (
                                                        <span>
                                                            Estampa:
                                                            <strong>
                                                                {" "}
                                                                {item.tamanoEstampa}
                                                            </strong>
                                                        </span>
                                                    )}

                                                    {item.medida && (
                                                        <span>
                                                            Medida:
                                                            <strong>
                                                                {" "}
                                                                {item.medida}
                                                            </strong>
                                                        </span>
                                                    )}

                                                </div>

                                                {item.disenos?.length > 0 && (

                                                    <div className="carrito-disenos">

                                                        {item.disenos.map(
                                                            (diseno, index) => (

                                                                <div
                                                                    className="carrito-diseno"
                                                                    key={`${item.carritoId}-diseno-${index}`}
                                                                >

                                                                    {diseno.previewUrl && (

                                                                        <img
                                                                            src={diseno.previewUrl}
                                                                            alt="Diseño personalizado"
                                                                        />

                                                                    )}

                                                                    <div>

                                                                        <strong>
                                                                            Diseño {index + 1}
                                                                        </strong>

                                                                        <span>
                                                                            {diseno.posicion || "Diseño"}
                                                                            {diseno.tamano
                                                                                ? ` · ${diseno.tamano}`
                                                                                : ""}
                                                                        </span>

                                                                    </div>

                                                                </div>

                                                            )
                                                        )}

                                                    </div>

                                                )}

                                                <div className="carrito-item-bottom">

                                                    <div className="carrito-cantidad">

                                                        <label>
                                                            Cantidad
                                                        </label>

                                                        <div className="cantidad-control">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    actualizarCantidad(
                                                                        item.carritoId,
                                                                        Number(item.cantidad) - 1
                                                                    )
                                                                }
                                                            >
                                                                −
                                                            </button>

                                                            <span>
                                                                {item.cantidad}
                                                            </span>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    actualizarCantidad(
                                                                        item.carritoId,
                                                                        Number(item.cantidad) + 1
                                                                    )
                                                                }
                                                            >
                                                                +
                                                            </button>

                                                        </div>

                                                    </div>

                                                    <div className="carrito-item-precio">

                                                        <small>
                                                            {formatearPrecio(
                                                                item.precioUnitario
                                                            )} c/u
                                                        </small>

                                                        <strong>
                                                            {formatearPrecio(
                                                                subtotal
                                                            )}
                                                        </strong>

                                                    </div>

                                                </div>

                                            </div>

                                        </article>

                                    );
                                })}

                            </section>

                            <aside className="carrito-resumen">

                                <span className="resumen-eyebrow">
                                    RESUMEN
                                </span>

                                <h2>
                                    Tu pedido
                                </h2>

                                <div className="resumen-linea">

                                    <span>
                                        Productos
                                    </span>

                                    <span>
                                        {items.reduce(
                                            (totalItems, item) =>
                                                totalItems +
                                                Number(item.cantidad || 0),
                                            0
                                        )}
                                    </span>

                                </div>

                                <div className="resumen-total">

                                    <span>
                                        Total estimado
                                    </span>

                                    <strong>
                                        {formatearPrecio(total)}
                                    </strong>

                                </div>

                                <p className="resumen-aclaracion">
                                    El precio final vuelve a ser verificado por el servidor al confirmar el pedido.
                                </p>

                                <Link
                                    to="/checkout"
                                    className="carrito-checkout"
                                >
                                    Continuar al pago
                                </Link>

                                <Link
                                    to="/indumentaria"
                                    className="carrito-seguir"
                                >
                                    Seguir comprando
                                </Link>

                            </aside>

                        </div>

                    )}

                </div>

            </main>

            <Footer />
        </>
    );
}