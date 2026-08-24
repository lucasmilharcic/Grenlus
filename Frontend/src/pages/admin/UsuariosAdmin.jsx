import { useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { registrarUsuario } from "../../services/usuarioService";
import "./UsuariosAdmin.css";

export default function UsuariosAdmin() {
    const [nombre, setNombre] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMensaje("");

        try {
            const usuario = await registrarUsuario({
                username,
                password,
                nombre,
            });

            console.log("Usuario creado:", usuario);

            setMensaje("Usuario creado correctamente.");

            setNombre("");
            setUsername("");
            setPassword("");

        } catch (error) {
            console.error(error);
            setMensaje(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <main className="usuarios-admin">

                <header className="usuarios-header">
                    <h1>Administrar usuarios</h1>
                    <p>
                        Registrá nuevos usuarios en el sistema Grenlus.
                    </p>
                </header>

                <section className="usuario-form-container">

                    <form onSubmit={handleSubmit}>

                        <div className="form-group">
                            <label>Nombre</label>

                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Nombre completo"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Usuario</label>

                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Usuario o email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Contraseña</label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Contraseña"
                                required
                            />
                        </div>

                        {mensaje && (
                            <p className="usuario-mensaje">
                                {mensaje}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Creando..."
                                : "Crear usuario"}
                        </button>

                    </form>

                </section>

            </main>

            <Footer />
        </>
    );
}