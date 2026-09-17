const KEY = "grenlus_carrito";

// =====================================================
// LEER
// =====================================================

function leerCarrito() {
    try {
        const data = localStorage.getItem(KEY);

        if (!data) {
            return [];
        }

        const parsed = JSON.parse(data);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {
        console.error(
            "Error leyendo carrito:",
            error
        );

        return [];
    }
}

// =====================================================
// GUARDAR
// =====================================================

function guardarCarrito(items) {
    localStorage.setItem(
        KEY,
        JSON.stringify(items)
    );

    window.dispatchEvent(
        new Event(
            "grenlus-carrito-updated"
        )
    );
}

// =====================================================
// OBTENER CARRITO
// =====================================================

export function getCarrito() {
    return leerCarrito();
}

// =====================================================
// AGREGAR
// =====================================================

export function agregarAlCarrito(item) {
    const actuales =
        leerCarrito();

    const nuevoItem = {
        ...item,

        carritoId:
            `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`
    };

    const nuevoCarrito = [
        ...actuales,
        nuevoItem
    ];

    guardarCarrito(
        nuevoCarrito
    );

    return nuevoItem;
}

// =====================================================
// ELIMINAR
// =====================================================

export function eliminarDelCarrito(
    carritoId
) {
    const actuales =
        leerCarrito();

    const nuevos =
        actuales.filter(
            item =>
                item.carritoId !==
                carritoId
        );

    guardarCarrito(
        nuevos
    );
}

// =====================================================
// ACTUALIZAR CANTIDAD
// =====================================================

export function actualizarCantidad(
    carritoId,
    cantidad
) {
    const nuevaCantidad =
        Math.max(
            1,
            Number(cantidad) || 1
        );

    const actuales =
        leerCarrito();

    const nuevos =
        actuales.map(item => {

            if (
                item.carritoId !==
                carritoId
            ) {
                return item;
            }

            const precioUnitario =
                Number(
                    item.precioUnitario ||
                    0
                );

            return {
                ...item,

                cantidad:
                    nuevaCantidad,

                subtotal:
                    precioUnitario *
                    nuevaCantidad
            };
        });

    guardarCarrito(
        nuevos
    );
}

// =====================================================
// VACIAR
// =====================================================

export function vaciarCarrito() {
    guardarCarrito([]);
}

// =====================================================
// CANTIDAD TOTAL
// =====================================================

export function cantidadCarrito() {
    return leerCarrito()
        .reduce(
            (total, item) =>
                total +
                Number(
                    item.cantidad ||
                    1
                ),
            0
        );
}

// =====================================================
// TOTAL DEL CARRITO
// =====================================================

export function totalCarrito() {
    return leerCarrito()
        .reduce(
            (total, item) =>
                total +
                Number(
                    item.subtotal ||
                    (
                        Number(
                            item.precioUnitario ||
                            0
                        ) *
                        Number(
                            item.cantidad ||
                            1
                        )
                    )
                ),
            0
        );
}
