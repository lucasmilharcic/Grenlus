import { Link } from "react-router-dom";

export default function CategoryPanel({ titulo, descripcion, imagen, link }) {
    return (
        <article
            className="category-card"
            style={{ backgroundImage: `url(${imagen})` }}
        >
            <div className="overlay"></div>

            <div className="category-content">
                <h2>{titulo}</h2>

                <p>{descripcion}</p>

                <Link to={link} className="category-button">
                    Explorar
                </Link>
            </div>
        </article>
    );
}