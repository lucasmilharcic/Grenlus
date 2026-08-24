import {
    useEffect,
    useState
} from "react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import {
    getTarifasEnvio,
    actualizarTarifaEnvio
} from "../../services/envioService";

import "./EnviosAdmin.css";

function formatearPrecio(
    valor
) {

    return new Intl.NumberFormat(
        "es-AR",
        {
            style: "currency",
            currency: "ARS",
            maximumFractionDigits: 0
        }
    ).format(
        Number(valor || 0)
    );
}

export default function EnviosAdmin() {

    const [
        tarifas,
        setTarifas
    ] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState("");

    const [
        mensaje,
        setMensaje
    ] = useState("");

    const [
        guardandoId,
        setGuardandoId
    ] = useState(null);

    // =====================================================
    // CARGAR
    // =====================================================

    async function cargarTarifas() {

        try {

            setLoading(true);
            setError("");

            const data =
                await getTarifasEnvio();

            setTarifas(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "No se pudieron cargar las tarifas."
            );

        } finally {

            setLoading(false);
        }
    }

    useEffect(() => {

        cargarTarifas();

    }, []);

    // =====================================================
    // CAMBIOS
    // =====================================================

    function actualizarCampo(
        id,
        campo,
        valor
    ) {

        setTarifas(
            actuales =>
                actuales.map(
                    tarifa =>
                        tarifa.id === id
                            ? {
                                ...tarifa,
                                [campo]:
                                    valor
                            }
                            : tarifa
                )
        );

        setMensaje("");
    }

    // =====================================================
    // GUARDAR
    // =====================================================

    async function guardarTarifa(
        tarifa
    ) {

        const precio =
            Number(
                tarifa.precio
            );

        if (
            Number.isNaN(precio) ||
            precio < 0
        ) {

            setError(
                "El precio debe ser válido."
            );

            return;
        }

        try {

            setGuardandoId(
                tarifa.id
            );

            setError("");
            setMensaje("");

            const actualizada =
                await actualizarTarifaEnvio(
                    tarifa.id,
                    {
                        nombre:
                            tarifa.nombre,

                        descripcion:
                            tarifa.descripcion,

                        precio,

                        activo:
                            tarifa.activo,

                        /*
                         * El backend ignora
                         * cambios de codigoZona,
                         * pero lo mandamos igual.
                         */
                        codigoZona:
                            tarifa.codigoZona
                    }
                );

            setTarifas(
                actuales =>
                    actuales.map(
                        item =>
                            item.id ===
                            tarifa.id
                                ? actualizada
                                : item
                    )
            );

            setMensaje(
                `Tarifa ${tarifa.nombre} actualizada correctamente.`
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "No se pudo actualizar la tarifa."
            );

        } finally {

            setGuardandoId(
                null
            );
        }
    }

    return (
        <>
            <Navbar />

            <main className="envios-admin">

                <header className="envios-admin-header">

                    <div>

                        <span className="envios-eyebrow">
                            ADMINISTRACIÓN
                        </span>

                        <h1>
                            Envíos
                        </h1>

                        <p>
                            Configurá las tarifas que
                            Grenlus utiliza en el checkout.
                        </p>

                    </div>

                    <div className="envios-count">

                        {tarifas.length}
                        {" "}
                        zonas

                    </div>

                </header>

                {mensaje && (

                    <div className="envios-mensaje">
                        {mensaje}
                    </div>
                )}

                {error && (

                    <div className="envios-error">
                        {error}
                    </div>
                )}

                {loading ? (

                    <div className="envios-state">
                        Cargando tarifas...
                    </div>

                ) : (

                    <section className="envios-grid">

                        {tarifas.map(
                            tarifa => (

                            <article
                                key={
                                    tarifa.id
                                }
                                className={
                                    `envio-tarifa-card ${
                                        !tarifa.activo
                                            ? "inactiva"
                                            : ""
                                    }`
                                }
                            >

                                <div className="envio-tarifa-top">

                                    <div>

                                        <span className="envio-zona">
                                            {tarifa.codigoZona}
                                        </span>

                                        <h2>
                                            {tarifa.nombre}
                                        </h2>

                                    </div>

                                    <label className="envio-activo">

                                        <input
                                            type="checkbox"
                                            checked={
                                                Boolean(
                                                    tarifa.activo
                                                )
                                            }
                                            onChange={(e) =>
                                                actualizarCampo(
                                                    tarifa.id,
                                                    "activo",
                                                    e.target.checked
                                                )
                                            }
                                        />

                                        <span>
                                            {tarifa.activo
                                                ? "Activo"
                                                : "Inactivo"}
                                        </span>

                                    </label>

                                </div>

                                <div className="envio-form">

                                    <div className="envio-field">

                                        <label>
                                            Nombre
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                tarifa.nombre ||
                                                ""
                                            }
                                            onChange={(e) =>
                                                actualizarCampo(
                                                    tarifa.id,
                                                    "nombre",
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>

                                    <div className="envio-field">

                                        <label>
                                            Descripción
                                        </label>

                                        <textarea
                                            value={
                                                tarifa.descripcion ||
                                                ""
                                            }
                                            onChange={(e) =>
                                                actualizarCampo(
                                                    tarifa.id,
                                                    "descripcion",
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>

                                    <div className="envio-field">

                                        <label>
                                            Código de zona
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                tarifa.codigoZona
                                            }
                                            disabled
                                        />

                                        <small>
                                            Este valor no se puede modificar.
                                        </small>

                                    </div>

                                    <div className="envio-field">

                                        <label>
                                            Precio
                                        </label>

                                        <div className="envio-precio-input">

                                            <span>
                                                $
                                            </span>

                                            <input
                                                type="number"
                                                min="0"
                                                step="100"
                                                value={
                                                    tarifa.precio
                                                }
                                                onChange={(e) =>
                                                    actualizarCampo(
                                                        tarifa.id,
                                                        "precio",
                                                        e.target.value
                                                    )
                                                }
                                            />

                                        </div>

                                        <small>
                                            Actualmente:{" "}
                                            {formatearPrecio(
                                                tarifa.precio
                                            )}
                                        </small>

                                    </div>

                                </div>

                                <button
                                    type="button"
                                    className="envio-guardar"
                                    disabled={
                                        guardandoId ===
                                        tarifa.id
                                    }
                                    onClick={() =>
                                        guardarTarifa(
                                            tarifa
                                        )
                                    }
                                >
                                    {guardandoId ===
                                    tarifa.id
                                        ? "Guardando..."
                                        : "Guardar cambios"}
                                </button>

                            </article>
                        ))}

                    </section>
                )}

            </main>

            <Footer />
        </>
    );
}