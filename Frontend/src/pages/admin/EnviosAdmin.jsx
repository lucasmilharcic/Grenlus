import {
    useEffect,
    useMemo,
    useState
} from "react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import {
    getEnvios,
    actualizarEnvio,
    getPortalMiCorreo
} from "../../services/envioService";

import {
    actualizarArchivoPedido,
    aprobarPagoManualmente
} from "../../services/pedidoService";

import {
    crearPreferenciaMercadoPago
} from "../../services/pagoService";

import "./EnviosAdmin.css";

// =====================================================
// CIRCUITO
// =====================================================

const ESTADOS = [
    "PENDIENTE",
    "PREPARANDO",
    "DESPACHADO",
    "ENTREGADO"
];

// =====================================================
// FORMATO
// =====================================================

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

function pesoEstimadoTotal(detalles = []) {
    if (
        detalles.length === 0 ||
        detalles.some(item => item.pesoGramos == null || item.cantidad == null)
    ) {
        return null;
    }

    return detalles.reduce(
        (total, item) =>
            total + Number(item.pesoGramos) * Number(item.cantidad),
        0
    );
}

function formatearFecha(valor) {

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

export default function EnviosAdmin() {

    const [
        envios,
        setEnvios
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
        mensaje,
        setMensaje
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
        verArchivados,
        setVerArchivados
    ] = useState(false);

    /*
     * Código de seguimiento que el admin está
     * tipeando, separado por pedido.
     */
    const [
        seguimientos,
        setSeguimientos
    ] = useState({});

    const [
        cotizaciones,
        setCotizaciones
    ] = useState({});

    const [
        enlacesPago,
        setEnlacesPago
    ] = useState({});

    const [
        estadosSeleccionados,
        setEstadosSeleccionados
    ] = useState({});

    // =====================================================
    // CARGAR
    // =====================================================

    useEffect(() => {

        let activo = true;

        getEnvios(undefined, verArchivados)
            .then(data => {
                if (!activo) {
                    return;
                }

                const lista =
                    Array.isArray(data)
                        ? data
                        : [];

                setEnvios(lista);

                setSeguimientos(
                    lista.reduce(
                        (acumulado, envio) => ({
                            ...acumulado,
                            [envio.pedidoId]:
                                envio.codigoSeguimiento || ""
                        }),
                        {}
                    )
                );

                setCotizaciones(
                    lista.reduce(
                        (acumulado, envio) => ({
                            ...acumulado,
                            [envio.pedidoId]:
                                envio.costoEnvio == null
                                    ? ""
                                    : String(envio.costoEnvio)
                        }),
                        {}
                    )
                );

                setEstadosSeleccionados(
                    lista.reduce(
                        (acumulado, envio) => ({
                            ...acumulado,
                            [envio.pedidoId]:
                                envio.estadoEnvio || "PENDIENTE"
                        }),
                        {}
                    )
                );
            })
            .catch(err => {
                if (!activo) {
                    return;
                }

                console.error(err);
                setError(
                    err.message ||
                    "No se pudieron cargar los envíos."
                );
            })
            .finally(() => {
                if (activo) {
                    setLoading(false);
                }
            });

        return () => {
            activo = false;
        };
    }, [verArchivados]);

    // =====================================================
    // FILTRO
    // =====================================================

    const enviosFiltrados =
        useMemo(() => {

            if (filtro === "TODOS") {
                return envios;
            }

            return envios.filter(
                envio =>
                    envio.estadoEnvio === filtro
            );

        }, [
            envios,
            filtro
        ]);

    function contarPorEstado(
        estado
    ) {

        return envios.filter(
            envio =>
                envio.estadoEnvio === estado
        ).length;
    }

    // =====================================================
    // GUARDAR
    // =====================================================

    /*
     * Un único camino para los dos botones.
     *
     * estadoEnvio null = solamente guardamos
     * el código de seguimiento.
     */
    async function guardar(
        pedidoId,
        estadoEnvio
    ) {

        try {

            setProcesandoId(pedidoId);
            setError("");
            setMensaje("");

            const actualizado =
                await actualizarEnvio(
                    pedidoId,
                    {
                        estadoEnvio,

                        codigoSeguimiento:
                            seguimientos[pedidoId] || null
                    }
                );

            setEnvios(
                actuales =>
                    actuales.map(
                        envio =>
                            envio.pedidoId === pedidoId
                                ? actualizado
                                : envio
                    )
            );

            setEstadosSeleccionados(actuales => ({
                ...actuales,
                [pedidoId]: actualizado.estadoEnvio
            }));

            setMensaje(
                estadoEnvio
                    ? `Pedido #${pedidoId}: envío actualizado a ${textoEstado(estadoEnvio).toLowerCase()}.`
                    : `Pedido #${pedidoId}: seguimiento guardado.`
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "No se pudo actualizar el envío."
            );

        } finally {

            setProcesandoId(null);
        }
    }

    async function guardarCotizacion(pedidoId) {

        const textoCosto = cotizaciones[pedidoId];
        const costoEnvio = Number(textoCosto);

        if (
            textoCosto == null ||
            textoCosto.trim() === "" ||
            !Number.isFinite(costoEnvio) ||
            costoEnvio < 0
        ) {
            setError("Ingresá un costo de envío válido, igual o mayor a cero.");
            return;
        }

        try {
            setProcesandoId(pedidoId);
            setError("");
            setMensaje("");

            const actualizado = await actualizarEnvio(
                pedidoId,
                { costoEnvio }
            );

            setEnvios(actuales =>
                actuales.map(envio =>
                    envio.pedidoId === pedidoId
                        ? actualizado
                        : envio
                )
            );

            setMensaje(
                `Pedido #${pedidoId}: cotización guardada. Total actualizado a ${moneda(actualizado.total)}.`
            );
        } catch (err) {
            console.error(err);
            setError(
                err.message ||
                "No se pudo guardar el costo del envío."
            );
        } finally {
            setProcesandoId(null);
        }
    }

    async function generarEnlacePago(pedidoId) {
        try {
            setProcesandoId(pedidoId);
            setError("");
            setMensaje("");

            const preferencia =
                await crearPreferenciaMercadoPago(pedidoId);

            if (!preferencia.url) {
                throw new Error(
                    "Mercado Pago no devolvió un enlace de pago."
                );
            }

            setEnlacesPago(actuales => ({
                ...actuales,
                [pedidoId]: preferencia.url
            }));

            setMensaje(
                `Pedido #${pedidoId}: enlace listo para compartir con el cliente.`
            );
        } catch (err) {
            console.error(err);
            setError(
                err.message ||
                "No se pudo generar el enlace de pago."
            );
        } finally {
            setProcesandoId(null);
        }
    }

    async function abrirMiCorreo() {
        try {
            setError("");
            const portal = await getPortalMiCorreo();
            window.open(portal.url, "_blank", "noopener,noreferrer");
        } catch (err) {
            setError(err.message || "No se pudo abrir MiCorreo.");
        }
    }

    async function aprobarPago(envio) {
        const confirmar = window.confirm(
            `Confirmá que verificaste el ingreso real del total cotizado para el pedido #${envio.pedidoId}. Esta acción marcará el pago como aprobado.`
        );

        if (!confirmar) {
            return;
        }

        try {
            setProcesandoId(envio.pedidoId);
            setError("");
            setMensaje("");

            await aprobarPagoManualmente(envio.pedidoId);

            setEnvios(actuales =>
                actuales.map(item =>
                    item.pedidoId === envio.pedidoId
                        ? {
                            ...item,
                            estadoPago: "APROBADO",
                            estado: "PAGADO"
                        }
                        : item
                )
            );

            setMensaje(
                `Pago del pedido #${envio.pedidoId} aprobado. Ya podés avanzar su preparación.`
            );
        } catch (err) {
            console.error(err);
            setError(
                err.message ||
                "No se pudo aprobar el pago."
            );
        } finally {
            setProcesandoId(null);
        }
    }

    async function actualizarArchivo(envio) {
        const archivar = !verArchivados;
        const confirmar = window.confirm(
            archivar
                ? `¿Archivar el pedido #${envio.pedidoId}? Se conservará y podrás restaurarlo.`
                : `¿Restaurar el pedido #${envio.pedidoId} en la lista activa?`
        );

        if (!confirmar) {
            return;
        }

        try {
            setProcesandoId(envio.pedidoId);
            setError("");
            setMensaje("");

            await actualizarArchivoPedido(
                envio.pedidoId,
                archivar
            );

            setEnvios(actuales =>
                actuales.filter(
                    item => item.pedidoId !== envio.pedidoId
                )
            );

            setMensaje(
                `Pedido #${envio.pedidoId}: ${archivar ? "archivado" : "restaurado"}.`
            );
        } catch (err) {
            console.error(err);
            setError(
                err.message ||
                "No se pudo actualizar el archivo del pedido."
            );
        } finally {
            setProcesandoId(null);
        }
    }

    function redactarEmailCotizacion(envio) {
        const asunto = encodeURIComponent(
            `Cotización de envío - Pedido #${envio.pedidoId}`
        );
        const urlMisCompras =
            `${window.location.origin}/mis-compras`;
        const urlLogin =
            `${window.location.origin}/login`;
        const cuerpo = encodeURIComponent(
            `Hola ${envio.nombreCliente || ""},\n\n` +
            `Actualizamos la cotización de tu pedido #${envio.pedidoId}.\n` +
            `Costo del envío: ${moneda(envio.costoEnvio)}\n` +
            `Total del pedido: ${moneda(envio.total)}\n\n` +
            "El nuevo total ya está disponible en tu cuenta. Iniciá sesión con el email que usaste al comprar y entrá a Mis compras para pagar con Mercado Pago (incluye tarjetas) o elegir transferencia.\n\n" +
            `Iniciar sesión: ${urlLogin}\n` +
            `Mis compras: ${urlMisCompras}\n\n` +
            "Saludos,\nGrenlus"
        );

        window.location.href =
            `mailto:${encodeURIComponent(envio.email)}?subject=${asunto}&body=${cuerpo}`;
    }

    return (
        <>
            <Navbar />

            <main className="envios-admin">

                <header className="envios-admin-header">

                    <div>

                        <span className="envios-eyebrow">
                            LOGÍSTICA
                        </span>

                        <h1>
                            Envíos
                        </h1>

                        <p>
                            Seguimiento de los pedidos
                            con envío a domicilio.
                        </p>

                    </div>

                    <div className="envios-count">
                        {envios.length}{" "}
                        {envios.length === 1
                            ? "envío"
                            : "envíos"}
                        {verArchivados ? " archivados" : ""}
                    </div>

                </header>

                <div className="envios-filtros">

                    <button
                        type="button"
                        className={!verArchivados ? "activo" : ""}
                        onClick={() => {
                            setFiltro("TODOS");
                            setLoading(true);
                            setError("");
                            setVerArchivados(false);
                        }}
                    >
                        Activos
                    </button>

                    <button
                        type="button"
                        className={verArchivados ? "activo" : ""}
                        onClick={() => {
                            setFiltro("TODOS");
                            setLoading(true);
                            setError("");
                            setVerArchivados(true);
                        }}
                    >
                        Archivados
                    </button>

                    <button
                        type="button"
                        className={
                            filtro === "TODOS"
                                ? "activo"
                                : ""
                        }
                        onClick={() =>
                            setFiltro("TODOS")
                        }
                    >
                        Todos ({envios.length})
                    </button>

                    {ESTADOS.map(
                        estado => (

                        <button
                            key={estado}
                            type="button"
                            className={
                                filtro === estado
                                    ? "activo"
                                    : ""
                            }
                            onClick={() =>
                                setFiltro(estado)
                            }
                        >
                            {textoEstado(estado)}{" "}
                            ({contarPorEstado(estado)})
                        </button>
                    ))}

                </div>

                {mensaje && (

                    <div className="envios-mensaje">
                        {mensaje}
                    </div>
                )}

                {error && (

                    <div className="envios-error">
                        {error}
                    </div>
                )}

                {loading && (

                    <div className="envios-state">
                        Cargando envíos...
                    </div>
                )}

                {!loading &&
                    !error &&
                    enviosFiltrados.length === 0 && (

                    <div className="envios-state">
                        No hay envíos en este estado.
                    </div>
                )}

                {!loading &&
                    enviosFiltrados.length > 0 && (

                    <section className="envios-grid">

                        {enviosFiltrados.map(
                            envio => {

                            const pagoAprobado =
                                envio.estadoPago ===
                                "APROBADO";
                            const pagoPendiente =
                                envio.estadoPago === "PENDIENTE" &&
                                envio.estado !== "CANCELADO";

                            const estadoActual =
                                envio.estadoEnvio || "PENDIENTE";
                            const indiceEstadoActual =
                                ESTADOS.indexOf(estadoActual);
                            const estadosDisponibles =
                                ESTADOS.filter(
                                    (estado, indice) =>
                                        indice >= Math.max(indiceEstadoActual, 0)
                                );
                            const estadoSeleccionado =
                                estadosSeleccionados[envio.pedidoId] ||
                                estadoActual;

                            const procesando =
                                procesandoId ===
                                envio.pedidoId;

                            const detalles =
                                Array.isArray(envio.detalles)
                                    ? envio.detalles
                                    : [];

                            const pesoTotal =
                                pesoEstimadoTotal(detalles);

                            return (

                                <article
                                    key={envio.pedidoId}
                                    className="envio-card"
                                >

                                    <div className="envio-card-top">

                                        <div>

                                            <span className="envio-numero">
                                                PEDIDO #
                                                {envio.pedidoId}
                                            </span>

                                            <h2>
                                                {envio.nombreCliente ||
                                                    "Sin nombre"}
                                            </h2>

                                            <small>
                                                {formatearFecha(
                                                    envio.fechaPedido
                                                )}
                                            </small>

                                        </div>

                                        <span
                                            className={`envio-estado ${envio.estadoEnvio}`}
                                        >
                                            {textoEstado(
                                                envio.estadoEnvio
                                            )}
                                        </span>

                                    </div>

                                    <div className="envio-datos">

                                        <div className="envio-dato">

                                            <span>
                                                Destino
                                            </span>

                                            <strong>
                                                {[
                                                    envio.direccion,
                                                    envio.ciudad,
                                                    envio.provincia
                                                ]
                                                    .filter(Boolean)
                                                    .join(", ") ||
                                                    "Sin dirección"}
                                            </strong>

                                            {envio.codigoPostal && (

                                                <small>
                                                    CP{" "}
                                                    {envio.codigoPostal}
                                                </small>
                                            )}

                                        </div>

                                        <div className="envio-dato">

                                            <span>
                                                Gestión
                                            </span>

                                            <strong>
                                                MiCorreo
                                            </strong>

                                            <small>
                                                Alta manual desde el portal
                                            </small>

                                        </div>

                                        <div className="envio-dato">

                                            <span>
                                                Costo del envío
                                            </span>

                                            <strong>
                                                {envio.envioCotizado
                                                    ? moneda(envio.costoEnvio)
                                                    : "A cotizar"}
                                            </strong>

                                            <small>
                                                {envio.envioCotizado
                                                    ? `Total del pedido: ${moneda(envio.total)}`
                                                    : "El cliente todavía no debe pagar"}
                                            </small>

                                        </div>

                                        <div className="envio-dato">
                                            <span>
                                                Valor de productos (sin envío)
                                            </span>
                                            <strong>
                                                {moneda(envio.subtotalProductos)}
                                            </strong>
                                            <small>
                                                Valor de los artículos del pedido
                                            </small>
                                        </div>

                                        <div className="envio-dato">

                                            <span>
                                                Contacto
                                            </span>

                                            <strong>
                                                {envio.telefono ||
                                                    "Sin teléfono"}
                                            </strong>

                                            {envio.email && (

                                                <small>
                                                    {envio.email}
                                                </small>
                                            )}

                                        </div>

                                    </div>

                                    <section className="envio-productos">
                                        <div className="envio-productos-cabecera">
                                            <h3>Productos del pedido</h3>
                                            {pesoTotal != null && (
                                                <strong>
                                                    Peso estimado total: {pesoTotal.toLocaleString("es-AR")} g
                                                </strong>
                                            )}
                                        </div>

                                        {detalles.length === 0 ? (
                                            <p>No hay artículos cargados en este pedido.</p>
                                        ) : (
                                            <div className="envio-productos-lista">
                                                {detalles.map((item, indice) => {
                                                    const medidas = [
                                                        item.largoEnvioCm,
                                                        item.anchoEnvioCm,
                                                        item.altoEnvioCm
                                                    ];
                                                    const tieneMedidas =
                                                        medidas.every(valor => valor != null);
                                                    const pesoItem =
                                                        item.pesoGramos != null &&
                                                        item.cantidad != null
                                                            ? Number(item.pesoGramos) *
                                                                Number(item.cantidad)
                                                            : null;

                                                    return (
                                                        <article
                                                            className="envio-producto"
                                                            key={item.id || `${item.productoId}-${indice}`}
                                                        >
                                                            <div className="envio-producto-info">
                                                                <strong>
                                                                    {item.productoNombre ||
                                                                        `Producto #${item.productoId || ""}`}
                                                                </strong>
                                                                <span>
                                                                    Cantidad: {item.cantidad ?? "—"}
                                                                    {item.talle && ` · Talle: ${item.talle}`}
                                                                    {item.color && ` · Color: ${item.color}`}
                                                                    {item.tamanoEstampa &&
                                                                        ` · Estampa: ${textoEstado(item.tamanoEstampa)}`}
                                                                </span>
                                                                <small>
                                                                    {tieneMedidas
                                                                        ? `Medidas estimadas por unidad: ${medidas.join(" × ")} cm`
                                                                        : "Medidas no cargadas"}
                                                                    {item.pesoGramos != null &&
                                                                        ` · ${item.pesoGramos} g por unidad`}
                                                                    {pesoItem != null &&
                                                                        ` · ${pesoItem.toLocaleString("es-AR")} g en este pedido`}
                                                                    {item.pesoGramos == null &&
                                                                        " · Peso no cargado"}
                                                                </small>
                                                            </div>
                                                            <div className="envio-producto-precios">
                                                                <span>
                                                                    Unitario: {moneda(item.precioUnitario)}
                                                                </span>
                                                                <strong>
                                                                    {moneda(item.subtotal)}
                                                                </strong>
                                                            </div>
                                                        </article>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </section>

                                    {!envio.envioCotizado && (
                                        <div className="envio-cotizacion">
                                            <label
                                                htmlFor={`cotizacion-${envio.pedidoId}`}
                                            >
                                                Costo cotizado (ARS)
                                            </label>

                                            <div className="envio-seguimiento-fila">
                                                <input
                                                    id={`cotizacion-${envio.pedidoId}`}
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={
                                                        cotizaciones[envio.pedidoId] ?? ""
                                                    }
                                                    disabled={procesando}
                                                    onChange={evento =>
                                                        setCotizaciones(actuales => ({
                                                            ...actuales,
                                                            [envio.pedidoId]:
                                                                evento.target.value
                                                        }))
                                                    }
                                                />

                                                <button
                                                    type="button"
                                                    className="envio-guardar"
                                                    disabled={procesando}
                                                    onClick={() =>
                                                        guardarCotizacion(envio.pedidoId)
                                                    }
                                                >
                                                    {procesando
                                                        ? "Guardando..."
                                                        : "Guardar cotización"}
                                                </button>
                                            </div>

                                            <small>
                                                Al guardar, se actualiza el total. Avisale al cliente por email o WhatsApp.
                                            </small>
                                        </div>
                                    )}

                                    {envio.envioCotizado && envio.email && (
                                        <div className="envio-email-cotizacion">
                                            <button
                                                type="button"
                                                disabled={procesando}
                                                onClick={() =>
                                                    redactarEmailCotizacion(envio)
                                                }
                                            >
                                                Preparar email de cotización
                                            </button>
                                            <small>
                                                Se abrirá tu aplicación de correo con el precio y el total; revisá y enviá el mensaje.
                                            </small>
                                        </div>
                                    )}

                                    {(envio.fechaDespacho ||
                                        envio.fechaEntrega) && (

                                        <div className="envio-fechas">

                                            {envio.fechaDespacho && (

                                                <span>
                                                    Despachado:{" "}
                                                    {formatearFecha(
                                                        envio.fechaDespacho
                                                    )}
                                                </span>
                                            )}

                                            {envio.fechaEntrega && (

                                                <span>
                                                    Entregado:{" "}
                                                    {formatearFecha(
                                                        envio.fechaEntrega
                                                    )}
                                                </span>
                                            )}

                                        </div>
                                    )}

                                    <div className="envio-seguimiento">

                                        <label
                                            htmlFor={`seguimiento-${envio.pedidoId}`}
                                        >
                                            Código de seguimiento
                                        </label>

                                        <div className="envio-seguimiento-fila">

                                            <input
                                                id={`seguimiento-${envio.pedidoId}`}
                                                type="text"
                                                placeholder="Ej: 1234567890"
                                                value={
                                                    seguimientos[
                                                        envio.pedidoId
                                                    ] ?? ""
                                                }
                                                disabled={procesando}
                                                onChange={evento =>
                                                    setSeguimientos(
                                                        actuales => ({
                                                            ...actuales,
                                                            [envio.pedidoId]:
                                                                evento
                                                                    .target
                                                                    .value
                                                        })
                                                    )
                                                }
                                            />

                                            <button
                                                type="button"
                                                className="envio-guardar"
                                                disabled={procesando}
                                                onClick={() =>
                                                    guardar(
                                                        envio.pedidoId,
                                                        null
                                                    )
                                                }
                                            >
                                                {procesando
                                                    ? "Guardando..."
                                                    : "Guardar"}
                                            </button>

                                        </div>

                                    </div>

                                    <div className="envio-acciones">

                                        <div className="envio-paq-ar-acciones">
                                            <button
                                                type="button"
                                                onClick={abrirMiCorreo}
                                            >
                                                Abrir MiCorreo
                                            </button>
                                        </div>

                                        {envio.envioCotizado &&
                                            !pagoAprobado &&
                                            envio.metodoPago === "MERCADO_PAGO" && (
                                                <div className="envio-paq-ar-acciones">
                                                    <button
                                                        type="button"
                                                        disabled={procesando}
                                                        onClick={() =>
                                                            generarEnlacePago(envio.pedidoId)
                                                        }
                                                    >
                                                        {procesando
                                                            ? "Generando..."
                                                            : "Generar enlace de pago"}
                                                    </button>

                                                    {enlacesPago[envio.pedidoId] && (
                                                        <a
                                                            href={enlacesPago[envio.pedidoId]}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            Abrir enlace para compartir
                                                        </a>
                                                    )}
                                                    <small>
                                                        Este enlace incluye el total cotizado y Mercado Pago informa el pago automáticamente. Usá la confirmación manual solo si verificaste un cobro por fuera de ese enlace.
                                                    </small>
                                                </div>
                                            )}

                                        {pagoAprobado && (
                                            <p className="envio-aviso ok">
                                                Pago aprobado. Ya podés actualizar el estado logístico.
                                            </p>
                                        )}

                                        {!pagoAprobado && (

                                            <p className="envio-aviso">
                                                El pago está en{" "}
                                                {textoEstado(
                                                    envio.estadoPago
                                                ).toLowerCase()}
                                                . No se puede avanzar
                                                el envío hasta aprobarlo.
                                            </p>
                                        )}

                                        {!pagoAprobado &&
                                            pagoPendiente &&
                                            envio.envioCotizado && (
                                                <button
                                                    type="button"
                                                    className="envio-aprobar-pago"
                                                    disabled={procesando}
                                                    onClick={() => aprobarPago(envio)}
                                                >
                                                    {procesando
                                                        ? "Confirmando..."
                                                        : "Confirmar pago recibido"}
                                                </button>
                                            )}

                                        {pagoAprobado && (

                                            <div className="envio-estado-control">
                                                <label htmlFor={`estado-${envio.pedidoId}`}>
                                                    Estado del envío
                                                </label>
                                                <div className="envio-seguimiento-fila">
                                                    <select
                                                        id={`estado-${envio.pedidoId}`}
                                                        value={estadoSeleccionado}
                                                        disabled={procesando}
                                                        onChange={evento =>
                                                            setEstadosSeleccionados(actuales => ({
                                                                ...actuales,
                                                                [envio.pedidoId]: evento.target.value
                                                            }))
                                                        }
                                                    >
                                                        {estadosDisponibles.map(estado => (
                                                            <option
                                                                key={estado}
                                                                value={estado}
                                                            >
                                                                {textoEstado(estado)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        className="envio-avanzar"
                                                        disabled={
                                                            procesando ||
                                                            estadoSeleccionado === estadoActual
                                                        }
                                                        onClick={() =>
                                                            guardar(
                                                                envio.pedidoId,
                                                                estadoSeleccionado
                                                            )
                                                        }
                                                    >
                                                        {procesando
                                                            ? "Guardando..."
                                                            : "Guardar estado"}
                                                    </button>
                                                </div>
                                                <small>
                                                    Para marcarlo como despachado, primero guardá el código de seguimiento.
                                                </small>
                                            </div>
                                        )}

                                        {pagoAprobado &&
                                            estadoActual === "ENTREGADO" && (

                                            <p className="envio-aviso ok">
                                                Envío finalizado.
                                            </p>
                                        )}

                                    </div>

                                    <button
                                        type="button"
                                        className="envio-archivar"
                                        disabled={procesando}
                                        onClick={() => actualizarArchivo(envio)}
                                    >
                                        {verArchivados
                                            ? "Restaurar pedido"
                                            : "Archivar pedido"}
                                    </button>

                                </article>
                            );
                        })}

                    </section>
                )}

            </main>

            <Footer />
        </>
    );
}
