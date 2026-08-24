import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CategoryProducts from "../components/CategoryProducts";

export default function Carteleria() {

    return (
        <>
            <Navbar />

            <main>

                <section className="category-header">

                    <span className="category-eyebrow">
                        GRENLUS
                    </span>

                    <h1>
                        Cartelería
                    </h1>

                    <p>
                        Carteles, letras corpóreas y
                        soluciones personalizadas.
                    </p>

                </section>

                <CategoryProducts
                    tipo="carteleria"
                />

            </main>

            <Footer />
        </>
    );
}