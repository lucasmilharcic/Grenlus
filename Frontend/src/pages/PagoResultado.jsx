import {
    Link,
    useSearchParams
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import "./PagoResultado.css";

export default function PagoResultado() {

    const [params] =
        useSearchParams();

    const estado =
        params.get("estado");

    const aprobado =
        estado === "success";

    const pendiente =
        estado === "pending";

    let titulo =
        "No se pudo completar el pago";

    let descripcion =
        "Mercado Pago informó que el pago no fue aprobado.";

    if (aprobado) {

        titulo =
            "¡Pago realizado!";

        descripcion =
            "Recibimos el resultado del pago. Tu pedido será procesado cuando Mercado Pago confirme la acreditación.";

    } else if (pendiente) {

        titulo =
            "Pago pendiente";

        descripcion =
            "Mercado Pago todavía está procesando el pago. El pedido se actualizará cuando recibamos la confirmación.";
    }

    return (
        <>
            <Navbar />

            <main className="pago-resultado-page">

                <section
                    className={`pago-resultado-card ${
                        aprobado
                            ? "success"
                            : pendiente
                                ? "pending"
                                : "failure"
                    }`}
                >

                    <div className="pago-resultado-icon">
                        {aprobado
                            ? "✓"
                            : pendiente
                                ? "…"
                                : "×"}
                    </div>

                    <span>
                        GRENLUS
                    </span>

                    <h1>
                        {titulo}
                    </h1>

                    <p>
                        {descripcion}
                    </p>

                    <div className="pago-resultado-actions">

                        <Link
                            to="/"
                            className="pago-primary"
                        >
                            Volver al inicio
                        </Link>

                        {!aprobado && (
                            <Link
                                to="/carrito"
                                className="pago-secondary"
                            >
                                Ver carrito
                            </Link>
                        )}

                    </div>

                </section>

            </main>

            <Footer />
        </>
    );
}