import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";

const CarritoContext = createContext(null);

const STORAGE_KEY = "grenlus_carrito";

function generarId() {

    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random()}`;
}

function obtenerCarritoInicial() {

    try {

        const guardado =
            localStorage.getItem(STORAGE_KEY);

        if (!guardado) {
            return [];
        }

        const parsed =
            JSON.parse(guardado);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "No se pudo recuperar el carrito:",
            error
        );

        return [];
    }
}

function aplicarDescuentosMayoristas(items) {

    const cantidadesPorProducto = items.reduce(
        (cantidades, item) => {
            const productoId = item.productoId;

            if (productoId != null) {
                const clave = String(productoId);
                cantidades.set(
                    clave,
                    (cantidades.get(clave) || 0) +
                        Number(item.cantidad || 0)
                );
            }

            return cantidades;
        },
        new Map()
    );

    return items.map(item => {
        const precioBase = Number(
            item.precioBase ?? item.precioUnitario ?? 0
        );
        const precioAdicional = Number(item.precioEstampa || 0);
        const descuento = Number(
            item.descuentoMayoristaPorcentaje || 0
        );
        const cantidadProducto = cantidadesPorProducto.get(
            String(item.productoId)
        ) || 0;
        const descuentoAplicado =
            cantidadProducto > 5 &&
            descuento > 0 &&
            descuento <= 100;
        const precioBaseFinal = descuentoAplicado
            ? Math.round(precioBase * (1 - descuento / 100) * 100) / 100
            : precioBase;
        const precioUnitarioOriginal =
            precioBase + precioAdicional;
        const precioUnitario =
            precioBaseFinal + precioAdicional;

        return {
            ...item,
            precioUnitarioOriginal,
            precioUnitario,
            subtotal: precioUnitario * Number(item.cantidad || 1),
            descuentoMayoristaAplicado: descuentoAplicado
        };
    });
}

export function CarritoProvider({ children }) {

    const [items, setItems] =
        useState(obtenerCarritoInicial);

    useEffect(() => {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(items)
        );

        /*
         * Avisamos a otros componentes
         * que el carrito cambió.
         */
        window.dispatchEvent(
            new Event(
                "grenlus-carrito-updated"
            )
        );

    }, [items]);

    const itemsConDescuentoMayorista = useMemo(
        () => aplicarDescuentosMayoristas(items),
        [items]
    );

    // =====================================================
    // AGREGAR
    // =====================================================

    function agregarAlCarrito(item) {

        const cantidad =
            Number(item?.cantidad);

        const precioUnitario =
            Number(
                item?.precioUnitario || 0
            );

        const cantidadFinal =
            cantidad > 0
                ? cantidad
                : 1;

        const nuevoItem = {
            ...item,

            carritoId:
                item?.carritoId ||
                generarId(),

            cantidad:
                cantidadFinal,

            subtotal:
                precioUnitario *
                cantidadFinal
        };

        setItems((actuales) => [
            ...actuales,
            nuevoItem
        ]);

        return nuevoItem;
    }

    // =====================================================
    // ELIMINAR
    // =====================================================

    function eliminarDelCarrito(
        carritoId
    ) {

        setItems((actuales) =>
            actuales.filter(
                (item) =>
                    item.carritoId !==
                    carritoId
            )
        );
    }

    // =====================================================
    // ACTUALIZAR CANTIDAD
    // =====================================================

    function actualizarCantidad(
        carritoId,
        cantidad
    ) {

        const nuevaCantidad =
            Math.max(
                1,
                Number(cantidad) || 1
            );

        setItems((actuales) =>
            actuales.map((item) => {

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
            })
        );
    }

    // =====================================================
    // VACIAR
    // =====================================================

    function vaciarCarrito() {
        setItems([]);
    }

    // =====================================================
    // CANTIDAD TOTAL
    // =====================================================

    const cantidadTotal =
        useMemo(() => {

            return itemsConDescuentoMayorista.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.cantidad ||
                        0
                    ),
                0
            );

        }, [itemsConDescuentoMayorista]);

    // =====================================================
    // TOTAL
    // =====================================================

    const total =
        useMemo(() => {

            return itemsConDescuentoMayorista.reduce(
                (
                    acumulado,
                    item
                ) => {

                    const precio =
                        Number(
                            item.precioUnitario ||
                            0
                        );

                    const cantidad =
                        Number(
                            item.cantidad ||
                            1
                        );

                    return (
                        acumulado +
                        precio *
                        cantidad
                    );
                },
                0
            );

        }, [itemsConDescuentoMayorista]);

    // =====================================================
    // VALUE
    // =====================================================

    const value = {

        items: itemsConDescuentoMayorista,

        agregarAlCarrito,

        eliminarDelCarrito,

        actualizarCantidad,

        vaciarCarrito,

        cantidadTotal,

        total
    };

    return (

        <CarritoContext.Provider
            value={value}
        >

            {children}

        </CarritoContext.Provider>
    );
}

export function useCarrito() {

    const context =
        useContext(
            CarritoContext
        );

    if (!context) {

        throw new Error(
            "useCarrito debe utilizarse dentro de CarritoProvider"
        );
    }

    return context;
}