import {
    useEffect,
    useState
} from "react";

import {
    Link
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { isAuthenticated } from "../services/authService";

import {
    consultarPedidoInvitado,
    getMisCompras,
    getMisComprasInvitado,
    guardarAccesoPedidoInvitado,
    obtenerTokenPedidoInvitado,
    actualizarMetodoPagoPedidoInvitado,
    actualizarMetodoPagoPedidoCuenta
} from "../services/pedidoService";

import {
    crearPreferenciaMercadoPagoCuenta,
    crearPreferenciaMercadoPagoInvitado,
    getDatosTransferencia,
    subirComprobanteTransferenciaCuenta,
    subirComprobanteTransferenciaInvitado
} from "../services/pagoService";

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

    if (!pedido.envioCotizado) {

        return (
            <div className="mi-compra-envio">

                <span className="mi-compra-envio-titulo">
                    Envío a cotizar por email
                </span>

                <p className="mi-compra-envio-nota">
                    Te enviaremos el costo y el total final antes de que pagues.
                </p>

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
                    Costo del envío: <strong>A cotizar</strong>
                </span>

            </div>
        );
    }

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

                <span>
                    Gestión:{" "}
                    <strong>MiCorreo</strong>
                </span>

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
                        {pedido.envioCotizado
                            ? moneda(pedido.costoEnvio)
                            : "A cotizar"}
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

    const [pedidosDeCuenta, setPedidosDeCuenta] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState("");

    const [
        pedidoInvitadoId,
        setPedidoInvitadoId
    ] = useState("");

    const [
        tokenInvitado,
        setTokenInvitado
    ] = useState("");

    const [
        consultandoInvitado,
        setConsultandoInvitado
    ] = useState(false);

    const [
        errorInvitado,
        setErrorInvitado
    ] = useState("");

    const [procesandoPagoId, setProcesandoPagoId] = useState(null);
    const [errorPago, setErrorPago] = useState("");
    const [mensajePago, setMensajePago] = useState("");
    const [enlacesPago, setEnlacesPago] = useState({});
    const [datosTransferencia, setDatosTransferencia] = useState({});
    const [comprobantes, setComprobantes] = useState({});
    const usuarioAutenticado = isAuthenticated();

    useEffect(() => {

        cargar();

    }, []);

    async function cargar() {

        try {

            setLoading(true);
            setError("");

            const usuarioTieneSesion = isAuthenticated();
            const comprasCuenta = usuarioTieneSesion
                ? await getMisCompras()
                : [];
            const comprasInvitado = usuarioTieneSesion
                ? []
                : await getMisComprasInvitado();

            const comprasPorId = new Map();
            const cuenta = Array.isArray(comprasCuenta) ? comprasCuenta : [];
            setPedidosDeCuenta(cuenta.map(pedido => pedido.id));
            [
                ...cuenta,
                ...comprasInvitado
            ].forEach(pedido => {
                comprasPorId.set(pedido.id, pedido);
            });

            setPedidos(
                [...comprasPorId.values()]
                    .sort((a, b) =>
                        Number(b.id || 0) - Number(a.id || 0)
                    )
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

    async function buscarPedidoInvitado(evento) {
        evento.preventDefault();
        setErrorInvitado("");

        if (!pedidoInvitadoId.trim() || !tokenInvitado.trim()) {
            setErrorInvitado("Ingresá el número del pedido y su código de acceso.");
            return;
        }

        if (!/^\d+$/.test(pedidoInvitadoId.trim())) {
            setErrorInvitado("El número del pedido debe contener solo números.");
            return;
        }

        try {
            setConsultandoInvitado(true);
            const pedido = await consultarPedidoInvitado(
                pedidoInvitadoId.trim(),
                tokenInvitado.trim()
            );

            let guardadoEnEsteNavegador = true;
            try {
                guardarAccesoPedidoInvitado({
                    id: pedido.id,
                    guestAccessToken: tokenInvitado.trim()
                });
            } catch (errorAlGuardar) {
                guardadoEnEsteNavegador = false;
                console.error(errorAlGuardar);
                setErrorInvitado(errorAlGuardar.message);
            }

            setPedidos(actuales => [
                pedido,
                ...actuales.filter(item => item.id !== pedido.id)
            ]);
            if (guardadoEnEsteNavegador) {
                setPedidoInvitadoId("");
                setTokenInvitado("");
            }
        } catch (err) {
            console.error(err);
            setErrorInvitado(
                err.message ||
                "No se pudo consultar el pedido."
            );
        } finally {
            setConsultandoInvitado(false);
        }
    }

    function reemplazarPedido(actualizado) {
        setPedidos(actuales =>
            actuales.map(pedido =>
                pedido.id === actualizado.id ? actualizado : pedido
            )
        );
    }

    async function elegirMedioPago(pedido, metodoPago) {
        const pedidoDeCuenta = pedidosDeCuenta.includes(pedido.id);
        const tokenAcceso = pedidoDeCuenta
            ? null
            : obtenerTokenPedidoInvitado(pedido.id);
        if (!pedidoDeCuenta && !tokenAcceso) {
            setErrorPago(
                `No se encontró el código privado del pedido #${pedido.id} en este navegador. Volvé a consultarlo con el número y el código.`
            );
            return;
        }

        try {
            setProcesandoPagoId(pedido.id);
            setErrorPago("");
            setMensajePago("");

            const actualizado = pedidoDeCuenta
                ? await actualizarMetodoPagoPedidoCuenta(
                    pedido.id,
                    metodoPago
                )
                : await actualizarMetodoPagoPedidoInvitado(
                    pedido.id,
                    metodoPago,
                    tokenAcceso
                );
            reemplazarPedido(actualizado);

            if (metodoPago === "MERCADO_PAGO") {
                const preferencia = pedidoDeCuenta
                    ? await crearPreferenciaMercadoPagoCuenta(pedido.id)
                    : await crearPreferenciaMercadoPagoInvitado(
                        pedido.id,
                        tokenAcceso
                    );
                setEnlacesPago(actuales => ({
                    ...actuales,
                    [pedido.id]: preferencia.url
                }));
                setMensajePago(
                    `El pago del pedido #${pedido.id} está listo. Podés elegir tarjeta de crédito, débito u otros medios en Mercado Pago.`
                );
                return;
            }

            const datos = await getDatosTransferencia();
            setDatosTransferencia(actuales => ({
                ...actuales,
                [pedido.id]: datos
            }));
            setMensajePago(
                `El pedido #${pedido.id} quedó configurado para transferencia.`
            );
        } catch (err) {
            console.error(err);
            setErrorPago(
                err.message || "No se pudo preparar el medio de pago."
            );
        } finally {
            setProcesandoPagoId(null);
        }
    }

    async function enviarComprobante(pedido) {
        const archivo = comprobantes[pedido.id];
        const pedidoDeCuenta = pedidosDeCuenta.includes(pedido.id);
        const tokenAcceso = pedidoDeCuenta
            ? null
            : obtenerTokenPedidoInvitado(pedido.id);

        if (!archivo || (!pedidoDeCuenta && !tokenAcceso)) {
            setErrorPago("Seleccioná el comprobante y volvé a consultar el pedido con su código privado.");
            return;
        }

        try {
            setProcesandoPagoId(pedido.id);
            setErrorPago("");
            setMensajePago("");

            if (pedidoDeCuenta) {
                await subirComprobanteTransferenciaCuenta(
                    pedido.id,
                    archivo
                );
            } else {
                await subirComprobanteTransferenciaInvitado(
                    pedido.id,
                    archivo,
                    tokenAcceso
                );
            }
            const actualizado = pedidoDeCuenta
                ? (await getMisCompras()).find(item => item.id === pedido.id)
                : await consultarPedidoInvitado(
                    pedido.id,
                    tokenAcceso
                );
            if (!actualizado) {
                throw new Error("No se pudo actualizar el estado del pedido.");
            }
            reemplazarPedido(actualizado);
            setComprobantes(actuales => ({
                ...actuales,
                [pedido.id]: null
            }));
            setMensajePago(
                `Recibimos el comprobante del pedido #${pedido.id}. El pago quedará pendiente hasta que lo verifiquemos.`
            );
        } catch (err) {
            console.error(err);
            setErrorPago(
                err.message || "No se pudo enviar el comprobante."
            );
        } finally {
            setProcesandoPagoId(null);
        }
    }

    return (
        <>
            <Navbar />

            <main className="mis-compras">

                <header className="mis-compras-header">

                    <span>
                        TUS PEDIDOS
                    </span>

                    <h1>
                        Mis compras
                    </h1>

                    <p>
                        {usuarioAutenticado
                            ? "Revisá el estado de tus pedidos y pagos."
                            : "Consultá tus pedidos anteriores como invitado con el número y el código de acceso."}
                    </p>

                </header>

                {!usuarioAutenticado && (
                    <form
                        className="mis-compras-invitado"
                        onSubmit={buscarPedidoInvitado}
                    >
                        <div>
                            <h2>Consultar pedido como invitado</h2>
                            <p>
                                Los pedidos anteriores hechos como invitado pueden consultarse
                                con su número y código de acceso. Para ver las compras hechas
                                con tu cuenta, <Link to="/login">iniciá sesión</Link>.
                            </p>
                            <button
                                type="button"
                                className="mis-compras-actualizar"
                                onClick={cargar}
                                disabled={loading}
                            >
                                {loading ? "Actualizando..." : "Actualizar pedidos"}
                            </button>
                        </div>

                        <label>
                            Número de pedido
                            <input
                                id="guest-order-number"
                                name="guest-order-number"
                                type="text"
                                inputMode="numeric"
                                value={pedidoInvitadoId}
                                onChange={evento =>
                                    setPedidoInvitadoId(evento.target.value)
                                }
                                autoComplete="off"
                                spellCheck="false"
                            />
                        </label>

                        <label>
                            Código de acceso
                            <input
                                id="guest-order-access-code"
                                name="guest-order-access-code"
                                type="password"
                                value={tokenInvitado}
                                onChange={evento =>
                                    setTokenInvitado(evento.target.value)
                                }
                                autoComplete="new-password"
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={consultandoInvitado}
                        >
                            {consultandoInvitado
                                ? "Buscando..."
                                : "Consultar pedido"}
                        </button>

                        {errorInvitado && (
                            <p
                                className="mis-compras-invitado-error"
                                role="alert"
                            >
                                {errorInvitado}
                            </p>
                        )}
                    </form>
                )}

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
                            {usuarioAutenticado
                                ? "Cuando hagas una compra con esta cuenta, aparecerá acá."
                                : "Los pedidos guardados en este navegador aparecerán acá. Si compraste desde otro dispositivo, consultalo con el número y el código de acceso."}
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
                                        {pedido.metodoEntrega === "ENVIO_DOMICILIO" &&
                                            !pedido.envioCotizado
                                            ? `Subtotal ${moneda(pedido.total)}`
                                            : moneda(pedido.total)}
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
                                            {pedido.estado === "PAGADO"
                                                ? "Aprobado · Pagado"
                                                : textoEstado(pedido.estado)}
                                        </strong>
                                    </span>

                                </div>

                                <SeguimientoEnvio
                                    pedido={pedido}
                                />

                                {pedido.metodoEntrega === "ENVIO_DOMICILIO" &&
                                    pedido.envioCotizado &&
                                    pedido.estadoPago === "PENDIENTE" &&
                                    pedido.estado !== "CANCELADO" &&
                                    (
                                        pedidosDeCuenta.includes(pedido.id) ||
                                        obtenerTokenPedidoInvitado(pedido.id)
                                    ) && (
                                        <section className="mi-compra-pago">
                                            <h3>Ya está cotizado: elegí cómo pagar</h3>
                                            <p>
                                                El total actualizado incluye el envío. Para pagar con tarjeta, se abrirá el checkout seguro de Mercado Pago.
                                            </p>
                                            <div className="mi-compra-pago-opciones">
                                                <button
                                                    type="button"
                                                    disabled={procesandoPagoId === pedido.id}
                                                    onClick={() => elegirMedioPago(pedido, "MERCADO_PAGO")}
                                                >
                                                    {procesandoPagoId === pedido.id
                                                        ? "Preparando..."
                                                        : "Pagar con Mercado Pago"}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="secundario"
                                                    disabled={procesandoPagoId === pedido.id}
                                                    onClick={() => elegirMedioPago(pedido, "TRANSFERENCIA")}
                                                >
                                                    Elegir transferencia
                                                </button>
                                            </div>

                                            {(enlacesPago[pedido.id] || pedido.mercadoPagoUrl) &&
                                                pedido.metodoPago === "MERCADO_PAGO" && (
                                                    <a
                                                        href={enlacesPago[pedido.id] || pedido.mercadoPagoUrl}
                                                        className="continuar-pago"
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        Ir a Mercado Pago · pagar con tarjeta
                                                    </a>
                                                )}

                                            {pedido.metodoPago === "TRANSFERENCIA" &&
                                                datosTransferencia[pedido.id] && (
                                                    <div className="mi-compra-transferencia">
                                                        <strong>Datos para transferir</strong>
                                                        <span>Alias: {datosTransferencia[pedido.id].alias || "No configurado"}</span>
                                                        <span>CBU: {datosTransferencia[pedido.id].cbu || "No configurado"}</span>
                                                        <span>Titular: {datosTransferencia[pedido.id].titular || "No configurado"}</span>
                                                        {pedido.comprobanteTransferencia ? (
                                                            <p>Comprobante enviado. Estamos verificando el pago.</p>
                                                        ) : (
                                                            <>
                                                                <label>
                                                                    Comprobante (imagen)
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        disabled={procesandoPagoId === pedido.id}
                                                                        onChange={evento =>
                                                                            setComprobantes(actuales => ({
                                                                                ...actuales,
                                                                                [pedido.id]: evento.target.files?.[0] || null
                                                                            }))
                                                                        }
                                                                    />
                                                                </label>
                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        procesandoPagoId === pedido.id ||
                                                                        !comprobantes[pedido.id]
                                                                    }
                                                                    onClick={() => enviarComprobante(pedido)}
                                                                >
                                                                    {procesandoPagoId === pedido.id
                                                                        ? "Enviando..."
                                                                        : "Enviar comprobante"}
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}

                                            {errorPago && (
                                                <p className="mi-compra-pago-error" role="alert">
                                                    {errorPago}
                                                </p>
                                            )}
                                            {mensajePago && (
                                                <p className="mi-compra-pago-mensaje" role="status">
                                                    {mensajePago}
                                                </p>
                                            )}
                                        </section>
                                    )}

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