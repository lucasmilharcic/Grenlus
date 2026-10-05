import {
    useEffect,
    useState
} from "react";

import {
    Link,
    Navigate
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
    getUsuario,
    isAuthenticated
} from "../services/authService";

import {
    useCarrito
} from "../context/CarritoContext";

import {
    crearPedido
} from "../services/pedidoService";

import {
    crearPreferenciaMercadoPagoCuenta,
    getDatosTransferencia,
    subirComprobanteTransferenciaCuenta
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
    ).format(
        Number(valor || 0)
    );
}

export default function Checkout() {

    const {
        items,
        total,
        vaciarCarrito
    } = useCarrito();

    // =====================================================
    // CLIENTE
    // =====================================================

    const [
        nombreCliente,
        setNombreCliente
    ] = useState(() => getUsuario()?.nombre || "");

    const [
        telefono,
        setTelefono
    ] = useState("");

    const [
        email,
        setEmail
    ] = useState(() => {
        const username = getUsuario()?.username;
        return username?.includes("@") ? username : "";
    });

    const [
        direccion,
        setDireccion
    ] = useState("");

    const [
        ciudad,
        setCiudad
    ] = useState("");

    const [
        provincia,
        setProvincia
    ] = useState("");

    const [
        codigoPostal,
        setCodigoPostal
    ] = useState("");

    // =====================================================
    // ENTREGA
    // =====================================================

    const [
        metodoEntrega,
        setMetodoEntrega
    ] = useState("RETIRO");

    // =====================================================
    // PAGO
    // =====================================================

    const [
        metodoPago,
        setMetodoPago
    ] = useState(
        "MERCADO_PAGO"
    );

    const [
        enviando,
        setEnviando
    ] = useState(false);

    const [
        error,
        setError
    ] = useState("");

    const [
        pedidoCreado,
        setPedidoCreado
    ] = useState(null);

    const [
        datosTransferencia,
        setDatosTransferencia
    ] = useState(null);

    const [
        comprobante,
        setComprobante
    ] = useState(null);

    const [
        subiendoComprobante,
        setSubiendoComprobante
    ] = useState(false);

    const [
        comprobanteEnviado,
        setComprobanteEnviado
    ] = useState(false);

    const autenticado = isAuthenticated();

    // =====================================================
    // TOTAL
    // =====================================================

    const costoEnvio = 0;

    const totalFinal =
        Number(total || 0) +
        costoEnvio;

    // =====================================================
    // TRANSFERENCIA
    // =====================================================

    useEffect(() => {

        if (
            metodoPago ===
            "TRANSFERENCIA"
        ) {

            cargarDatosTransferencia();
        }

    }, [metodoPago]);

    async function cargarDatosTransferencia() {

        try {

            const data =
                await getDatosTransferencia();

            setDatosTransferencia(
                data
            );

        } catch (err) {

            console.error(err);
        }
    }

    // =====================================================
    // CAMBIO ENTREGA
    // =====================================================

    function seleccionarEntrega(
        valor
    ) {

        setMetodoEntrega(
            valor
        );

        if (valor === "ENVIO_DOMICILIO") {
            setMetodoPago("MERCADO_PAGO");
        }

        setError("");

    }

    // =====================================================
    // ITEMS -> PEDIDO
    // =====================================================

    function convertirItemsAPedido() {

        return items.map(
            (item) => ({

                productoId:
                    Number(
                        item.productoId
                    ),

                cantidad:
                    Number(
                        item.cantidad
                    ),

                talle:
                    item.talle ||
                    null,

                color:
                    item.color ||
                    null,

                disenos:
                    (
                        item.disenos ||
                        []
                    ).map(
                        (diseno) => ({

                            rutaImagen:
                                diseno.rutaImagen,

                            posicion:
                                diseno.posicion,

                            tamano:
                                diseno.tamano,

                            posicionX:
                                Number(
                                    diseno.posicionX ||
                                    0
                                ),

                            posicionY:
                                Number(
                                    diseno.posicionY ||
                                    0
                                ),

                            ancho:
                                Number(
                                    diseno.ancho ||
                                    0
                                ),

                            alto:
                                Number(
                                    diseno.alto ||
                                    0
                                ),

                            anchoCm:
                                diseno.anchoCm != null
                                    ? Number(
                                        diseno.anchoCm
                                    )
                                    : null,

                            altoCm:
                                diseno.altoCm != null
                                    ? Number(
                                        diseno.altoCm
                                    )
                                    : null,

                            observaciones:
                                diseno.observaciones ||
                                null

                        })
                    )
            })
        );
    }

    // =====================================================
    // CONFIRMAR
    // =====================================================

    async function handleConfirmar(
        e
    ) {

        e.preventDefault();

        setError("");

        if (
            items.length === 0
        ) {

            setError(
                "Tu carrito está vacío."
            );

            return;
        }

        if (
            !nombreCliente.trim()
        ) {

            setError(
                "Ingresá tu nombre."
            );

            return;
        }

        if (
            !telefono.trim()
        ) {

            setError(
                "Ingresá tu teléfono o WhatsApp."
            );

            return;
        }

        if (!metodoEntrega) {

            setError(
                "Debés seleccionar una forma de entrega."
            );

            return;
        }

        if (
            metodoEntrega ===
            "ENVIO_DOMICILIO"
        ) {

            if (!email.trim()) {

                setError(
                    "Ingresá tu email para recibir la cotización del envío."
                );

                return;
            }

            if (
                !direccion.trim()
            ) {

                setError(
                    "Ingresá la dirección de envío."
                );

                return;
            }

            if (
                !ciudad.trim()
            ) {

                setError(
                    "Ingresá la localidad."
                );

                return;
            }

            if (
                !provincia.trim()
            ) {

                setError(
                    "Ingresá la provincia."
                );

                return;
            }

            if (
                !codigoPostal.trim()
            ) {

                setError(
                    "Ingresá el código postal."
                );

                return;
            }

        }

        try {

            setEnviando(
                true
            );

            const pedido =
                await crearPedido({

                    nombreCliente:
                        nombreCliente.trim(),

                    telefono:
                        telefono.trim(),

                    email:
                        email.trim(),

                    direccion:
                        metodoEntrega ===
                            "ENVIO_DOMICILIO"
                            ? direccion.trim()
                            : null,

                    ciudad:
                        metodoEntrega ===
                            "ENVIO_DOMICILIO"
                            ? ciudad.trim()
                            : null,

                    provincia:
                        metodoEntrega ===
                            "ENVIO_DOMICILIO"
                            ? provincia.trim()
                            : null,

                    codigoPostal:
                        metodoEntrega ===
                            "ENVIO_DOMICILIO"
                            ? codigoPostal.trim()
                            : null,

                    metodoEntrega,

                    metodoPago,

                    detalles:
                        convertirItemsAPedido()
                });

            setPedidoCreado(
                pedido
            );

            if (metodoEntrega === "ENVIO_DOMICILIO") {
                vaciarCarrito();
                return;
            }

            // =================================================
            // MERCADO PAGO
            // =================================================

            if (
                metodoPago ===
                "MERCADO_PAGO"
            ) {

                const preferencia =
                    await crearPreferenciaMercadoPagoCuenta(
                        pedido.id
                    );

                if (
                    !preferencia.url
                ) {

                    throw new Error(
                        "Mercado Pago no devolvió una URL de pago."
                    );
                }

                /*
                 * NO vaciamos todavía.
                 * Si el usuario abandona Mercado Pago,
                 * conserva su carrito.
                 */

                window.location.href =
                    preferencia.url;

                return;
            }

            // =================================================
            // TRANSFERENCIA
            // =================================================

            if (
                metodoPago ===
                "TRANSFERENCIA"
            ) {

                await cargarDatosTransferencia();

                /*
                 * Tampoco vaciamos antes
                 * de confirmar efectivamente.
                 */
            }

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "No se pudo confirmar el pedido."
            );

        } finally {

            setEnviando(
                false
            );
        }
    }

    // =====================================================
    // COMPROBANTE
    // =====================================================

    async function handleSubirComprobante() {

        if (
            !pedidoCreado ||
            !comprobante
        ) {

            return;
        }

        try {

            setSubiendoComprobante(
                true
            );

            setError("");

            await subirComprobanteTransferenciaCuenta(
                pedidoCreado.id,
                comprobante
            );

            setComprobanteEnviado(
                true
            );

            /*
             * Acá sí consideramos terminado
             * el flujo por transferencia.
             */
            vaciarCarrito();

        } catch (err) {

            setError(
                err.message ||
                "No se pudo subir el comprobante."
            );

        } finally {

            setSubiendoComprobante(
                false
            );
        }
    }

    // =====================================================
    // TRANSFERENCIA CREADA
    // =====================================================

    if (!autenticado) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: { pathname: "/checkout" } }}
            />
        );
    }

    if (
        pedidoCreado &&
        pedidoCreado.metodoEntrega === "ENVIO_DOMICILIO"
    ) {

        return (
            <>
                <Navbar />

                <main className="checkout-page">

                    <div className="checkout-cotizacion-final">

                        <span className="checkout-eyebrow">
                            PEDIDO #{pedidoCreado.id}
                        </span>

                        <h1>
                            Recibimos tu pedido
                        </h1>

                        <p>
                            El envío está pendiente de cotización por MiCorreo.
                            Te vamos a contactar por email con el costo del envío
                            y el total final. También vas a verlo actualizado en
                            Mis compras, dentro de tu cuenta.
                        </p>

                        <div className="checkout-envio-resumen-final">
                            <span>Envío</span>
                            <strong>A cotizar</strong>
                        </div>

                        <div className="checkout-envio-resumen-final">
                            <span>Subtotal de productos</span>
                            <strong>
                                {formatearPrecio(pedidoCreado.subtotalProductos)}
                            </strong>
                        </div>

                        <p className="checkout-cotizacion-contacto">
                            Enviaremos la cotización a{" "}
                            <strong>{pedidoCreado.email}</strong>.
                            No realices el pago todavía. Cuando recibas el aviso,
                            iniciá sesión para pagar desde Mis compras.
                        </p>

                        {error && (
                            <div className="checkout-error">
                                {error}
                            </div>
                        )}

                        <Link
                            to="/mis-compras"
                            className="checkout-volver"
                        >
                            Consultar estado del pedido
                        </Link>

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

    if (
        pedidoCreado &&
        metodoPago ===
        "TRANSFERENCIA"
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
                            Tu pedido ya fue registrado.
                            Transferí el total indicado y
                            subí el comprobante.
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

                        {pedidoCreado.metodoEntrega ===
                            "ENVIO_DOMICILIO" && (

                                <div className="checkout-envio-resumen-final">

                                    <span>
                                        Envío
                                    </span>

                                    <strong>
                                        {formatearPrecio(
                                            pedidoCreado.costoEnvio
                                        )}
                                    </strong>

                                </div>
                            )}

                        <div className="datos-bancarios">

                            <div>
                                <span>Alias</span>

                                <strong>
                                    {datosTransferencia?.alias ||
                                        "No configurado"}
                                </strong>
                            </div>

                            <div>
                                <span>CBU</span>

                                <strong>
                                    {datosTransferencia?.cbu ||
                                        "No configurado"}
                                </strong>
                            </div>

                            <div>
                                <span>Titular</span>

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
                                Comprobante recibido. El pago
                                quedará pendiente hasta que sea
                                verificado.
                            </div>
                        )}

                        {error && (

                            <div className="checkout-error">
                                {error}
                            </div>
                        )}

                        <Link
                            to="/mis-compras"
                            className="checkout-volver"
                        >
                            Consultar estado del pedido
                        </Link>

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

    // =====================================================
    // CARRITO VACÍO
    // =====================================================

    if (
        items.length === 0
    ) {

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

    // =====================================================
    // CHECKOUT
    // =====================================================

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
                                Completá tus datos, elegí la
                                entrega y cómo querés pagar.
                                No necesitás crear una cuenta para comprar.
                            </p>

                        </header>

                        <form
                            className="checkout-form"
                            onSubmit={handleConfirmar}
                        >

                            {/* =========================
                                CONTACTO
                            ========================= */}

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
                                        />

                                    </div>

                                    <div className="checkout-field checkout-full">

                                        <label>
                                            Email
                                            {metodoEntrega === "ENVIO_DOMICILIO"
                                                ? " *"
                                                : ""}
                                        </label>

                                        <input
                                            type="email"
                                            required={
                                                metodoEntrega === "ENVIO_DOMICILIO"
                                            }
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>

                                </div>

                            </section>

                            {/* =========================
                                ENTREGA
                            ========================= */}

                            <section className="checkout-section">

                                <h2>
                                    Forma de entrega
                                </h2>

                                <div className="checkout-entregas">

                                    <label
                                        className={`metodo-entrega ${metodoEntrega ===
                                            "RETIRO"
                                            ? "selected"
                                            : ""
                                            }`}
                                    >

                                        <input
                                            type="radio"
                                            name="metodoEntrega"
                                            value="RETIRO"
                                            checked={
                                                metodoEntrega ===
                                                "RETIRO"
                                            }
                                            onChange={() =>
                                                seleccionarEntrega(
                                                    "RETIRO"
                                                )
                                            }
                                        />

                                        <div>
                                            <strong>
                                                Retiro / coordinar
                                            </strong>

                                            <span>
                                                Sin costo de envío.
                                                Coordinamos por WhatsApp.
                                            </span>
                                        </div>

                                    </label>

                                    <label
                                        className={`metodo-entrega ${metodoEntrega ===
                                            "ENVIO_DOMICILIO"
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
                                            onChange={() =>
                                                seleccionarEntrega(
                                                    "ENVIO_DOMICILIO"
                                                )
                                            }
                                        />

                                        <div>
                                            <strong>
                                                Envío a cotizar por mail
                                            </strong>

                                            <span>
                                                Te confirmamos el costo y el total por email antes de pagar.
                                            </span>
                                        </div>

                                    </label>

                                </div>

                                {metodoEntrega ===
                                    "ENVIO_DOMICILIO" && (

                                        <div className="checkout-envio-box">

                                            <div className="checkout-grid">

                                                <div className="checkout-field">

                                                    <label>
                                                        Provincia *
                                                    </label>

                                                    <input
                                                        type="text"
                                                        value={provincia}
                                                        onChange={(e) => {
                                                            setProvincia(
                                                                e.target.value
                                                            );

                                                        }}
                                                        placeholder="Buenos Aires"
                                                    />

                                                </div>

                                                <div className="checkout-field">

                                                    <label>
                                                        Localidad *
                                                    </label>

                                                    <input
                                                        type="text"
                                                        value={ciudad}
                                                        onChange={(e) => {
                                                            setCiudad(
                                                                e.target.value
                                                            );

                                                        }}
                                                        placeholder="Temperley"
                                                    />

                                                </div>

                                                <div className="checkout-field">

                                                    <label>
                                                        Código postal *
                                                    </label>

                                                    <input
                                                        type="text"
                                                        value={codigoPostal}
                                                        onChange={(e) => {
                                                            setCodigoPostal(
                                                                e.target.value
                                                            );

                                                        }}
                                                        placeholder="1834"
                                                    />

                                                </div>

                                                <div className="checkout-field">

                                                    <label>
                                                        Dirección *
                                                    </label>

                                                    <input
                                                        type="text"
                                                        value={direccion}
                                                        onChange={(e) =>
                                                            setDireccion(
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="Calle, altura, piso..."
                                                    />

                                                </div>

                                            </div>

                                            <p className="checkout-envio-aviso">
                                                Envío a cotizar por email. Te enviaremos el costo y el total final antes de que pagues.
                                            </p>

                                        </div>
                                    )}

                            </section>

                            {/* =========================
                                PAGO
                            ========================= */}

                            {metodoEntrega !== "ENVIO_DOMICILIO" ? (
                            <section className="checkout-section">

                                <h2>
                                    Medio de pago
                                </h2>

                                <div className="metodos-pago">

                                    <label
                                        className={`metodo-pago ${metodoPago ===
                                            "MERCADO_PAGO"
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
                                                Pagá online a través de
                                                Mercado Pago.
                                            </span>
                                        </div>

                                    </label>

                                    <label
                                        className={`metodo-pago ${metodoPago ===
                                            "TRANSFERENCIA"
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
                                                Transferí y enviá el
                                                comprobante.
                                            </span>
                                        </div>

                                    </label>

                                </div>

                            </section>
                            ) : (
                                <div className="checkout-envio-aviso">
                                    El envío se cotiza manualmente. No se cobrará nada
                                    hasta que recibas por email el costo y el total final.
                                </div>
                            )}

                            {error && (

                                <div className="checkout-error">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="checkout-confirmar"
                                disabled={
                                    enviando
                                }
                            >
                                {enviando
                                    ? "Procesando..."
                                    : metodoEntrega === "ENVIO_DOMICILIO"
                                        ? "Solicitar cotización"
                                        : metodoPago ===
                                        "MERCADO_PAGO"
                                        ? "Continuar a Mercado Pago"
                                        : "Confirmar pedido"}
                            </button>

                        </form>

                    </section>

                    {/* =========================
                        RESUMEN
                    ========================= */}

                    <aside className="checkout-summary">

                        <span className="checkout-eyebrow">
                            TU PEDIDO
                        </span>

                        {items.map(
                            (item) => (

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
                                            {item.descuentoMayoristaAplicado &&
                                                ` · ${item.descuentoMayoristaPorcentaje}% mayorista`}
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
                                <span>
                                    Productos
                                </span>

                                <strong>
                                    {formatearPrecio(
                                        total
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Entrega
                                </span>

                                <strong>
                                    {metodoEntrega === "RETIRO"
                                        ? "Gratis"
                                        : "A cotizar por mail"}
                                </strong>
                            </div>

                        </div>

                        <div className="checkout-total">

                            <span>
                                {metodoEntrega === "ENVIO_DOMICILIO"
                                    ? "Subtotal sin envío"
                                    : "Total"}
                            </span>

                            <strong>
                                {formatearPrecio(
                                    totalFinal
                                )}
                            </strong>

                        </div>

                        <small>
                            {metodoEntrega === "ENVIO_DOMICILIO"
                                ? "El pedido queda registrado sin cobrar. Te enviaremos el total final antes de pagar."
                                : "El servidor verificará nuevamente los precios al crear el pedido."}
                        </small>

                    </aside>

                </div>

            </main>

            <Footer />
        </>
    );
}