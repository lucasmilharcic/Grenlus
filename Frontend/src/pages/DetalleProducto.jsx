import {
    useEffect,
    useState
} from "react";

import {
    useParams,
    Link
} from "react-router-dom";

import Navbar
    from "../components/Navbar";

import Footer
    from "../components/Footer";

import PersonalizadorProducto
    from "../components/PersonalizadorProducto";

import {
    getProducto,
    obtenerUrlArchivo
} from "../services/productoService";

import "./DetalleProducto.css";

function esIndumentaria(
    producto
) {

    return (
        producto?.usaTalles !==
            undefined ||
        producto?.permiteEstampaChica !==
            undefined
    );
}

export default function DetalleProducto() {

    const { id } =
        useParams();

    const [
        producto,
        setProducto
    ] = useState(null);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState("");

    useEffect(() => {

        async function cargar() {

            try {

                setLoading(true);

                const data =
                    await getProducto(
                        id
                    );

                setProducto(
                    data
                );

            } catch (err) {

                console.error(err);

                setError(
                    err.message ||
                    "No se pudo cargar el producto."
                );

            } finally {

                setLoading(false);
            }
        }

        cargar();

    }, [id]);

    if (loading) {

        return (
            <>
                <Navbar />

                <main className="detalle-status">
                    Cargando producto...
                </main>

                <Footer />
            </>
        );
    }

    if (
        error ||
        !producto
    ) {

        return (
            <>
                <Navbar />

                <main className="detalle-status">

                    <h1>
                        Producto no encontrado
                    </h1>

                    <p>
                        {error}
                    </p>

                    <Link to="/">
                        Volver al inicio
                    </Link>

                </main>

                <Footer />
            </>
        );
    }

    const indumentaria =
        esIndumentaria(
            producto
        );

    /*
     * INDUMENTARIA:
     * usa el personalizador completo.
     */
    if (indumentaria) {

        return (
            <>
                <Navbar />

                <PersonalizadorProducto
                    producto={
                        producto
                    }
                />

                <Footer />
            </>
        );
    }

    /*
     * CARTELERÍA.
     */
    const imagenUrl =
        obtenerUrlArchivo(
            producto.imagenPrincipal
        );

    return (
        <>
            <Navbar />

            <main className="detalle-carteleria">

                <div className="detalle-carteleria-grid">

                    <div className="detalle-carteleria-image">

                        {imagenUrl && (

                            <img
                                src={
                                    imagenUrl
                                }
                                alt={
                                    producto.nombre
                                }
                            />

                        )}

                    </div>

                    <div className="detalle-carteleria-info">

                        <span>
                            CARTELERÍA
                        </span>

                        <h1>
                            {producto.nombre}
                        </h1>

                        <p>
                            {producto.descripcion}
                        </p>

                        {producto.esCotizable ? (

                            <>

                                <strong className="cotizacion-titulo">
                                    Precio a cotizar
                                </strong>

                                <Link
                                    to={`/solicitud/${producto.id}`}
                                    className="btn-solicitar"
                                >
                                    Solicitar presupuesto
                                </Link>

                            </>

                        ) : (

                            <>

                                <strong className="cartel-precio">
                                    $
                                    {new Intl.NumberFormat(
                                        "es-AR"
                                    ).format(
                                        Number(
                                            producto.precioFijo ||
                                            0
                                        )
                                    )}
                                </strong>

                                <p className="cartel-compra-info">
                                    Este producto tiene precio fijo y podrá agregarse directamente al carrito.
                                </p>

                            </>

                        )}

                    </div>

                </div>

            </main>

            <Footer />
        </>
    );
}