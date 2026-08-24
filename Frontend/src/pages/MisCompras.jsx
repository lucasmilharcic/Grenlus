import {
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
    getMisCompras
} from "../services/pedidoService";

import "./MisCompras.css";

function moneda(valor) {

    return new Intl.NumberFormat(
        "es-AR",
        {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0
        }
    ).format(
        Number(valor || 0)
    );
}

function fecha(valor) {

    if (!valor) {
        return "";
    }

    try {

        return new Intl.DateTimeFormat(
            "es-AR",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        ).format(
            new Date(valor)
        );

    } catch {

        return valor;
    }
}

function textoEstado(valor) {

    if (!valor) {
        return "Sin estado";
    }

    return String(valor)
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(
            /^\w/,
            letra =>
                letra.toUpperCase()
        );
}

export default function MisCompras() {

    const [
        pedidos,
        setPedidos
    ] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState("");

    useEffect(() => {

        cargar();

    }, []);

    async function cargar() {

        try {

            setLoading(true);
            setError("");

            const data =
                await getMisCompras();

            setPedidos(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "No se pudieron cargar tus compras."
            );

        } finally {

            setLoading(false);
        }
    }

    return (
        <>
            <Navbar />

            <main className="mis-compras">

                <header className="mis-compras-header">

                    <span>
                        TU CUENTA
                    </span>

                    <h1>
                        Mis compras
                    </h1>

                    <p>
                        Revisá el estado de tus pedidos
                        y pagos.
                    </p>

                </header>

                {loading && (

                    <div className="mis-compras-state">
                        Cargando compras...
                    </div>
                )}

                {!loading && error && (

                    <div className="mis-compras-state error">

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={cargar}
                        >
                            Reintentar
                        </button>

                    </div>
                )}

                {!loading &&
                    !error &&
                    pedidos.length === 0 && (

                    <div className="mis-compras-state">

                        <h2>
                            Todavía no tenés compras
                        </h2>

                        <p>
                            Cuando hagas un pedido
                            aparecerá acá.
                        </p>

                        <Link
                            to="/indumentaria"
                        >
                            Ver productos
                        </Link>

                    </div>
                )}

                {!loading &&
                    !error &&
                    pedidos.length > 0 && (

                    <section className="mis-compras-list">

                        {pedidos.map(
                            pedido => (

                            <article
                                key={pedido.id}
                                className="mi-compra-card"
                            >

                                <div className="mi-compra-top">

                                    <div>

                                        <span className="mi-compra-numero">
                                            Pedido #{pedido.id}
                                        </span>

                                        <h2>
                                            {fecha(
                                                pedido.fechaPedido
                                            )}
                                        </h2>

                                    </div>

                                    <strong>
                                        {moneda(
                                            pedido.total
                                        )}
                                    </strong>

                                </div>

                                <div className="mi-compra-estados">

                                    <span>
                                        Pago:{" "}
                                        <strong>
                                            {textoEstado(
                                                pedido.estadoPago
                                            )}
                                        </strong>
                                    </span>

                                    <span>
                                        Pedido:{" "}
                                        <strong>
                                            {textoEstado(
                                                pedido.estado
                                            )}
                                        </strong>
                                    </span>

                                </div>

                                <div className="mi-compra-productos">

                                    {(pedido.detalles || [])
                                        .map(
                                            detalle => (

                                        <div
                                            key={detalle.id}
                                            className="mi-compra-producto"
                                        >

                                            <div>

                                                <strong>
                                                    {detalle.productoNombre ||
                                                        `Producto #${detalle.productoId}`}
                                                </strong>

                                                <span>
                                                    Cantidad:{" "}
                                                    {detalle.cantidad}
                                                </span>

                                                {detalle.talle && (
                                                    <span>
                                                        Talle:{" "}
                                                        {detalle.talle}
                                                    </span>
                                                )}

                                                {detalle.color && (
                                                    <span>
                                                        Color:{" "}
                                                        {detalle.color}
                                                    </span>
                                                )}

                                            </div>

                                            <strong>
                                                {moneda(
                                                    detalle.subtotal
                                                )}
                                            </strong>

                                        </div>
                                    ))}

                                </div>

                                {pedido.estadoPago ===
                                    "PENDIENTE" &&
                                    pedido.metodoPago ===
                                    "MERCADO_PAGO" &&
                                    pedido.mercadoPagoUrl && (

                                    <a
                                        href={
                                            pedido.mercadoPagoUrl
                                        }
                                        className="continuar-pago"
                                    >
                                        Continuar pago
                                    </a>
                                )}

                            </article>
                        ))}

                    </section>
                )}

            </main>

            <Footer />
        </>
    );
}