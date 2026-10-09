import { useEffect, useRef, useState } from "react";
import { getProductos } from "../services/productoService";
import ProductCard from "./ProductCard";

/*
 * Cuántos productos se suman cada vez que el visitante
 * llega al final de la grilla.
 */
const TANDA = 8;

export default function FeaturedProductos() {

    const [productos, setProductos] = useState([]);
    const [visibles, setVisibles] = useState(TANDA);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const finDeLaGrilla = useRef(null);

    useEffect(() => {

        async function cargarProductos() {

            try {

                const data = await getProductos();

                const productosActivos = Array.isArray(data)
                    ? data.filter(producto => producto.activo !== false)
                    : [];

                /*
                 * Los últimos cargados primero, así lo nuevo
                 * aparece arriba.
                 */
                productosActivos.sort(
                    (a, b) => Number(b.id || 0) - Number(a.id || 0)
                );

                setProductos(productosActivos);

            } catch (error) {

                console.error(
                    "Error cargando productos destacados:",
                    error
                );

                setError(error.message);

            } finally {

                setLoading(false);

            }
        }

        cargarProductos();

    }, []);

    /*
     * Al llegar al final de la grilla mostramos otra tanda.
     * No hay tope: se siguen sumando mientras haya productos.
     */
    useEffect(() => {

        const marca = finDeLaGrilla.current;

        if (!marca || visibles >= productos.length) {
            return;
        }

        const observador = new IntersectionObserver(
            entradas => {

                if (entradas[0]?.isIntersecting) {

                    setVisibles(
                        actuales =>
                            Math.min(
                                actuales + TANDA,
                                productos.length
                            )
                    );
                }
            },
            { rootMargin: "200px" }
        );

        observador.observe(marca);

        return () => observador.disconnect();

    }, [productos.length, visibles]);

    const mostrados = productos.slice(0, visibles);

    const quedan = productos.length - mostrados.length;

    return (
        <section className="featured-products">

            <div className="section-header">

                <h2>
                    Productos destacados
                </h2>

                <p>
                    Todo lo que hacemos, personalizado
                </p>

            </div>

            {loading && (
                <div className="products-loading">
                    <span></span>
                    <p>Cargando productos...</p>
                </div>
            )}

            {!loading && error && (
                <div className="products-error">
                    <p>
                        No se pudieron cargar los productos.
                    </p>

                    <small>
                        {error}
                    </small>
                </div>
            )}

            {!loading &&
                !error &&
                productos.length === 0 && (

                    <div className="products-empty">

                        <p>
                            Todavía no hay productos destacados.
                        </p>

                    </div>
                )}

            {!loading &&
                !error &&
                productos.length > 0 && (

                    <>
                        <div className="products-grid">

                            {mostrados.map(producto => (

                                <ProductCard
                                    key={producto.id}
                                    producto={producto}
                                />

                            ))}

                        </div>

                        <div
                            ref={finDeLaGrilla}
                            className="products-sentinel"
                        >
                            {quedan > 0 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setVisibles(
                                            actuales =>
                                                Math.min(
                                                    actuales + TANDA,
                                                    productos.length
                                                )
                                        )
                                    }
                                >
                                    Ver más ({quedan})
                                </button>
                            )}
                        </div>
                    </>
                )}

        </section>
    );
}
