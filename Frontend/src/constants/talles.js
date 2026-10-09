/*
 * Los mismos talles que conoce el backend
 * (ver CatalogoTalles.java), en el mismo orden.
 */

export const TALLES_INFANTILES = [
    "4", "6", "8", "10", "12", "14", "16", "18"
];

export const TALLES_ESPECIALES = [
    "T6", "T8", "T10", "T14", "T16"
];

export const TALLES_ADULTOS = [
    "S", "M", "L", "XL", "XXL"
];

export const GRUPOS_DE_TALLES = [
    { nombre: "Infantil", talles: TALLES_INFANTILES },
    { nombre: "Especiales", talles: TALLES_ESPECIALES },
    { nombre: "Adulto", talles: TALLES_ADULTOS }
];

export const TODOS_LOS_TALLES = [
    ...TALLES_INFANTILES,
    ...TALLES_ESPECIALES,
    ...TALLES_ADULTOS
];

export function normalizarTalle(talle) {
    if (talle === null || talle === undefined) {
        return "";
    }

    return String(talle).trim().toUpperCase();
}

export function esTalleEspecial(talle) {
    return TALLES_ESPECIALES.includes(
        normalizarTalle(talle)
    );
}

/*
 * Deja los talles en el orden del catálogo y descarta
 * los que no existen.
 */
export function ordenarTalles(talles) {
    const elegidos = new Set(
        (talles || []).map(normalizarTalle)
    );

    return TODOS_LOS_TALLES.filter(
        talle => elegidos.has(talle)
    );
}

/*
 * Talles que ofrece un producto.
 *
 * El backend ya manda la lista resuelta en tallesOfrecidos;
 * el resto es para no romper con respuestas viejas.
 */
export function tallesDelProducto(producto) {
    if (!producto?.usaTalles) {
        return [];
    }

    if (producto.tallesOfrecidos?.length) {
        return ordenarTalles(producto.tallesOfrecidos);
    }

    if (producto.tallesDisponibles?.length) {
        return ordenarTalles(producto.tallesDisponibles);
    }

    const heredados = [];

    if (producto.incluyeTallesInfantiles !== false) {
        heredados.push(...TALLES_INFANTILES);
    }

    if (producto.incluyeTallesEspeciales === true) {
        heredados.push(
            ...TALLES_ESPECIALES.filter(
                talle =>
                    !["T14", "T16"].includes(talle) ||
                    producto.incluyeTallesEspecialesGrandes !== false
            )
        );
    }

    heredados.push(...TALLES_ADULTOS);

    return ordenarTalles(heredados);
}
