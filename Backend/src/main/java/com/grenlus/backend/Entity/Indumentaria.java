package com.grenlus.backend.Entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class Indumentaria extends Producto {

    private boolean usaTalles;

    private Boolean incluyeTallesInfantiles = true;

    private Boolean incluyeTallesEspeciales = false;

    /*
     * Dentro de los talles especiales, T14 y T16 son opcionales.
     *
     * Null en los productos cargados antes de esta opción:
     * los tratamos como incluidos para no sacarles talles
     * que hoy ya ofrecen.
     */
    private Boolean incluyeTallesEspecialesGrandes = true;

    private BigDecimal precioAdicionalTalleEspecial = BigDecimal.ZERO;

    private boolean usaColores;

    private boolean permiteFrente;

    private boolean permiteEspalda;

    private boolean requiereImagen;

    private boolean permiteManga;

    /*
     * Tamaños de estampa habilitados.
     */
    private boolean permiteEstampaChica;

    private boolean permiteEstampaMedia;

    private boolean permiteEstampaGrande;

    /*
     * Cada vista tiene:
     *
     * - foto propia
     * - área imprimible propia
     * - medidas reales por tamaño
     *
     * Ejemplo:
     *
     * FRENTE
     * ESPALDA
     * MANGA_DERECHA
     * MANGA_IZQUIERDA
     */
    @OneToMany(
            mappedBy = "indumentaria",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("id ASC")
    private List<AreaPersonalizacion> areasPersonalizacion =
            new ArrayList<>();

    @JsonIgnore
    @OneToMany(
            mappedBy = "indumentaria",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<CalibracionEstampa> calibracionesEstampa =
            new ArrayList<>();

    public void agregarAreaPersonalizacion(
            AreaPersonalizacion area) {

        areasPersonalizacion.add(area);

        area.setIndumentaria(this);
    }

    public void eliminarAreaPersonalizacion(
            AreaPersonalizacion area) {

        areasPersonalizacion.remove(area);

        area.setIndumentaria(null);
    }

    /*
     * Talles especiales que el producto ofrece hoy.
     *
     * T14 y T16 dependen de la opción aparte.
     */
    public boolean ofreceTalleEspecial(
            String talle) {

        if (!Boolean.TRUE.equals(incluyeTallesEspeciales)
                || talle == null) {
            return false;
        }

        String normalizado = talle.trim().toUpperCase();

        if (List.of("T14", "T16").contains(normalizado)) {
            return !Boolean.FALSE.equals(
                    incluyeTallesEspecialesGrandes);
        }

        return List.of("T6", "T8", "T10")
                .contains(normalizado);
    }

    public BigDecimal calcularPrecioAdicionalTalleEspecial(
            String talle) {

        if (!ofreceTalleEspecial(talle)) {
            return BigDecimal.ZERO;
        }

        return precioAdicionalTalleEspecial != null
                ? precioAdicionalTalleEspecial
                : BigDecimal.ZERO;
    }
}