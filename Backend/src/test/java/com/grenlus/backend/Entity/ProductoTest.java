package com.grenlus.backend.Entity;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;

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
}
