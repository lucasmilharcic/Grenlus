import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import {
    CarritoProvider
} from "./context/CarritoContext";

import Home from "./pages/Home";
import Productos from "./pages/Productos";
import Indumentaria from "./pages/Indumentaria";
import Carteleria from "./pages/Carteleria";
import Login from "./pages/Login";
import Register from "./pages/Register";

import DetalleProducto from "./pages/DetalleProducto";
import CrearSolicitud from "./pages/CrearSolicitud";

import Carrito from "./pages/Carrito";
import Checkout from "./pages/Checkout";
import PagoResultado from "./pages/PagoResultado";
import MisCompras from "./pages/MisCompras";

import Dashboard from "./pages/admin/Dashboard";
import ProductosAdmin from "./pages/admin/ProductosAdmin";
import PedidosAdmin from "./pages/admin/PedidosAdmin";
import SolicitudesAdmin from "./pages/admin/SolicitudesAdmin";
import UsuariosAdmin from "./pages/admin/UsuariosAdmin";

export default function App() {

    return (

        <BrowserRouter>

            <CarritoProvider>

                <Routes>

                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/productos"
                        element={<Productos />}
                    />

                    <Route
                        path="/indumentaria"
                        element={<Indumentaria />}
                    />

                    <Route
                        path="/carteleria"
                        element={<Carteleria />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/registro"
                        element={<Register />}
                    />

                    <Route
                        path="/producto/:id"
                        element={<DetalleProducto />}
                    />

                    <Route
                        path="/solicitud/:productoId"
                        element={<CrearSolicitud />}
                    />

                    <Route
                        path="/carrito"
                        element={<Carrito />}
                    />

                    <Route
                        path="/checkout"
                        element={<Checkout />}
                    />

                    <Route
                        path="/pago/resultado"
                        element={<PagoResultado />}
                    />

                    <Route
                        path="/admin"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/admin/productos"
                        element={<ProductosAdmin />}
                    />

                    <Route
                        path="/admin/pedidos"
                        element={<PedidosAdmin />}
                    />

                    <Route
                        path="/admin/solicitudes"
                        element={<SolicitudesAdmin />}
                    />

                    <Route
                        path="/admin/usuarios"
                        element={<UsuariosAdmin />}
                    />

                    <Route
                        path="/mis-compras"
                        element={<MisCompras />}
                    />

                </Routes>

            </CarritoProvider>

        </BrowserRouter>
    );
}