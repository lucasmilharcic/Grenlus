import {
    useEffect,
    useMemo,
    useState
} from "react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import {
    getEnvios,
    actualizarEnvio
} from "../../services/envioService";

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

const ETIQUETA_SIGUIENTE = {
    PENDIENTE: "Marcar en preparación",
    PREPARANDO: "Marcar despachado",
    DESPACHADO: "Marcar entregado"
};

/*
 * Cómo contamos el cambio en el cartel de éxito.
 */
const ETIQUETA_MENSAJE = {
    PREPARANDO: "pasó a preparación",
    DESPACHADO: "quedó despachado",
    ENTREGADO: "quedó entregado"
};

function siguienteEstado(
    estado
) {

    const indice =
        ESTADOS.indexOf(estado);

    if (
        indice < 0 ||
        indice === ESTADOS.length - 1
    ) {

        return null;
    }

    return ESTADOS[indice + 1];
}

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

    /*
     * Código de seguimiento que el admin está
     * tipeando, separado por pedido.
     */
    const [
        seguimientos,
        setSeguimientos
    ] = useState({});

    // =====================================================
    // CARGAR
    // =====================================================

    async function cargarEnvios() {

        try {

            setLoading(true);
            setError("");

            const data =
                await getEnvios();

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

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "No se pudieron cargar los envíos."
            );

        } finally {

            setLoading(false);
        }
    }

    useEffect(() => {

        cargarEnvios();

    }, []);

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

            setMensaje(
                estadoEnvio
                    ? `Pedido #${pedidoId}: el envío ${
                        ETIQUETA_MENSAJE[estadoEnvio]
                    }.`
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
                    </div>

                </header>

                <div className="envios-filtros">

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

                            const siguiente =
                                siguienteEstado(
                                    envio.estadoEnvio
                                );

                            const pagoAprobado =
                                envio.estadoPago ===
                                "APROBADO";

                            const procesando =
                                procesandoId ===
                                envio.pedidoId;

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
                                                Transporte
                                            </span>

                                            <strong>
                                                {envio.carrierEnvioNombre ||
                                                    "Sin transporte"}
                                            </strong>

                                            {envio.serviceNombreEnvio && (

                                                <small>
                                                    {envio.serviceNombreEnvio}
                                                </small>
                                            )}

                                        </div>

                                        <div className="envio-dato">

                                            <span>
                                                Costo del envío
                                            </span>

                                            <strong>
                                                {moneda(
                                                    envio.costoEnvio
                                                )}
                                            </strong>

                                            <small>
                                                Total del pedido:{" "}
                                                {moneda(envio.total)}
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

                                        {pagoAprobado &&
                                            siguiente && (

                                            <button
                                                type="button"
                                                className="envio-avanzar"
                                                disabled={procesando}
                                                onClick={() =>
                                                    guardar(
                                                        envio.pedidoId,
                                                        siguiente
                                                    )
                                                }
                                            >
                                                {procesando
                                                    ? "Actualizando..."
                                                    : ETIQUETA_SIGUIENTE[
                                                        envio.estadoEnvio
                                                    ]}
                                            </button>
                                        )}

                                        {pagoAprobado &&
                                            !siguiente && (

                                            <p className="envio-aviso ok">
                                                Envío finalizado.
                                            </p>
                                        )}

                                    </div>

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
