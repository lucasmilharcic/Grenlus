const API_URL = "http://127.0.0.1:8081";

// =====================================================
// HELPERS
// =====================================================

function getAuthHeaders() {

    const token =
        localStorage.getItem("token");

    return token
        ? {
            Authorization: `Bearer ${token}`
        }
        : {};
}

async function leerError(
    response,
    mensajeDefault
) {

    try {

        const data =
            await response.json();

        if (data?.message) {
            return data.message;
        }

    } catch {
        // seguimos
    }

    try {

        const text =
            await response.text();

        if (text) {
            return text;
        }

    } catch {
        // seguimos
    }

    return mensajeDefault;
}

function agregarBoolean(
    formData,
    nombre,
    valor
) {

    formData.append(
        nombre,
        Boolean(valor)
    );
}

function agregarNumero(
    formData,
    nombre,
    valor
) {

    if (
        valor !== null &&
        valor !== undefined &&
        valor !== ""
    ) {

        formData.append(
            nombre,
            valor
        );
    }
}

// =====================================================
// URL ARCHIVOS
// =====================================================

export function obtenerUrlArchivo(ruta) {

    if (!ruta) {
        return null;
    }

    if (
        ruta.startsWith("http://") ||
        ruta.startsWith("https://")
    ) {
        return ruta;
    }

    return `${API_URL}${ruta.startsWith("/")
            ? ""
            : "/"
        }${ruta}`;
}

// =====================================================
// PRODUCTOS
// =====================================================

export async function getProductos() {

    const response =
        await fetch(
            `${API_URL}/productos`
        );

    if (!response.ok) {

        throw new Error(
            await leerError(
                response,
                "No se pudieron cargar los productos."
            )
        );
    }

    return response.json();
}

export async function getProducto(id) {

    const response =
        await fetch(
            `${API_URL}/productos/${id}`
        );

    if (!response.ok) {

        throw new Error(
            await leerError(
                response,
                "No se pudo cargar el producto."
            )
        );
    }

    return response.json();
}

export async function eliminarProducto(id) {

    const response =
        await fetch(
            `${API_URL}/productos/${id}`,
            {
                method: "DELETE",
                headers: getAuthHeaders()
            }
        );

    if (!response.ok) {

        throw new Error(
            await leerError(
                response,
                "No se pudo eliminar el producto."
            )
        );
    }

    return true;
}

// =====================================================
// INDUMENTARIA
// =====================================================

export async function getIndumentarias() {

    const response =
        await fetch(
            `${API_URL}/indumentarias`
        );

    if (!response.ok) {

        throw new Error(
            await leerError(
                response,
                "No se pudieron cargar las indumentarias."
            )
        );
    }

    return response.json();
}

export async function getIndumentaria(id) {

    const response =
        await fetch(
            `${API_URL}/indumentarias/${id}`
        );

    if (!response.ok) {

        throw new Error(
            await leerError(
                response,
                "No se pudo cargar la indumentaria."
            )
        );
    }

    return response.json();
}

export async function crearIndumentaria({
    nombre,
    descripcion,
    imagen,

    precioBase,
    precioEstampaChica,
    precioEstampaMedia,
    precioEstampaGrande,

    // =========================
    // DATOS DE ENVÍO
    // =========================
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
}) {

    const formData =
        new FormData();

    formData.append(
        "nombre",
        nombre
    );

    formData.append(
        "descripcion",
        descripcion || ""
    );

    if (imagen) {

        formData.append(
            "imagen",
            imagen
        );
    }

    // =========================
    // PRECIOS
    // =========================

    agregarNumero(
        formData,
        "precioBase",
        precioBase
    );

    agregarNumero(
        formData,
        "precioEstampaChica",
        precioEstampaChica
    );

    agregarNumero(
        formData,
        "precioEstampaMedia",
        precioEstampaMedia
    );

    agregarNumero(
        formData,
        "precioEstampaGrande",
        precioEstampaGrande
    );

    // =========================
    // DATOS DE ENVÍO / ZIPNOVA
    // =========================

    agregarNumero(
        formData,
        "pesoGramos",
        pesoGramos
    );

    agregarNumero(
        formData,
        "largoEnvioCm",
        largoEnvioCm
    );

    agregarNumero(
        formData,
        "anchoEnvioCm",
        anchoEnvioCm
    );

    agregarNumero(
        formData,
        "altoEnvioCm",
        altoEnvioCm
    );

    // =========================
    // CONFIGURACIÓN
    // =========================

    agregarBoolean(
        formData,
        "usaTalles",
        usaTalles
    );

    agregarBoolean(
        formData,
        "usaColores",
        usaColores
    );

    agregarBoolean(
        formData,
        "permiteFrente",
        permiteFrente
    );

    agregarBoolean(
        formData,
        "permiteEspalda",
        permiteEspalda
    );

    agregarBoolean(
        formData,
        "permiteManga",
        permiteManga
    );

    agregarBoolean(
        formData,
        "requiereImagen",
        requiereImagen
    );

    agregarBoolean(
        formData,
        "permiteEstampaChica",
        permiteEstampaChica
    );

    agregarBoolean(
        formData,
        "permiteEstampaMedia",
        permiteEstampaMedia
    );

    agregarBoolean(
        formData,
        "permiteEstampaGrande",
        permiteEstampaGrande
    );

    const response =
        await fetch(
            `${API_URL}/indumentarias`,
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: formData
            }
        );

    if (!response.ok) {

        throw new Error(
            await leerError(
                response,
                "No se pudo crear la indumentaria."
            )
        );
    }

    return response.json();
}

export async function editarIndumentaria(
    id,
    {
        nombre,
        descripcion,
        imagen,

        precioBase,
        precioEstampaChica,
        precioEstampaMedia,
        precioEstampaGrande,

        // =========================
        // DATOS DE ENVÍO
        // =========================
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
    }
) {

    const formData =
        new FormData();

    formData.append(
        "nombre",
        nombre
    );

    formData.append(
        "descripcion",
        descripcion || ""
    );

    if (imagen) {

        formData.append(
            "imagen",
            imagen
        );
    }

    // =========================
    // PRECIOS
    // =========================

    agregarNumero(
        formData,
        "precioBase",
        precioBase
    );

    agregarNumero(
        formData,
        "precioEstampaChica",
        precioEstampaChica
    );

    agregarNumero(
        formData,
        "precioEstampaMedia",
        precioEstampaMedia
    );

    agregarNumero(
        formData,
        "precioEstampaGrande",
        precioEstampaGrande
    );

    // =========================
    // DATOS DE ENVÍO / ZIPNOVA
    // =========================

    agregarNumero(
        formData,
        "pesoGramos",
        pesoGramos
    );

    agregarNumero(
        formData,
        "largoEnvioCm",
        largoEnvioCm
    );

    agregarNumero(
        formData,
        "anchoEnvioCm",
        anchoEnvioCm
    );

    agregarNumero(
        formData,
        "altoEnvioCm",
        altoEnvioCm
    );

    // =========================
    // CONFIGURACIÓN
    // =========================

    agregarBoolean(
        formData,
        "usaTalles",
        usaTalles
    );

    agregarBoolean(
        formData,
        "usaColores",
        usaColores
    );

    agregarBoolean(
        formData,
        "permiteFrente",
        permiteFrente
    );

    agregarBoolean(
        formData,
        "permiteEspalda",
        permiteEspalda
    );

    agregarBoolean(
        formData,
        "permiteManga",
        permiteManga
    );

    agregarBoolean(
        formData,
        "requiereImagen",
        requiereImagen
    );

    agregarBoolean(
        formData,
        "permiteEstampaChica",
        permiteEstampaChica
    );

    agregarBoolean(
        formData,
        "permiteEstampaMedia",
        permiteEstampaMedia
    );

    agregarBoolean(
        formData,
        "permiteEstampaGrande",
        permiteEstampaGrande
    );

    const response =
        await fetch(
            `${API_URL}/indumentarias/${id}`,
            {
                method: "PUT",
                headers: getAuthHeaders(),
                body: formData
            }
        );

    if (!response.ok) {

        throw new Error(
            await leerError(
                response,
                "No se pudo editar la indumentaria."
            )
        );
    }

    return response.json();
}

export async function eliminarIndumentaria(id) {

    const response =
        await fetch(
            `${API_URL}/indumentarias/${id}`,
            {
                method: "DELETE",
                headers: getAuthHeaders()
            }
        );

    if (!response.ok) {

        throw new Error(
            await leerError(
                response,
                "No se pudo eliminar la indumentaria."
            )
        );
    }

    return true;
}

// =====================================================
// ÁREAS DE PERSONALIZACIÓN
// =====================================================

export async function getAreasPersonalizacion(
    indumentariaId,
    color = null
) {

    let url =
        `${API_URL}/indumentarias/${indumentariaId}/areas`;

    if (
        color !== null &&
        color !== undefined &&
        String(color).trim() !== ""
    ) {

        url +=
            `?color=${encodeURIComponent(
                String(color).trim()
            )}`;
    }

    const response =
        await fetch(url);

    if (!response.ok) {

        throw new Error(
            await leerError(
                response,
                "No se pudieron cargar las áreas de personalización."
            )
        );
    }

    return response.json();
}

export async function getAreaPersonalizacion(
    indumentariaId,
    areaId
) {

    const response =
        await fetch(
            `${API_URL}/indumentarias/${indumentariaId}/areas/${areaId}`
        );

    if (!response.ok) {

        throw new Error(
            await leerError(
                response,
                "No se pudo cargar el área de personalización."
            )
        );
    }

    return response.json();
}

function construirAreaFormData({
    posicion,
    color,
    imagen,

    x,
    y,
    width,
    height,

    anchoChicaCm,
    altoChicaCm,

    anchoMediaCm,
    altoMediaCm,

    anchoGrandeCm,
    altoGrandeCm
}) {

    const formData =
        new FormData();

    formData.append(
        "posicion",
        posicion
    );

    if (
        color !== null &&
        color !== undefined &&
        String(color).trim() !== ""
    ) {

        formData.append(
            "color",
            String(color).trim()
        );
    }

    if (imagen) {

        formData.append(
            "imagen",
            imagen
        );
    }

    agregarNumero(
        formData,
        "x",
        x
    );

    agregarNumero(
        formData,
        "y",
        y
    );

    agregarNumero(
        formData,
        "width",
        width
    );

    agregarNumero(
        formData,
        "height",
        height
    );

    agregarNumero(
        formData,
        "anchoChicaCm",
        anchoChicaCm
    );

    agregarNumero(
        formData,
        "altoChicaCm",
        altoChicaCm
    );

    agregarNumero(
        formData,
        "anchoMediaCm",
        anchoMediaCm
    );

    agregarNumero(
        formData,
        "altoMediaCm",
        altoMediaCm
    );

    agregarNumero(
        formData,
        "anchoGrandeCm",
        anchoGrandeCm
    );

    agregarNumero(
        formData,
        "altoGrandeCm",
        altoGrandeCm
    );

    return formData;
}
export async function crearAreaPersonalizacion(
    indumentariaId,
    datos
) {

    const formData =
        construirAreaFormData(
            datos
        );

    const response =
        await fetch(
            `${API_URL}/indumentarias/${indumentariaId}/areas`,
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: formData
            }
        );

    if (!response.ok) {

        throw new Error(
            await leerError(
                response,
                "No se pudo crear el área de personalización."
            )
        );
    }

    return response.json();
}

export async function editarAreaPersonalizacion(
    indumentariaId,
    areaId,
    datos
) {

    const formData =
        construirAreaFormData(
            datos
        );

    const response =
        await fetch(
            `${API_URL}/indumentarias/${indumentariaId}/areas/${areaId}`,
            {
                method: "PUT",
                headers: getAuthHeaders(),
                body: formData
            }
        );

    if (!response.ok) {

        throw new Error(
            await leerError(
                response,
                "No se pudo editar el área de personalización."
            )
        );
    }

    return response.json();
}

export async function eliminarAreaPersonalizacion(
    indumentariaId,
    areaId
) {

    const response =
        await fetch(
            `${API_URL}/indumentarias/${indumentariaId}/areas/${areaId}`,
            {
                method: "DELETE",
                headers: getAuthHeaders()
            }
        );

    if (!response.ok) {

        throw new Error(
            await leerError(
                response,
                "No se pudo eliminar el área de personalización."
            )
        );
    }

    return true;
}

// =====================================================
// CARTELERÍA
// =====================================================

export async function getCarteleria() {

    const response =
        await fetch(
            `${API_URL}/carteleria`
        );

    if (!response.ok) {

        throw new Error(
            await leerError(
                response,
                "No se pudo cargar la cartelería."
            )
        );
    }

    return response.json();
}

export async function getCarteleriaById(id) {

    const response =
        await fetch(
            `${API_URL}/carteleria/${id}`
        );

    if (!response.ok) {

        throw new Error(
            await leerError(
                response,
                "No se pudo cargar la cartelería."
            )
        );
    }

    return response.json();
}

export async function crearCarteleria({
    nombre,
    descripcion,
    imagen,

    esCotizable,
    precioFijo,

    requiereMedidas,
    requiereImagen,
    requiereCantidad,
    requiereInstalacion
}) {

    const formData =
        new FormData();

    formData.append(
        "nombre",
        nombre
    );

    formData.append(
        "descripcion",
        descripcion || ""
    );

    if (imagen) {

        formData.append(
            "imagen",
            imagen
        );
    }

    agregarBoolean(
        formData,
        "esCotizable",
        esCotizable
    );

    agregarNumero(
        formData,
        "precioFijo",
        precioFijo
    );

    agregarBoolean(
        formData,
        "requiereMedidas",
        requiereMedidas
    );

    agregarBoolean(
        formData,
        "requiereImagen",
        requiereImagen
    );

    agregarBoolean(
        formData,
        "requiereCantidad",
        requiereCantidad
    );

    agregarBoolean(
        formData,
        "requiereInstalacion",
        requiereInstalacion
    );

    const response =
        await fetch(
            `${API_URL}/carteleria`,
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: formData
            }
        );

    if (!response.ok) {

        throw new Error(
            await leerError(
                response,
                "No se pudo crear la cartelería."
            )
        );
    }

    return response.json();
}

export async function editarCarteleria(
    id,
    {
        nombre,
        descripcion,
        imagen,

        esCotizable,
        precioFijo,

        requiereMedidas,
        requiereImagen,
        requiereCantidad,
        requiereInstalacion
    }
) {

    const formData =
        new FormData();

    formData.append(
        "nombre",
        nombre
    );

    formData.append(
        "descripcion",
        descripcion || ""
    );

    if (imagen) {

        formData.append(
            "imagen",
            imagen
        );
    }

    agregarBoolean(
        formData,
        "esCotizable",
        esCotizable
    );

    agregarNumero(
        formData,
        "precioFijo",
        precioFijo
    );

    agregarBoolean(
        formData,
        "requiereMedidas",
        requiereMedidas
    );

    agregarBoolean(
        formData,
        "requiereImagen",
        requiereImagen
    );

    agregarBoolean(
        formData,
        "requiereCantidad",
        requiereCantidad
    );

    agregarBoolean(
        formData,
        "requiereInstalacion",
        requiereInstalacion
    );

    const response =
        await fetch(
            `${API_URL}/carteleria/${id}`,
            {
                method: "PUT",
                headers: getAuthHeaders(),
                body: formData
            }
        );

    if (!response.ok) {

        throw new Error(
            await leerError(
                response,
                "No se pudo editar la cartelería."
            )
        );
    }

    return response.json();
}

export async function eliminarCarteleria(id) {

    const response =
        await fetch(
            `${API_URL}/carteleria/${id}`,
            {
                method: "DELETE",
                headers: getAuthHeaders()
            }
        );

    if (!response.ok) {

        throw new Error(
            await leerError(
                response,
                "No se pudo eliminar la cartelería."
            )
        );
    }

    return true;
}
