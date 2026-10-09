import {
    Link
} from "react-router-dom";

import {
    obtenerUrlArchivo
} from "../services/productoService";

/*
 * Indumentaria, artículo o cartelería.
 *
 * Los productos de cartelería no tienen "tipo"; los de
 * indumentaria siempre lo traen.
 */
function etiquetaCategoria(producto) {

    const tipo = String(producto?.tipo || "").toUpperCase();

    if (tipo === "ARTICULO") {
        return "Artículo";
    }

    if (tipo === "INDUMENTARIA") {
        return "Indumentaria";
    }

    return producto?.usaTalles !== undefined
        ? "Indumentaria"
        : "Cartelería";
}

export default function ProductCard({
    producto
}) {

    if (!producto) {
        return null;
    }

    const nombre =
        producto.nombre ||
        "Producto";

    const descripcion =
        producto.descripcion ||
        "Personalizado a tu medida";

    // =====================================================
    // IMAGEN
    //
    // Prioridad:
    //
    // 1. imagenPrincipal
    // 2. mockup FRENTE
    // 3. primer mockup disponible
    // =====================================================

    const areas =
        Array.isArray(
            producto
                .areasPersonalizacion
        )
            ? producto
                .areasPersonalizacion
            : [];

    const areaFrente =
        areas.find(
            area =>
                area.posicion ===
                "FRENTE"
        );

    const primerArea =
        areas[0];

    const imagen =
        producto.imagenPrincipal ||
        producto.imagen ||
        producto.image ||
        producto.img ||
        areaFrente?.imagenMockup ||
        primerArea?.imagenMockup ||
        null;

    const imagenUrl =
        obtenerUrlArchivo(
            imagen
        );

    return (

        <article className="product-card">

            <Link
                to={`/producto/${producto.id}`}
                className="product-card-link"
            >

                <div className="product-card-media">

                    {imagenUrl ? (

                        <img
                            src={
                                imagenUrl
                            }
                            alt={
                                nombre
                            }
                            loading="lazy"
                            onError={(e) => {

                                console.error(
                                    "No se pudo cargar imagen:",
                                    imagenUrl
                                );

                                e.currentTarget
                                    .style
                                    .display =
                                    "none";

                                const container =
                                    e.currentTarget
                                        .parentElement;

                                if (container) {

                                    container
                                        .classList
                                        .add(
                                            "image-error"
                                        );
                                }
                            }}
                        />

                    ) : (

                        <div className="product-card-no-image">

                            <span>
                                Sin imagen
                            </span>

                        </div>

                    )}

                </div>

                <div className="product-card-content">

                    <span className="product-card-category">

                        {etiquetaCategoria(producto)}

                    </span>

                    <h3>
                        {nombre}
                    </h3>

                    <p>
                        {descripcion}
                    </p>

                    <span className="link-more">

                        Ver producto

                        <span>
                            →
                        </span>

                    </span>

                </div>

            </Link>

        </article>
    );
}