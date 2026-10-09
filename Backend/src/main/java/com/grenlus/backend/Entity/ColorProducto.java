package com.grenlus.backend.Entity;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/*
 * Color de un producto.
 *
 * El mockup sigue viviendo en el área de personalización:
 * esta ficha agrega lo que el área no sabe, que es cuánto
 * suma el color y en qué talles no está disponible.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
public class ColorProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "indumentaria_id")
    @JsonIgnore
    private Indumentaria indumentaria;

    @Column(nullable = false)
    private String nombre;

    /*
     * Lo que este color suma sobre el precio base.
     */
    @Column(nullable = false)
    private BigDecimal precioAdicional = BigDecimal.ZERO;

    @Column(nullable = false)
    private boolean activo = true;

    /*
     * Por defecto el color está en todos los talles del
     * producto. Acá se cargan las excepciones.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "color_producto_talle_excluido",
            joinColumns = @JoinColumn(name = "color_producto_id"))
    @Column(name = "talle")
    private Set<String> tallesExcluidos = new LinkedHashSet<>();

    // =========================================================
    // DISPONIBILIDAD
    // =========================================================

    public boolean disponibleParaTalle(String talle) {

        if (!activo) {
            return false;
        }

        String normalizado =
                CatalogoTalles.normalizar(talle);

        if (normalizado == null) {
            /*
             * Producto sin talles: alcanza con que el color
             * esté activo.
             */
            return true;
        }

        return tallesExcluidos == null
                || !CatalogoTalles.ordenar(tallesExcluidos)
                        .contains(normalizado);
    }

    public boolean tieneNombre(String otroNombre) {

        return nombre != null
                && otroNombre != null
                && nombre.trim().equalsIgnoreCase(
                        otroNombre.trim());
    }
}
