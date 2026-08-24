import {
    useEffect,
    useMemo,
    useState
} from "react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import {
    getPedidos,
    aprobarTransferencia,
    rechazarTransferencia,
    obtenerUrlArchivoPedido
} from "../../services/pedidoService";

import "./PedidosAdmin.css";

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

function formatearFecha(fecha) {

    if (!fecha) {
        return "Sin fecha";
    }

    try {

        return new Intl.DateTimeFormat(
            "es-AR",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        ).format(
            new Date(fecha)
        );

    } catch {

        return fecha;
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

function MockupDiseno({
    diseno
}) {

    const imagenBase =
        obtenerUrlArchivoPedido(
            diseno.rutaImagenBase ||
            diseno.rutaMockup
        );

    const imagenDiseno =
        obtenerUrlArchivoPedido(
            diseno.rutaImagen
        );

    if (
        !imagenBase &&
        !imagenDiseno
    ) {
        return null;
    }

    return (

        <div className="pedido-diseno-preview">

            {imagenBase ? (

                <div className="pedido-mockup">

                    <img
                        src={imagenBase}
                        alt="Mockup base"
                        className="pedido-mockup-base"
                    />

                    {imagenDiseno && (

                        <img
                            src={imagenDiseno}
                            alt="Diseño del cliente"
                            className="pedido-mockup-diseno"
                            style={{
                                left:
                                    `${Number(
                                        diseno.posicionX ||
                                        0
                                    )}%`,

                                top:
                                    `${Number(
                                        diseno.posicionY ||
                                        0
                                    )}%`,

                                width:
                                    `${Number(
                                        diseno.ancho ||
                                        15
                                    )}%`,

                                height:
                                    `${Number(
                                        diseno.alto ||
                                        15
                                    )}%`
                            }}
                        />

                    )}

                </div>

            ) : (

                <div className="pedido-original-solo">

                    <img
                        src={imagenDiseno}
                        alt="Diseño original"
                    />

                </div>
            )}

        </div>
    );
}

export default function PedidosAdmin() {

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

    const [
        procesandoId,
        setProcesandoId
    ] = useState(null);

    const [
        filtro,
        setFiltro
    ] = useState("TODOS");

    const [
        mensajeAccion,
        setMensajeAccion
    ] = useState("");

    // =====================================================
    // CARGAR
    // =====================================================

    async function cargarPedidos() {

        try {

            setLoading(true);
            setError("");

            const data =
                await getPedidos();

            const lista =
                Array.isArray(data)
                    ? [...data]
                    : [];

            lista.sort(
                (a, b) =>
                    Number(b.id || 0) -
                    Number(a.id || 0)
            );

            setPedidos(lista);

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "No se pudieron cargar los pedidos."
            );

        } finally {

            setLoading(false);
        }
    }

    useEffect(() => {

        cargarPedidos();

    }, []);

    // =====================================================
    // FILTROS
    // =====================================================

    const pedidosFiltrados =
        useMemo(() => {

            if (filtro === "TODOS") {
                return pedidos;
            }

            if (filtro === "PENDIENTES") {

                return pedidos.filter(
                    pedido =>
                        pedido.estadoPago ===
                        "PENDIENTE"
                );
            }

            if (filtro === "APROBADOS") {

                return pedidos.filter(
                    pedido =>
                        pedido.estadoPago ===
                        "APROBADO"
                );
            }

            if (filtro === "RECHAZADOS") {

                return pedidos.filter(
                    pedido =>
                        pedido.estadoPago ===
                        "RECHAZADO"
                );
            }

            if (filtro === "PAGADOS") {

                return pedidos.filter(
                    pedido =>
                        pedido.estado ===
                        "PAGADO"
                );
            }

            return pedidos;

        }, [
            pedidos,
            filtro
        ]);

    function contarPorPago(
        estado
    ) {

        return pedidos.filter(
            pedido =>
                pedido.estadoPago ===
                estado
        ).length;
    }

    // =====================================================
    // APROBAR
    // =====================================================

    async function handleAprobar(
        pedido
    ) {

        const confirmar =
            window.confirm(
                `¿Aprobar el pago del pedido #${pedido.id}?`
            );

        if (!confirmar) {
            return;
        }

        try {

            setProcesandoId(
                pedido.id
            );

            setMensajeAccion("");

            await aprobarTransferencia(
                pedido.id
            );

            setMensajeAccion(
                `Pago del pedido #${pedido.id} aprobado correctamente.`
            );

            await cargarPedidos();

        } catch (err) {

            console.error(err);

            setMensajeAccion(
                err.message ||
                "No se pudo aprobar el pago."
            );

        } finally {

            setProcesandoId(null);
        }
    }

    // =====================================================
    // RECHAZAR
    // =====================================================

    async function handleRechazar(
        pedido
    ) {

        const confirmar =
            window.confirm(
                `¿Rechazar el comprobante del pedido #${pedido.id}?`
            );

        if (!confirmar) {
            return;
        }

        try {

            setProcesandoId(
                pedido.id
            );

            setMensajeAccion("");

            await rechazarTransferencia(
                pedido.id
            );

            setMensajeAccion(
                `Pago del pedido #${pedido.id} rechazado.`
            );

            await cargarPedidos();

        } catch (err) {

            console.error(err);

            setMensajeAccion(
                err.message ||
                "No se pudo rechazar el pago."
            );

        } finally {

            setProcesandoId(null);
        }
    }

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <>
            <Navbar />

            <main className="pedidos-admin">

                <header className="pedidos-admin-header">

                    <div>

                        <span className="pedidos-eyebrow">
                            VENTAS
                        </span>

                        <h1>
                            Pedidos
                        </h1>

                        <p>
                            Revisá compras, pagos,
                            comprobantes, mockups
                            y archivos originales.
                        </p>

                    </div>

                    <div className="pedidos-count">
                        {pedidos.length} pedidos
                    </div>

                </header>

                {/* =================================================
                    FILTROS
                ================================================= */}

                <div className="pedidos-filtros">

                    <button
                        type="button"
                        className={
                            filtro === "TODOS"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setFiltro(
                                "TODOS"
                            )
                        }
                    >
                        Todos
                        <span>
                            {pedidos.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        className={
                            filtro === "PENDIENTES"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setFiltro(
                                "PENDIENTES"
                            )
                        }
                    >
                        Pendientes

                        <span>
                            {contarPorPago(
                                "PENDIENTE"
                            )}
                        </span>
                    </button>

                    <button
                        type="button"
                        className={
                            filtro === "APROBADOS"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setFiltro(
                                "APROBADOS"
                            )
                        }
                    >
                        Aprobados

                        <span>
                            {contarPorPago(
                                "APROBADO"
                            )}
                        </span>
                    </button>

                    <button
                        type="button"
                        className={
                            filtro === "RECHAZADOS"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setFiltro(
                                "RECHAZADOS"
                            )
                        }
                    >
                        Rechazados

                        <span>
                            {contarPorPago(
                                "RECHAZADO"
                            )}
                        </span>
                    </button>

                </div>

                {mensajeAccion && (

                    <div className="pedido-mensaje-accion">

                        {mensajeAccion}

                    </div>
                )}

                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (

                    <div className="pedidos-state">
                        Cargando pedidos...
                    </div>
                )}

                {!loading && error && (

                    <div className="pedidos-state error">

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={
                                cargarPedidos
                            }
                        >
                            Reintentar
                        </button>

                    </div>
                )}

                {!loading &&
                    !error &&
                    pedidosFiltrados.length === 0 && (

                    <div className="pedidos-state">

                        No hay pedidos en esta sección.

                    </div>
                )}

                {/* =================================================
                    PEDIDOS
                ================================================= */}

                {!loading &&
                    !error &&
                    pedidosFiltrados.length > 0 && (

                    <section className="pedidos-list">

                        {pedidosFiltrados.map(
                            pedido => {

                                const comprobanteUrl =
                                    obtenerUrlArchivoPedido(
                                        pedido
                                            .comprobanteTransferencia
                                    );

                                const esTransferencia =
                                    pedido.metodoPago ===
                                    "TRANSFERENCIA";

                                return (

                                    <article
                                        key={pedido.id}
                                        className="pedido-card"
                                    >

                                        {/* HEADER */}

                                        <div className="pedido-card-top">

                                            <div>

                                                <span className="pedido-numero">
                                                    Pedido #{pedido.id}
                                                </span>

                                                <h2>
                                                    {pedido.nombreCliente ||
                                                        "Cliente"}
                                                </h2>

                                                <span className="pedido-fecha">

                                                    {formatearFecha(
                                                        pedido.fechaPedido
                                                    )}

                                                </span>

                                            </div>

                                            <strong className="pedido-total">

                                                {moneda(
                                                    pedido.total
                                                )}

                                            </strong>

                                        </div>

                                        {/* ESTADOS */}

                                        <div className="pedido-estados">

                                            <span className="estado-badge">

                                                Pedido:{" "}

                                                {textoEstado(
                                                    pedido.estado
                                                )}

                                            </span>

                                            <span
                                                className={
                                                    `estado-badge pago ${
                                                        String(
                                                            pedido.estadoPago ||
                                                            ""
                                                        ).toLowerCase()
                                                    }`
                                                }
                                            >

                                                Pago:{" "}

                                                {textoEstado(
                                                    pedido.estadoPago
                                                )}

                                            </span>

                                            <span className="estado-badge metodo">

                                                {pedido.metodoPago ===
                                                "TRANSFERENCIA"
                                                    ? "Transferencia"
                                                    : "Mercado Pago"}

                                            </span>

                                        </div>

                                        {/* CLIENTE */}

                                        <div className="pedido-cliente-grid">

                                            <div>

                                                <span>
                                                    WhatsApp
                                                </span>

                                                <strong>
                                                    {pedido.telefono ||
                                                        "No informado"}
                                                </strong>

                                            </div>

                                            <div>

                                                <span>
                                                    Email
                                                </span>

                                                <strong>
                                                    {pedido.email ||
                                                        "No informado"}
                                                </strong>

                                            </div>

                                            <div>

                                                <span>
                                                    Ciudad
                                                </span>

                                                <strong>
                                                    {pedido.ciudad ||
                                                        "No informada"}
                                                </strong>

                                            </div>

                                            <div>

                                                <span>
                                                    Dirección
                                                </span>

                                                <strong>
                                                    {pedido.direccion ||
                                                        "No informada"}
                                                </strong>

                                            </div>

                                        </div>

                                        {/* =================================================
                                            PRODUCTOS
                                        ================================================= */}

                                        <div className="pedido-productos">

                                            <h3>
                                                Productos
                                            </h3>

                                            {(pedido.detalles || [])
                                                .map(
                                                    detalle => (

                                                    <div
                                                        key={
                                                            detalle.id
                                                        }
                                                        className="pedido-detalle-completo"
                                                    >

                                                        <div className="pedido-producto">

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

                                                                {detalle.tamanoEstampa && (

                                                                    <span>

                                                                        Categoría de estampa:{" "}

                                                                        {textoEstado(
                                                                            detalle.tamanoEstampa
                                                                        )}

                                                                    </span>

                                                                )}

                                                            </div>

                                                            <strong>

                                                                {moneda(
                                                                    detalle.subtotal
                                                                )}

                                                            </strong>

                                                        </div>

                                                        {/* =================================
                                                            DISEÑOS DEL PRODUCTO
                                                        ================================= */}

                                                        {(detalle.disenos || [])
                                                            .length > 0 && (

                                                            <div className="pedido-disenos">

                                                                <h4>
                                                                    Diseños del cliente
                                                                </h4>

                                                                <div className="pedido-disenos-grid">

                                                                    {detalle.disenos.map(
                                                                        diseno => {

                                                                            const originalUrl =
                                                                                obtenerUrlArchivoPedido(
                                                                                    diseno.rutaImagen
                                                                                );

                                                                            const baseUrl =
                                                                                obtenerUrlArchivoPedido(
                                                                                    diseno.rutaImagenBase
                                                                                );

                                                                            return (

                                                                                <div
                                                                                    key={
                                                                                        diseno.id
                                                                                    }
                                                                                    className="pedido-diseno-card"
                                                                                >

                                                                                    <div className="pedido-diseno-header">

                                                                                        <strong>

                                                                                            {textoEstado(
                                                                                                diseno.posicion
                                                                                            )}

                                                                                        </strong>

                                                                                        {diseno.tamano && (

                                                                                            <span>

                                                                                                {textoEstado(
                                                                                                    diseno.tamano
                                                                                                )}

                                                                                            </span>

                                                                                        )}

                                                                                    </div>

                                                                                    <MockupDiseno
                                                                                        diseno={
                                                                                            diseno
                                                                                        }
                                                                                    />

                                                                                    <div className="pedido-diseno-actions">

                                                                                        {originalUrl && (

                                                                                            <>
                                                                                                <a
                                                                                                    href={
                                                                                                        originalUrl
                                                                                                    }
                                                                                                    target="_blank"
                                                                                                    rel="noreferrer"
                                                                                                >
                                                                                                    Ver original
                                                                                                </a>

                                                                                                <a
                                                                                                    href={
                                                                                                        originalUrl
                                                                                                    }
                                                                                                    download
                                                                                                >
                                                                                                    Descargar original
                                                                                                </a>
                                                                                            </>
                                                                                        )}

                                                                                        {baseUrl && (

                                                                                            <a
                                                                                                href={
                                                                                                    baseUrl
                                                                                                }
                                                                                                target="_blank"
                                                                                                rel="noreferrer"
                                                                                            >
                                                                                                Ver foto base
                                                                                            </a>

                                                                                        )}

                                                                                    </div>

                                                                                    {diseno.observaciones && (

                                                                                        <p className="pedido-diseno-observaciones">

                                                                                            {diseno.observaciones}

                                                                                        </p>

                                                                                    )}

                                                                                </div>
                                                                            );
                                                                        }
                                                                    )}

                                                                </div>

                                                            </div>
                                                        )}

                                                    </div>
                                                )
                                            )}

                                        </div>

                                        {/* =================================================
                                            TRANSFERENCIA
                                        ================================================= */}

                                        {esTransferencia && (

                                            <div className="pedido-comprobante">

                                                <h3>
                                                    Comprobante de transferencia
                                                </h3>

                                                {comprobanteUrl ? (

                                                    <div className="comprobante-actions">

                                                        <a
                                                            href={
                                                                comprobanteUrl
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="btn-comprobante"
                                                        >
                                                            Ver comprobante
                                                        </a>

                                                        {pedido.estadoPago !==
                                                            "APROBADO" && (

                                                            <button
                                                                type="button"
                                                                className="btn-aprobar"
                                                                disabled={
                                                                    procesandoId ===
                                                                    pedido.id
                                                                }
                                                                onClick={() =>
                                                                    handleAprobar(
                                                                        pedido
                                                                    )
                                                                }
                                                            >

                                                                {procesandoId ===
                                                                pedido.id
                                                                    ? "Procesando..."
                                                                    : "Aprobar pago"}

                                                            </button>

                                                        )}

                                                        {pedido.estadoPago !==
                                                            "RECHAZADO" && (

                                                            <button
                                                                type="button"
                                                                className="btn-rechazar"
                                                                disabled={
                                                                    procesandoId ===
                                                                    pedido.id
                                                                }
                                                                onClick={() =>
                                                                    handleRechazar(
                                                                        pedido
                                                                    )
                                                                }
                                                            >

                                                                Rechazar

                                                            </button>

                                                        )}

                                                    </div>

                                                ) : (

                                                    <p className="sin-comprobante">

                                                        El cliente todavía no envió comprobante.

                                                    </p>
                                                )}

                                            </div>
                                        )}

                                    </article>
                                );
                            }
                        )}

                    </section>
                )}

            </main>

            <Footer />
        </>
    );
}