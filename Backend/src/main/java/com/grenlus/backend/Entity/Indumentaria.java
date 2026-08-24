package com.grenlus.backend.Entity;

import java.util.ArrayList;
import java.util.List;

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
}