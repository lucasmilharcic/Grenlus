import { useEffect, useState } from "react";

import ProductCard from "./ProductCard";

import {
    getIndumentarias,
    getCarteleria
} from "../services/productoService";

export default function CategoryProducts({ tipo }) {

    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        let activo = true;

        async function cargarProductos() {

            try {

                setLoading(true);
                setError("");

                let data = [];

                if (tipo === "indumentaria") {
                    data = await getIndumentarias();
                }

                if (tipo === "carteleria") {
                    data = await getCarteleria();
                }

                if (!activo) {
                    return;
                }

                const productosActivos =
                    Array.isArray(data)
                        ? data.filter(
                              (producto) =>
                                  producto.activo !== false
                          )
                        : [];

                setProductos(
                    productosActivos
                );

            } catch (err) {

                console.error(
                    "Error cargando productos:",
                    err
                );

                if (activo) {
                    setError(
                        err.message ||
                        "No se pudieron cargar los productos."
                    );
                }

            } finally {

                if (activo) {
                    setLoading(false);
                }

            }
        }

        cargarProductos();

        return () => {
            activo = false;
        };

    }, [tipo]);

    if (loading) {

        return (
            <section className="category-products">

                <div className="products-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Cargando productos...
                    </p>

                </div>

            </section>
        );
    }

    if (error) {

        return (
            <section className="category-products">

                <div className="products-error">

                    <h3>
                        No se pudieron cargar los productos
                    </h3>

                    <p>
                        {error}
                    </p>

                </div>

            </section>
        );
    }

    if (productos.length === 0) {

        return (
            <section className="category-products">

                <div className="products-empty">

                    <h3>
                        No hay productos disponibles
                    </h3>

                    <p>
                        Próximamente vas a encontrar
                        nuestros productos acá.
                    </p>

                </div>

            </section>
        );
    }

    return (
        <section className="category-products">

            <div className="products-grid">

                {productos.map((producto) => (

                    <ProductCard
                        key={producto.id}
                        producto={producto}
                    />

                ))}

            </div>

        </section>
    );
}