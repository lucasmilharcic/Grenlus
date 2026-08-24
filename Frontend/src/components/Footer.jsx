import { Link } from "react-router-dom";

export default function Footer() {

    return (
        <footer className="site-footer">

            <div className="container footer-main">

                <div className="footer-brand">

                    <strong>
                        GRENLUS
                    </strong>

                    <p>
                        Indumentaria, cartelería y
                        productos personalizados.
                    </p>

                </div>

                <nav className="footer-column">

                    <h4>
                        Navegación
                    </h4>

                    <Link to="/">
                        Inicio
                    </Link>

                    <Link to="/indumentaria">
                        Indumentaria
                    </Link>

                    <Link to="/carteleria">
                        Cartelería
                    </Link>

                    <Link to="/nosotros">
                        Nosotros
                    </Link>

                </nav>

                <div className="footer-column">

                    <h4>
                        Contacto
                    </h4>

                    <a
                        href="https://www.instagram.com/grenlus.personalizados/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Instagram · @grenlus.personalizados
                    </a>

                    <a
                        href="https://wa.me/541162372999"
                        target="_blank"
                        rel="noreferrer"
                    >
                        WhatsApp · 11 6237-2999
                    </a>

                </div>

            </div>

            <div className="container footer-bottom">

                <span>
                    © {new Date().getFullYear()} GRENLUS
                </span>

                <span>
                    Personalizados con identidad.
                </span>

            </div>

        </footer>
    );
}