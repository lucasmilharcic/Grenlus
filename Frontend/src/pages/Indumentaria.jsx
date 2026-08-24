import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CategoryProducts from "../components/CategoryProducts";

export default function Indumentaria() {

    return (
        <>
            <Navbar />

            <main>

                <section className="category-header">

                    <span className="category-eyebrow">
                        GRENLUS
                    </span>

                    <h1>
                        Indumentaria
                    </h1>

                    <p>
                        Elegí la prenda que querés
                        personalizar.
                    </p>

                </section>

                <CategoryProducts
                    tipo="indumentaria"
                />

            </main>

            <Footer />
        </>
    );
}