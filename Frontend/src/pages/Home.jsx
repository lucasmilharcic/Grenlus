import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import CategoryPanel from "../components/CategoryPanel";
import FeaturedProducts from "../components/FeaturedProductos";
import CategoryProducts from "../components/CategoryProducts";
import './Home.css';

export default function Home() {
    return (
        <>
            <Navbar />

            <main>

                <Hero />

                <section className="categories">
                    <CategoryPanel
                        titulo="Indumentaria"
                        descripcion="Remeras, buzos y prendas personalizadas."
                        imagen="/images/indumentaria.jpg"
                        link="/indumentaria"
                    />

                    <CategoryPanel
                        titulo="Cartelería"
                        descripcion="Carteles, letras corpóreas y soluciones personalizadas."
                        imagen="/images/carteleria.jpg"
                        link="/carteleria"
                    />
                </section>


                <FeaturedProducts />

            </main>

            <Footer />
        </>
    );
}