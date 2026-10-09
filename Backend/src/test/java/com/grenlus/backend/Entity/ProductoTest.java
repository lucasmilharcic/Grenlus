package com.grenlus.backend.Entity;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;

class ProductoTest {

    @Test
    void aplicaDescuentoMayoristaAlSuperarCincoUnidades() {

        Indumentaria producto = new Indumentaria();
        producto.setPrecioBase(new BigDecimal("10000"));
        producto.setDescuentoMayoristaPorcentaje(new BigDecimal("10"));

        assertThat(producto.calcularPrecioBaseMayorista(5))
                .isEqualByComparingTo("10000");

        assertThat(producto.calcularPrecioBaseMayorista(6))
                .isEqualByComparingTo("9000");
    }

    @Test
    void dejaElPrecioNormalCuandoElProductoNoTieneDescuentoMayorista() {

        Indumentaria producto = new Indumentaria();
        producto.setPrecioBase(new BigDecimal("10000"));

        assertThat(producto.calcularPrecioBaseMayorista(6))
                .isEqualByComparingTo("10000");
    }

    @Test
    void aplicaAdicionalSoloALosTallesEspecialesHabilitados() {

        Indumentaria producto = new Indumentaria();
        producto.setIncluyeTallesEspeciales(true);
        producto.setPrecioAdicionalTalleEspecial(new BigDecimal("2500"));

        for (String talle : List.of("T6", "T8", "T10", "T14", "T16")) {
            assertThat(producto.calcularPrecioAdicionalTalleEspecial(talle))
                    .isEqualByComparingTo("2500");
        }

        assertThat(producto.calcularPrecioAdicionalTalleEspecial("M"))
                .isEqualByComparingTo("0");
    }

    @Test
    void noAplicaAdicionalCuandoLosTallesEspecialesEstanDeshabilitados() {

        Indumentaria producto = new Indumentaria();
        producto.setPrecioAdicionalTalleEspecial(new BigDecimal("2500"));

        assertThat(producto.calcularPrecioAdicionalTalleEspecial("T6"))
                .isEqualByComparingTo("0");
    }

    @Test
    void t14YT16SeApaganSinTocarLosDemasTallesEspeciales() {

        Indumentaria producto = new Indumentaria();
        producto.setIncluyeTallesEspeciales(true);
        producto.setIncluyeTallesEspecialesGrandes(false);
        producto.setPrecioAdicionalTalleEspecial(new BigDecimal("2500"));

        for (String talle : List.of("T14", "T16")) {
            assertThat(producto.ofreceTalleEspecial(talle))
                    .isFalse();

            assertThat(producto.calcularPrecioAdicionalTalleEspecial(talle))
                    .isEqualByComparingTo("0");
        }

        for (String talle : List.of("T6", "T8", "T10")) {
            assertThat(producto.ofreceTalleEspecial(talle))
                    .isTrue();

            assertThat(producto.calcularPrecioAdicionalTalleEspecial(talle))
                    .isEqualByComparingTo("2500");
        }
    }

    @Test
    void elColorSumaSuAdicionalYRespetaLosTallesExcluidos() {

        Indumentaria producto = new Indumentaria();
        producto.setUsaTalles(true);
        producto.getTallesDisponibles()
                .addAll(List.of("S", "M", "L", "XL"));

        ColorProducto negro = new ColorProducto();
        negro.setNombre("Negro");
        negro.setPrecioAdicional(new BigDecimal("1500"));
        negro.getTallesExcluidos().addAll(List.of("XL"));

        producto.agregarColor(negro);

        assertThat(producto.calcularPrecioAdicionalColor("Negro"))
                .isEqualByComparingTo("1500");

        // el nombre no distingue mayusculas ni espacios
        assertThat(producto.calcularPrecioAdicionalColor("  negro "))
                .isEqualByComparingTo("1500");

        assertThat(producto.colorDisponibleParaTalle("Negro", "M"))
                .isTrue();

        assertThat(producto.colorDisponibleParaTalle("Negro", "XL"))
                .isFalse();
    }

    @Test
    void unColorApagadoNoSeOfreceNiCobra() {

        Indumentaria producto = new Indumentaria();

        ColorProducto verde = new ColorProducto();
        verde.setNombre("Verde");
        verde.setPrecioAdicional(new BigDecimal("900"));
        verde.setActivo(false);

        producto.agregarColor(verde);

        assertThat(producto.calcularPrecioAdicionalColor("Verde"))
                .isEqualByComparingTo("0");

        assertThat(producto.colorDisponibleParaTalle("Verde", "M"))
                .isFalse();
    }

    @Test
    void unColorSinFichaSigueDisponibleYSinAdicional() {

        /*
         * Los colores salen de los mockups del area: si nadie
         * les cargo ficha, no cobran ni se restringen.
         */
        Indumentaria producto = new Indumentaria();

        assertThat(producto.calcularPrecioAdicionalColor("Blanco"))
                .isEqualByComparingTo("0");

        assertThat(producto.colorDisponibleParaTalle("Blanco", "M"))
                .isTrue();
    }

    @Test
    void elProductoOfreceSoloLosTallesElegidos() {

        Indumentaria producto = new Indumentaria();
        producto.setUsaTalles(true);
        producto.getTallesDisponibles()
                .addAll(List.of("8", "10", "M", "L", "T16"));

        assertThat(producto.obtenerTallesOfrecidos())
                .containsExactly("8", "10", "T16", "M", "L");

        assertThat(producto.ofreceTalle("4")).isFalse();
        assertThat(producto.ofreceTalle("6")).isFalse();
        assertThat(producto.ofreceTalle("8")).isTrue();

        // minusculas y espacios tambien valen
        assertThat(producto.ofreceTalle(" m ")).isTrue();
    }

    @Test
    void elAdicionalSigueALosTallesEspecialesElegidos() {

        Indumentaria producto = new Indumentaria();
        producto.setUsaTalles(true);
        producto.setPrecioAdicionalTalleEspecial(new BigDecimal("2500"));
        producto.getTallesDisponibles()
                .addAll(List.of("T6", "M"));

        assertThat(producto.calcularPrecioAdicionalTalleEspecial("T6"))
                .isEqualByComparingTo("2500");

        assertThat(producto.calcularPrecioAdicionalTalleEspecial("T16"))
                .isEqualByComparingTo("0");

        assertThat(producto.calcularPrecioAdicionalTalleEspecial("M"))
                .isEqualByComparingTo("0");
    }

    @Test
    void sinTallesElegidosSeUsanLosInterruptoresViejos() {

        Indumentaria producto = new Indumentaria();
        producto.setUsaTalles(true);
        producto.setIncluyeTallesInfantiles(false);
        producto.setIncluyeTallesEspeciales(true);
        producto.setIncluyeTallesEspecialesGrandes(false);

        assertThat(producto.obtenerTallesOfrecidos())
                .containsExactly("T6", "T8", "T10", "S", "M", "L", "XL", "XXL");
    }

    @Test
    void losProductosViejosSiguenOfreciendoT14YT16() {

        /*
         * Las filas cargadas antes de la opción tienen la
         * columna en null.
         */
        Indumentaria producto = new Indumentaria();
        producto.setIncluyeTallesEspeciales(true);
        producto.setIncluyeTallesEspecialesGrandes(null);
        producto.setPrecioAdicionalTalleEspecial(new BigDecimal("2500"));

        assertThat(producto.ofreceTalleEspecial("T14"))
                .isTrue();

        assertThat(producto.calcularPrecioAdicionalTalleEspecial("T16"))
                .isEqualByComparingTo("2500");
    }
}
