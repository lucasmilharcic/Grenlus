package com.grenlus.backend.Entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
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

    /*
     * Prenda o artículo (taza, botella, llavero).
     *
     * Comparten motor; solo cambia cómo se agrupan en la
     * tienda. Null en los productos viejos: se leen como
     * indumentaria.
     */
    @Enumerated(EnumType.STRING)
    private TipoIndumentaria tipo = TipoIndumentaria.INDUMENTARIA;

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

    /*
     * Talles que este producto ofrece, elegidos uno por uno
     * desde el panel.
     *
     * Vacio = producto cargado antes de esta opcion: ahi
     * caemos en los interruptores viejos (infantiles /
     * especiales) para no cambiarle los talles de golpe.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "indumentaria_talle",
            joinColumns = @JoinColumn(name = "indumentaria_id"))
    @Column(name = "talle")
    private Set<String> tallesDisponibles = new LinkedHashSet<>();

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

    /*
     * Colores con su adicional de precio y los talles
     * donde no están disponibles.
     *
     * No viajan dentro del producto: se piden aparte en
     * /indumentarias/{id}/colores. Si se serializaran acá,
     * al no estar en el grafo de carga quedarían perezosos
     * y romperían el JSON (open-in-view está apagado).
     */
    @JsonIgnore
    @OneToMany(
            mappedBy = "indumentaria",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("id ASC")
    private List<ColorProducto> colores =
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
     * Talles que el producto ofrece, en el orden del catalogo.
     *
     * Si nadie eligio talles todavia, reconstruimos la lista
     * con los interruptores viejos para que los productos ya
     * cargados sigan mostrando lo mismo.
     */
    @JsonProperty("tallesOfrecidos")
    public Set<String> obtenerTallesOfrecidos() {

        if (tallesDisponibles != null
                && !tallesDisponibles.isEmpty()) {

            return CatalogoTalles.ordenar(tallesDisponibles);
        }

        List<String> heredados = new ArrayList<>();

        if (!Boolean.FALSE.equals(incluyeTallesInfantiles)) {
            heredados.addAll(CatalogoTalles.INFANTILES);
        }

        if (Boolean.TRUE.equals(incluyeTallesEspeciales)) {

            for (String especial : CatalogoTalles.ESPECIALES) {

                boolean esGrande =
                        List.of("T14", "T16").contains(especial);

                if (!esGrande
                        || !Boolean.FALSE.equals(
                                incluyeTallesEspecialesGrandes)) {

                    heredados.add(especial);
                }
            }
        }

        heredados.addAll(CatalogoTalles.ADULTOS);

        return CatalogoTalles.ordenar(heredados);
    }

    public boolean ofreceTalle(String talle) {

        String normalizado =
                CatalogoTalles.normalizar(talle);

        return normalizado != null
                && obtenerTallesOfrecidos().contains(normalizado);
    }

    /*
     * Talles especiales que el producto ofrece hoy.
     */
    public boolean ofreceTalleEspecial(
            String talle) {

        return CatalogoTalles.esEspecial(talle)
                && ofreceTalle(talle);
    }

    // =========================================================
    // COLORES
    // =========================================================

    public TipoIndumentaria getTipo() {

        return tipo != null
                ? tipo
                : TipoIndumentaria.INDUMENTARIA;
    }

    public void agregarColor(ColorProducto color) {

        colores.add(color);

        color.setIndumentaria(this);
    }

    public void eliminarColor(ColorProducto color) {

        colores.remove(color);

        color.setIndumentaria(null);
    }

    public ColorProducto buscarColor(String nombre) {

        if (nombre == null || colores == null) {
            return null;
        }

        return colores.stream()
                .filter(color -> color.tieneNombre(nombre))
                .findFirst()
                .orElse(null);
    }

    /*
     * Lo que suma el color sobre el precio base.
     *
     * Un color sin ficha cargada no suma nada.
     */
    public BigDecimal calcularPrecioAdicionalColor(
            String nombre) {

        ColorProducto color = buscarColor(nombre);

        if (color == null
                || !color.isActivo()
                || color.getPrecioAdicional() == null) {

            return BigDecimal.ZERO;
        }

        return color.getPrecioAdicional();
    }

    /*
     * Si el color no tiene ficha lo damos por disponible:
     * sale de los mockups del área y nadie lo restringió.
     */
    public boolean colorDisponibleParaTalle(
            String nombre,
            String talle) {

        ColorProducto color = buscarColor(nombre);

        return color == null
                || color.disponibleParaTalle(talle);
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