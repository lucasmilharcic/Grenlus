package com.grenlus.backend.Entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class DetallePedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Pedido pedido;

    @ManyToOne
    private Producto producto;

    private Integer cantidad;

    private String talle;

    private String color;

    @Enumerated(EnumType.STRING)
    private TamanoEstampa tamanoEstampa;

    /**
     * Precio base del producto.
     *
     * Ejemplo:
     * Remera = 18000
     */
    private BigDecimal precioBase;

    /**
     * Precio adicional de la estampa.
     *
     * Ejemplo:
     * Estampa media = 3500
     */
    private BigDecimal precioEstampa;

    /**
     * Precio final unitario.
     *
     * precioBase + precioEstampa
     */
    private BigDecimal precioUnitario;

    /**
     * precioUnitario * cantidad
     */
    private BigDecimal subtotal;

    @OneToMany(
            mappedBy = "detallePedido",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<DisenoPedido> disenos = new ArrayList<>();

    public void agregarDiseno(DisenoPedido diseno) {

        disenos.add(diseno);

        diseno.setDetallePedido(this);
    }
}