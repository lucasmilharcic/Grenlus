import {
    useEffect,
    useState
} from "react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import AreaPersonalizacionEditor
    from "../../components/AreaPersonalizacionEditor";

import {
    crearIndumentaria,
    crearCarteleria,
    getProductos,
    editarIndumentaria,
    editarCarteleria,
    eliminarProducto,
    getAreasPersonalizacion,
    obtenerUrlArchivo
} from "../../services/productoService";

import "./ProductosAdmin.css";

// =====================================================
// HELPERS
// =====================================================

function esIndumentaria(producto) {

    return (
        producto?.usaTalles !== undefined ||
        producto?.usaColores !== undefined ||
        producto?.permiteFrente !== undefined ||
        producto?.permiteEspalda !== undefined ||
        producto?.permiteManga !== undefined ||
        producto?.permiteEstampaChica !== undefined
    );
}

function normalizarNumero(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {
        return "";
    }

    return String(valor);
}

function precio(valor) {

    const numero =
        Number(valor || 0);

    return new Intl.NumberFormat(
        "es-AR",
        {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0
        }
    ).format(numero);
}

export default function ProductosAdmin() {

    // =====================================================
    // PRODUCTOS
    // =====================================================

    const [
        productos,
        setProductos
    ] = useState([]);

    const [
        loadingProductos,
        setLoadingProductos
    ] = useState(true);

    const [
        errorProductos,
        setErrorProductos
    ] = useState("");

    // =====================================================
    // FORM CREAR
    // =====================================================

    const [tipo, setTipo] =
        useState("indumentaria");

    const [nombre, setNombre] =
        useState("");

    const [
        descripcion,
        setDescripcion
    ] = useState("");

    const [imagen, setImagen] =
        useState(null);

    // PRECIOS INDUMENTARIA

    const [
        precioBase,
        setPrecioBase
    ] = useState("");

    const [
        precioEstampaChica,
        setPrecioEstampaChica
    ] = useState("");

    const [
        precioEstampaMedia,
        setPrecioEstampaMedia
    ] = useState("");

    const [
        precioEstampaGrande,
        setPrecioEstampaGrande
    ] = useState("");

    // DATOS LOGÍSTICOS - ZIPNOVA

    const [pesoGramos, setPesoGramos] = useState("");
    const [largoEnvioCm, setLargoEnvioCm] = useState("");
    const [anchoEnvioCm, setAnchoEnvioCm] = useState("");
    const [altoEnvioCm, setAltoEnvioCm] = useState("");

    // CONFIG INDUMENTARIA

    const [
        usaTalles,
        setUsaTalles
    ] = useState(true);

    const [
        usaColores,
        setUsaColores
    ] = useState(true);

    const [
        permiteFrente,
        setPermiteFrente
    ] = useState(true);

    const [
        permiteEspalda,
        setPermiteEspalda
    ] = useState(false);

    const [
        permiteManga,
        setPermiteManga
    ] = useState(false);

    const [
        requiereImagen,
        setRequiereImagen
    ] = useState(true);

    // TAMAÑOS

    const [
        permiteEstampaChica,
        setPermiteEstampaChica
    ] = useState(true);

    const [
        permiteEstampaMedia,
        setPermiteEstampaMedia
    ] = useState(true);

    const [
        permiteEstampaGrande,
        setPermiteEstampaGrande
    ] = useState(true);

    // CARTELERÍA

    const [
        esCotizable,
        setEsCotizable
    ] = useState(false);

    const [
        precioFijo,
        setPrecioFijo
    ] = useState("");

    const [
        requiereMedidas,
        setRequiereMedidas
    ] = useState(false);

    const [
        requiereCantidad,
        setRequiereCantidad
    ] = useState(true);

    const [
        requiereInstalacion,
        setRequiereInstalacion
    ] = useState(false);

    const [
        loading,
        setLoading
    ] = useState(false);

    const [
        mensaje,
        setMensaje
    ] = useState("");

    const [
        error,
        setError
    ] = useState("");

    // =====================================================
    // EDICIÓN
    // =====================================================

    const [
        productoEditando,
        setProductoEditando
    ] = useState(null);

    const [
        editNombre,
        setEditNombre
    ] = useState("");

    const [
        editDescripcion,
        setEditDescripcion
    ] = useState("");

    const [
        editImagen,
        setEditImagen
    ] = useState(null);

    // PRECIOS

    const [
        editPrecioBase,
        setEditPrecioBase
    ] = useState("");

    const [
        editPrecioEstampaChica,
        setEditPrecioEstampaChica
    ] = useState("");

    const [
        editPrecioEstampaMedia,
        setEditPrecioEstampaMedia
    ] = useState("");

    const [
        editPrecioEstampaGrande,
        setEditPrecioEstampaGrande
    ] = useState("");

    // DATOS LOGÍSTICOS - ZIPNOVA

    const [editPesoGramos, setEditPesoGramos] = useState("");
    const [editLargoEnvioCm, setEditLargoEnvioCm] = useState("");
    const [editAnchoEnvioCm, setEditAnchoEnvioCm] = useState("");
    const [editAltoEnvioCm, setEditAltoEnvioCm] = useState("");

    // INDUMENTARIA

    const [
        editUsaTalles,
        setEditUsaTalles
    ] = useState(false);

    const [
        editUsaColores,
        setEditUsaColores
    ] = useState(false);

    const [
        editPermiteFrente,
        setEditPermiteFrente
    ] = useState(false);

    const [
        editPermiteEspalda,
        setEditPermiteEspalda
    ] = useState(false);

    const [
        editPermiteManga,
        setEditPermiteManga
    ] = useState(false);

    const [
        editRequiereImagen,
        setEditRequiereImagen
    ] = useState(false);

    const [
        editPermiteEstampaChica,
        setEditPermiteEstampaChica
    ] = useState(false);

    const [
        editPermiteEstampaMedia,
        setEditPermiteEstampaMedia
    ] = useState(false);

    const [
        editPermiteEstampaGrande,
        setEditPermiteEstampaGrande
    ] = useState(false);

    // CARTELERÍA

    const [
        editEsCotizable,
        setEditEsCotizable
    ] = useState(false);

    const [
        editPrecioFijo,
        setEditPrecioFijo
    ] = useState("");

    const [
        editRequiereMedidas,
        setEditRequiereMedidas
    ] = useState(false);

    const [
        editRequiereCantidad,
        setEditRequiereCantidad
    ] = useState(false);

    const [
        editRequiereInstalacion,
        setEditRequiereInstalacion
    ] = useState(false);

    const [
        editLoading,
        setEditLoading
    ] = useState(false);

    const [
        editError,
        setEditError
    ] = useState("");

    // =====================================================
    // ÁREAS
    // =====================================================

    const [
        areasPersonalizacion,
        setAreasPersonalizacion
    ] = useState([]);

    const [
        cargandoAreas,
        setCargandoAreas
    ] = useState(false);

    // =====================================================
    // CARGAR
    // =====================================================

    async function cargarProductos() {

        try {

            setLoadingProductos(true);
            setErrorProductos("");

            const data =
                await getProductos();

            setProductos(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(err);

            setErrorProductos(
                err.message ||
                "No se pudieron cargar los productos."
            );

        } finally {

            setLoadingProductos(false);
        }
    }

    useEffect(() => {

        cargarProductos();

    }, []);

    // =====================================================
    // LIMPIAR
    // =====================================================

    function limpiarFormulario() {

        setNombre("");
        setDescripcion("");
        setImagen(null);

        setPrecioBase("");

        setPrecioEstampaChica("");
        setPrecioEstampaMedia("");
        setPrecioEstampaGrande("");

        setPesoGramos("");
        setLargoEnvioCm("");
        setAnchoEnvioCm("");
        setAltoEnvioCm("");

        setUsaTalles(true);
        setUsaColores(true);

        setPermiteFrente(true);
        setPermiteEspalda(false);
        setPermiteManga(false);

        setRequiereImagen(true);

        setPermiteEstampaChica(true);
        setPermiteEstampaMedia(true);
        setPermiteEstampaGrande(true);

        setEsCotizable(false);
        setPrecioFijo("");

        setRequiereMedidas(false);
        setRequiereCantidad(true);
        setRequiereInstalacion(false);

        const input =
            document.getElementById(
                "imagen-producto"
            );

        if (input) {
            input.value = "";
        }
    }

    // =====================================================
    // CREAR
    // =====================================================

    async function handleSubmit(e) {

        e.preventDefault();

        setLoading(true);
        setMensaje("");
        setError("");

        try {

            if (!nombre.trim()) {

                throw new Error(
                    "El nombre es obligatorio."
                );
            }

            if (tipo === "indumentaria") {

                if (
                    precioBase === "" ||
                    Number(precioBase) < 0
                ) {

                    throw new Error(
                        "Ingresá un precio base válido."
                    );
                }

                if (
                    Number(pesoGramos) <= 0 ||
                    Number(largoEnvioCm) <= 0 ||
                    Number(anchoEnvioCm) <= 0 ||
                    Number(altoEnvioCm) <= 0
                ) {

                    throw new Error(
                        "Completá peso y medidas de envío con valores mayores a cero."
                    );
                }

                if (
                    !permiteEstampaChica &&
                    !permiteEstampaMedia &&
                    !permiteEstampaGrande
                ) {

                    throw new Error(
                        "Habilitá al menos un tamaño de estampa."
                    );
                }

                await crearIndumentaria({

                    nombre,
                    descripcion,
                    imagen,

                    precioBase,

                    precioEstampaChica:
                        permiteEstampaChica
                            ? precioEstampaChica || 0
                            : 0,

                    precioEstampaMedia:
                        permiteEstampaMedia
                            ? precioEstampaMedia || 0
                            : 0,

                    precioEstampaGrande:
                        permiteEstampaGrande
                            ? precioEstampaGrande || 0
                            : 0,

                    pesoGramos,
                    largoEnvioCm,
                    anchoEnvioCm,
                    altoEnvioCm,

                    usaTalles,
                    usaColores,

                    permiteFrente,
                    permiteEspalda,
                    permiteManga,

                    requiereImagen,

                    permiteEstampaChica,
                    permiteEstampaMedia,
                    permiteEstampaGrande
                });

            } else {

                if (
                    !esCotizable &&
                    (
                        precioFijo === "" ||
                        Number(precioFijo) < 0
                    )
                ) {

                    throw new Error(
                        "Ingresá el precio fijo del cartel."
                    );
                }

                await crearCarteleria({

                    nombre,
                    descripcion,
                    imagen,

                    esCotizable,

                    precioFijo:
                        esCotizable
                            ? 0
                            : precioFijo,

                    requiereMedidas,
                    requiereImagen,
                    requiereCantidad,
                    requiereInstalacion
                });
            }

            setMensaje(
                "Producto creado correctamente."
            );

            limpiarFormulario();

            await cargarProductos();

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "No se pudo crear el producto."
            );

        } finally {

            setLoading(false);
        }
    }

    // =====================================================
    // ABRIR EDICIÓN
    // =====================================================

    async function abrirEdicion(
        producto
    ) {

        const tipoProducto =
            esIndumentaria(producto)
                ? "indumentaria"
                : "carteleria";

        setProductoEditando({
            ...producto,
            tipo: tipoProducto
        });

        setEditNombre(
            producto.nombre || ""
        );

        setEditDescripcion(
            producto.descripcion || ""
        );

        setEditImagen(null);

        setEditPrecioBase(
            normalizarNumero(
                producto.precioBase
            )
        );

        setEditPrecioEstampaChica(
            normalizarNumero(
                producto.precioEstampaChica
            )
        );

        setEditPrecioEstampaMedia(
            normalizarNumero(
                producto.precioEstampaMedia
            )
        );

        setEditPrecioEstampaGrande(
            normalizarNumero(
                producto.precioEstampaGrande
            )
        );

        setEditPesoGramos(
            normalizarNumero(producto.pesoGramos)
        );

        setEditLargoEnvioCm(
            normalizarNumero(producto.largoEnvioCm)
        );

        setEditAnchoEnvioCm(
            normalizarNumero(producto.anchoEnvioCm)
        );

        setEditAltoEnvioCm(
            normalizarNumero(producto.altoEnvioCm)
        );

        setEditUsaTalles(
            Boolean(producto.usaTalles)
        );

        setEditUsaColores(
            Boolean(producto.usaColores)
        );

        setEditPermiteFrente(
            Boolean(producto.permiteFrente)
        );

        setEditPermiteEspalda(
            Boolean(producto.permiteEspalda)
        );

        setEditPermiteManga(
            Boolean(producto.permiteManga)
        );

        setEditRequiereImagen(
            Boolean(producto.requiereImagen)
        );

        setEditPermiteEstampaChica(
            Boolean(
                producto.permiteEstampaChica
            )
        );

        setEditPermiteEstampaMedia(
            Boolean(
                producto.permiteEstampaMedia
            )
        );

        setEditPermiteEstampaGrande(
            Boolean(
                producto.permiteEstampaGrande
            )
        );

        setEditEsCotizable(
            Boolean(producto.esCotizable)
        );

        setEditPrecioFijo(
            normalizarNumero(
                producto.precioFijo
            )
        );

        setEditRequiereMedidas(
            Boolean(
                producto.requiereMedidas
            )
        );

        setEditRequiereCantidad(
            Boolean(
                producto.requiereCantidad
            )
        );

        setEditRequiereInstalacion(
            Boolean(
                producto.requiereInstalacion
            )
        );

        setEditError("");
        setAreasPersonalizacion([]);

        if (
            tipoProducto ===
            "indumentaria"
        ) {

            await cargarAreas(
                producto.id
            );
        }
    }

    async function cargarAreas(id) {

        try {

            setCargandoAreas(true);

            const data =
                await getAreasPersonalizacion(
                    id
                );

            setAreasPersonalizacion(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "Error cargando áreas:",
                err
            );

            setAreasPersonalizacion([]);

        } finally {

            setCargandoAreas(false);
        }
    }

    // =====================================================
    // CERRAR EDICIÓN
    // =====================================================

    function cerrarEdicion() {

        if (editLoading) {
            return;
        }

        setProductoEditando(null);

        setEditImagen(null);
        setEditError("");

        setAreasPersonalizacion([]);
    }

    // =====================================================
    // GUARDAR EDICIÓN
    // =====================================================

    async function guardarEdicion(e) {

        e.preventDefault();

        if (!productoEditando) {
            return;
        }

        setEditLoading(true);
        setEditError("");

        try {

            if (!editNombre.trim()) {

                throw new Error(
                    "El nombre es obligatorio."
                );
            }

            if (
                productoEditando.tipo ===
                "indumentaria"
            ) {

                if (
                    Number(editPesoGramos) <= 0 ||
                    Number(editLargoEnvioCm) <= 0 ||
                    Number(editAnchoEnvioCm) <= 0 ||
                    Number(editAltoEnvioCm) <= 0
                ) {

                    throw new Error(
                        "Completá peso y medidas de envío con valores mayores a cero."
                    );
                }

                await editarIndumentaria(
                    productoEditando.id,
                    {
                        nombre:
                            editNombre,

                        descripcion:
                            editDescripcion,

                        imagen:
                            editImagen,

                        precioBase:
                            editPrecioBase,

                        precioEstampaChica:
                            editPermiteEstampaChica
                                ? editPrecioEstampaChica || 0
                                : 0,

                        precioEstampaMedia:
                            editPermiteEstampaMedia
                                ? editPrecioEstampaMedia || 0
                                : 0,

                        precioEstampaGrande:
                            editPermiteEstampaGrande
                                ? editPrecioEstampaGrande || 0
                                : 0,

                        pesoGramos:
                            editPesoGramos,

                        largoEnvioCm:
                            editLargoEnvioCm,

                        anchoEnvioCm:
                            editAnchoEnvioCm,

                        altoEnvioCm:
                            editAltoEnvioCm,

                        usaTalles:
                            editUsaTalles,

                        usaColores:
                            editUsaColores,

                        permiteFrente:
                            editPermiteFrente,

                        permiteEspalda:
                            editPermiteEspalda,

                        permiteManga:
                            editPermiteManga,

                        requiereImagen:
                            editRequiereImagen,

                        permiteEstampaChica:
                            editPermiteEstampaChica,

                        permiteEstampaMedia:
                            editPermiteEstampaMedia,

                        permiteEstampaGrande:
                            editPermiteEstampaGrande
                    }
                );

            } else {

                await editarCarteleria(
                    productoEditando.id,
                    {
                        nombre:
                            editNombre,

                        descripcion:
                            editDescripcion,

                        imagen:
                            editImagen,

                        esCotizable:
                            editEsCotizable,

                        precioFijo:
                            editEsCotizable
                                ? 0
                                : editPrecioFijo,

                        requiereMedidas:
                            editRequiereMedidas,

                        requiereImagen:
                            editRequiereImagen,

                        requiereCantidad:
                            editRequiereCantidad,

                        requiereInstalacion:
                            editRequiereInstalacion
                    }
                );
            }

            await cargarProductos();

            setMensaje(
                "Producto actualizado correctamente."
            );

            /*
             * No cerramos el modal.
             *
             * Así, para indumentaria, podés guardar los datos
             * y después configurar Frente / Espalda / Manga
             * en el mismo lugar.
             */

            setProductoEditando(
                (actual) => ({
                    ...actual,

                    nombre:
                        editNombre,

                    descripcion:
                        editDescripcion,

                    precioBase:
                        editPrecioBase,

                    precioEstampaChica:
                        editPrecioEstampaChica,

                    precioEstampaMedia:
                        editPrecioEstampaMedia,

                    precioEstampaGrande:
                        editPrecioEstampaGrande,

                    pesoGramos:
                        editPesoGramos,

                    largoEnvioCm:
                        editLargoEnvioCm,

                    anchoEnvioCm:
                        editAnchoEnvioCm,

                    altoEnvioCm:
                        editAltoEnvioCm,

                    usaTalles:
                        editUsaTalles,

                    usaColores:
                        editUsaColores,

                    permiteFrente:
                        editPermiteFrente,

                    permiteEspalda:
                        editPermiteEspalda,

                    permiteManga:
                        editPermiteManga,

                    requiereImagen:
                        editRequiereImagen,

                    permiteEstampaChica:
                        editPermiteEstampaChica,

                    permiteEstampaMedia:
                        editPermiteEstampaMedia,

                    permiteEstampaGrande:
                        editPermiteEstampaGrande,

                    esCotizable:
                        editEsCotizable,

                    precioFijo:
                        editPrecioFijo,

                    requiereMedidas:
                        editRequiereMedidas,

                    requiereCantidad:
                        editRequiereCantidad,

                    requiereInstalacion:
                        editRequiereInstalacion
                })
            );

        } catch (err) {

            console.error(err);

            setEditError(
                err.message ||
                "No se pudo editar el producto."
            );

        } finally {

            setEditLoading(false);
        }
    }

    // =====================================================
    // ELIMINAR
    // =====================================================

    async function handleEliminar(
        producto
    ) {

        const confirmar =
            window.confirm(
                `¿Seguro que querés eliminar "${producto.nombre}"?`
            );

        if (!confirmar) {
            return;
        }

        try {

            await eliminarProducto(
                producto.id
            );

            setProductos(
                (actuales) =>
                    actuales.filter(
                        (p) =>
                            p.id !==
                            producto.id
                    )
            );

            setMensaje(
                "Producto eliminado correctamente."
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "No se pudo eliminar el producto."
            );
        }
    }

    // =====================================================
    // IMAGEN
    // =====================================================

    function obtenerImagen(
        producto
    ) {

        return (
            obtenerUrlArchivo(
                producto.imagenPrincipal
            ) ||
            "/images/product-placeholder.png"
        );
    }

    // =====================================================
    // RENDER
    // =====================================================

    return (

        <>
            <Navbar />

            <main className="productos-admin">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="productos-admin-header">

                    <div>

                        <span className="admin-eyebrow">
                            CATÁLOGO
                        </span>

                        <h1>
                            Administrar productos
                        </h1>

                        <p>
                            Configurá productos, precios,
                            estampados y cartelería.
                        </p>

                    </div>

                </header>

                {/* =================================================
                    CREAR
                ================================================= */}

                <section className="producto-form-container">

                    <div className="form-section-title">

                        <div>
                            <span>
                                NUEVO
                            </span>

                            <h2>
                                Crear producto
                            </h2>
                        </div>

                    </div>

                    <form
                        className="producto-form"
                        onSubmit={handleSubmit}
                    >

                        {/* TIPO */}

                        <div className="form-group">

                            <label>
                                Tipo de producto
                            </label>

                            <select
                                value={tipo}
                                onChange={(e) =>
                                    setTipo(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="indumentaria">
                                    Indumentaria
                                </option>

                                <option value="carteleria">
                                    Cartelería
                                </option>

                            </select>

                        </div>

                        {/* NOMBRE */}

                        <div className="form-group">

                            <label>
                                Nombre
                            </label>

                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) =>
                                    setNombre(
                                        e.target.value
                                    )
                                }
                                placeholder="Ej: Remera personalizada"
                                required
                            />

                        </div>

                        {/* DESCRIPCIÓN */}

                        <div className="form-group">

                            <label>
                                Descripción
                            </label>

                            <textarea
                                value={descripcion}
                                onChange={(e) =>
                                    setDescripcion(
                                        e.target.value
                                    )
                                }
                                placeholder="Descripción del producto..."
                                rows="4"
                            />

                        </div>

                        {/* FOTO CATÁLOGO */}

                        <div className="form-group">

                            <label>
                                Imagen de catálogo
                            </label>

                            <input
                                id="imagen-producto"
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setImagen(
                                        e.target
                                            .files?.[0] ||
                                        null
                                    )
                                }
                            />

                            <small>
                                Esta foto se usa en las tarjetas del catálogo.
                                Los mockups Frente/Espalda se configuran después.
                            </small>

                        </div>

                        {/* =================================================
                            INDUMENTARIA
                        ================================================= */}

                        {tipo ===
                            "indumentaria" && (

                            <>

                                <div className="admin-config-section">

                                    <div className="config-section-heading">

                                        <span>
                                            PRECIOS
                                        </span>

                                        <h3>
                                            Precio del producto
                                        </h3>

                                        <p>
                                            El backend volverá a calcular
                                            estos valores al crear el pedido.
                                        </p>

                                    </div>

                                    <div className="price-grid">

                                        <label className="price-field">

                                            <span>
                                                Precio base
                                            </span>

                                            <div className="money-input">

                                                <strong>
                                                    $
                                                </strong>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={
                                                        precioBase
                                                    }
                                                    onChange={(e) =>
                                                        setPrecioBase(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="18000"
                                                    required
                                                />

                                            </div>

                                        </label>

                                    </div>

                                </div>

                                <div className="admin-config-section">

                                    <div className="config-section-heading">

                                        <span>
                                            ENVÍO
                                        </span>

                                        <h3>
                                            Peso y medidas del paquete
                                        </h3>

                                        <p>
                                            Zipnova usa estos datos para calcular el costo real del envío.
                                            Cargalos para una unidad del producto ya preparada para despachar.
                                        </p>

                                    </div>

                                    <div className="price-grid">

                                        <label className="price-field">
                                            <span>Peso (gramos)</span>
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={pesoGramos}
                                                onChange={(e) =>
                                                    setPesoGramos(e.target.value)
                                                }
                                                placeholder="350"
                                                required
                                            />
                                        </label>

                                        <label className="price-field">
                                            <span>Largo (cm)</span>
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={largoEnvioCm}
                                                onChange={(e) =>
                                                    setLargoEnvioCm(e.target.value)
                                                }
                                                placeholder="30"
                                                required
                                            />
                                        </label>

                                        <label className="price-field">
                                            <span>Ancho (cm)</span>
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={anchoEnvioCm}
                                                onChange={(e) =>
                                                    setAnchoEnvioCm(e.target.value)
                                                }
                                                placeholder="25"
                                                required
                                            />
                                        </label>

                                        <label className="price-field">
                                            <span>Alto (cm)</span>
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={altoEnvioCm}
                                                onChange={(e) =>
                                                    setAltoEnvioCm(e.target.value)
                                                }
                                                placeholder="5"
                                                required
                                            />
                                        </label>

                                    </div>

                                </div>

                                <div className="admin-config-section">

                                    <div className="config-section-heading">

                                        <span>
                                            ESTAMPADO
                                        </span>

                                        <h3>
                                            Tamaños y precios
                                        </h3>

                                        <p>
                                            El precio indicado se suma
                                            al precio base.
                                        </p>

                                    </div>

                                    <div className="stamp-prices-grid">

                                        {/* CHICA */}

                                        <article
                                            className={
                                                `stamp-price-card ${
                                                    permiteEstampaChica
                                                        ? "enabled"
                                                        : ""
                                                }`
                                            }
                                        >

                                            <label className="stamp-toggle">

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        permiteEstampaChica
                                                    }
                                                    onChange={(e) =>
                                                        setPermiteEstampaChica(
                                                            e.target.checked
                                                        )
                                                    }
                                                />

                                                <div>

                                                    <strong>
                                                        Chica
                                                    </strong>

                                                    <span>
                                                        Estampa pequeña
                                                    </span>

                                                </div>

                                            </label>

                                            <div className="money-input">

                                                <strong>
                                                    + $
                                                </strong>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    disabled={
                                                        !permiteEstampaChica
                                                    }
                                                    value={
                                                        precioEstampaChica
                                                    }
                                                    onChange={(e) =>
                                                        setPrecioEstampaChica(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="2500"
                                                />

                                            </div>

                                        </article>

                                        {/* MEDIA */}

                                        <article
                                            className={
                                                `stamp-price-card ${
                                                    permiteEstampaMedia
                                                        ? "enabled"
                                                        : ""
                                                }`
                                            }
                                        >

                                            <label className="stamp-toggle">

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        permiteEstampaMedia
                                                    }
                                                    onChange={(e) =>
                                                        setPermiteEstampaMedia(
                                                            e.target.checked
                                                        )
                                                    }
                                                />

                                                <div>

                                                    <strong>
                                                        Media
                                                    </strong>

                                                    <span>
                                                        Estampa mediana
                                                    </span>

                                                </div>

                                            </label>

                                            <div className="money-input">

                                                <strong>
                                                    + $
                                                </strong>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    disabled={
                                                        !permiteEstampaMedia
                                                    }
                                                    value={
                                                        precioEstampaMedia
                                                    }
                                                    onChange={(e) =>
                                                        setPrecioEstampaMedia(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="3500"
                                                />

                                            </div>

                                        </article>

                                        {/* GRANDE */}

                                        <article
                                            className={
                                                `stamp-price-card ${
                                                    permiteEstampaGrande
                                                        ? "enabled"
                                                        : ""
                                                }`
                                            }
                                        >

                                            <label className="stamp-toggle">

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        permiteEstampaGrande
                                                    }
                                                    onChange={(e) =>
                                                        setPermiteEstampaGrande(
                                                            e.target.checked
                                                        )
                                                    }
                                                />

                                                <div>

                                                    <strong>
                                                        Grande
                                                    </strong>

                                                    <span>
                                                        Estampa grande
                                                    </span>

                                                </div>

                                            </label>

                                            <div className="money-input">

                                                <strong>
                                                    + $
                                                </strong>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    disabled={
                                                        !permiteEstampaGrande
                                                    }
                                                    value={
                                                        precioEstampaGrande
                                                    }
                                                    onChange={(e) =>
                                                        setPrecioEstampaGrande(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="5000"
                                                />

                                            </div>

                                        </article>

                                    </div>

                                </div>

                                {/* POSICIONES */}

                                <div className="admin-config-section">

                                    <div className="config-section-heading">

                                        <span>
                                            PERSONALIZACIÓN
                                        </span>

                                        <h3>
                                            Opciones disponibles
                                        </h3>

                                    </div>

                                    <div className="checkbox-grid">

                                        <label className="checkbox-option">

                                            <input
                                                type="checkbox"
                                                checked={usaTalles}
                                                onChange={(e) =>
                                                    setUsaTalles(
                                                        e.target.checked
                                                    )
                                                }
                                            />

                                            <span>
                                                Usa talles
                                            </span>

                                        </label>

                                        <label className="checkbox-option">

                                            <input
                                                type="checkbox"
                                                checked={usaColores}
                                                onChange={(e) =>
                                                    setUsaColores(
                                                        e.target.checked
                                                    )
                                                }
                                            />

                                            <span>
                                                Usa colores
                                            </span>

                                        </label>

                                        <label className="checkbox-option">

                                            <input
                                                type="checkbox"
                                                checked={permiteFrente}
                                                onChange={(e) =>
                                                    setPermiteFrente(
                                                        e.target.checked
                                                    )
                                                }
                                            />

                                            <span>
                                                Estampa frente
                                            </span>

                                        </label>

                                        <label className="checkbox-option">

                                            <input
                                                type="checkbox"
                                                checked={permiteEspalda}
                                                onChange={(e) =>
                                                    setPermiteEspalda(
                                                        e.target.checked
                                                    )
                                                }
                                            />

                                            <span>
                                                Estampa espalda
                                            </span>

                                        </label>

                                        <label className="checkbox-option">

                                            <input
                                                type="checkbox"
                                                checked={permiteManga}
                                                onChange={(e) =>
                                                    setPermiteManga(
                                                        e.target.checked
                                                    )
                                                }
                                            />

                                            <span>
                                                Estampa mangas
                                            </span>

                                        </label>

                                        <label className="checkbox-option">

                                            <input
                                                type="checkbox"
                                                checked={requiereImagen}
                                                onChange={(e) =>
                                                    setRequiereImagen(
                                                        e.target.checked
                                                    )
                                                }
                                            />

                                            <span>
                                                Requiere diseño
                                            </span>

                                        </label>

                                    </div>

                                </div>

                            </>

                        )}

                        {/* =================================================
                            CARTELERÍA
                        ================================================= */}

                        {tipo ===
                            "carteleria" && (

                            <>

                                <div className="admin-config-section">

                                    <div className="config-section-heading">

                                        <span>
                                            VENTA
                                        </span>

                                        <h3>
                                            Tipo de cartelería
                                        </h3>

                                    </div>

                                    <div className="sale-mode-grid">

                                        <button
                                            type="button"
                                            className={
                                                !esCotizable
                                                    ? "sale-mode active"
                                                    : "sale-mode"
                                            }
                                            onClick={() =>
                                                setEsCotizable(
                                                    false
                                                )
                                            }
                                        >

                                            <strong>
                                                Precio fijo
                                            </strong>

                                            <span>
                                                Se agrega al carrito y se compra directamente.
                                            </span>

                                        </button>

                                        <button
                                            type="button"
                                            className={
                                                esCotizable
                                                    ? "sale-mode active"
                                                    : "sale-mode"
                                            }
                                            onClick={() =>
                                                setEsCotizable(
                                                    true
                                                )
                                            }
                                        >

                                            <strong>
                                                Solicitar cotización
                                            </strong>

                                            <span>
                                                Para carteles grandes o trabajos especiales.
                                            </span>

                                        </button>

                                    </div>

                                    {!esCotizable && (

                                        <label className="price-field cartel-price">

                                            <span>
                                                Precio fijo
                                            </span>

                                            <div className="money-input">

                                                <strong>
                                                    $
                                                </strong>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    value={
                                                        precioFijo
                                                    }
                                                    onChange={(e) =>
                                                        setPrecioFijo(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="35000"
                                                />

                                            </div>

                                        </label>

                                    )}

                                </div>

                                <div className="admin-config-section">

                                    <div className="config-section-heading">

                                        <span>
                                            DATOS
                                        </span>

                                        <h3>
                                            Información requerida
                                        </h3>

                                    </div>

                                    <div className="checkbox-grid">

                                        <label className="checkbox-option">

                                            <input
                                                type="checkbox"
                                                checked={
                                                    requiereMedidas
                                                }
                                                onChange={(e) =>
                                                    setRequiereMedidas(
                                                        e.target.checked
                                                    )
                                                }
                                            />

                                            <span>
                                                Requiere medidas
                                            </span>

                                        </label>

                                        <label className="checkbox-option">

                                            <input
                                                type="checkbox"
                                                checked={
                                                    requiereImagen
                                                }
                                                onChange={(e) =>
                                                    setRequiereImagen(
                                                        e.target.checked
                                                    )
                                                }
                                            />

                                            <span>
                                                Requiere imagen
                                            </span>

                                        </label>

                                        <label className="checkbox-option">

                                            <input
                                                type="checkbox"
                                                checked={
                                                    requiereCantidad
                                                }
                                                onChange={(e) =>
                                                    setRequiereCantidad(
                                                        e.target.checked
                                                    )
                                                }
                                            />

                                            <span>
                                                Requiere cantidad
                                            </span>

                                        </label>

                                        <label className="checkbox-option">

                                            <input
                                                type="checkbox"
                                                checked={
                                                    requiereInstalacion
                                                }
                                                onChange={(e) =>
                                                    setRequiereInstalacion(
                                                        e.target.checked
                                                    )
                                                }
                                            />

                                            <span>
                                                Instalación
                                            </span>

                                        </label>

                                    </div>

                                </div>

                            </>

                        )}

                        {mensaje && (

                            <div className="producto-mensaje success">
                                {mensaje}
                            </div>

                        )}

                        {error && (

                            <div className="producto-mensaje error">
                                {error}
                            </div>

                        )}

                        <button
                            type="submit"
                            className="crear-producto-button"
                            disabled={loading}
                        >

                            {loading
                                ? "Creando..."
                                : "Crear producto"}

                        </button>

                    </form>

                </section>

                {/* =================================================
                    PRODUCTOS EXISTENTES
                ================================================= */}

                <section className="productos-existentes">

                    <div className="productos-existentes-header">

                        <div>

                            <span className="admin-eyebrow">
                                PUBLICADOS
                            </span>

                            <h2>
                                Productos existentes
                            </h2>

                            <p>
                                Editá precios, disponibilidad y mockups.
                            </p>

                        </div>

                        <span className="productos-count">
                            {productos.length} productos
                        </span>

                    </div>

                    {loadingProductos && (

                        <div className="productos-loading">
                            Cargando productos...
                        </div>

                    )}

                    {errorProductos && (

                        <div className="producto-mensaje error">
                            {errorProductos}
                        </div>

                    )}

                    {!loadingProductos &&
                        !errorProductos &&
                        productos.length === 0 && (

                        <div className="productos-vacio">

                            <h3>
                                No hay productos todavía
                            </h3>

                            <p>
                                Los productos que crees van a aparecer acá.
                            </p>

                        </div>

                    )}

                    {!loadingProductos &&
                        productos.length > 0 && (

                        <div className="productos-admin-grid">

                            {productos.map(
                                (producto) => {

                                    const indumentaria =
                                        esIndumentaria(
                                            producto
                                        );

                                    return (

                                        <article
                                            className="admin-product-card"
                                            key={producto.id}
                                        >

                                            <div className="admin-product-image">

                                                <img
                                                    src={
                                                        obtenerImagen(
                                                            producto
                                                        )
                                                    }
                                                    alt={
                                                        producto.nombre
                                                    }
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            "/images/product-placeholder.png";
                                                    }}
                                                />

                                                <span className="admin-product-type">

                                                    {indumentaria
                                                        ? "Indumentaria"
                                                        : "Cartelería"}

                                                </span>

                                            </div>

                                            <div className="admin-product-content">

                                                <h3>
                                                    {producto.nombre}
                                                </h3>

                                                <p>
                                                    {producto.descripcion ||
                                                        "Sin descripción"}
                                                </p>

                                                <div className="product-price-summary">

                                                    {indumentaria ? (

                                                        <>
                                                            <strong>
                                                                {precio(
                                                                    producto.precioBase
                                                                )}
                                                            </strong>

                                                            <span>
                                                                Base
                                                            </span>
                                                        </>

                                                    ) : producto.esCotizable ? (

                                                        <strong className="cotizable-label">
                                                            A cotizar
                                                        </strong>

                                                    ) : (

                                                        <strong>
                                                            {precio(
                                                                producto.precioFijo
                                                            )}
                                                        </strong>

                                                    )}

                                                </div>

                                                {indumentaria && (

                                                    <div className="stamp-summary">

                                                        {producto.permiteEstampaChica && (

                                                            <span>
                                                                Chica +
                                                                {precio(
                                                                    producto.precioEstampaChica
                                                                )}
                                                            </span>

                                                        )}

                                                        {producto.permiteEstampaMedia && (

                                                            <span>
                                                                Media +
                                                                {precio(
                                                                    producto.precioEstampaMedia
                                                                )}
                                                            </span>

                                                        )}

                                                        {producto.permiteEstampaGrande && (

                                                            <span>
                                                                Grande +
                                                                {precio(
                                                                    producto.precioEstampaGrande
                                                                )}
                                                            </span>

                                                        )}

                                                    </div>

                                                )}

                                                <div className="admin-product-actions">

                                                    <button
                                                        type="button"
                                                        className="btn-editar"
                                                        onClick={() =>
                                                            abrirEdicion(
                                                                producto
                                                            )
                                                        }
                                                    >
                                                        Editar
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn-eliminar"
                                                        onClick={() =>
                                                            handleEliminar(
                                                                producto
                                                            )
                                                        }
                                                    >
                                                        Eliminar
                                                    </button>

                                                </div>

                                            </div>

                                        </article>
                                    );
                                }
                            )}

                        </div>

                    )}

                </section>

                {/* =================================================
                    MODAL EDITAR
                ================================================= */}

                {productoEditando && (

                    <div
                        className="edit-modal-overlay"
                        onMouseDown={(e) => {

                            if (
                                e.target ===
                                e.currentTarget
                            ) {
                                cerrarEdicion();
                            }
                        }}
                    >

                        <div
                            className="edit-modal"
                            onMouseDown={(e) => {
                                e.stopPropagation();
                            }}
                        >

                            <div className="edit-modal-header">

                                <div>

                                    <span>
                                        EDITAR PRODUCTO
                                    </span>

                                    <h2>
                                        {productoEditando.nombre}
                                    </h2>

                                </div>

                                <button
                                    type="button"
                                    className="modal-close"
                                    onClick={
                                        cerrarEdicion
                                    }
                                >
                                    ×
                                </button>

                            </div>

                            <div className="edit-modal-body">

                                <form
                                    className="edit-product-form"
                                    onSubmit={
                                        guardarEdicion
                                    }
                                >

                                <div className="form-group">

                                    <label>
                                        Nombre
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            editNombre
                                        }
                                        onChange={(e) =>
                                            setEditNombre(
                                                e.target.value
                                            )
                                        }
                                        required
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Descripción
                                    </label>

                                    <textarea
                                        rows="4"
                                        value={
                                            editDescripcion
                                        }
                                        onChange={(e) =>
                                            setEditDescripcion(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Cambiar imagen de catálogo
                                    </label>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                            setEditImagen(
                                                e.target
                                                    .files?.[0] ||
                                                null
                                            )
                                        }
                                    />

                                    <small>
                                        Dejá vacío para conservar la actual.
                                    </small>

                                </div>

                                {/* INDUMENTARIA EDICIÓN */}

                                {productoEditando.tipo ===
                                    "indumentaria" && (

                                    <>

                                        <div className="admin-config-section">

                                            <div className="config-section-heading">

                                                <span>
                                                    PRECIOS
                                                </span>

                                                <h3>
                                                    Precio base
                                                </h3>

                                            </div>

                                            <label className="price-field">

                                                <div className="money-input">

                                                    <strong>
                                                        $
                                                    </strong>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={
                                                            editPrecioBase
                                                        }
                                                        onChange={(e) =>
                                                            setEditPrecioBase(
                                                                e.target.value
                                                            )
                                                        }
                                                    />

                                                </div>

                                            </label>

                                        </div>

                                        <div className="admin-config-section">

                                            <div className="config-section-heading">
                                                <span>ENVÍO</span>
                                                <h3>Peso y medidas del paquete</h3>
                                                <p>
                                                    Estos datos se usan para cotizar con Zipnova.
                                                </p>
                                            </div>

                                            <div className="price-grid">
                                                <label className="price-field">
                                                    <span>Peso (gramos)</span>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={editPesoGramos}
                                                        onChange={(e) =>
                                                            setEditPesoGramos(e.target.value)
                                                        }
                                                        required
                                                    />
                                                </label>

                                                <label className="price-field">
                                                    <span>Largo (cm)</span>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={editLargoEnvioCm}
                                                        onChange={(e) =>
                                                            setEditLargoEnvioCm(e.target.value)
                                                        }
                                                        required
                                                    />
                                                </label>

                                                <label className="price-field">
                                                    <span>Ancho (cm)</span>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={editAnchoEnvioCm}
                                                        onChange={(e) =>
                                                            setEditAnchoEnvioCm(e.target.value)
                                                        }
                                                        required
                                                    />
                                                </label>

                                                <label className="price-field">
                                                    <span>Alto (cm)</span>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        step="1"
                                                        value={editAltoEnvioCm}
                                                        onChange={(e) =>
                                                            setEditAltoEnvioCm(e.target.value)
                                                        }
                                                        required
                                                    />
                                                </label>
                                            </div>

                                        </div>

                                        <div className="stamp-prices-grid">

                                            <article
                                                className={`stamp-price-card ${
                                                    editPermiteEstampaChica
                                                        ? "enabled"
                                                        : ""
                                                }`}
                                            >

                                                <label className="stamp-toggle">

                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            editPermiteEstampaChica
                                                        }
                                                        onChange={(e) =>
                                                            setEditPermiteEstampaChica(
                                                                e.target.checked
                                                            )
                                                        }
                                                    />

                                                    <strong>
                                                        Chica
                                                    </strong>

                                                </label>

                                                <div className="money-input">

                                                    <strong>
                                                        + $
                                                    </strong>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        disabled={
                                                            !editPermiteEstampaChica
                                                        }
                                                        value={
                                                            editPrecioEstampaChica
                                                        }
                                                        onChange={(e) =>
                                                            setEditPrecioEstampaChica(
                                                                e.target.value
                                                            )
                                                        }
                                                    />

                                                </div>

                                            </article>

                                            <article
                                                className={`stamp-price-card ${
                                                    editPermiteEstampaMedia
                                                        ? "enabled"
                                                        : ""
                                                }`}
                                            >

                                                <label className="stamp-toggle">

                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            editPermiteEstampaMedia
                                                        }
                                                        onChange={(e) =>
                                                            setEditPermiteEstampaMedia(
                                                                e.target.checked
                                                            )
                                                        }
                                                    />

                                                    <strong>
                                                        Media
                                                    </strong>

                                                </label>

                                                <div className="money-input">

                                                    <strong>
                                                        + $
                                                    </strong>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        disabled={
                                                            !editPermiteEstampaMedia
                                                        }
                                                        value={
                                                            editPrecioEstampaMedia
                                                        }
                                                        onChange={(e) =>
                                                            setEditPrecioEstampaMedia(
                                                                e.target.value
                                                            )
                                                        }
                                                    />

                                                </div>

                                            </article>

                                            <article
                                                className={`stamp-price-card ${
                                                    editPermiteEstampaGrande
                                                        ? "enabled"
                                                        : ""
                                                }`}
                                            >

                                                <label className="stamp-toggle">

                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            editPermiteEstampaGrande
                                                        }
                                                        onChange={(e) =>
                                                            setEditPermiteEstampaGrande(
                                                                e.target.checked
                                                            )
                                                        }
                                                    />

                                                    <strong>
                                                        Grande
                                                    </strong>

                                                </label>

                                                <div className="money-input">

                                                    <strong>
                                                        + $
                                                    </strong>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        disabled={
                                                            !editPermiteEstampaGrande
                                                        }
                                                        value={
                                                            editPrecioEstampaGrande
                                                        }
                                                        onChange={(e) =>
                                                            setEditPrecioEstampaGrande(
                                                                e.target.value
                                                            )
                                                        }
                                                    />

                                                </div>

                                            </article>

                                        </div>

                                        <div className="checkbox-grid edit-checkbox-grid">

                                            <label className="checkbox-option">

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        editUsaTalles
                                                    }
                                                    onChange={(e) =>
                                                        setEditUsaTalles(
                                                            e.target.checked
                                                        )
                                                    }
                                                />

                                                <span>
                                                    Usa talles
                                                </span>

                                            </label>

                                            <label className="checkbox-option">

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        editUsaColores
                                                    }
                                                    onChange={(e) =>
                                                        setEditUsaColores(
                                                            e.target.checked
                                                        )
                                                    }
                                                />

                                                <span>
                                                    Usa colores
                                                </span>

                                            </label>

                                            <label className="checkbox-option">

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        editPermiteFrente
                                                    }
                                                    onChange={(e) =>
                                                        setEditPermiteFrente(
                                                            e.target.checked
                                                        )
                                                    }
                                                />

                                                <span>
                                                    Frente
                                                </span>

                                            </label>

                                            <label className="checkbox-option">

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        editPermiteEspalda
                                                    }
                                                    onChange={(e) =>
                                                        setEditPermiteEspalda(
                                                            e.target.checked
                                                        )
                                                    }
                                                />

                                                <span>
                                                    Espalda
                                                </span>

                                            </label>

                                            <label className="checkbox-option">

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        editPermiteManga
                                                    }
                                                    onChange={(e) =>
                                                        setEditPermiteManga(
                                                            e.target.checked
                                                        )
                                                    }
                                                />

                                                <span>
                                                    Mangas
                                                </span>

                                            </label>

                                            <label className="checkbox-option">

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        editRequiereImagen
                                                    }
                                                    onChange={(e) =>
                                                        setEditRequiereImagen(
                                                            e.target.checked
                                                        )
                                                    }
                                                />

                                                <span>
                                                    Requiere diseño
                                                </span>

                                            </label>

                                        </div>

                                    </>

                                )}

                                {/* CARTELERÍA EDICIÓN */}

                                {productoEditando.tipo ===
                                    "carteleria" && (

                                    <>

                                        <div className="sale-mode-grid">

                                            <button
                                                type="button"
                                                className={
                                                    !editEsCotizable
                                                        ? "sale-mode active"
                                                        : "sale-mode"
                                                }
                                                onClick={() =>
                                                    setEditEsCotizable(
                                                        false
                                                    )
                                                }
                                            >
                                                <strong>
                                                    Precio fijo
                                                </strong>
                                            </button>

                                            <button
                                                type="button"
                                                className={
                                                    editEsCotizable
                                                        ? "sale-mode active"
                                                        : "sale-mode"
                                                }
                                                onClick={() =>
                                                    setEditEsCotizable(
                                                        true
                                                    )
                                                }
                                            >
                                                <strong>
                                                    Cotización
                                                </strong>
                                            </button>

                                        </div>

                                        {!editEsCotizable && (

                                            <label className="price-field">

                                                <span>
                                                    Precio fijo
                                                </span>

                                                <div className="money-input">

                                                    <strong>
                                                        $
                                                    </strong>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={
                                                            editPrecioFijo
                                                        }
                                                        onChange={(e) =>
                                                            setEditPrecioFijo(
                                                                e.target.value
                                                            )
                                                        }
                                                    />

                                                </div>

                                            </label>

                                        )}

                                        <div className="checkbox-grid edit-checkbox-grid">

                                            <label className="checkbox-option">

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        editRequiereMedidas
                                                    }
                                                    onChange={(e) =>
                                                        setEditRequiereMedidas(
                                                            e.target.checked
                                                        )
                                                    }
                                                />

                                                <span>
                                                    Medidas
                                                </span>

                                            </label>

                                            <label className="checkbox-option">

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        editRequiereImagen
                                                    }
                                                    onChange={(e) =>
                                                        setEditRequiereImagen(
                                                            e.target.checked
                                                        )
                                                    }
                                                />

                                                <span>
                                                    Imagen
                                                </span>

                                            </label>

                                            <label className="checkbox-option">

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        editRequiereCantidad
                                                    }
                                                    onChange={(e) =>
                                                        setEditRequiereCantidad(
                                                            e.target.checked
                                                        )
                                                    }
                                                />

                                                <span>
                                                    Cantidad
                                                </span>

                                            </label>

                                            <label className="checkbox-option">

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        editRequiereInstalacion
                                                    }
                                                    onChange={(e) =>
                                                        setEditRequiereInstalacion(
                                                            e.target.checked
                                                        )
                                                    }
                                                />

                                                <span>
                                                    Instalación
                                                </span>

                                            </label>

                                        </div>

                                    </>

                                )}

                                {editError && (

                                    <div className="producto-mensaje error">
                                        {editError}
                                    </div>

                                )}

                                <div className="edit-modal-actions">

                                    <button
                                        type="button"
                                        className="btn-cancelar"
                                        onClick={
                                            cerrarEdicion
                                        }
                                    >
                                        Cerrar
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn-guardar"
                                        disabled={
                                            editLoading
                                        }
                                    >

                                        {editLoading
                                            ? "Guardando..."
                                            : "Guardar producto"}

                                    </button>

                                </div>

                            </form>

                            {/* =================================================
                                MOCKUPS ADMIN
                            ================================================= */}

                            {productoEditando.tipo ===
                                "indumentaria" && (

                                <div className="mockups-admin-wrapper">

                                    <div className="mockups-divider">

                                        <span>
                                            PERSONALIZADOR
                                        </span>

                                        <h2>
                                            Mockups y áreas
                                        </h2>

                                        <p>
                                            Primero guardá las opciones del producto.
                                            Después configurá cada vista.
                                        </p>

                                    </div>

                                    {cargandoAreas ? (

                                        <div className="productos-loading">
                                            Cargando mockups...
                                        </div>

                                    ) : (

                                        <AreaPersonalizacionEditor
                                            producto={{
                                                ...productoEditando,

                                                permiteFrente:
                                                    editPermiteFrente,

                                                permiteEspalda:
                                                    editPermiteEspalda,

                                                permiteManga:
                                                    editPermiteManga,

                                                permiteEstampaChica:
                                                    editPermiteEstampaChica,

                                                permiteEstampaMedia:
                                                    editPermiteEstampaMedia,

                                                permiteEstampaGrande:
                                                    editPermiteEstampaGrande
                                            }}
                                            areas={
                                                areasPersonalizacion
                                            }
                                            onActualizado={() =>
                                                cargarAreas(
                                                    productoEditando.id
                                                )
                                            }
                                        />

                                    )}

                                </div>

                            )}

                            </div>

                        </div>

                    </div>

                )}

            </main>

            <Footer />
        </>
    );
}
