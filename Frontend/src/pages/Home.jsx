import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import CategoryPanel from "../components/CategoryPanel";
import FeaturedProducts from "../components/FeaturedProductos";
import './Home.css';

export default function Home() {
    return (
        <>
            <Navbar />

            <main>

                <Hero />

                <section className="categories">
                    <CategoryPanel
                        titulo="Indumentaria y artículos"
                        descripcion="Remeras, buzos, tazas, botellas y más, con tu diseño."
                        imagen="/images/indumentaria.jpg"
                        link="/productos?filtro=indumentaria"
                    />

                    <CategoryPanel
                        titulo="Cartelería"
                        descripcion="Carteles, letras corpóreas y soluciones personalizadas."
                        imagen="/images/carteleria.jpg"
                        link="/productos?filtro=carteleria"
                    />
                </section>


                <FeaturedProducts />

            </main>

            <Footer />
        </>
    );
}