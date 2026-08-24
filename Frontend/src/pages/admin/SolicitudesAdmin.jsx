import { useEffect, useState } from "react";
import { getSolicitudes } from "../../services/solicitudService";

export default function SolicitudesAdmin() {

    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        cargarSolicitudes();
    }, []);

    async function cargarSolicitudes() {

        try {
            setLoading(true);
            setError("");

            const data = await getSolicitudes();

            setSolicitudes(data);

        } catch (error) {

            console.error(error);
            setError("No se pudieron cargar las solicitudes");

        } finally {

            setLoading(false);

        }
    }

    if (loading) {
        return (
            <main className="admin-page">
                <h1>Solicitudes</h1>
                <p>Cargando solicitudes...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="admin-page">
                <h1>Solicitudes</h1>

                <p>{error}</p>

                <button onClick={cargarSolicitudes}>
                    Reintentar
                </button>
            </main>
        );
    }

    return (
        <main className="admin-page">

            <div className="admin-header">

                <div>
                    <h1>Solicitudes</h1>

                    <p>
                        Administrá las solicitudes de los clientes.
                    </p>
                </div>

            </div>

            {solicitudes.length === 0 ? (

                <div className="empty-state">
                    <h2>No hay solicitudes</h2>

                    <p>
                        Cuando un cliente realice una solicitud,
                        aparecerá acá.
                    </p>
                </div>

            ) : (

                <section className="solicitudes-list">

                    {solicitudes.map((solicitud) => (

                        <article
                            className="solicitud-card"
                            key={solicitud.id}
                        >

                            <div className="solicitud-info">

                                <h2>
                                    Solicitud #{solicitud.id}
                                </h2>

                                <p>
                                    <strong>Cliente:</strong>{" "}
                                    {solicitud.nombreCliente}
                                </p>

                                <p>
                                    <strong>Teléfono:</strong>{" "}
                                    {solicitud.telefono}
                                </p>

                                <p>
                                    <strong>Email:</strong>{" "}
                                    {solicitud.email}
                                </p>

                                <p>
                                    <strong>Ciudad:</strong>{" "}
                                    {solicitud.ciudad}
                                </p>

                                <p>
                                    <strong>Cantidad:</strong>{" "}
                                    {solicitud.cantidad}
                                </p>

                                <p>
                                    <strong>Producto:</strong>{" "}
                                    {solicitud.producto?.nombre || "Sin producto"}
                                </p>

                                <p>
                                    <strong>Estado:</strong>{" "}
                                    {solicitud.estado || "Pendiente"}
                                </p>

                            </div>

                            <div className="solicitud-actions">

                                <button
                                    type="button"
                                    onClick={() =>
                                        console.log(
                                            "Solicitud seleccionada:",
                                            solicitud
                                        )
                                    }
                                >
                                    Ver solicitud
                                </button>

                            </div>

                        </article>

                    ))}

                </section>

            )}

        </main>
    );
}