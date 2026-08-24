import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    getAreasPersonalizacion,
    obtenerUrlArchivo
} from "../services/productoService";

import {
    subirImagen
} from "../services/archivoService";

import {
    useCarrito
} from "../context/CarritoContext";

import "./PersonalizadorProducto.css";

const TAMANOS = {
    CHICA: {
        label: "Chica"
    },

    MEDIA: {
        label: "Mediana"
    },

    GRANDE: {
        label: "Grande"
    }
};

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

function clamp(
    valor,
    min,
    max
) {
    return Math.min(
        Math.max(
            valor,
            min
        ),
        max
    );
}

function crearDisenoVacio() {
    return {
        archivo: null,
        preview: null,
        ruta: null,

        logo: {
            x: 0,
            y: 0,
            width: 0,
            height: 0
        }
    };
}

export default function PersonalizadorProducto({
    producto
}) {

    const {
        agregarAlCarrito
    } = useCarrito();

    const canvasRef =
        useRef(null);

    const fileInputRef =
        useRef(null);

    const dragRef =
        useRef(null);

    const resizeRef =
        useRef(null);

    const [
        areas,
        setAreas
    ] = useState([]);

    const [
        cargando,
        setCargando
    ] = useState(true);

    const [
        posicion,
        setPosicion
    ] = useState(null);

    const [
        tamano,
        setTamano
    ] = useState(null);

    /*
     * IMPORTANTE:
     *
     * Cada vista tiene SU propio diseño.
     *
     * {
     *   FRENTE: {...},
     *   ESPALDA: {...},
     *   MANGA_DERECHA: {...}
     * }
     */
    const [
        disenosPorVista,
        setDisenosPorVista
    ] = useState({});

    const [
        talle,
        setTalle
    ] = useState("");

    const [
        color,
        setColor
    ] = useState("");

    const coloresDisponibles =
        useMemo(() => {

            if (!producto.usaColores) {
                return [];
            }

            const unicos =
                new Map();

            areas.forEach(
                area => {

                    const valor =
                        String(
                            area.color ||
                            ""
                        ).trim();

                    if (valor) {
                        unicos.set(
                            valor.toLowerCase(),
                            valor
                        );
                    }
                }
            );

            return Array.from(
                unicos.values()
            );

        }, [
            areas,
            producto.usaColores
        ]);

    const areasActivas =
        useMemo(() => {

            if (!producto.usaColores) {

                const genericas =
                    areas.filter(
                        area =>
                            !String(
                                area.color ||
                                ""
                            ).trim()
                    );

                return genericas.length > 0
                    ? genericas
                    : areas;
            }

            if (!color) {
                return [];
            }

            return areas.filter(
                area =>
                    String(
                        area.color ||
                        ""
                    )
                        .trim()
                        .toLowerCase() ===
                    String(color)
                        .trim()
                        .toLowerCase()
            );

        }, [
            areas,
            color,
            producto.usaColores
        ]);

    const [
        cantidad,
        setCantidad
    ] = useState(1);

    const [
        subiendo,
        setSubiendo
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
    // CARGAR ÁREAS / MOCKUPS
    // =====================================================

    useEffect(() => {

        async function cargarAreas() {

            try {

                setCargando(true);
                setError("");

                const data =
                    await getAreasPersonalizacion(
                        producto.id
                    );

                const lista =
                    Array.isArray(data)
                        ? data
                        : [];

                setAreas(lista);

                if (
                    lista.length > 0 &&
                    !producto.usaColores
                ) {

                    setPosicion(
                        lista[0].posicion
                    );
                }

                if (
                    producto.usaColores
                ) {

                    const colores =
                        Array.from(
                            new Map(
                                lista
                                    .map(
                                        area =>
                                            String(
                                                area.color ||
                                                ""
                                            ).trim()
                                    )
                                    .filter(Boolean)
                                    .map(
                                        valor => [
                                            valor.toLowerCase(),
                                            valor
                                        ]
                                    )
                            ).values()
                        );

                    if (
                        colores.length > 0
                    ) {

                        setColor(
                            actual =>
                                actual ||
                                colores[0]
                        );
                    }
                }

            } catch (err) {

                console.error(err);

                setError(
                    "No se pudieron cargar las vistas de personalización."
                );

            } finally {

                setCargando(false);
            }
        }

        cargarAreas();

    }, [producto.id, producto.usaColores]);

    useEffect(() => {

        if (
            areasActivas.length === 0
        ) {
            setPosicion(null);
            return;
        }

        if (
            !areasActivas.some(
                area =>
                    area.posicion ===
                    posicion
            )
        ) {

            setPosicion(
                areasActivas[0].posicion
            );
        }

        setDisenosPorVista(
            actual => {

                const copia = {
                    ...actual
                };

                areasActivas.forEach(
                    area => {

                        if (
                            !copia[
                                area.posicion
                            ]
                        ) {

                            copia[
                                area.posicion
                            ] =
                                crearDisenoVacio();
                        }
                    }
                );

                return copia;
            }
        );

    }, [
        areasActivas,
        posicion
    ]);

    // =====================================================
    // ÁREA ACTUAL
    // =====================================================

    const areaActual =
        useMemo(() => {

            return (
                areasActivas.find(
                    area =>
                        area.posicion ===
                        posicion
                ) ||
                null
            );

        }, [
            areasActivas,
            posicion
        ]);

    const disenoActual =
        posicion
            ? (
                disenosPorVista[
                    posicion
                ] ||
                crearDisenoVacio()
            )
            : crearDisenoVacio();

    const logo =
        disenoActual.logo;

    const previewLogo =
        disenoActual.preview;

    // =====================================================
    // TAMAÑOS DISPONIBLES
    // =====================================================

    const tamanosDisponibles =
        useMemo(() => {

            const lista = [];

            if (
                producto.permiteEstampaChica
            ) {
                lista.push("CHICA");
            }

            if (
                producto.permiteEstampaMedia
            ) {
                lista.push("MEDIA");
            }

            if (
                producto.permiteEstampaGrande
            ) {
                lista.push("GRANDE");
            }

            return lista;

        }, [producto]);

    useEffect(() => {

        if (
            !tamano &&
            tamanosDisponibles.length > 0
        ) {

            setTamano(
                tamanosDisponibles[0]
            );
        }

    }, [
        tamanosDisponibles,
        tamano
    ]);

    // =====================================================
    // PRECIO
    // =====================================================

    function obtenerAdicional() {

        if (
            tamano === "CHICA"
        ) {

            return Number(
                producto
                    .precioEstampaChica ||
                0
            );
        }

        if (
            tamano === "MEDIA"
        ) {

            return Number(
                producto
                    .precioEstampaMedia ||
                0
            );
        }

        if (
            tamano === "GRANDE"
        ) {

            return Number(
                producto
                    .precioEstampaGrande ||
                0
            );
        }

        return 0;
    }

    const precioUnitario =
        Number(
            producto.precioBase ||
            0
        ) +
        obtenerAdicional();

    // =====================================================
    // MEDIDAS MÁXIMAS EN CM
    // =====================================================

    function obtenerMedidasMaximas(
        area = areaActual
    ) {

        if (!area) {

            return {
                ancho: 0,
                alto: 0
            };
        }

        if (
            tamano === "CHICA"
        ) {

            return {
                ancho:
                    Number(
                        area
                            .anchoChicaCm ||
                        0
                    ),

                alto:
                    Number(
                        area
                            .altoChicaCm ||
                        0
                    )
            };
        }

        if (
            tamano === "MEDIA"
        ) {

            return {
                ancho:
                    Number(
                        area
                            .anchoMediaCm ||
                        0
                    ),

                alto:
                    Number(
                        area
                            .altoMediaCm ||
                        0
                    )
            };
        }

        return {
            ancho:
                Number(
                    area
                        .anchoGrandeCm ||
                    0
                ),

            alto:
                Number(
                    area
                        .altoGrandeCm ||
                    0
                )
        };
    }

    // =====================================================
    // TAMAÑO VISUAL MÁXIMO DEL LOGO
    //
    // El ÁREA GENERAL NO cambia.
    //
    // CHICA / MEDIA / GRANDE solamente determinan
    // cuánto puede medir el diseño.
    //
    // El usuario puede moverlo por TODA el área general.
    // =====================================================

    function obtenerMaximoVisual(
        area = areaActual
    ) {

        if (!area) {

            return {
                width: 0,
                height: 0
            };
        }

        const anchoGrande =
            Number(
                area.anchoGrandeCm ||
                0
            );

        const altoGrande =
            Number(
                area.altoGrandeCm ||
                0
            );

        const medidas =
            obtenerMedidasMaximas(
                area
            );

        /*
         * Si faltan medidas físicas,
         * usamos el área completa como fallback.
         */
        if (
            anchoGrande <= 0 ||
            altoGrande <= 0 ||
            medidas.ancho <= 0 ||
            medidas.alto <= 0
        ) {

            return {
                width:
                    Number(
                        area.width
                    ),

                height:
                    Number(
                        area.height
                    )
            };
        }

        const proporcionAncho =
            clamp(
                medidas.ancho /
                    anchoGrande,
                0,
                1
            );

        const proporcionAlto =
            clamp(
                medidas.alto /
                    altoGrande,
                0,
                1
            );

        return {
            width:
                Number(
                    area.width
                ) *
                proporcionAncho,

            height:
                Number(
                    area.height
                ) *
                proporcionAlto
        };
    }

    // =====================================================
    // ACTUALIZAR DISEÑO DE UNA VISTA
    // =====================================================

    function actualizarDisenoVista(
        posicionVista,
        cambios
    ) {

        setDisenosPorVista(
            actual => {

                const anterior =
                    actual[
                        posicionVista
                    ] ||
                    crearDisenoVacio();

                return {
                    ...actual,

                    [posicionVista]: {
                        ...anterior,
                        ...cambios
                    }
                };
            }
        );
    }

    function actualizarLogoVista(
        posicionVista,
        nuevoLogo
    ) {

        setDisenosPorVista(
            actual => {

                const anterior =
                    actual[
                        posicionVista
                    ] ||
                    crearDisenoVacio();

                return {
                    ...actual,

                    [posicionVista]: {
                        ...anterior,

                        logo:
                            typeof nuevoLogo ===
                            "function"
                                ? nuevoLogo(
                                      anterior.logo
                                  )
                                : nuevoLogo
                    }
                };
            }
        );
    }

    // =====================================================
    // CUANDO CAMBIA TAMAÑO
    //
    // NO centra obligatoriamente los diseños ya existentes.
    //
    // Solo:
    // - limita el tamaño máximo
    // - corrige posición si quedara afuera
    //
    // Si una vista todavía no tiene tamaño inicial,
    // arranca centrada.
    // =====================================================

    useEffect(() => {

        if (
            !tamano ||
            areasActivas.length === 0
        ) {
            return;
        }

        setDisenosPorVista(
            actual => {

                const copia = {
                    ...actual
                };

                areasActivas.forEach(
                    area => {

                        const anterior =
                            copia[
                                area.posicion
                            ] ||
                            crearDisenoVacio();

                        const max =
                            obtenerMaximoVisual(
                                area
                            );

                        let width =
                            Number(
                                anterior
                                    .logo
                                    .width ||
                                0
                            );

                        let height =
                            Number(
                                anterior
                                    .logo
                                    .height ||
                                0
                            );

                        const nuncaInicializado =
                            width <= 0 ||
                            height <= 0;

                        if (
                            nuncaInicializado
                        ) {

                            width =
                                max.width *
                                0.6;

                            height =
                                max.height *
                                0.6;
                        } else {

                            width =
                                Math.min(
                                    width,
                                    max.width
                                );

                            height =
                                Math.min(
                                    height,
                                    max.height
                                );
                        }

                        let x =
                            Number(
                                anterior
                                    .logo
                                    .x ||
                                0
                            );

                        let y =
                            Number(
                                anterior
                                    .logo
                                    .y ||
                                0
                            );

                        if (
                            nuncaInicializado
                        ) {

                            x =
                                Number(
                                    area.x
                                ) +
                                (
                                    Number(
                                        area.width
                                    ) -
                                    width
                                ) /
                                2;

                            y =
                                Number(
                                    area.y
                                ) +
                                (
                                    Number(
                                        area.height
                                    ) -
                                    height
                                ) /
                                2;

                        } else {

                            x =
                                clamp(
                                    x,
                                    Number(
                                        area.x
                                    ),
                                    Number(
                                        area.x
                                    ) +
                                        Number(
                                            area.width
                                        ) -
                                        width
                                );

                            y =
                                clamp(
                                    y,
                                    Number(
                                        area.y
                                    ),
                                    Number(
                                        area.y
                                    ) +
                                        Number(
                                            area.height
                                        ) -
                                        height
                                );
                        }

                        copia[
                            area.posicion
                        ] = {
                            ...anterior,

                            logo: {
                                x,
                                y,
                                width,
                                height
                            }
                        };
                    }
                );

                return copia;
            }
        );

    }, [
        tamano,
        areasActivas
    ]);

    // =====================================================
    // ARCHIVO DE LA VISTA ACTUAL
    // =====================================================

    function procesarArchivo(
        archivo
    ) {

        if (
            !archivo ||
            !posicion
        ) {
            return;
        }

        if (
            !archivo.type.startsWith(
                "image/"
            )
        ) {

            setError(
                "El archivo debe ser una imagen."
            );

            return;
        }

        const anterior =
            disenosPorVista[
                posicion
            ];

        if (
            anterior?.preview
        ) {

            URL.revokeObjectURL(
                anterior.preview
            );
        }

        actualizarDisenoVista(
            posicion,
            {
                archivo,
                ruta: null,

                preview:
                    URL.createObjectURL(
                        archivo
                    )
            }
        );

        setMensaje("");
        setError("");
    }

    function handleDrop(e) {

        e.preventDefault();

        const archivo =
            e.dataTransfer
                .files?.[0];

        procesarArchivo(
            archivo
        );
    }

    // =====================================================
    // MOVER LOGO
    //
    // El movimiento usa SIEMPRE areaActual,
    // no un área chica centrada.
    // =====================================================

    function iniciarMover(e) {

        if (
            !previewLogo ||
            !posicion
        ) {
            return;
        }

        if (
            e.target.classList.contains(
                "personalizador-resize"
            )
        ) {
            return;
        }

        e.preventDefault();

        dragRef.current = {

            pointerId:
                e.pointerId,

            posicion,

            clientX:
                e.clientX,

            clientY:
                e.clientY,

            inicial:
                { ...logo }
        };

        e.currentTarget
            .setPointerCapture(
                e.pointerId
            );
    }

    function moverLogo(e) {

        const drag =
            dragRef.current;

        if (
            !drag ||
            drag.pointerId !==
                e.pointerId ||
            !canvasRef.current
        ) {
            return;
        }

        const area =
            areasActivas.find(
                item =>
                    item.posicion ===
                    drag.posicion
            );

        if (!area) {
            return;
        }

        const rect =
            canvasRef.current
                .getBoundingClientRect();

        const dx =
            (
                (
                    e.clientX -
                    drag.clientX
                ) /
                rect.width
            ) *
            100;

        const dy =
            (
                (
                    e.clientY -
                    drag.clientY
                ) /
                rect.height
            ) *
            100;

        const minX =
            Number(
                area.x
            );

        const maxX =
            Number(
                area.x
            ) +
            Number(
                area.width
            ) -
            drag.inicial.width;

        const minY =
            Number(
                area.y
            );

        const maxY =
            Number(
                area.y
            ) +
            Number(
                area.height
            ) -
            drag.inicial.height;

        actualizarLogoVista(
            drag.posicion,
            {
                ...drag.inicial,

                x:
                    clamp(
                        drag.inicial.x +
                            dx,
                        minX,
                        maxX
                    ),

                y:
                    clamp(
                        drag.inicial.y +
                            dy,
                        minY,
                        maxY
                    )
            }
        );
    }

    function terminarMover() {

        dragRef.current =
            null;
    }

    // =====================================================
    // REDIMENSIONAR
    //
    // El máximo depende de CHICA/MEDIA/GRANDE.
    //
    // Pero puede estar ubicado en cualquier parte
    // del área general.
    // =====================================================

    function iniciarResize(e) {

        if (!posicion) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        resizeRef.current = {

            pointerId:
                e.pointerId,

            posicion,

            clientX:
                e.clientX,

            clientY:
                e.clientY,

            inicial:
                { ...logo }
        };

        e.currentTarget
            .setPointerCapture(
                e.pointerId
            );
    }

    function resizeLogo(e) {

        const resize =
            resizeRef.current;

        if (
            !resize ||
            resize.pointerId !==
                e.pointerId ||
            !canvasRef.current
        ) {
            return;
        }

        const area =
            areasActivas.find(
                item =>
                    item.posicion ===
                    resize.posicion
            );

        if (!area) {
            return;
        }

        const rect =
            canvasRef.current
                .getBoundingClientRect();

        const dx =
            (
                (
                    e.clientX -
                    resize.clientX
                ) /
                rect.width
            ) *
            100;

        const dy =
            (
                (
                    e.clientY -
                    resize.clientY
                ) /
                rect.height
            ) *
            100;

        const maximoTamano =
            obtenerMaximoVisual(
                area
            );

        /*
         * Además del máximo por categoría,
         * no puede salirse del borde derecho/inferior
         * del área general desde su posición actual.
         */
        const maxWidthPorPosicion =
            Number(
                area.x
            ) +
            Number(
                area.width
            ) -
            resize.inicial.x;

        const maxHeightPorPosicion =
            Number(
                area.y
            ) +
            Number(
                area.height
            ) -
            resize.inicial.y;

        const maxWidth =
            Math.min(
                maximoTamano.width,
                maxWidthPorPosicion
            );

        const maxHeight =
            Math.min(
                maximoTamano.height,
                maxHeightPorPosicion
            );

        actualizarLogoVista(
            resize.posicion,
            {
                ...resize.inicial,

                width:
                    clamp(
                        resize.inicial.width +
                            dx,
                        Math.min(
                            3,
                            maxWidth
                        ),
                        maxWidth
                    ),

                height:
                    clamp(
                        resize.inicial.height +
                            dy,
                        Math.min(
                            3,
                            maxHeight
                        ),
                        maxHeight
                    )
            }
        );
    }

    function terminarResize() {

        resizeRef.current =
            null;
    }

    // =====================================================
    // MEDIDAS REALES DE UNA VISTA
    // =====================================================

    function calcularMedidasReales(
        area,
        logoVista
    ) {

        if (
            !area ||
            !logoVista
        ) {

            return {
                ancho: 0,
                alto: 0
            };
        }

        const maxVisual =
            obtenerMaximoVisual(
                area
            );

        const maxCm =
            obtenerMedidasMaximas(
                area
            );

        if (
            maxVisual.width <= 0 ||
            maxVisual.height <= 0 ||
            maxCm.ancho <= 0 ||
            maxCm.alto <= 0
        ) {

            return {
                ancho: 0,
                alto: 0
            };
        }

        return {
            ancho:
                Number(
                    (
                        maxCm.ancho *
                        (
                            logoVista.width /
                            maxVisual.width
                        )
                    ).toFixed(1)
                ),

            alto:
                Number(
                    (
                        maxCm.alto *
                        (
                            logoVista.height /
                            maxVisual.height
                        )
                    ).toFixed(1)
                )
        };
    }

    const medidasRealesActuales =
        useMemo(() => {

            return calcularMedidasReales(
                areaActual,
                logo
            );

        }, [
            areaActual,
            logo,
            tamano
        ]);

    // =====================================================
    // AGREGAR AL CARRITO
    // =====================================================

    async function handleAgregarCarrito() {

        setError("");
        setMensaje("");

        if (
            areasActivas.length === 0
        ) {

            setError(
                "Este producto todavía no tiene áreas de personalización configuradas."
            );

            return;
        }

        const disenosConArchivo =
            Object.entries(
                disenosPorVista
            ).filter(
                ([, diseno]) =>
                    Boolean(
                        diseno.archivo ||
                        diseno.ruta
                    )
            );

        if (
            producto.requiereImagen &&
            disenosConArchivo.length ===
                0
        ) {

            setError(
                "Subí al menos un diseño antes de agregar el producto."
            );

            return;
        }

        if (
            producto.usaTalles &&
            !talle
        ) {

            setError(
                "Seleccioná un talle."
            );

            return;
        }

        if (
            producto.usaColores &&
            !color
        ) {

            setError(
                "Seleccioná un color."
            );

            return;
        }

        try {

            setSubiendo(true);

            const disenosFinales = [];

            for (
                const [
                    posicionVista,
                    diseno
                ] of Object.entries(
                    disenosPorVista
                )
            ) {

                if (
                    !diseno.archivo &&
                    !diseno.ruta
                ) {
                    continue;
                }

                let ruta =
                    diseno.ruta;

                if (
                    diseno.archivo &&
                    !ruta
                ) {

                    const respuesta =
                        await subirImagen(
                            diseno.archivo
                        );

                    ruta =
                        respuesta.ruta;

                    actualizarDisenoVista(
                        posicionVista,
                        {
                            ruta
                        }
                    );
                }

                const area =
                    areas.find(
                        item =>
                            item.posicion ===
                            posicionVista
                    );

                if (!area) {
                    continue;
                }

                const medidas =
                    calcularMedidasReales(
                        area,
                        diseno.logo
                    );

                disenosFinales.push({
                    rutaImagen:
                        ruta,

                    posicion:
                        posicionVista,

                    tamano,

                    posicionX:
                        Number(
                            diseno.logo.x
                                .toFixed(3)
                        ),

                    posicionY:
                        Number(
                            diseno.logo.y
                                .toFixed(3)
                        ),

                    ancho:
                        Number(
                            diseno.logo.width
                                .toFixed(3)
                        ),

                    alto:
                        Number(
                            diseno.logo.height
                                .toFixed(3)
                        ),

                    anchoCm:
                        medidas.ancho,

                    altoCm:
                        medidas.alto,

                    previewLocal:
                        diseno.preview,

                    imagenBase:
                        area.imagenMockup
                });
            }

            agregarAlCarrito({

                productoId:
                    producto.id,

                productoNombre:
                    producto.nombre,

                imagenPrincipal:
                    producto.imagenPrincipal,

                cantidad:
                    Number(cantidad),

                talle:
                    talle ||
                    null,

                color:
                    color ||
                    null,

                tamanoEstampa:
                    tamano,

                precioBase:
                    Number(
                        producto
                            .precioBase ||
                        0
                    ),

                precioEstampa:
                    obtenerAdicional(),

                precioUnitario,

                subtotal:
                    precioUnitario *
                    Number(
                        cantidad
                    ),

                disenos:
                    disenosFinales
            });

            setMensaje(
                disenosFinales.length ===
                    1
                    ? "Producto agregado al carrito con 1 diseño."
                    : `Producto agregado al carrito con ${disenosFinales.length} diseños.`
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "No se pudo agregar el producto."
            );

        } finally {

            setSubiendo(false);
        }
    }

    // =====================================================
    // ESTADOS DE CARGA
    // =====================================================

    if (cargando) {

        return (
            <div className="personalizador-loading">
                Cargando personalizador...
            </div>
        );
    }

    if (
        areas.length === 0 ||
        (
            producto.usaColores &&
            coloresDisponibles.length === 0
        )
    ) {

        return (

            <div className="personalizador-no-config">

                {producto.usaColores
                    ? "Este producto todavía no tiene colores con mockups configurados."
                    : "Este producto todavía no tiene mockups configurados."}

            </div>
        );
    }

    const imagenMockup =
        obtenerUrlArchivo(
            areaActual
                ?.imagenMockup
        );

    // =====================================================
    // RENDER
    // =====================================================

    return (

        <section className="personalizador">

            <div className="personalizador-visual">

                {/* =========================================
                    VISTAS DEL PRODUCTO
                ========================================= */}

                <div className="personalizador-tabs">

                    {areasActivas.map(area => {

                        const tieneDiseno =
                            Boolean(
                                disenosPorVista[
                                    area.posicion
                                ]?.archivo ||
                                disenosPorVista[
                                    area.posicion
                                ]?.ruta
                            );

                        return (

                            <button
                                key={
                                    area.id
                                }
                                type="button"
                                className={
                                    posicion ===
                                    area.posicion
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setPosicion(
                                        area.posicion
                                    )
                                }
                            >

                                {area.posicion ===
                                "FRENTE"
                                    ? "Frente"
                                    : area.posicion ===
                                      "ESPALDA"
                                        ? "Espalda"
                                        : area.posicion
                                              .replaceAll(
                                                  "_",
                                                  " "
                                              )
                                              .toLowerCase()}

                                {tieneDiseno
                                    ? " ✓"
                                    : ""}

                            </button>
                        );
                    })}

                </div>

                {/* =========================================
                    MOCKUP
                ========================================= */}

                <div
                    ref={canvasRef}
                    className="personalizador-canvas"
                    onDragOver={(e) =>
                        e.preventDefault()
                    }
                    onDrop={
                        handleDrop
                    }
                >

                    {imagenMockup && (

                        <img
                            className="personalizador-base"
                            src={
                                imagenMockup
                            }
                            alt={
                                `${producto.nombre} ${posicion || ""}`
                            }
                            draggable="false"
                        />

                    )}

                    {/* =====================================
                        ÁREA GENERAL DEL ADMIN

                        ESTA NO CAMBIA ENTRE
                        CHICA / MEDIA / GRANDE.
                    ===================================== */}

                    {areaActual && (

                        <div
                            className="personalizador-area"
                            style={{
                                left:
                                    `${areaActual.x}%`,

                                top:
                                    `${areaActual.y}%`,

                                width:
                                    `${areaActual.width}%`,

                                height:
                                    `${areaActual.height}%`
                            }}
                            onClick={() => {

                                if (
                                    !previewLogo
                                ) {

                                    fileInputRef.current
                                        ?.click();
                                }
                            }}
                        >

                            {!previewLogo && (

                                <div className="personalizador-placeholder">

                                    <strong>
                                        TU LOGO
                                    </strong>

                                    <span>
                                        AQUÍ
                                    </span>

                                    <small>
                                        Click o arrastrá una imagen
                                    </small>

                                </div>

                            )}

                        </div>

                    )}

                    {/* =====================================
                        DISEÑO DE ESTA VISTA
                    ===================================== */}

                    {previewLogo && (

                        <div
                            className="personalizador-logo"
                            style={{
                                left:
                                    `${logo.x}%`,

                                top:
                                    `${logo.y}%`,

                                width:
                                    `${logo.width}%`,

                                height:
                                    `${logo.height}%`
                            }}
                            onPointerDown={
                                iniciarMover
                            }
                            onPointerMove={
                                moverLogo
                            }
                            onPointerUp={
                                terminarMover
                            }
                            onPointerCancel={
                                terminarMover
                            }
                        >

                            <img
                                src={
                                    previewLogo
                                }
                                alt={`Diseño ${posicion || ""}`}
                                draggable="false"
                            />

                            <button
                                type="button"
                                className="personalizador-resize"
                                aria-label="Redimensionar diseño"
                                onPointerDown={
                                    iniciarResize
                                }
                                onPointerMove={
                                    resizeLogo
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

                </div>

                <input
                    ref={fileInputRef}
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(e) => {

                        procesarArchivo(
                            e.target
                                .files?.[0]
                        );

                        /*
                         * Permite volver a elegir
                         * el mismo archivo después.
                         */
                        e.target.value = "";
                    }}
                />

                {previewLogo && (

                    <button
                        type="button"
                        className="cambiar-diseno"
                        onClick={() =>
                            fileInputRef.current
                                ?.click()
                        }
                    >
                        Cambiar diseño de esta vista
                    </button>

                )}

            </div>

            {/* =================================================
                CONTROLES
            ================================================= */}

            <div className="personalizador-controles">

                <span className="personalizador-eyebrow">
                    PERSONALIZÁ TU PRODUCTO
                </span>

                <h1>
                    {producto.nombre}
                </h1>

                <p className="personalizador-descripcion">
                    {producto.descripcion}
                </p>

                <div className="personalizador-precio">

                    <strong>
                        {moneda(
                            precioUnitario
                        )}
                    </strong>

                    {obtenerAdicional() >
                        0 && (

                        <span>
                            {moneda(
                                producto.precioBase
                            )}
                            {" "}+
                            {" "}
                            {moneda(
                                obtenerAdicional()
                            )}
                            {" "}estampa
                        </span>

                    )}

                </div>

                {/* =========================================
                    TAMAÑO
                ========================================= */}

                <div className="control-section">

                    <label>
                        Tamaño de estampa
                    </label>

                    <div className="tamano-options">

                        {tamanosDisponibles.map(
                            item => (

                                <button
                                    type="button"
                                    key={
                                        item
                                    }
                                    className={
                                        tamano ===
                                        item
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setTamano(
                                            item
                                        )
                                    }
                                >

                                    <strong>
                                        {
                                            TAMANOS[
                                                item
                                            ].label
                                        }
                                    </strong>

                                    <span>
                                        +
                                        {moneda(
                                            item ===
                                            "CHICA"
                                                ? producto
                                                      .precioEstampaChica
                                                : item ===
                                                  "MEDIA"
                                                    ? producto
                                                          .precioEstampaMedia
                                                    : producto
                                                          .precioEstampaGrande
                                        )}
                                    </span>

                                </button>

                            )
                        )}

                    </div>

                    {areaActual && (

                        <small className="medida-actual">
                            Mové y ajustá tu diseño hasta que quede como te guste.
                        </small>

                    )}

                </div>

                {/* =========================================
                    TALLE
                ========================================= */}

                {producto.usaTalles && (

                    <div className="control-section">

                        <label>
                            Talle
                        </label>

                        <select
                            value={
                                talle
                            }
                            onChange={(e) =>
                                setTalle(
                                    e.target.value
                                )
                            }
                        >

                            <option value="">
                                Elegir talle
                            </option>

                            <option value="XS">
                                XS
                            </option>

                            <option value="S">
                                S
                            </option>

                            <option value="M">
                                M
                            </option>

                            <option value="L">
                                L
                            </option>

                            <option value="XL">
                                XL
                            </option>

                            <option value="XXL">
                                XXL
                            </option>

                        </select>

                    </div>

                )}

                {/* =========================================
                    COLOR
                ========================================= */}

                {producto.usaColores && (

                    <div className="control-section">

                        <label>
                            Color
                        </label>

                        <div className="color-options">

                            {coloresDisponibles.map(
                                item => (

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

                    </div>

                )}

                {/* =========================================
                    CANTIDAD
                ========================================= */}

                <div className="control-section">

                    <label>
                        Cantidad
                    </label>

                    <input
                        type="number"
                        min="1"
                        value={
                            cantidad
                        }
                        onChange={(e) =>
                            setCantidad(
                                e.target.value
                            )
                        }
                    />

                </div>

                {/* =========================================
                    RESUMEN DE DISEÑOS
                ========================================= */}

                <div className="control-section">

                    <label>
                        Diseños cargados
                    </label>

                    <div className="personalizador-tabs">

                        {areasActivas.map(area => {

                            const cargado =
                                Boolean(
                                    disenosPorVista[
                                        area.posicion
                                    ]?.archivo ||
                                    disenosPorVista[
                                        area.posicion
                                    ]?.ruta
                                );

                            return (

                                <span
                                    key={
                                        `resumen-${area.id}`
                                    }
                                    className={
                                        cargado
                                            ? "active"
                                            : ""
                                    }
                                >
                                    {
                                        area.posicion
                                            .replaceAll(
                                                "_",
                                                " "
                                            )
                                            .toLowerCase()
                                    }
                                    {cargado
                                        ? " ✓"
                                        : ""}
                                </span>
                            );
                        })}

                    </div>

                </div>

                {error && (

                    <div className="personalizador-message error">
                        {error}
                    </div>

                )}

                {mensaje && (

                    <div className="personalizador-message success">
                        {mensaje}
                    </div>

                )}

                <button
                    type="button"
                    className="agregar-carrito-button"
                    disabled={
                        subiendo
                    }
                    onClick={
                        handleAgregarCarrito
                    }
                >

                    {subiendo
                        ? "Preparando..."
                        : `Agregar al carrito · ${moneda(
                              precioUnitario *
                              Number(
                                  cantidad
                              )
                          )}`}

                </button>

            </div>

        </section>
    );
}