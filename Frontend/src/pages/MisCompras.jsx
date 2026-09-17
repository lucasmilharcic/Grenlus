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

// =====================================================
// ENVÍO
// =====================================================

const PASOS_ENVIO = [
    {
        estado: "PENDIENTE",
        titulo: "Recibido"
    },
    {
        estado: "PREPARANDO",
        titulo: "En preparación"
    },
    {
        estado: "DESPACHADO",
        titulo: "Despachado"
    },
    {
        estado: "ENTREGADO",
        titulo: "Entregado"
    }
];

function textoEntrega(valor) {

    if (valor === "ENVIO_DOMICILIO") {
        return "Envío a domicilio";
    }

    if (valor === "RETIRO") {
        return "Retiro en el local";
    }

    if (valor === "COORDINAR") {
        return "A coordinar";
    }

    return "Entrega";
}

function SeguimientoEnvio({
    pedido
}) {

    if (
        pedido.metodoEntrega !==
        "ENVIO_DOMICILIO"
    ) {

        return (

            <div className="mi-compra-envio">

                <span className="mi-compra-envio-titulo">
                    {textoEntrega(
                        pedido.metodoEntrega
                    )}
                </span>

                <p className="mi-compra-envio-nota">
                    Te avisamos cuando tu pedido
                    esté listo.
                </p>

            </div>
        );
    }

    const pasoActual =
        PASOS_ENVIO.findIndex(
            paso =>
                paso.estado ===
                pedido.estadoEnvio
        );

    return (

        <div className="mi-compra-envio">

            <div className="mi-compra-envio-top">

                <span className="mi-compra-envio-titulo">
                    Envío a domicilio
                </span>

                <span
                    className={`mi-compra-envio-estado ${pedido.estadoEnvio || ""}`}
                >
                    {textoEstado(
                        pedido.estadoEnvio
                    )}
                </span>

            </div>

            <ol className="mi-compra-pasos">

                {PASOS_ENVIO.map(
                    (paso, indice) => (

                    <li
                        key={paso.estado}
                        className={
                            indice <= pasoActual
                                ? "completo"
                                : ""
                        }
                    >
                        <span />
                        {paso.titulo}
                    </li>
                ))}

            </ol>

            <div className="mi-compra-envio-datos">

                {pedido.carrierEnvioNombre && (

                    <span>
                        Transporte:{" "}
                        <strong>
                            {pedido.carrierEnvioNombre}
                            {pedido.serviceNombreEnvio
                                ? ` - ${pedido.serviceNombreEnvio}`
                                : ""}
                        </strong>
                    </span>
                )}

                {pedido.direccion && (

                    <span>
                        Destino:{" "}
                        <strong>
                            {[
                                pedido.direccion,
                                pedido.ciudad,
                                pedido.provincia
                            ]
                                .filter(Boolean)
                                .join(", ")}
                        </strong>
                    </span>
                )}

                <span>
                    Costo del envío:{" "}
                    <strong>
                        {moneda(
                            pedido.costoEnvio
                        )}
                    </strong>
                </span>

                {pedido.codigoSeguimiento && (

                    <span>
                        Seguimiento:{" "}
                        <strong>
                            {pedido.codigoSeguimiento}
                        </strong>
                    </span>
                )}

                {pedido.fechaDespacho && (

                    <span>
                        Despachado:{" "}
                        <strong>
                            {fecha(
                                pedido.fechaDespacho
                            )}
                        </strong>
                    </span>
                )}

                {pedido.fechaEntrega && (

                    <span>
                        Entregado:{" "}
                        <strong>
                            {fecha(
                                pedido.fechaEntrega
                            )}
                        </strong>
                    </span>
                )}

            </div>

        </div>
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

                                <SeguimientoEnvio
                                    pedido={pedido}
                                />

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