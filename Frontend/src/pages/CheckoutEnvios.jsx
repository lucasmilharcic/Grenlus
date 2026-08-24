
import {
    useEffect,
    useState
} from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
    useCarrito
} from "../context/CarritoContext";

import {
    crearPedido
} from "../services/pedidoService";

import {
    cotizarEnvio
} from "../services/envioService";

import {
    crearPreferenciaMercadoPago,
    getDatosTransferencia,
    subirComprobanteTransferencia
} from "../services/pagoService";

import "./Checkout.css";

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

export default function Checkout() {

    const navigate =
        useNavigate();

    const {
        items,
        total,
        vaciarCarrito
    } = useCarrito();

    const [nombreCliente, setNombreCliente] =
        useState("");

    const [telefono, setTelefono] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [direccion, setDireccion] =
        useState("");

    const [ciudad, setCiudad] =
        useState("");

    const [provincia, setProvincia] =
        useState("");

    const [codigoPostal, setCodigoPostal] =
        useState("");

    const [metodoEntrega, setMetodoEntrega] =
        useState("RETIRO");

    const [cotizacionEnvio, setCotizacionEnvio] =
        useState(null);

    const [cotizandoEnvio, setCotizandoEnvio] =
        useState(false);

    const [metodoPago, setMetodoPago] =
        useState("MERCADO_PAGO");

    const [enviando, setEnviando] =
        useState(false);

    const [error, setError] =
        useState("");

    const [pedidoCreado, setPedidoCreado] =
        useState(null);

    const [
        datosTransferencia,
        setDatosTransferencia
    ] = useState(null);

    const [comprobante, setComprobante] =
        useState(null);

    const [
        subiendoComprobante,
        setSubiendoComprobante
    ] = useState(false);

    const [
        comprobanteEnviado,
        setComprobanteEnviado
    ] = useState(false);

    useEffect(() => {

        if (
            metodoPago === "TRANSFERENCIA"
        ) {

            cargarDatosTransferencia();
        }

    }, [metodoPago]);

    useEffect(() => {

        if (metodoEntrega === "RETIRO") {
            setCotizacionEnvio(null);
        }

    }, [metodoEntrega]);

    useEffect(() => {

        if (metodoEntrega === "ENVIO_DOMICILIO") {
            setCotizacionEnvio(null);
        }

    }, [provincia, ciudad, codigoPostal, metodoEntrega]);

    async function cargarDatosTransferencia() {

        try {

            const data =
                await getDatosTransferencia();

            setDatosTransferencia(data);

        } catch (err) {

            console.error(err);
        }
    }

    async function handleCotizarEnvio() {

        setError("");

        if (!provincia.trim()) {
            setError("Seleccioná una provincia.");
            return;
        }

        if (!ciudad.trim()) {
            setError("Ingresá tu localidad o ciudad.");
            return;
        }

        if (!codigoPostal.trim()) {
            setError("Ingresá tu código postal.");
            return;
        }

        try {

            setCotizandoEnvio(true);

            const data = await cotizarEnvio({
                codigoPostal: codigoPostal.trim(),
                provincia: provincia.trim(),
                localidad: ciudad.trim()
            });

            setCotizacionEnvio(data);

        } catch (err) {

            console.error(err);

            setCotizacionEnvio(null);
            setError(
                err.message ||
                "No se pudo calcular el envío."
            );

        } finally {

            setCotizandoEnvio(false);
        }
    }

    function convertirItemsAPedido() {

        return items.map((item) => ({

            productoId:
                Number(item.productoId),

            cantidad:
                Number(item.cantidad),

            talle:
                item.talle || null,

            color:
                item.color || null,

            disenos:
                (item.disenos || []).map(
                    (diseno) => ({

                        rutaImagen:
                            diseno.rutaImagen,

                        posicion:
                            diseno.posicion,

                        tamano:
                            diseno.tamano,

                        posicionX:
                            Number(
                                diseno.posicionX || 0
                            ),

                        posicionY:
                            Number(
                                diseno.posicionY || 0
                            ),

                        ancho:
                            Number(
                                diseno.ancho || 0
                            ),

                        alto:
                            Number(
                                diseno.alto || 0
                            ),

                        anchoCm:
                            diseno.anchoCm != null
                                ? Number(diseno.anchoCm)
                                : null,

                        altoCm:
                            diseno.altoCm != null
                                ? Number(diseno.altoCm)
                                : null,

                        observaciones:
                            diseno.observaciones || null

                    })
                )

        }));
    }

    async function handleConfirmar(e) {

        e.preventDefault();

        setError("");

        if (items.length === 0) {

            setError(
                "Tu carrito está vacío."
            );

            return;
        }

        if (!nombreCliente.trim()) {

            setError(
                "Ingresá tu nombre."
            );

            return;
        }

        if (!telefono.trim()) {

            setError(
                "Ingresá tu teléfono o WhatsApp."
            );

            return;
        }

        if (metodoEntrega === "ENVIO_DOMICILIO") {

            if (!direccion.trim()) {
                setError("Ingresá una dirección de entrega.");
                return;
            }

            if (!ciudad.trim()) {
                setError("Ingresá tu localidad o ciudad.");
                return;
            }

            if (!provincia.trim()) {
                setError("Seleccioná una provincia.");
                return;
            }

            if (!codigoPostal.trim()) {
                setError("Ingresá tu código postal.");
                return;
            }

            if (!cotizacionEnvio?.tarifaId) {
                setError("Calculá el costo de envío antes de continuar.");
                return;
            }
        }

        try {

            setEnviando(true);

            const pedido =
                await crearPedido({

                    nombreCliente:
                        nombreCliente.trim(),

                    telefono:
                        telefono.trim(),

                    email:
                        email.trim(),

                    direccion:
                        direccion.trim(),

                    ciudad:
                        ciudad.trim() || null,

                    provincia:
                        provincia.trim() || null,

                    codigoPostal:
                        codigoPostal.trim() || null,

                    metodoEntrega,

                    tarifaEnvioId:
                        metodoEntrega === "ENVIO_DOMICILIO"
                            ? cotizacionEnvio?.tarifaId
                            : null,

                    metodoPago,

                    detalles:
                        convertirItemsAPedido()

                });

            setPedidoCreado(pedido);

            /*
             * MERCADO PAGO
             */
            if (
                metodoPago ===
                "MERCADO_PAGO"
            ) {

                const preferencia =
                    await crearPreferenciaMercadoPago(
                        pedido.id
                    );

                if (!preferencia.url) {

                    throw new Error(
                        "Mercado Pago no devolvió una URL de pago."
                    );
                }

                localStorage.setItem(
                    "grenlus_pedido_pendiente",
                    String(pedido.id)
                );

                window.location.href =
                    preferencia.url;

                return;
            }

            /*
             * TRANSFERENCIA
             */
            if (
                metodoPago ===
                "TRANSFERENCIA"
            ) {

                await cargarDatosTransferencia();

                localStorage.setItem(
                    "grenlus_pedido_pendiente",
                    String(pedido.id)
                );
            }

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "No se pudo confirmar el pedido."
            );

        } finally {

            setEnviando(false);
        }
    }

    async function handleSubirComprobante() {

        if (
            !pedidoCreado ||
            !comprobante
        ) {
            return;
        }

        try {

            setSubiendoComprobante(true);
            setError("");

            await subirComprobanteTransferencia(
                pedidoCreado.id,
                comprobante
            );

            setComprobanteEnviado(true);

            vaciarCarrito();

            localStorage.removeItem(
                "grenlus_pedido_pendiente"
            );

        } catch (err) {

            setError(
                err.message ||
                "No se pudo subir el comprobante."
            );

        } finally {

            setSubiendoComprobante(false);
        }
    }

    if (
        pedidoCreado &&
        metodoPago === "TRANSFERENCIA"
    ) {

        return (
            <>
                <Navbar />

                <main className="checkout-page">

                    <div className="checkout-transferencia-final">

                        <span className="checkout-eyebrow">
                            PEDIDO #{pedidoCreado.id}
                        </span>

                        <h1>
                            Realizá la transferencia
                        </h1>

                        <p>
                            Tu pedido ya fue registrado. Transferí el total indicado y, si querés, subí el comprobante.
                        </p>

                        <div className="transferencia-total">

                            <span>
                                Total
                            </span>

                            <strong>
                                {formatearPrecio(
                                    pedidoCreado.total
                                )}
                            </strong>

                        </div>

                        <div className="datos-bancarios">

                            <div>
                                <span>
                                    Alias
                                </span>

                                <strong>
                                    {datosTransferencia?.alias ||
                                        "No configurado"}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    CBU
                                </span>

                                <strong>
                                    {datosTransferencia?.cbu ||
                                        "No configurado"}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Titular
                                </span>

                                <strong>
                                    {datosTransferencia?.titular ||
                                        "GRENLUS"}
                                </strong>
                            </div>

                        </div>

                        {!comprobanteEnviado ? (

                            <div className="comprobante-box">

                                <label>
                                    Comprobante de transferencia
                                </label>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setComprobante(
                                            e.target.files?.[0] ||
                                            null
                                        )
                                    }
                                />

                                <button
                                    type="button"
                                    onClick={
                                        handleSubirComprobante
                                    }
                                    disabled={
                                        !comprobante ||
                                        subiendoComprobante
                                    }
                                >
                                    {subiendoComprobante
                                        ? "Subiendo..."
                                        : "Enviar comprobante"}
                                </button>

                            </div>

                        ) : (

                            <div className="checkout-success">
                                Comprobante recibido. El pago quedará pendiente hasta que sea verificado.
                            </div>

                        )}

                        {error && (
                            <div className="checkout-error">
                                {error}
                            </div>
                        )}

                        <Link
                            to="/"
                            className="checkout-volver"
                        >
                            Volver al inicio
                        </Link>

                    </div>

                </main>

                <Footer />
            </>
        );
    }

    if (items.length === 0) {

        return (
            <>
                <Navbar />

                <main className="checkout-page">

                    <div className="checkout-empty">

                        <h1>
                            No hay productos para pagar
                        </h1>

                        <Link to="/carrito">
                            Volver al carrito
                        </Link>

                    </div>

                </main>

                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="checkout-page">

                <div className="checkout-container">

                    <section className="checkout-main">

                        <header className="checkout-header">

                            <span className="checkout-eyebrow">
                                CHECKOUT
                            </span>

                            <h1>
                                Finalizar compra
                            </h1>

                            <p>
                                Completá tus datos, elegí la entrega y revisá el total antes de pagar.
                            </p>

                        </header>

                        <form
                            className="checkout-form"
                            onSubmit={handleConfirmar}
                        >

                            <section className="checkout-section">

                                <h2>
                                    Datos de contacto
                                </h2>

                                <div className="checkout-grid">

                                    <div className="checkout-field">

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
                                            required
                                        />

                                    </div>

                                    <div className="checkout-field">

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
                                            required
                                        />

                                    </div>

                                    <div className="checkout-field">

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
                                        />

                                    </div>

                                    <div className="checkout-field">

                                        <label>
                                            Ciudad / localidad {metodoEntrega === "ENVIO_DOMICILIO" ? "*" : ""}
                                        </label>

                                        <input
                                            type="text"
                                            value={ciudad}
                                            onChange={(e) =>
                                                setCiudad(
                                                    e.target.value
                                                )
                                            }
                                            required={
                                                metodoEntrega ===
                                                "ENVIO_DOMICILIO"
                                            }
                                        />

                                    </div>

                                    <div className="checkout-field checkout-full">

                                        <label>
                                            Dirección {metodoEntrega === "ENVIO_DOMICILIO" ? "*" : ""}
                                        </label>

                                        <input
                                            type="text"
                                            value={direccion}
                                            onChange={(e) =>
                                                setDireccion(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Calle, altura, piso, etc."
                                            required={
                                                metodoEntrega ===
                                                "ENVIO_DOMICILIO"
                                            }
                                        />

                                    </div>

                                </div>

                            </section>

                            <section className="checkout-section">

                                <h2>
                                    Entrega
                                </h2>

                                <div className="metodos-pago checkout-entregas">

                                    <label
                                        className={`metodo-pago ${
                                            metodoEntrega === "RETIRO"
                                                ? "selected"
                                                : ""
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="metodoEntrega"
                                            value="RETIRO"
                                            checked={
                                                metodoEntrega === "RETIRO"
                                            }
                                            onChange={(e) =>
                                                setMetodoEntrega(
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <div>
                                            <strong>
                                                Retiro / coordinar
                                            </strong>
                                            <span>
                                                Sin costo de envío. Coordinamos por WhatsApp.
                                            </span>
                                        </div>
                                    </label>

                                    <label
                                        className={`metodo-pago ${
                                            metodoEntrega === "ENVIO_DOMICILIO"
                                                ? "selected"
                                                : ""
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="metodoEntrega"
                                            value="ENVIO_DOMICILIO"
                                            checked={
                                                metodoEntrega ===
                                                "ENVIO_DOMICILIO"
                                            }
                                            onChange={(e) =>
                                                setMetodoEntrega(
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <div>
                                            <strong>
                                                Envío a domicilio
                                            </strong>
                                            <span>
                                                Calculamos el costo según tu zona antes de pagar.
                                            </span>
                                        </div>
                                    </label>

                                </div>

                                {metodoEntrega === "ENVIO_DOMICILIO" && (

                                    <div className="checkout-envio-box">

                                        <div className="checkout-grid">

                                            <div className="checkout-field">
                                                <label>Provincia *</label>
                                                <input
                                                    type="text"
                                                    value={provincia}
                                                    onChange={(e) =>
                                                        setProvincia(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Ej: Buenos Aires"
                                                />
                                            </div>

                                            <div className="checkout-field">
                                                <label>Código postal *</label>
                                                <input
                                                    type="text"
                                                    value={codigoPostal}
                                                    onChange={(e) =>
                                                        setCodigoPostal(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Ej: 1824"
                                                />
                                            </div>

                                        </div>

                                        <button
                                            type="button"
                                            className="checkout-cotizar-envio"
                                            onClick={handleCotizarEnvio}
                                            disabled={cotizandoEnvio}
                                        >
                                            {cotizandoEnvio
                                                ? "Calculando..."
                                                : "Calcular envío"}
                                        </button>

                                        {cotizacionEnvio && (
                                            <div className="checkout-cotizacion-ok">
                                                <div>
                                                    <span>
                                                        {cotizacionEnvio.nombre ||
                                                            cotizacionEnvio.zona}
                                                    </span>
                                                    <small>
                                                        Zona {cotizacionEnvio.zona}
                                                    </small>
                                                </div>
                                                <strong>
                                                    {formatearPrecio(
                                                        cotizacionEnvio.precio
                                                    )}
                                                </strong>
                                            </div>
                                        )}

                                    </div>
                                )}

                            </section>

                            <section className="checkout-section">

                                <h2>
                                    Medio de pago
                                </h2>

                                <div className="metodos-pago">

                                    <label
                                        className={`metodo-pago ${
                                            metodoPago === "MERCADO_PAGO"
                                                ? "selected"
                                                : ""
                                        }`}
                                    >

                                        <input
                                            type="radio"
                                            name="metodoPago"
                                            value="MERCADO_PAGO"
                                            checked={
                                                metodoPago ===
                                                "MERCADO_PAGO"
                                            }
                                            onChange={(e) =>
                                                setMetodoPago(
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <div>

                                            <strong>
                                                Mercado Pago / Tarjeta
                                            </strong>

                                            <span>
                                                Pagá online a través de Mercado Pago.
                                            </span>

                                        </div>

                                    </label>

                                    <label
                                        className={`metodo-pago ${
                                            metodoPago === "TRANSFERENCIA"
                                                ? "selected"
                                                : ""
                                        }`}
                                    >

                                        <input
                                            type="radio"
                                            name="metodoPago"
                                            value="TRANSFERENCIA"
                                            checked={
                                                metodoPago ===
                                                "TRANSFERENCIA"
                                            }
                                            onChange={(e) =>
                                                setMetodoPago(
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <div>

                                            <strong>
                                                Transferencia bancaria
                                            </strong>

                                            <span>
                                                Transferí y enviá el comprobante.
                                            </span>

                                        </div>

                                    </label>

                                </div>

                            </section>

                            {error && (

                                <div className="checkout-error">
                                    {error}
                                </div>

                            )}

                            <button
                                type="submit"
                                className="checkout-confirmar"
                                disabled={enviando}
                            >
                                {enviando
                                    ? "Procesando..."
                                    : metodoPago === "MERCADO_PAGO"
                                        ? "Continuar a Mercado Pago"
                                        : "Confirmar pedido"}
                            </button>

                        </form>

                    </section>

                    <aside className="checkout-summary">

                        <span className="checkout-eyebrow">
                            TU PEDIDO
                        </span>

                        {items.map((item) => (

                            <div
                                className="checkout-summary-item"
                                key={item.carritoId}
                            >

                                <div>
                                    <strong>
                                        {item.nombre}
                                    </strong>

                                    <span>
                                        {item.cantidad} ×{" "}
                                        {formatearPrecio(
                                            item.precioUnitario
                                        )}
                                    </span>
                                </div>

                                <strong>
                                    {formatearPrecio(
                                        Number(
                                            item.precioUnitario
                                        ) *
                                        Number(
                                            item.cantidad
                                        )
                                    )}
                                </strong>

                            </div>

                        ))}

                        <div className="checkout-summary-totales">

                            <div>
                                <span>Productos</span>
                                <strong>
                                    {formatearPrecio(total)}
                                </strong>
                            </div>

                            <div>
                                <span>Entrega</span>
                                <strong>
                                    {metodoEntrega === "RETIRO"
                                        ? "Gratis"
                                        : cotizacionEnvio
                                            ? formatearPrecio(
                                                cotizacionEnvio.precio
                                            )
                                            : "A calcular"}
                                </strong>
                            </div>

                        </div>

                        <div className="checkout-total">

                            <span>
                                Total
                            </span>

                            <strong>
                                {formatearPrecio(
                                    Number(total || 0) +
                                    (metodoEntrega === "ENVIO_DOMICILIO"
                                        ? Number(
                                            cotizacionEnvio?.precio || 0
                                        )
                                        : 0)
                                )}
                            </strong>

                        </div>

                        <small>
                            El servidor verificará nuevamente todos los precios al crear el pedido.
                        </small>

                    </aside>

                </div>

            </main>

            <Footer />
        </>
    );
}