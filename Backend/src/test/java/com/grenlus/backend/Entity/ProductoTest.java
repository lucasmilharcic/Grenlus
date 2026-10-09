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
