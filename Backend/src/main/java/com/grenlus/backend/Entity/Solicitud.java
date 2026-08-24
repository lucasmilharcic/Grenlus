package com.grenlus.backend.Entity;

import java.time.LocalDateTime;
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
import jakarta.persistence.PrePersist;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Producto producto;

    private String nombreCliente;

    private String telefono;

    private String email;

    private String ciudad;

    private Integer cantidad;

    private String talle;

    private String color;

    private String descripcion;

    private String imagenReferencia;

    /**
     * Medidas del cartel.
     *
     * Ejemplo:
     * 120x80 cm
     */
    private String medidas;

    @Enumerated(EnumType.STRING)
    private EstadoSolicitud estado;

    @OneToMany(
            mappedBy = "solicitud",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<DisenoSolicitud> disenos = new ArrayList<>();

    private LocalDateTime fechaSolicitud;

    @PrePersist
    public void prePersist() {

        if (fechaSolicitud == null) {
            fechaSolicitud = LocalDateTime.now();
        }

        if (estado == null) {
            estado = EstadoSolicitud.PENDIENTE;
        }
    }
}