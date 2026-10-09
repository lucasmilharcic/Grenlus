import {
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    getAreasPersonalizacion,
    getCalibracionesEstampa,
    obtenerUrlArchivo
} from "../services/productoService";

import {
    subirImagen
} from "../services/archivoService";

import {
    useCarrito
} from "../context/CarritoContext";

import {
    GRUPOS_DE_TALLES,
    tallesDelProducto
} from "../constants/talles";

import "./PersonalizadorProducto.css";

const TAMANOS = {
    CHICA: "Chica",
    MEDIA: "Mediana",
    GRANDE: "Grande"
};

const TALLES_ESPECIALES = [
    "T6",
    "T8",
    "T10"
];

/*
 * T14 y T16 solo se ofrecen si el producto los tiene
 * habilitados, igual que valida el backend.
 */
const TALLES_ESPECIALES_GRANDES = [
    "T14",
    "T16"
];

function ofreceTalleEspecial(producto, talle) {
    if (producto?.incluyeTallesEspeciales !== true || !talle) {
        return false;
    }

    const normalizado = String(talle).trim().toUpperCase();

    if (TALLES_ESPECIALES_GRANDES.includes(normalizado)) {
        return producto.incluyeTallesEspecialesGrandes !== false;
    }

    return TALLES_ESPECIALES.includes(normalizado);
}

function moneda(valor) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    }).format(Number(valor || 0));
}

function clamp(valor, min, max) {
    return Math.min(Math.max(valor, min), max);
}

/*
 * Medidas maximas en cm que el admin configuro en el area,
 * para la categoria pedida.
 *
 * Devuelve null si esa categoria no tiene medidas cargadas.
 */
function obtenerMaximoCm(area, categoria) {
    if (!area) {
        return null;
    }

    const campos = {
        CHICA: ["anchoChicaCm", "altoChicaCm"],
        MEDIA: ["anchoMediaCm", "altoMediaCm"],
        GRANDE: ["anchoGrandeCm", "altoGrandeCm"]
    }[categoria];

    if (!campos) {
        return null;
    }

    const ancho = Number(area[campos[0]] || 0);
    const alto = Number(area[campos[1]] || 0);

    return ancho > 0 && alto > 0
        ? { ancho, alto }
        : null;
}

/*
 * La categoria sale de las medidas del area configuradas
 * en el admin, que son las mismas que valida el backend.
 *
 * Si el area no tiene medidas cargadas caemos en los
 * valores de referencia de siempre (20 / 30 cm).
 */
function obtenerCategoriaEstampa(medidas, area) {
    const ancho = Number(medidas?.ancho || 0);
    const alto = Number(medidas?.alto || 0);

    if (ancho <= 0 || alto <= 0) {
        return "CHICA";
    }

    for (const categoria of ["CHICA", "MEDIA", "GRANDE"]) {
        const max = obtenerMaximoCm(area, categoria);

        if (max && ancho <= max.ancho && alto <= max.alto) {
            return categoria;
        }
    }

    if (obtenerMaximoCm(area, "GRANDE")) {
        /*
         * Hay medidas configuradas y el diseño no entra en
         * ninguna: queda GRANDE y el editor ya lo limita.
         */
        return "GRANDE";
    }

    if (ancho <= 20 && alto <= 20) {
        return "CHICA";
    }

    if (ancho <= 30 && alto <= 30) {
        return "MEDIA";
    }

    return "GRANDE";
}

async function recortarMargenTransparente(archivo) {
    if (
        !["image/png", "image/webp", "image/avif"].includes(archivo.type) ||
        typeof createImageBitmap !== "function"
    ) {
        return archivo;
    }

    const imagen = await createImageBitmap(archivo);

    try {
        const escala = Math.min(
            1,
            512 / Math.max(imagen.width, imagen.height)
        );

        const anchoMuestra = Math.max(
            1,
            Math.ceil(imagen.width * escala)
        );

        const altoMuestra = Math.max(
            1,
            Math.ceil(imagen.height * escala)
        );

        const lienzoMuestra = document.createElement("canvas");

        lienzoMuestra.width = anchoMuestra;
        lienzoMuestra.height = altoMuestra;

        const contextoMuestra = lienzoMuestra.getContext(
            "2d",
            { willReadFrequently: true }
        );

        if (!contextoMuestra) {
            throw new Error(
                "No se pudo preparar la imagen para recortarla."
            );
        }

        contextoMuestra.drawImage(
            imagen,
            0,
            0,
            anchoMuestra,
            altoMuestra
        );

        const pixeles = contextoMuestra.getImageData(
            0,
            0,
            anchoMuestra,
            altoMuestra
        ).data;

        let izquierda = anchoMuestra;
        let arriba = altoMuestra;
        let derecha = -1;
        let abajo = -1;

        for (let y = 0; y < altoMuestra; y += 1) {
            for (let x = 0; x < anchoMuestra; x += 1) {
                const alpha = pixeles[(y * anchoMuestra + x) * 4 + 3];

                if (alpha > 8) {
                    izquierda = Math.min(izquierda, x);
                    arriba = Math.min(arriba, y);
                    derecha = Math.max(derecha, x);
                    abajo = Math.max(abajo, y);
                }
            }
        }

        if (derecha < izquierda || abajo < arriba) {
            return archivo;
        }

        const margenMuestra = 2;

        const origenX = Math.max(
            0,
            izquierda - margenMuestra
        );

        const origenY = Math.max(
            0,
            arriba - margenMuestra
        );

        const finalX = Math.min(
            anchoMuestra,
            derecha + margenMuestra + 1
        );

        const finalY = Math.min(
            altoMuestra,
            abajo + margenMuestra + 1
        );

        const recorteX = Math.floor(origenX / escala);
        const recorteY = Math.floor(origenY / escala);

        const recorteAncho = Math.min(
            imagen.width - recorteX,
            Math.ceil((finalX - origenX) / escala)
        );

        const recorteAlto = Math.min(
            imagen.height - recorteY,
            Math.ceil((finalY - origenY) / escala)
        );

        if (
            recorteX === 0 &&
            recorteY === 0 &&
            recorteAncho === imagen.width &&
            recorteAlto === imagen.height
        ) {
            return archivo;
        }

        const lienzoRecorte = document.createElement("canvas");

        lienzoRecorte.width = recorteAncho;
        lienzoRecorte.height = recorteAlto;

        const contextoRecorte = lienzoRecorte.getContext("2d");

        if (!contextoRecorte) {
            throw new Error(
                "No se pudo recortar el margen transparente de la imagen."
            );
        }

        contextoRecorte.drawImage(
            imagen,
            recorteX,
            recorteY,
            recorteAncho,
            recorteAlto,
            0,
            0,
            recorteAncho,
            recorteAlto
        );

        const blob = await new Promise((resolve, reject) => {
            lienzoRecorte.toBlob(
                resultado => {
                    if (resultado) {
                        resolve(resultado);
                    } else {
                        reject(
                            new Error(
                                "No se pudo generar la imagen recortada."
                            )
                        );
                    }
                },
                "image/png"
            );
        });

        const nombreBase = archivo.name.replace(/\.[^.]+$/, "");

        return new File(
            [blob],
            `${nombreBase}.png`,
            {
                type: "image/png",
                lastModified: Date.now()
            }
        );
    } finally {
        imagen.close();
    }
}

async function obtenerAspectRatioImagen(archivo) {
    if (typeof createImageBitmap === "function") {
        const imagen = await createImageBitmap(archivo);

        try {
            return imagen.width / imagen.height;
        } finally {
            imagen.close();
        }
    }

    const url = URL.createObjectURL(archivo);

    try {
        const imagen = new Image();

        return await new Promise((resolve, reject) => {
            imagen.onload = () => {
                resolve(
                    imagen.naturalWidth / imagen.naturalHeight
                );
            };

            imagen.onerror = () => {
                reject(
                    new Error(
                        "No se pudieron leer las dimensiones de la imagen."
                    )
                );
            };

            imagen.src = url;
        });
    } finally {
        URL.revokeObjectURL(url);
    }
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
            height: 0,
            aspectRatio: 1
        }
    };
}

export default function PersonalizadorProducto({ producto }) {
    const { items, agregarAlCarrito } = useCarrito();

    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const dragRef = useRef(null);
    const resizeRef = useRef(null);

    const [areas, setAreas] = useState([]);
    const [calibraciones, setCalibraciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [posicion, setPosicion] = useState(null);
    const [disenosPorVista, setDisenosPorVista] = useState({});
    const [talle, setTalle] = useState("");

    /*
     * Talles que este producto ofrece, elegidos en el panel.
     */
    const tallesOfrecidos = useMemo(
        () => tallesDelProducto(producto),
        [producto]
    );
    const [color, setColor] = useState("");
    const [cantidad, setCantidad] = useState(1);
    const [subiendo, setSubiendo] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const coloresDisponibles = useMemo(() => {
        if (!producto.usaColores) {
            return [];
        }

        const unicos = new Map();

        areas.forEach(area => {
            const valor = String(area.color || "").trim();

            if (valor) {
                unicos.set(valor.toLowerCase(), valor);
            }
        });

        return Array.from(unicos.values());
    }, [areas, producto.usaColores]);

    const areasActivas = useMemo(() => {
        if (!producto.usaColores) {
            const genericas = areas.filter(
                area => !String(area.color || "").trim()
            );

            return genericas.length > 0 ? genericas : areas;
        }

        if (!color) {
            return [];
        }

        return areas.filter(
            area =>
                String(area.color || "").trim().toLowerCase() ===
                String(color).trim().toLowerCase()
        );
    }, [areas, color, producto.usaColores]);

    // =====================================================
    // CARGAR ÁREAS Y CALIBRACIONES
    // =====================================================

    useEffect(() => {
        async function cargarAreas() {
            try {
                setCargando(true);
                setError("");

                const data = await getAreasPersonalizacion(producto.id);
                const lista = Array.isArray(data) ? data : [];

                setAreas(lista);

                if (lista.length > 0 && !producto.usaColores) {
                    setPosicion(lista[0].posicion);
                }

                if (producto.usaColores) {
                    const colores = Array.from(
                        new Map(
                            lista
                                .map(area => String(area.color || "").trim())
                                .filter(Boolean)
                                .map(valor => [valor.toLowerCase(), valor])
                        ).values()
                    );

                    if (colores.length > 0) {
                        setColor(actual => actual || colores[0]);
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
                        "No se pudieron cargar las medidas por talle."
                    );
                }
            }
        }

        cargarCalibraciones();

        return () => {
            activa = false;
        };
    }, [producto.id]);

    useEffect(() => {
        if (areasActivas.length === 0) {
            setPosicion(null);
            return;
        }

        if (
            !areasActivas.some(area => area.posicion === posicion)
        ) {
            setPosicion(areasActivas[0].posicion);
        }

        setDisenosPorVista(actual => {
            const copia = { ...actual };

            areasActivas.forEach(area => {
                if (!copia[area.posicion]) {
                    copia[area.posicion] = crearDisenoVacio();
                }
            });

            return copia;
        });
    }, [areasActivas, posicion]);

    // =====================================================
    // ÁREA Y DISEÑO ACTUAL
    // =====================================================

    const areaActual = useMemo(() => {
        return (
            areasActivas.find(area => area.posicion === posicion) ||
            null
        );
    }, [areasActivas, posicion]);

    const disenoActual = posicion
        ? disenosPorVista[posicion] || crearDisenoVacio()
        : crearDisenoVacio();

    const logo = disenoActual.logo;
    const previewLogo = disenoActual.preview;

    // =====================================================
    // CALIBRACIÓN: CM POR UNIDAD VISUAL
    // =====================================================

    function obtenerEscalaCmPorcentaje(
        area = areaActual,
        talleSeleccionado = talle
    ) {
        if (!area || !talleSeleccionado) {
            return 0;
        }

        const calibracion = calibraciones.find(
            item => item.posicion === area.posicion
        );

        const medidasPorTalle = calibracion?.medidasCmPorTalle || {};

        const distanciaCm = Number(
            medidasPorTalle[
                String(talleSeleccionado).trim().toUpperCase()
            ] || 0
        );

        if (
            !calibracion ||
            distanciaCm <= 0 ||
            !Number.isFinite(distanciaCm)
        ) {
            return 0;
        }

        const distanciaPuntos = Math.hypot(
            Number(calibracion.punto2X) - Number(calibracion.punto1X),
            Number(calibracion.punto2Y) - Number(calibracion.punto1Y)
        );

        return distanciaPuntos > 0
            ? distanciaCm / distanciaPuntos
            : 0;
    }

    // =====================================================
    // LÍMITE VISUAL
    //
    // No depende del talle ni de la categoría de precio.
    // El límite es el área completa configurada por el admin.
    // =====================================================

    function obtenerMaximoVisual(
        area = areaActual,
        talleSeleccionado = talle
    ) {
        if (!area) {
            return {
                width: 0,
                height: 0
            };
        }

        const width = Math.max(0, Number(area.width || 0));
        const alto = Math.max(0, Number(area.height || 0));

        /*
         * Tope fisico: el diseño no puede pasar la medida
         * GRANDE del area, porque es la que valida el backend
         * al confirmar el pedido.
         *
         * Restamos medio milimetro porque las medidas se
         * redondean a un decimal antes de enviarlas.
         */
        const maxCm = obtenerMaximoCm(area, "GRANDE");

        const escala = obtenerEscalaCmPorcentaje(
            area,
            talleSeleccionado
        );

        if (maxCm && escala > 0) {
            const MARGEN_CM = 0.05;

            return {
                width: Math.min(
                    width,
                    Math.max(0, maxCm.ancho - MARGEN_CM) / escala
                ),
                height: Math.min(
                    alto,
                    Math.max(0, maxCm.alto - MARGEN_CM) / escala
                )
            };
        }

        /*
         * Sin calibracion las medidas se derivan del area
         * completa tomando GRANDE como referencia, asi que
         * el area ya es el tope.
         */
        return {
            width,
            height: alto
        };
    }

    // =====================================================
    // MEDIDAS FÍSICAS
    //
    // Con calibración: utiliza la escala del talle elegido.
    // Sin calibración: utiliza las dimensiones grandes
    // configuradas como referencia para el área.
    // =====================================================

    function calcularMedidasReales(
        area,
        logoVista,
        talleSeleccionado = talle
    ) {
        if (!area || !logoVista) {
            return {
                ancho: 0,
                alto: 0
            };
        }

        const anchoVisual = Number(logoVista.width || 0);
        const altoVisual = Number(logoVista.height || 0);

        if (anchoVisual <= 0 || altoVisual <= 0) {
            return {
                ancho: 0,
                alto: 0
            };
        }

        const escala = obtenerEscalaCmPorcentaje(
            area,
            talleSeleccionado
        );

        if (escala > 0) {
            return {
                ancho: Number((anchoVisual * escala).toFixed(1)),
                alto: Number((altoVisual * escala).toFixed(1))
            };
        }

        const anchoReferencia = Number(area.anchoGrandeCm || 0);
        const altoReferencia = Number(area.altoGrandeCm || 0);
        const anchoArea = Number(area.width || 0);
        const altoArea = Number(area.height || 0);

        if (
            anchoReferencia <= 0 ||
            altoReferencia <= 0 ||
            anchoArea <= 0 ||
            altoArea <= 0
        ) {
            return {
                ancho: 0,
                alto: 0
            };
        }

        return {
            ancho: Number(
                (anchoVisual / anchoArea * anchoReferencia).toFixed(1)
            ),
            alto: Number(
                (altoVisual / altoArea * altoReferencia).toFixed(1)
            )
        };
    }

    // =====================================================
    // CATEGORÍA AUTOMÁTICA
    //
    // Si hay varios diseños, se cobra según el más grande.
    // =====================================================

    const categoriaEstampa = useMemo(() => {
        let categoriaMayor = "CHICA";

        const prioridad = {
            CHICA: 1,
            MEDIA: 2,
            GRANDE: 3
        };

        Object.entries(disenosPorVista).forEach(
            ([posicionVista, diseno]) => {
                if (
                    !diseno?.archivo &&
                    !diseno?.ruta
                ) {
                    return;
                }

                const area = areas.find(
                    item => item.posicion === posicionVista
                );

                if (!area) {
                    return;
                }

                const medidas = calcularMedidasReales(
                    area,
                    diseno.logo,
                    talle
                );

                const categoria = obtenerCategoriaEstampa(medidas, area);

                if (prioridad[categoria] > prioridad[categoriaMayor]) {
                    categoriaMayor = categoria;
                }
            }
        );

        return categoriaMayor;
    }, [
        disenosPorVista,
        areas,
        talle,
        calibraciones
    ]);

    function obtenerAdicional(categoria = categoriaEstampa) {
        if (categoria === "CHICA") {
            return Number(producto.precioEstampaChica || 0);
        }

        if (categoria === "MEDIA") {
            return Number(producto.precioEstampaMedia || 0);
        }

        if (categoria === "GRANDE") {
            return Number(producto.precioEstampaGrande || 0);
        }

        return 0;
    }

    const precioAdicionalTalle =
        ofreceTalleEspecial(producto, talle)
            ? Number(producto.precioAdicionalTalleEspecial || 0)
            : 0;

    const precioUnitario =
        Number(producto.precioBase || 0) +
        obtenerAdicional() +
        precioAdicionalTalle;

    const cantidadEnCarrito = items.reduce(
        (cantidadTotal, item) =>
            String(item.productoId) === String(producto.id)
                ? cantidadTotal + Number(item.cantidad || 0)
                : cantidadTotal,
        0
    );

    const descuentoMayoristaPorcentaje =
        Number(producto.descuentoMayoristaPorcentaje || 0);

    const aplicaDescuentoMayorista =
        cantidadEnCarrito + Number(cantidad || 0) > 5 &&
        descuentoMayoristaPorcentaje > 0;

    const precioUnitarioMostrado =
        Number(producto.precioBase || 0) *
            (
                aplicaDescuentoMayorista
                    ? 1 - descuentoMayoristaPorcentaje / 100
                    : 1
            ) +
        obtenerAdicional() +
        precioAdicionalTalle;

    const medidasRealesActuales = useMemo(() => {
        return calcularMedidasReales(
            areaActual,
            logo,
            talle
        );
    }, [
        areaActual,
        logo,
        talle,
        calibraciones
    ]);

    const calibracionActual = calibraciones.find(
        item => item.posicion === posicion
    ) || null;

    const escalaCalibradaActual =
        obtenerEscalaCmPorcentaje(areaActual, talle);

    // =====================================================
    // ACTUALIZAR DISEÑOS POR VISTA
    // =====================================================

    function actualizarDisenoVista(posicionVista, cambios) {
        setDisenosPorVista(actual => {
            const anterior =
                actual[posicionVista] || crearDisenoVacio();

            return {
                ...actual,
                [posicionVista]: {
                    ...anterior,
                    ...cambios
                }
            };
        });
    }

    function actualizarLogoVista(posicionVista, nuevoLogo) {
        setDisenosPorVista(actual => {
            const anterior =
                actual[posicionVista] || crearDisenoVacio();

            const logoActualizado =
                typeof nuevoLogo === "function"
                    ? nuevoLogo(anterior.logo)
                    : nuevoLogo;

            return {
                ...actual,
                [posicionVista]: {
                    ...anterior,
                    logo: logoActualizado
                }
            };
        });
    }

    // =====================================================
    // INICIALIZAR DISEÑO
    //
    // Solo inicializa diseños vacíos.
    // No se ejecuta al cambiar talle ni precio.
    // =====================================================

    useEffect(() => {
        if (areasActivas.length === 0) {
            return;
        }

        setDisenosPorVista(actual => {
            const copia = { ...actual };
            let huboCambios = false;

            areasActivas.forEach(area => {
                const anterior =
                    copia[area.posicion] || crearDisenoVacio();

                const width = Number(anterior.logo.width || 0);
                const height = Number(anterior.logo.height || 0);

                if (width > 0 && height > 0) {
                    return;
                }

                const maximo = obtenerMaximoVisual(area);

                const aspectRatio =
                    Number(anterior.logo.aspectRatio) || 1;

                let nuevoAncho = Math.min(
                    maximo.width * 0.6,
                    maximo.height * 0.6 * aspectRatio
                );

                let nuevoAlto = nuevoAncho / aspectRatio;

                if (nuevoAlto > maximo.height * 0.6) {
                    nuevoAlto = maximo.height * 0.6;
                    nuevoAncho = nuevoAlto * aspectRatio;
                }

                const x =
                    Number(area.x) +
                    (Number(area.width) - nuevoAncho) / 2;

                const y =
                    Number(area.y) +
                    (Number(area.height) - nuevoAlto) / 2;

                copia[area.posicion] = {
                    ...anterior,
                    logo: {
                        x,
                        y,
                        width: nuevoAncho,
                        height: nuevoAlto,
                        aspectRatio
                    }
                };

                huboCambios = true;
            });

            return huboCambios ? copia : actual;
        });
    }, [areasActivas]);

    // =====================================================
    // CARGAR ARCHIVO
    // =====================================================

    async function procesarArchivo(archivo) {
        if (!archivo || !posicion || !areaActual) {
            return;
        }

        if (!archivo.type.startsWith("image/")) {
            setError("El archivo debe ser una imagen.");
            return;
        }

        try {
            const archivoRecortado =
                await recortarMargenTransparente(archivo);

            const aspectRatio =
                await obtenerAspectRatioImagen(archivoRecortado);

            const maximo = obtenerMaximoVisual(areaActual);

            let width = Math.min(
                maximo.width * 0.6,
                maximo.height * 0.6 * aspectRatio
            );

            let height = width / aspectRatio;

            if (height > maximo.height * 0.6) {
                height = maximo.height * 0.6;
                width = height * aspectRatio;
            }

            const x = clamp(
                Number(areaActual.x || 0) +
                    (Number(areaActual.width || 100) - width) / 2,
                Number(areaActual.x || 0),
                Number(areaActual.x || 0) +
                    Number(areaActual.width || 100) -
                    width
            );

            const y = clamp(
                Number(areaActual.y || 0) +
                    (Number(areaActual.height || 100) - height) / 2,
                Number(areaActual.y || 0),
                Number(areaActual.y || 0) +
                    Number(areaActual.height || 100) -
                    height
            );

            const anterior = disenosPorVista[posicion];

            if (anterior?.preview) {
                URL.revokeObjectURL(anterior.preview);
            }

            actualizarDisenoVista(posicion, {
                archivo: archivoRecortado,
                ruta: null,
                logo: {
                    x,
                    y,
                    width,
                    height,
                    aspectRatio
                },
                preview: URL.createObjectURL(archivoRecortado)
            });

            setMensaje("");
            setError("");
        } catch (err) {
            console.error(err);
            setError(err.message || "No se pudo preparar la imagen.");
        }
    }

    function handleDrop(e) {
        e.preventDefault();

        const archivo = e.dataTransfer.files?.[0];

        procesarArchivo(archivo);
    }

    // =====================================================
    // MOVER DISEÑO
    // =====================================================

    function iniciarMover(e) {
        if (!previewLogo || !posicion) {
            return;
        }

        if (e.target.classList.contains("personalizador-resize")) {
            return;
        }

        e.preventDefault();

        dragRef.current = {
            pointerId: e.pointerId,
            posicion,
            clientX: e.clientX,
            clientY: e.clientY,
            inicial: { ...logo }
        };

        e.currentTarget.setPointerCapture(e.pointerId);
    }

    function moverLogo(e) {
        const drag = dragRef.current;

        if (
            !drag ||
            drag.pointerId !== e.pointerId ||
            !canvasRef.current
        ) {
            return;
        }

        const area = areasActivas.find(
            item => item.posicion === drag.posicion
        );

        if (!area) {
            return;
        }

        const rect = canvasRef.current.getBoundingClientRect();

        const dx = ((e.clientX - drag.clientX) / rect.width) * 100;
        const dy = ((e.clientY - drag.clientY) / rect.height) * 100;

        actualizarLogoVista(drag.posicion, {
            ...drag.inicial,

            x: clamp(
                drag.inicial.x + dx,
                Number(area.x),
                Number(area.x) +
                    Number(area.width) -
                    drag.inicial.width
            ),

            y: clamp(
                drag.inicial.y + dy,
                Number(area.y),
                Number(area.y) +
                    Number(area.height) -
                    drag.inicial.height
            )
        });
    }

    function terminarMover() {
        dragRef.current = null;
    }

    // =====================================================
    // REDIMENSIONAR DISEÑO
    //
    // Sin límite de 20 o 30 cm.
    // El único límite es el área de impresión.
    // =====================================================

    function iniciarResize(e) {
        if (!posicion) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        resizeRef.current = {
            pointerId: e.pointerId,
            posicion,
            clientX: e.clientX,
            clientY: e.clientY,
            inicial: { ...logo }
        };

        e.currentTarget.setPointerCapture(e.pointerId);
    }

    function resizeLogo(e) {
        const resize = resizeRef.current;

        if (
            !resize ||
            resize.pointerId !== e.pointerId ||
            !canvasRef.current
        ) {
            return;
        }

        const area = areasActivas.find(
            item => item.posicion === resize.posicion
        );

        if (!area) {
            return;
        }

        const rect = canvasRef.current.getBoundingClientRect();

        const dx = ((e.clientX - resize.clientX) / rect.width) * 100;
        const dy = ((e.clientY - resize.clientY) / rect.height) * 100;

        const aspectRatio =
            Number(resize.inicial.aspectRatio) ||
            resize.inicial.width / resize.inicial.height;

        const maxWidthPorPosicion =
            Number(area.x) +
            Number(area.width) -
            resize.inicial.x;

        const maxHeightPorPosicion =
            Number(area.y) +
            Number(area.height) -
            resize.inicial.y;

        const maximo = obtenerMaximoVisual(area);

        const maxWidth = Math.max(
            0,
            Math.min(
                maximo.width,
                maximo.height * aspectRatio,
                maxWidthPorPosicion,
                maxHeightPorPosicion * aspectRatio
            )
        );

        const anchoSolicitado =
            Math.abs(dx) >= Math.abs(dy) * aspectRatio
                ? resize.inicial.width + dx
                : (resize.inicial.height + dy) * aspectRatio;

        const width = clamp(
            anchoSolicitado,
            Math.min(0.5, maxWidth),
            maxWidth
        );

        actualizarLogoVista(resize.posicion, {
            ...resize.inicial,
            width,
            height: width / aspectRatio
        });
    }

    function terminarResize() {
        resizeRef.current = null;
    }

    // =====================================================
    // AGREGAR AL CARRITO
    // =====================================================

    async function handleAgregarCarrito() {
        setError("");
        setMensaje("");

        if (areasActivas.length === 0) {
            setError(
                "Este producto todavía no tiene áreas de personalización configuradas."
            );
            return;
        }

        if (
            producto.usaTalles &&
            !talle
        ) {
            setError("Seleccioná un talle.");
            return;
        }

        if (
            producto.usaColores &&
            !color
        ) {
            setError("Seleccioná un color.");
            return;
        }

        const disenosConArchivo = Object.entries(
            disenosPorVista
        ).filter(
            ([, diseno]) => Boolean(diseno.archivo || diseno.ruta)
        );

        if (
            producto.requiereImagen &&
            disenosConArchivo.length === 0
        ) {
            setError(
                "Subí al menos un diseño antes de agregar el producto."
            );
            return;
        }

        const disenoSinCalibracion =
            producto.usaTalles && talle
                ? disenosConArchivo.find(([posicionVista]) => {
                    const calibracion = calibraciones.find(
                        item => item.posicion === posicionVista
                    );

                    if (!calibracion) {
                        return false;
                    }

                    const area = areas.find(
                        item => item.posicion === posicionVista
                    );

                    return !obtenerEscalaCmPorcentaje(area, talle);
                })
                : null;

        if (disenoSinCalibracion) {
            setError(
                `Falta calibrar el talle ${talle} para la vista ${disenoSinCalibracion[0]
                    .toLowerCase()
                    .replaceAll("_", " ")}.`
            );
            return;
        }

        try {
            setSubiendo(true);

            const disenosFinales = [];

            for (const [posicionVista, diseno] of Object.entries(
                disenosPorVista
            )) {
                if (!diseno.archivo && !diseno.ruta) {
                    continue;
                }

                let ruta = diseno.ruta;

                if (diseno.archivo && !ruta) {
                    const respuesta = await subirImagen(diseno.archivo);

                    ruta = respuesta.ruta;

                    actualizarDisenoVista(posicionVista, { ruta });
                }

                const area = areas.find(
                    item => item.posicion === posicionVista
                );

                if (!area) {
                    continue;
                }

                const medidas = calcularMedidasReales(
                    area,
                    diseno.logo,
                    talle
                );

                const categoriaDiseno =
                    obtenerCategoriaEstampa(medidas, area);

                disenosFinales.push({
                    rutaImagen: ruta,
                    posicion: posicionVista,

                    tamano: categoriaDiseno,

                    posicionX: Number(diseno.logo.x.toFixed(3)),
                    posicionY: Number(diseno.logo.y.toFixed(3)),

                    ancho: Number(diseno.logo.width.toFixed(3)),
                    alto: Number(diseno.logo.height.toFixed(3)),

                    anchoCm: medidas.ancho,
                    altoCm: medidas.alto,

                    previewLocal: diseno.preview,
                    imagenBase: area.imagenMockup
                });
            }

            agregarAlCarrito({
                productoId: producto.id,
                productoNombre: producto.nombre,
                imagenPrincipal: producto.imagenPrincipal,

                cantidad: Number(cantidad),

                talle: talle || null,
                color: color || null,

                tamanoEstampa: categoriaEstampa,

                precioBase: Number(producto.precioBase || 0),

                descuentoMayoristaPorcentaje:
                    Number(producto.descuentoMayoristaPorcentaje || 0),

                precioEstampa: obtenerAdicional(categoriaEstampa),

                precioAdicionalTalle,

                precioUnitario,

                subtotal: precioUnitario * Number(cantidad),

                disenos: disenosFinales
            });

            setMensaje(
                disenosFinales.length === 1
                    ? "Producto agregado al carrito con 1 diseño."
                    : `Producto agregado al carrito con ${disenosFinales.length} diseños.`
            );
        } catch (err) {
            console.error(err);

            setError(
                err.message || "No se pudo agregar el producto."
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

    const imagenMockup = obtenerUrlArchivo(
        areaActual?.imagenMockup
    );

    // =====================================================
    // INTERFAZ
    // =====================================================

    return (
        <section className="personalizador">
            <div className="personalizador-visual">
                <div className="personalizador-tabs">
                    {areasActivas.map(area => {
                        const tieneDiseno = Boolean(
                            disenosPorVista[area.posicion]?.archivo ||
                            disenosPorVista[area.posicion]?.ruta
                        );

                        return (
                            <button
                                key={area.id}
                                type="button"
                                className={
                                    posicion === area.posicion ? "active" : ""
                                }
                                onClick={() => setPosicion(area.posicion)}
                            >
                                {area.posicion === "FRENTE"
                                    ? "Frente"
                                    : area.posicion === "ESPALDA"
                                        ? "Espalda"
                                        : area.posicion
                                            .replaceAll("_", " ")
                                            .toLowerCase()}

                                {tieneDiseno ? " ✓" : ""}
                            </button>
                        );
                    })}
                </div>

                <div
                    ref={canvasRef}
                    className="personalizador-canvas"
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    {imagenMockup && (
                        <img
                            className="personalizador-base"
                            src={imagenMockup}
                            alt={`${producto.nombre} ${posicion || ""}`}
                            draggable="false"
                        />
                    )}

                    {areaActual && (
                        <div
                            className="personalizador-area"
                            style={{
                                left: `${areaActual.x}%`,
                                top: `${areaActual.y}%`,
                                width: `${areaActual.width}%`,
                                height: `${areaActual.height}%`
                            }}
                            onClick={() => {
                                if (!previewLogo) {
                                    fileInputRef.current?.click();
                                }
                            }}
                        >
                            {!previewLogo && (
                                <div className="personalizador-placeholder">
                                    <strong>TU LOGO</strong>
                                    <span>AQUÍ</span>
                                    <small>Click o arrastrá una imagen</small>
                                </div>
                            )}
                        </div>
                    )}

                    {previewLogo && (
                        <div
                            className="personalizador-logo"
                            style={{
                                left: `${logo.x}%`,
                                top: `${logo.y}%`,
                                width: `${logo.width}%`,
                                height: `${logo.height}%`
                            }}
                            onPointerDown={iniciarMover}
                            onPointerMove={moverLogo}
                            onPointerUp={terminarMover}
                            onPointerCancel={terminarMover}
                        >
                            <img
                                src={previewLogo}
                                alt={`Diseño ${posicion || ""}`}
                                draggable="false"
                            />

                            <button
                                type="button"
                                className="personalizador-resize"
                                aria-label="Redimensionar diseño"
                                onPointerDown={iniciarResize}
                                onPointerMove={resizeLogo}
                                onPointerUp={terminarResize}
                                onPointerCancel={terminarResize}
                            />
                        </div>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={e => {
                        procesarArchivo(e.target.files?.[0]);
                        e.target.value = "";
                    }}
                />

                {previewLogo && (
                    <button
                        type="button"
                        className="cambiar-diseno"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Cambiar diseño de esta vista
                    </button>
                )}

                <p className="personalizador-consulta-colores">
                    ¿Querés ver mejor los colores? Consultanos por mail o
                    WhatsApp y te enviamos fotos para que puedas elegir con
                    más precisión.
                </p>
            </div>

            <div className="personalizador-controles">
                <span className="personalizador-eyebrow">
                    PERSONALIZÁ TU PRODUCTO
                </span>

                <h1>{producto.nombre}</h1>

                <p className="personalizador-descripcion">
                    {producto.descripcion}
                </p>

                <div className="personalizador-precio">
                    <strong>{moneda(precioUnitarioMostrado)}</strong>

                    {obtenerAdicional() > 0 && (
                        <span>
                            {moneda(producto.precioBase)} +{" "}
                            {moneda(obtenerAdicional())} estampa
                        </span>
                    )}

                    {precioAdicionalTalle > 0 && (
                        <span>
                            Adicional por talle especial:{" "}
                            {moneda(precioAdicionalTalle)}
                        </span>
                    )}
                </div>

                {Number(producto.descuentoMayoristaPorcentaje) > 0 && (
                    <p className="personalizador-mayorista">
                        {aplicaDescuentoMayorista
                            ? "Descuento mayorista aplicado: "
                            : "Comprando 6 o más unidades de este producto: "}
                        {Number(producto.descuentoMayoristaPorcentaje)}%
                        {" "}de descuento sobre el precio base.
                    </p>
                )}

                {/* TAMAÑO Y PRECIO AUTOMÁTICOS */}

                <div className="control-section">
                    <label>Tamaño de estampa</label>

                    <div className="medida-actual">
                        <strong>
                            Categoría: {TAMANOS[categoriaEstampa]}
                        </strong>

                        <span>
                            Chica: hasta 20 × 20 cm. Mediana: hasta 30 × 30 cm.
                            Grande: supera los 30 cm de ancho o alto.
                        </span>

                        <span>
                            Agrandá o achicá el diseño directamente sobre el
                            producto. El precio se actualiza automáticamente.
                        </span>

                        {medidasRealesActuales.ancho > 0 &&
                        medidasRealesActuales.alto > 0 ? (
                            <strong>
                                {escalaCalibradaActual > 0
                                    ? `Medida aproximada para talle ${talle}: `
                                    : "Medida aproximada: "}
                                {medidasRealesActuales.ancho} ×{" "}
                                {medidasRealesActuales.alto} cm
                            </strong>
                        ) : (
                            <span>
                                {producto.usaTalles && calibracionActual && talle
                                    ? `Falta cargar la medida de referencia del talle ${talle} para esta vista.`
                                    : "Las medidas en centímetros se mostrarán cuando haya una calibración o medidas de referencia configuradas."}
                            </span>
                        )}
                    </div>
                </div>

                {/* TALLE */}

                {producto.usaTalles && (
                    <div className="control-section">
                        <label>Talle</label>

                        <select
                            value={talle}
                            onChange={e => setTalle(e.target.value)}
                        >
                            <option value="">Elegir talle</option>

                            {GRUPOS_DE_TALLES.map(grupo => {

                                const delGrupo = grupo.talles.filter(
                                    talleGrupo =>
                                        tallesOfrecidos.includes(talleGrupo)
                                );

                                if (delGrupo.length === 0) {
                                    return null;
                                }

                                return (
                                    <optgroup
                                        key={grupo.nombre}
                                        label={grupo.nombre}
                                    >
                                        {delGrupo.map(talleGrupo => (
                                            <option
                                                key={talleGrupo}
                                                value={talleGrupo}
                                            >
                                                {talleGrupo}
                                            </option>
                                        ))}
                                    </optgroup>
                                );
                            })}
                        </select>
                    </div>
                )}

                {/* COLOR */}

                {producto.usaColores && (
                    <div className="control-section">
                        <label>Color</label>

                        <div className="color-options">
                            {coloresDisponibles.map(item => (
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
                            ))}
                        </div>
                    </div>
                )}

                {/* CANTIDAD */}

                <div className="control-section">
                    <label>Cantidad</label>

                    <input
                        type="number"
                        min="1"
                        value={cantidad}
                        onChange={e => {
                            const valor = Number(e.target.value);
                            setCantidad(
                                Number.isFinite(valor)
                                    ? Math.max(1, valor)
                                    : 1
                            );
                        }}
                    />
                </div>

                {/* RESUMEN DE DISEÑOS */}

                <div className="control-section">
                    <label>Diseños cargados</label>

                    <div className="personalizador-tabs">
                        {areasActivas.map(area => {
                            const cargado = Boolean(
                                disenosPorVista[area.posicion]?.archivo ||
                                disenosPorVista[area.posicion]?.ruta
                            );

                            return (
                                <span
                                    key={`resumen-${area.id}`}
                                    className={cargado ? "active" : ""}
                                >
                                    {area.posicion
                                        .replaceAll("_", " ")
                                        .toLowerCase()}
                                    {cargado ? " ✓" : ""}
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
                    disabled={subiendo}
                    onClick={handleAgregarCarrito}
                >
                    {subiendo
                        ? "Preparando..."
                        : `Agregar al carrito · ${moneda(
                            precioUnitarioMostrado * Number(cantidad)
                        )}`}
                </button>
            </div>
        </section>
    );
}