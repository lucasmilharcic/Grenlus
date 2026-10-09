import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";

import {
    getIndumentarias,
    getCarteleria
} from "../services/productoService";

import "./Productos.css";

/*
 * Un solo catálogo: indumentaria, artículos y cartelería
 * salen juntos y se separan con estos filtros.
 */
const FILTROS = [
    {
        id: "todos",
        etiqueta: "Todo",
        titulo: "Nuestros productos",
        descripcion:
            "Indumentaria, artículos y cartelería personalizados."
    },
    {
        id: "indumentaria",
        etiqueta: "Indumentaria",
        titulo: "Indumentaria",
        descripcion: "Remeras, buzos y prendas personalizadas."
    },
    {
        id: "articulos",
        etiqueta: "Artículos",
        titulo: "Artículos",
        descripcion:
            "Tazas, botellas, llaveros y más, con tu diseño."
    },
    {
        id: "carteleria",
        etiqueta: "Cartelería",
        titulo: "Cartelería",
        descripcion:
            "Carteles, letras corpóreas y soluciones personalizadas."
    }
];

function esArticulo(producto) {
    return (
        String(producto?.tipo || "INDUMENTARIA").toUpperCase() ===
        "ARTICULO"
    );
}

export default function Productos({ tipo }) {

    const [searchParams, setSearchParams] = useSearchParams();

    /*
     * El filtro puede venir por la URL (desde el home) o
     * por prop (rutas viejas /indumentaria y /carteleria).
     */
    const filtroActivo =
        FILTROS.find(
            filtro =>
                filtro.id ===
                (searchParams.get("filtro") || tipo)
        )?.id || "todos";

    const [indumentarias, setIndumentarias] = useState([]);
    const [carteleria, setCarteleria] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const cargarProductos = useCallback(async () => {

        try {

            setLoading(true);
            setError("");

            const [datosIndumentaria, datosCarteleria] =
                await Promise.all([
                    getIndumentarias(),
                    getCarteleria()
                ]);

            setIndumentarias(datosIndumentaria || []);
            setCarteleria(datosCarteleria || []);

        } catch (err) {

            console.error("Error cargando productos:", err);

            setError(
                err.message ||
                "No se pudieron cargar los productos."
            );

        } finally {

            setLoading(false);
        }

    }, []);

    useEffect(() => {

        cargarProductos();

    }, [cargarProductos]);

    // =====================================================
    // FILTRO
    // =====================================================

    const porFiltro = useMemo(() => {

        const prendas = indumentarias.filter(
            producto => !esArticulo(producto)
        );

        const articulos = indumentarias.filter(esArticulo);

        return {
            todos: [
                ...prendas,
                ...articulos,
                ...carteleria
            ],
            indumentaria: prendas,
            articulos,
            carteleria
        };

    }, [indumentarias, carteleria]);

    const productos = porFiltro[filtroActivo] || [];

    const datosFiltro =
        FILTROS.find(filtro => filtro.id === filtroActivo) ||
        FILTROS[0];

    function elegirFiltro(id) {

        if (id === "todos") {
            setSearchParams({});
        } else {
            setSearchParams({ filtro: id });
        }
    }

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
                            {datosFiltro.titulo}
                        </h1>

                        <p>
                            {datosFiltro.descripcion}
                        </p>

                    </div>

                </section>

                <section className="productos-listado">

                    <div className="container">

                        <div className="productos-filtros">

                            {FILTROS.map(filtro => (
                                <button
                                    key={filtro.id}
                                    type="button"
                                    className={
                                        filtro.id === filtroActivo
                                            ? "activo"
                                            : ""
                                    }
                                    onClick={() =>
                                        elegirFiltro(filtro.id)
                                    }
                                >
                                    {filtro.etiqueta}

                                    <span>
                                        {(porFiltro[filtro.id] || []).length}
                                    </span>
                                </button>
                            ))}

                        </div>

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
                                    Todavía no hay productos
                                    en esta categoría.
                                </div>
                            )
                        }

                        {!loading &&
                            !error &&
                            productos.length > 0 && (

                                <div className="productos-grid">

                                    {productos.map((producto) => (
                                        <ProductCard
                                            key={`${producto.tipo || "P"}-${producto.id}`}
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
