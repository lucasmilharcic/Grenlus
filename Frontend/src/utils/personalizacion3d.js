export const ALTURA_IMPRESION_TAZA_CM = 9.5;

export const MARGEN_TAZA_PORCENTAJE =
    (1 / ALTURA_IMPRESION_TAZA_CM) * 100;

export function limitarDisenoTaza(logo) {
    if (!logo) {
        return logo;
    }

    const width = Number(logo.width) || 0;
    const height = Number(logo.height) || 0;
    const aspectRatio =
        Number(logo.aspectRatio) ||
        (width > 0 && height > 0 ? width / height : 1);
    const alturaMaxima =
        100 - 2 * MARGEN_TAZA_PORCENTAJE;
    const ancho =
        Math.min(width, alturaMaxima * aspectRatio);
    const alto =
        ancho / aspectRatio;
    const x = Number(logo.x) || 0;
    const y = Number(logo.y) || MARGEN_TAZA_PORCENTAJE;

    return {
        ...logo,
        x: Math.min(Math.max(x, 0), 100 - ancho),
        y: Math.min(
            Math.max(y, MARGEN_TAZA_PORCENTAJE),
            100 - MARGEN_TAZA_PORCENTAJE - alto
        ),
        width: ancho,
        height: alto,
        aspectRatio
    };
}
