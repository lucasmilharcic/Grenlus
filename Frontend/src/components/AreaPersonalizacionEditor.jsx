import { useEffect, useMemo, useRef, useState } from "react";

import {
    crearAreaPersonalizacion,
    editarAreaPersonalizacion,
    eliminarAreaPersonalizacion,
    getCalibracionesEstampa,
    guardarCalibracionEstampa,
    obtenerUrlArchivo
} from "../services/productoService";

import {
    tallesDelProducto
} from "../constants/talles";

import "./AreaPersonalizacionEditor.css";

const POSICIONES = [
    { value: "FRENTE", label: "Frente" },
    { value: "ESPALDA", label: "Espalda" },
    { value: "MANGA_DERECHA", label: "Manga derecha" },
    { value: "MANGA_IZQUIERDA", label: "Manga izquierda" }
];

const AREA_INICIAL = {
    x: 30,
    y: 25,
    width: 40,
    height: 50
};


function numero(valor) {
    const parsed = Number(valor);
    return Number.isFinite(parsed) ? parsed : 0;
}

function limitar(valor, min, max) {
    return Math.min(Math.max(valor, min), max);
}

function obtenerTallesCalibrables(producto) {
    /*
     * Solo pedimos calibración de los talles que el
     * producto realmente ofrece.
     */
    return tallesDelProducto(producto);
}

export default function AreaPersonalizacionEditor({
    producto,
    areas = [],
    onActualizado
}) {
    const editorRef = useRef(null);
    const moverRef = useRef(null);
    const resizeRef = useRef(null);

    const [posicion, setPosicion] = useState("FRENTE");

    const [color, setColor] = useState("");
    const [nuevoColor, setNuevoColor] = useState("");

    const [imagen, setImagen] = useState(null);
    const [previewNuevaImagen, setPreviewNuevaImagen] = useState(null);

    const [area, setArea] = useState(AREA_INICIAL);

    const [calibraciones, setCalibraciones] = useState([]);
    const [borradoresCalibracion, setBorradoresCalibracion] = useState({});
    const [puntosPendientes, setPuntosPendientes] = useState({});

    const [anchoChicaCm, setAnchoChicaCm] = useState("");
    const [altoChicaCm, setAltoChicaCm] = useState("");

    const [anchoMediaCm, setAnchoMediaCm] = useState("");
    const [altoMediaCm, setAltoMediaCm] = useState("");

    const [anchoGrandeCm, setAnchoGrandeCm] = useState("");
    const [altoGrandeCm, setAltoGrandeCm] = useState("");

    const [guardando, setGuardando] = useState(false);

    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        let activa = true;

        async function cargarCalibraciones() {
            try {
                const data = await getCalibracionesEstampa(producto.id);
                if (activa) {
                    setCalibraciones(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error(err);
                if (activa) {
                    setError(
                        err.message ||
                        "No se pudieron cargar las calibraciones por talle."
                    );
                }
            }
        }

        cargarCalibraciones();

        return () => {
            activa = false;
        };
    }, [producto.id]);

    const calibracionActual = useMemo(
        () => calibraciones.find(item => item.posicion === posicion) || null,
        [calibraciones, posicion]
    );

    const borradorCalibracion = borradoresCalibracion[posicion] || {};
    const punto1 = borradorCalibracion.punto1 || (
        calibracionActual
            ? { x: numero(calibracionActual.punto1X), y: numero(calibracionActual.punto1Y) }
            : null
    );
    const punto2 = borradorCalibracion.punto2 || (
        calibracionActual
            ? { x: numero(calibracionActual.punto2X), y: numero(calibracionActual.punto2Y) }
            : null
    );
    const medidasCmPorTalle =
        borradorCalibracion.medidasCmPorTalle ||
        calibracionActual?.medidasCmPorTalle ||
        {};
    const puntoPendiente = puntosPendientes[posicion] || null;

    function actualizarBorradorCalibracion(cambios) {
        setBorradoresCalibracion(actuales => ({
            ...actuales,
            [posicion]: {
                ...actuales[posicion],
                ...cambios
            }
        }));
    }

    function actualizarPuntoPendiente(valor) {
        setPuntosPendientes(actuales => ({
            ...actuales,
            [posicion]: valor
        }));
    }

    const coloresConfigurados = useMemo(() => {

        if (!producto.usaColores) {
            return [];
        }

        const unicos = new Map();

        areas.forEach((item) => {
            const valor = String(item.color || "").trim();

            if (valor) {
                unicos.set(
                    valor.toLowerCase(),
                    valor
                );
            }
        });

        return Array.from(
            unicos.values()
        );

    }, [areas, producto.usaColores]);

    useEffect(() => {

        if (!producto.usaColores) {
            setColor("");
            return;
        }

        /*
         * Solo elegimos automáticamente el primer color
         * cuando todavía no hay ninguno seleccionado.
         *
         * IMPORTANTE:
         * No validamos que el color actual ya exista en
         * coloresConfigurados porque puede ser un color NUEVO
         * que todavía no fue guardado.
         */
        if (
            !color &&
            coloresConfigurados.length > 0
        ) {
            setColor(
                coloresConfigurados[0]
            );
        }

    }, [
        producto.usaColores,
        coloresConfigurados,
        color
    ]);

    const areaExistente = useMemo(() => {

        return (
            areas.find((item) => {

                if (item.posicion !== posicion) {
                    return false;
                }

                if (!producto.usaColores) {
                    return !item.color;
                }

                return (
                    String(item.color || "")
                        .trim()
                        .toLowerCase() ===
                    String(color || "")
                        .trim()
                        .toLowerCase()
                );
            }) || null
        );

    }, [
        areas,
        posicion,
        color,
        producto.usaColores
    ]);

    const posicionesPermitidas = useMemo(() => {
        const permitidas = [];

        if (producto.permiteFrente) {
            permitidas.push(POSICIONES[0]);
        }

        if (producto.permiteEspalda) {
            permitidas.push(POSICIONES[1]);
        }

        if (producto.permiteManga) {
            permitidas.push(
                POSICIONES[2],
                POSICIONES[3]
            );
        }

        return permitidas;
    }, [producto]);

    useEffect(() => {
        if (
            posicionesPermitidas.length > 0 &&
            !posicionesPermitidas.some(
                (item) => item.value === posicion
            )
        ) {
            setPosicion(
                posicionesPermitidas[0].value
            );
        }
    }, [posicionesPermitidas, posicion]);

    useEffect(() => {
        setError("");
        setMensaje("");
        setImagen(null);

        if (previewNuevaImagen) {
            URL.revokeObjectURL(
                previewNuevaImagen
            );
        }

        setPreviewNuevaImagen(null);

        if (areaExistente) {
            setArea({
                x: numero(areaExistente.x),
                y: numero(areaExistente.y),
                width: numero(areaExistente.width),
                height: numero(areaExistente.height)
            });

            setAnchoChicaCm(
                areaExistente.anchoChicaCm ?? ""
            );

            setAltoChicaCm(
                areaExistente.altoChicaCm ?? ""
            );

            setAnchoMediaCm(
                areaExistente.anchoMediaCm ?? ""
            );

            setAltoMediaCm(
                areaExistente.altoMediaCm ?? ""
            );

            setAnchoGrandeCm(
                areaExistente.anchoGrandeCm ?? ""
            );

            setAltoGrandeCm(
                areaExistente.altoGrandeCm ?? ""
            );
        } else {
            setArea(AREA_INICIAL);

            setAnchoChicaCm("");
            setAltoChicaCm("");

            setAnchoMediaCm("");
            setAltoMediaCm("");

            setAnchoGrandeCm("");
            setAltoGrandeCm("");
        }
    }, [posicion, areaExistente]);

    const imagenActualUrl =
        previewNuevaImagen ||
        obtenerUrlArchivo(
            areaExistente?.imagenMockup
        );

    function marcarPunto(e) {
        if (!puntoPendiente || !editorRef.current) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        const rect = editorRef.current.getBoundingClientRect();
        const punto = {
            x: Number(limitar(((e.clientX - rect.left) / rect.width) * 100, 0, 100).toFixed(3)),
            y: Number(limitar(((e.clientY - rect.top) / rect.height) * 100, 0, 100).toFixed(3))
        };

        if (puntoPendiente === 1) {
            actualizarBorradorCalibracion({ punto1: punto });
            actualizarPuntoPendiente(2);
        } else {
            actualizarBorradorCalibracion({ punto2: punto });
            actualizarPuntoPendiente(null);
        }
    }

    async function guardarCalibracion() {
        setError("");
        setMensaje("");

        if (!imagenActualUrl || !punto1 || !punto2) {
            setError("Subí una foto y marcá los dos extremos de una medida conocida.");
            return;
        }

        const talles = obtenerTallesCalibrables(producto);
        const medidas = {};
        const faltantes = [];

        talles.forEach(talle => {
            const valor = Number(medidasCmPorTalle[talle]);
            if (!Number.isFinite(valor) || valor <= 0) {
                faltantes.push(talle);
            } else {
                medidas[talle] = valor;
            }
        });

        if (faltantes.length > 0) {
            setError(`Completá la distancia en centímetros para estos talles: ${faltantes.join(", ")}.`);
            return;
        }

        try {
            setGuardando(true);
            const guardada = await guardarCalibracionEstampa(
                producto.id,
                posicion,
                {
                    punto1X: punto1.x,
                    punto1Y: punto1.y,
                    punto2X: punto2.x,
                    punto2Y: punto2.y,
                    medidasCmPorTalle: medidas
                }
            );

            setCalibraciones(actuales => [
                ...actuales.filter(item => item.posicion !== posicion),
                guardada
            ]);
            setBorradoresCalibracion(actuales => {
                const copia = { ...actuales };
                delete copia[posicion];
                return copia;
            });
            setMensaje(
                `Calibración de ${posicion.toLowerCase()} guardada para todos los colores.`
            );
        } catch (err) {
            console.error(err);
            setError(
                err.message ||
                "No se pudo guardar la calibración."
            );
        } finally {
            setGuardando(false);
        }
    }

    function seleccionarImagen(archivo) {
        if (!archivo) {
            return;
        }

        if (!archivo.type.startsWith("image/")) {
            setError(
                "El archivo debe ser una imagen."
            );
            return;
        }

        if (previewNuevaImagen) {
            URL.revokeObjectURL(
                previewNuevaImagen
            );
        }

        const preview =
            URL.createObjectURL(archivo);

        setImagen(archivo);
        setPreviewNuevaImagen(preview);

        setError("");
    }

    function iniciarMover(e) {
        if (
            e.target.classList.contains(
                "area-admin-resize"
            )
        ) {
            return;
        }

        e.preventDefault();

        moverRef.current = {
            pointerId: e.pointerId,
            clientX: e.clientX,
            clientY: e.clientY,
            areaInicial: { ...area }
        };

        e.currentTarget.setPointerCapture(
            e.pointerId
        );
    }

    function moverArea(e) {
        const movimiento =
            moverRef.current;

        if (
            !movimiento ||
            movimiento.pointerId !== e.pointerId ||
            !editorRef.current
        ) {
            return;
        }

        const rect =
            editorRef.current.getBoundingClientRect();

        const deltaX =
            ((e.clientX - movimiento.clientX) /
                rect.width) *
            100;

        const deltaY =
            ((e.clientY - movimiento.clientY) /
                rect.height) *
            100;

        const nuevoX = limitar(
            movimiento.areaInicial.x + deltaX,
            0,
            100 - movimiento.areaInicial.width
        );

        const nuevoY = limitar(
            movimiento.areaInicial.y + deltaY,
            0,
            100 - movimiento.areaInicial.height
        );

        setArea((actual) => ({
            ...actual,
            x: nuevoX,
            y: nuevoY
        }));
    }

    function terminarMover(e) {
        if (
            moverRef.current?.pointerId ===
            e.pointerId
        ) {
            moverRef.current = null;
        }
    }

    function iniciarResize(e) {
        e.preventDefault();
        e.stopPropagation();

        resizeRef.current = {
            pointerId: e.pointerId,
            clientX: e.clientX,
            clientY: e.clientY,
            areaInicial: { ...area }
        };

        e.currentTarget.setPointerCapture(
            e.pointerId
        );
    }

    function resizeArea(e) {
        const resize =
            resizeRef.current;

        if (
            !resize ||
            resize.pointerId !== e.pointerId ||
            !editorRef.current
        ) {
            return;
        }

        const rect =
            editorRef.current.getBoundingClientRect();

        const deltaX =
            ((e.clientX - resize.clientX) /
                rect.width) *
            100;

        const deltaY =
            ((e.clientY - resize.clientY) /
                rect.height) *
            100;

        const maxWidth =
            100 - resize.areaInicial.x;

        const maxHeight =
            100 - resize.areaInicial.y;

        setArea((actual) => ({
            ...actual,

            width: limitar(
                resize.areaInicial.width +
                deltaX,
                5,
                maxWidth
            ),

            height: limitar(
                resize.areaInicial.height +
                deltaY,
                5,
                maxHeight
            )
        }));
    }

    function terminarResize(e) {
        if (
            resizeRef.current?.pointerId ===
            e.pointerId
        ) {
            resizeRef.current = null;
        }
    }

    function usarNuevoColor() {

        const valor =
            String(nuevoColor || "").trim();

        if (!valor) {
            setError(
                "Escribí un color antes de agregarlo."
            );
            return;
        }

        setColor(valor);
        setNuevoColor("");
        setError("");
        setMensaje("");
    }

    async function guardarArea() {
        setError("");
        setMensaje("");

        if (!imagenActualUrl) {
            setError(
                "Subí una imagen para esta vista."
            );
            return;
        }

        if (
            producto.usaColores &&
            !String(color || "").trim()
        ) {
            setError(
                "Seleccioná o agregá un color para esta variante."
            );
            return;
        }

        try {
            setGuardando(true);

            const datos = {
                posicion,

                color:
                    producto.usaColores
                        ? String(color).trim()
                        : null,

                imagen,

                x: Number(area.x.toFixed(3)),
                y: Number(area.y.toFixed(3)),

                width: Number(
                    area.width.toFixed(3)
                ),

                height: Number(
                    area.height.toFixed(3)
                ),

                anchoChicaCm:
                    producto.permiteEstampaChica
                        ? anchoChicaCm
                        : "",

                altoChicaCm:
                    producto.permiteEstampaChica
                        ? altoChicaCm
                        : "",

                anchoMediaCm:
                    producto.permiteEstampaMedia
                        ? anchoMediaCm
                        : "",

                altoMediaCm:
                    producto.permiteEstampaMedia
                        ? altoMediaCm
                        : "",

                anchoGrandeCm:
                    producto.permiteEstampaGrande
                        ? anchoGrandeCm
                        : "",

                altoGrandeCm:
                    producto.permiteEstampaGrande
                        ? altoGrandeCm
                        : ""
            };

            if (areaExistente) {
                await editarAreaPersonalizacion(
                    producto.id,
                    areaExistente.id,
                    datos
                );
            } else {
                await crearAreaPersonalizacion(
                    producto.id,
                    datos
                );
            }

            setMensaje(
                "Vista guardada correctamente."
            );

            if (onActualizado) {
                await onActualizado();
            }
        } catch (err) {
            console.error(err);

            setError(
                err.message ||
                "No se pudo guardar el área."
            );
        } finally {
            setGuardando(false);
        }
    }

    async function eliminarArea() {
        if (!areaExistente) {
            return;
        }

        const confirmar =
            window.confirm(
                producto.usaColores
                    ? `¿Eliminar ${posicion} del color ${color}?`
                    : `¿Eliminar la configuración de ${posicion}?`
            );

        if (!confirmar) {
            return;
        }

        try {
            setGuardando(true);
            setError("");

            await eliminarAreaPersonalizacion(
                producto.id,
                areaExistente.id
            );

            setMensaje(
                "Vista eliminada."
            );

            if (onActualizado) {
                await onActualizado();
            }
        } catch (err) {
            setError(
                err.message ||
                "No se pudo eliminar la vista."
            );
        } finally {
            setGuardando(false);
        }
    }

    if (
        posicionesPermitidas.length === 0
    ) {
        return (
            <div className="area-admin-empty">
                Este producto todavía no tiene
                posiciones de estampado habilitadas.
            </div>
        );
    }

    return (
        <section className="area-admin-editor">
            <div className="area-admin-header">
                <span>MOCKUPS</span>

                <h3>
                    Áreas de estampado
                </h3>

                <p>
                    Subí una imagen por vista y acomodá el rectángulo sobre la zona imprimible.
                </p>
            </div>

            {producto.usaColores && (
                <div className="area-admin-colores">

                    <div className="area-admin-colores-header">
                        <div>
                            <strong>
                                Color de la prenda
                            </strong>

                            <span>
                                Cada color puede tener sus propias fotos de frente, espalda y mangas.
                            </span>
                        </div>
                    </div>

                    {coloresConfigurados.length > 0 && (
                        <div className="area-admin-color-list">

                            {coloresConfigurados.map(
                                (item) => (

                                    <button
                                        type="button"
                                        key={item}
                                        className={
                                            String(color).toLowerCase() ===
                                                item.toLowerCase()
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() => {
                                            setColor(item);
                                            setError("");
                                            setMensaje("");
                                        }}
                                    >
                                        {item}
                                    </button>

                                )
                            )}

                        </div>
                    )}

                    <div className="area-admin-color-create">

                        <input
                            type="text"
                            value={nuevoColor}
                            placeholder="Ej: Negro, Blanco, Azul..."
                            onChange={(e) =>
                                setNuevoColor(
                                    e.target.value
                                )
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    usarNuevoColor();
                                }
                            }}
                        />

                        <button
                            type="button"
                            onClick={usarNuevoColor}
                        >
                            Usar nuevo color
                        </button>

                    </div>

                    {color && (
                        <small className="area-admin-color-current">
                            Editando mockups de: <strong>{color}</strong>
                        </small>
                    )}

                </div>
            )}

            <div className="area-admin-tabs">
                {posicionesPermitidas.map(
                    (item) => (
                        <button
                            type="button"
                            key={item.value}
                            className={
                                posicion ===
                                    item.value
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                setPosicion(
                                    item.value
                                )
                            }
                        >
                            {item.label}

                            {areas.some(
                                (areaItem) => {

                                    if (
                                        areaItem.posicion !==
                                        item.value
                                    ) {
                                        return false;
                                    }

                                    if (!producto.usaColores) {
                                        return !areaItem.color;
                                    }

                                    return (
                                        String(areaItem.color || "")
                                            .trim()
                                            .toLowerCase() ===
                                        String(color || "")
                                            .trim()
                                            .toLowerCase()
                                    );
                                }
                            ) && (
                                    <span className="area-configurada-dot" />
                                )}
                        </button>
                    )
                )}
            </div>

            <div className="area-admin-layout">
                <div>
                    <div
                        ref={editorRef}
                        className="area-admin-canvas"
                        onPointerDownCapture={marcarPunto}
                    >
                        {imagenActualUrl ? (
                            <img
                                src={imagenActualUrl}
                                alt={`Vista ${posicion}`}
                                draggable="false"
                            />
                        ) : (
                            <div className="area-admin-no-image">
                                <strong>
                                    Subí la foto de esta vista
                                </strong>

                                <span>
                                    Ej: remera vista de frente
                                </span>
                            </div>
                        )}

                        {imagenActualUrl && (
                            <div
                                className="area-admin-box"
                                style={{
                                    left: `${area.x}%`,
                                    top: `${area.y}%`,
                                    width: `${area.width}%`,
                                    height: `${area.height}%`
                                }}
                                onPointerDown={
                                    iniciarMover
                                }
                                onPointerMove={
                                    moverArea
                                }
                                onPointerUp={
                                    terminarMover
                                }
                                onPointerCancel={
                                    terminarMover
                                }
                            >
                                <div className="area-admin-box-label">
                                    ÁREA DE ESTAMPA
                                </div>

                                <button
                                    type="button"
                                    className="area-admin-resize"
                                    onPointerDown={
                                        iniciarResize
                                    }
                                    onPointerMove={
                                        resizeArea
                                    }
                                    onPointerUp={
                                        terminarResize
                                    }
                                    onPointerCancel={
                                        terminarResize
                                    }
                                />
                            </div>
                        )}

                        {punto1 && punto2 && (
                            <div
                                className="area-admin-calibration-line"
                                style={{
                                    left: `${punto1.x}%`,
                                    top: `${punto1.y}%`,
                                    width: `${Math.hypot(
                                        punto2.x - punto1.x,
                                        punto2.y - punto1.y
                                    )}%`,
                                    transform: `rotate(${Math.atan2(
                                        punto2.y - punto1.y,
                                        punto2.x - punto1.x
                                    )}rad)`
                                }}
                            />
                        )}

                        {punto1 && (
                            <div
                                className="area-admin-calibration-point"
                                style={{
                                    left: `${punto1.x}%`,
                                    top: `${punto1.y}%`
                                }}
                            >
                                1
                            </div>
                        )}

                        {punto2 && (
                            <div
                                className="area-admin-calibration-point second"
                                style={{
                                    left: `${punto2.x}%`,
                                    top: `${punto2.y}%`
                                }}
                            >
                                2
                            </div>
                        )}
                    </div>

                    <div className="area-admin-coordinates">
                        <span>
                            X{" "}
                            <strong>
                                {area.x.toFixed(1)}%
                            </strong>
                        </span>

                        <span>
                            Y{" "}
                            <strong>
                                {area.y.toFixed(1)}%
                            </strong>
                        </span>

                        <span>
                            Ancho{" "}
                            <strong>
                                {area.width.toFixed(1)}%
                            </strong>
                        </span>

                        <span>
                            Alto{" "}
                            <strong>
                                {area.height.toFixed(1)}%
                            </strong>
                        </span>
                    </div>
                </div>

                <div className="area-admin-config">
                    <div className="area-admin-field">
                        <label>
                            Foto de{" "}
                            {posicion.toLowerCase()}
                            {producto.usaColores && color
                                ? ` · ${color}`
                                : ""}
                        </label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                seleccionarImagen(
                                    e.target.files?.[0] ||
                                    null
                                )
                            }
                        />
                    </div>

                    {producto.usaTalles && (
                        <div className="area-medida-card area-calibracion-card">
                            <strong>
                                Calibración por talle · compartida entre colores
                            </strong>
                            <p>
                                Marcá dos extremos de una medida de la prenda (por ejemplo, ancho de pecho de costura a costura, medido en plano) e ingresá esa distancia por talle. Se comparte entre colores; usá fotos con el mismo encuadre.
                            </p>

                            <div className="area-calibracion-puntos">
                                <button
                                    type="button"
                                    className={puntoPendiente === 1 ? "active" : ""}
                                    onClick={() => actualizarPuntoPendiente(1)}
                                    disabled={!imagenActualUrl || guardando}
                                >
                                    {punto1 ? "Cambiar punto 1" : "Marcar punto 1"}
                                </button>
                                <button
                                    type="button"
                                    className={puntoPendiente === 2 ? "active" : ""}
                                    onClick={() => actualizarPuntoPendiente(2)}
                                    disabled={!imagenActualUrl || guardando}
                                >
                                    {punto2 ? "Cambiar punto 2" : "Marcar punto 2"}
                                </button>
                            </div>

                            <small>
                                {puntoPendiente
                                    ? `Tocá la foto para ubicar el punto ${puntoPendiente}.`
                                    : "Elegí una distancia fácil de medir, por ejemplo, el ancho del pecho."}
                            </small>

                            <div className="area-calibracion-medidas">
                                {obtenerTallesCalibrables(producto).map(talle => (
                                    <label key={talle}>
                                        Talle {talle} · cm
                                        <input
                                            type="number"
                                            min="0.1"
                                            max="300"
                                            step="0.1"
                                            value={medidasCmPorTalle[talle] ?? ""}
                                            onChange={e => actualizarBorradorCalibracion({
                                                medidasCmPorTalle: {
                                                    ...medidasCmPorTalle,
                                                    [talle]: e.target.value
                                                }
                                            })}
                                        />
                                    </label>
                                ))}
                            </div>

                            <button
                                type="button"
                                className="area-admin-save area-calibracion-save"
                                onClick={guardarCalibracion}
                                disabled={guardando}
                            >
                                {guardando
                                    ? "Guardando..."
                                    : "Guardar calibración de esta vista"}
                            </button>
                        </div>
                    )}

                    {producto.permiteEstampaChica && (
                        <div className="area-medida-card">
                            <strong>
                                Estampa chica
                            </strong>

                            <div className="area-medida-grid">
                                <label>
                                    Ancho cm
                                    <input
                                        type="number"
                                        min="0.1"
                                        step="0.1"
                                        value={
                                            anchoChicaCm
                                        }
                                        onChange={(e) =>
                                            setAnchoChicaCm(
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>

                                <label>
                                    Alto cm
                                    <input
                                        type="number"
                                        min="0.1"
                                        step="0.1"
                                        value={
                                            altoChicaCm
                                        }
                                        onChange={(e) =>
                                            setAltoChicaCm(
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>
                            </div>
                        </div>
                    )}

                    {producto.permiteEstampaMedia && (
                        <div className="area-medida-card">
                            <strong>
                                Estampa mediana
                            </strong>

                            <div className="area-medida-grid">
                                <label>
                                    Ancho cm
                                    <input
                                        type="number"
                                        min="0.1"
                                        step="0.1"
                                        value={
                                            anchoMediaCm
                                        }
                                        onChange={(e) =>
                                            setAnchoMediaCm(
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>

                                <label>
                                    Alto cm
                                    <input
                                        type="number"
                                        min="0.1"
                                        step="0.1"
                                        value={
                                            altoMediaCm
                                        }
                                        onChange={(e) =>
                                            setAltoMediaCm(
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>
                            </div>
                        </div>
                    )}

                    {producto.permiteEstampaGrande && (
                        <div className="area-medida-card">
                            <strong>
                                Estampa grande
                            </strong>

                            <div className="area-medida-grid">
                                <label>
                                    Ancho cm
                                    <input
                                        type="number"
                                        min="0.1"
                                        step="0.1"
                                        value={
                                            anchoGrandeCm
                                        }
                                        onChange={(e) =>
                                            setAnchoGrandeCm(
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>

                                <label>
                                    Alto cm
                                    <input
                                        type="number"
                                        min="0.1"
                                        step="0.1"
                                        value={
                                            altoGrandeCm
                                        }
                                        onChange={(e) =>
                                            setAltoGrandeCm(
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="area-admin-message error">
                            {error}
                        </div>
                    )}

                    {mensaje && (
                        <div className="area-admin-message success">
                            {mensaje}
                        </div>
                    )}

                    <div className="area-admin-actions">
                        {areaExistente && (
                            <button
                                type="button"
                                className="area-admin-delete"
                                onClick={
                                    eliminarArea
                                }
                                disabled={
                                    guardando
                                }
                            >
                                Eliminar vista
                            </button>
                        )}

                        <button
                            type="button"
                            className="area-admin-save"
                            onClick={
                                guardarArea
                            }
                            disabled={
                                guardando
                            }
                        >
                            {guardando
                                ? "Guardando..."
                                : areaExistente
                                    ? "Guardar cambios"
                                    : "Guardar vista"}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}