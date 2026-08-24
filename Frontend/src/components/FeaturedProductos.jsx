import { useEffect, useState } from "react";
import { getProductos } from "../services/productoService";
import ProductCard from "./ProductCard";

export default function FeaturedProductos() {

    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        async function cargarProductos() {

            try {

                const data = await getProductos();

                const productosActivos = Array.isArray(data)
                    ? data.filter(producto => producto.activo !== false)
                    : [];

                setProductos(
                    productosActivos.slice(0, 6)
                );

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

    return (
        <section className="featured-products">

            <div className="section-header">

                <h2>
                    Productos destacados
                </h2>

                <p>
                    Algunos de nuestros productos personalizados
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

                    <div className="products-grid">

                        {productos.map(producto => (

                            <ProductCard
                                key={producto.id}
                                producto={producto}
                            />

                        ))}

                    </div>
                )}

        </section>
    );
}