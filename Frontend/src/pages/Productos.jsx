import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";

import {
    getIndumentarias,
    getCarteleria
} from "../services/productoService";

import "./Productos.css";

export default function Productos({ tipo = "indumentaria" }) {

    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        cargarProductos();
    }, [tipo]);

    async function cargarProductos() {

        try {

            setLoading(true);
            setError("");

            let data;

            if (tipo === "carteleria") {
                data = await getCarteleria();
            } else {
                data = await getIndumentarias();
            }

            setProductos(data || []);

        } catch (err) {

            console.error("Error cargando productos:", err);

            setError(
                err.message ||
                "No se pudieron cargar los productos."
            );

        } finally {

            setLoading(false);

        }
    }

    const titulo =
        tipo === "carteleria"
            ? "Cartelería"
            : "Indumentaria";

    const descripcion =
        tipo === "carteleria"
            ? "Carteles, letras corpóreas y soluciones personalizadas."
            : "Remeras, buzos y prendas personalizadas.";

    return (
        <>
            <Navbar />

            <main className="productos-page">

                <section className="productos-header">

                    <div className="container">

                        <span className="productos-eyebrow">
                            GRENLUS
                        </span>

                        <h1>
                            {titulo}
                        </h1>

                        <p>
                            {descripcion}
                        </p>

                    </div>

                </section>

                <section className="productos-listado">

                    <div className="container">

                        {loading && (
                            <div className="productos-estado">
                                Cargando productos...
                            </div>
                        )}

                        {error && (
                            <div className="productos-estado error">
                                {error}
                            </div>
                        )}

                        {!loading &&
                            !error &&
                            productos.length === 0 && (
                                <div className="productos-estado">
                                    Todavía no hay productos disponibles.
                                </div>
                            )
                        }

                        {!loading &&
                            !error &&
                            productos.length > 0 && (

                                <div className="productos-grid">

                                    {productos.map((producto) => (
                                        <ProductCard
                                            key={producto.id}
                                            producto={producto}
                                        />
                                    ))}

                                </div>

                            )
                        }

                    </div>

                </section>

            </main>

            <Footer />
        </>
    );
}