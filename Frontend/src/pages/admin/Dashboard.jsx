import {
    Link
} from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import "./Dashboard.css";

export default function Dashboard() {

    return (
        <>
            <Navbar />

            <main className="admin-dashboard">

                <header className="dashboard-header">

                    <h1>
                        Panel de administración
                    </h1>

                    <p>
                        Gestioná productos,
                        pedidos, solicitudes
                        y usuarios de Grenlus.
                    </p>

                </header>

                <section className="dashboard-grid">

                    <Link
                        to="/admin/productos"
                        className="dashboard-card"
                    >

                        <h2>
                            Productos
                        </h2>

                        <p>
                            Crear, editar y eliminar productos.
                        </p>

                    </Link>

                    <Link
                        to="/admin/pedidos"
                        className="dashboard-card"
                    >

                        <h2>
                            Pedidos
                        </h2>

                        <p>
                            Revisar compras, pagos y diseños.
                        </p>

                    </Link>

                    <Link
                        to="/admin/envios"
                        className="dashboard-card"
                    >

                        <h2>
                            Envíos
                        </h2>

                        <p>
                            Preparar, despachar y seguir entregas.
                        </p>

                    </Link>

                    <Link
                        to="/admin/solicitudes"
                        className="dashboard-card"
                    >

                        <h2>
                            Solicitudes
                        </h2>

                        <p>
                            Revisar cotizaciones de clientes.
                        </p>

                    </Link>

                    <Link
                        to="/admin/usuarios"
                        className="dashboard-card"
                    >

                        <h2>
                            Usuarios
                        </h2>

                        <p>
                            Administrar usuarios del sistema.
                        </p>

                    </Link>

                </section>

            </main>

            <Footer />
        </>
    );
}