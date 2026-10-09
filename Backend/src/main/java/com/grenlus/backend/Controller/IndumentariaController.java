package com.grenlus.backend.Controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.grenlus.backend.Entity.Indumentaria;
import com.grenlus.backend.Exception.BadRequestException;
import com.grenlus.backend.Exception.ResourceNotFoundException;
import com.grenlus.backend.Service.IndumentariaService;

@RestController
@RequestMapping("/indumentarias")
public class IndumentariaController {

    private final IndumentariaService indumentariaService;

    public IndumentariaController(
            IndumentariaService indumentariaService) {

        this.indumentariaService =
                indumentariaService;
    }

    @GetMapping
    public List<Indumentaria> getIndumentarias() {

        return indumentariaService.findAll();
    }

    @GetMapping("/{id}")
    public Indumentaria getIndumentariaById(
            @PathVariable Long id) {

        return indumentariaService
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Indumentaria no encontrada"
                        )
                );
    }

    // =========================================================
    // CREAR
    // =========================================================

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Indumentaria crearIndumentaria(

            @RequestParam("nombre")
            String nombre,

            @RequestParam(
                    value = "descripcion",
                    required = false
            )
            String descripcion,

            @RequestParam(
                    value = "imagen",
                    required = false
            )
            MultipartFile imagen,

            /*
             * PRECIOS
             */
            @RequestParam(
                    value = "precioBase",
                    required = false
            )
            BigDecimal precioBase,

            @RequestParam(
                    value = "precioEstampaChica",
                    required = false
            )
            BigDecimal precioEstampaChica,

            @RequestParam(
                    value = "precioEstampaMedia",
                    required = false
            )
            BigDecimal precioEstampaMedia,

            @RequestParam(
                    value = "precioEstampaGrande",
                    required = false
            )
            BigDecimal precioEstampaGrande,

            @RequestParam(
                    value = "descuentoMayoristaPorcentaje",
                    required = false
            )
            BigDecimal descuentoMayoristaPorcentaje,

            /*
             * DATOS LOGÍSTICOS DEL PAQUETE
             */
            @RequestParam(
                    value = "pesoGramos",
                    required = false
            )
            Integer pesoGramos,

            @RequestParam(
                    value = "largoEnvioCm",
                    required = false
            )
            Integer largoEnvioCm,

            @RequestParam(
                    value = "anchoEnvioCm",
                    required = false
            )
            Integer anchoEnvioCm,

            @RequestParam(
                    value = "altoEnvioCm",
                    required = false
            )
            Integer altoEnvioCm,

            /*
             * CONFIGURACIÓN
             */
            @RequestParam(
                    value = "usaTalles",
                    required = false
            )
            Boolean usaTalles,

            @RequestParam(
                    value = "incluyeTallesInfantiles",
                    required = false
            )
            Boolean incluyeTallesInfantiles,

            @RequestParam(
                    value = "incluyeTallesEspeciales",
                    required = false
            )
            Boolean incluyeTallesEspeciales,

            @RequestParam(
                    value = "incluyeTallesEspecialesGrandes",
                    required = false
            )
            Boolean incluyeTallesEspecialesGrandes,

            @RequestParam(
                    value = "precioAdicionalTalleEspecial",
                    required = false
            )
            BigDecimal precioAdicionalTalleEspecial,

            @RequestParam(
                    value = "usaColores",
                    required = false
            )
            Boolean usaColores,

            @RequestParam(
                    value = "permiteFrente",
                    required = false
            )
            Boolean permiteFrente,

            @RequestParam(
                    value = "permiteEspalda",
                    required = false
            )
            Boolean permiteEspalda,

            @RequestParam(
                    value = "permiteManga",
                    required = false
            )
            Boolean permiteManga,

            @RequestParam(
                    value = "requiereImagen",
                    required = false
            )
            Boolean requiereImagen,

            /*
             * TAMAÑOS HABILITADOS
             */
            @RequestParam(
                    value = "permiteEstampaChica",
                    required = false
            )
            Boolean permiteEstampaChica,

            @RequestParam(
                    value = "permiteEstampaMedia",
                    required = false
            )
            Boolean permiteEstampaMedia,

            @RequestParam(
                    value = "permiteEstampaGrande",
                    required = false
            )
            Boolean permiteEstampaGrande
    ) {

        Indumentaria indumentaria =
                new Indumentaria();

        cargarDatos(
                indumentaria,
                nombre,
                descripcion,
                precioBase,
                precioEstampaChica,
                precioEstampaMedia,
                precioEstampaGrande,
                descuentoMayoristaPorcentaje,
                pesoGramos,
                largoEnvioCm,
                anchoEnvioCm,
                altoEnvioCm,
                usaTalles,
                incluyeTallesInfantiles,
                incluyeTallesEspeciales,

                incluyeTallesEspecialesGrandes,
                precioAdicionalTalleEspecial,
                usaColores,
                permiteFrente,
                permiteEspalda,
                permiteManga,
                requiereImagen,
                permiteEstampaChica,
                permiteEstampaMedia,
                permiteEstampaGrande
        );

        indumentaria.setActivo(true);

        return indumentariaService.save(
                indumentaria,
                imagen
        );
    }

    // =========================================================
    // EDITAR
    // =========================================================

    @PutMapping(
            value = "/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Indumentaria editarIndumentaria(

            @PathVariable Long id,

            @RequestParam("nombre")
            String nombre,

            @RequestParam(
                    value = "descripcion",
                    required = false
            )
            String descripcion,

            @RequestParam(
                    value = "imagen",
                    required = false
            )
            MultipartFile imagen,

            @RequestParam(
                    value = "precioBase",
                    required = false
            )
            BigDecimal precioBase,

            @RequestParam(
                    value = "precioEstampaChica",
                    required = false
            )
            BigDecimal precioEstampaChica,

            @RequestParam(
                    value = "precioEstampaMedia",
                    required = false
            )
            BigDecimal precioEstampaMedia,

            @RequestParam(
                    value = "precioEstampaGrande",
                    required = false
            )
            BigDecimal precioEstampaGrande,

            @RequestParam(
                    value = "descuentoMayoristaPorcentaje",
                    required = false
            )
            BigDecimal descuentoMayoristaPorcentaje,

            @RequestParam(
                    value = "pesoGramos",
                    required = false
            )
            Integer pesoGramos,

            @RequestParam(
                    value = "largoEnvioCm",
                    required = false
            )
            Integer largoEnvioCm,

            @RequestParam(
                    value = "anchoEnvioCm",
                    required = false
            )
            Integer anchoEnvioCm,

            @RequestParam(
                    value = "altoEnvioCm",
                    required = false
            )
            Integer altoEnvioCm,

            @RequestParam(
                    value = "usaTalles",
                    required = false
            )
            Boolean usaTalles,

            @RequestParam(
                    value = "incluyeTallesInfantiles",
                    required = false
            )
            Boolean incluyeTallesInfantiles,

            @RequestParam(
                    value = "incluyeTallesEspeciales",
                    required = false
            )
            Boolean incluyeTallesEspeciales,

            @RequestParam(
                    value = "incluyeTallesEspecialesGrandes",
                    required = false
            )
            Boolean incluyeTallesEspecialesGrandes,

            @RequestParam(
                    value = "precioAdicionalTalleEspecial",
                    required = false
            )
            BigDecimal precioAdicionalTalleEspecial,

            @RequestParam(
                    value = "usaColores",
                    required = false
            )
            Boolean usaColores,

            @RequestParam(
                    value = "permiteFrente",
                    required = false
            )
            Boolean permiteFrente,

            @RequestParam(
                    value = "permiteEspalda",
                    required = false
            )
            Boolean permiteEspalda,

            @RequestParam(
                    value = "permiteManga",
                    required = false
            )
            Boolean permiteManga,

            @RequestParam(
                    value = "requiereImagen",
                    required = false
            )
            Boolean requiereImagen,

            @RequestParam(
                    value = "permiteEstampaChica",
                    required = false
            )
            Boolean permiteEstampaChica,

            @RequestParam(
                    value = "permiteEstampaMedia",
                    required = false
            )
            Boolean permiteEstampaMedia,

            @RequestParam(
                    value = "permiteEstampaGrande",
                    required = false
            )
            Boolean permiteEstampaGrande
    ) {

        Indumentaria existing =
                indumentariaService
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Indumentaria no encontrada"
                                )
                        );

        cargarDatos(
                existing,
                nombre,
                descripcion,
                precioBase,
                precioEstampaChica,
                precioEstampaMedia,
                precioEstampaGrande,
                descuentoMayoristaPorcentaje,
                pesoGramos,
                largoEnvioCm,
                anchoEnvioCm,
                altoEnvioCm,
                usaTalles,
                incluyeTallesInfantiles,
                incluyeTallesEspeciales,

                incluyeTallesEspecialesGrandes,
                precioAdicionalTalleEspecial,
                usaColores,
                permiteFrente,
                permiteEspalda,
                permiteManga,
                requiereImagen,
                permiteEstampaChica,
                permiteEstampaMedia,
                permiteEstampaGrande
        );

        return indumentariaService
                .editarIndumentaria(
                        existing,
                        imagen
                );
    }

    // =========================================================
    // ELIMINAR
    // =========================================================

    @DeleteMapping("/{id}")
    public void eliminarIndumentaria(
            @PathVariable Long id) {

        indumentariaService.deleteById(id);
    }

    // =========================================================
    // CARGAR DATOS
    // =========================================================

    private void cargarDatos(

            Indumentaria indumentaria,

            String nombre,
            String descripcion,

            BigDecimal precioBase,
            BigDecimal precioEstampaChica,
            BigDecimal precioEstampaMedia,
            BigDecimal precioEstampaGrande,

            BigDecimal descuentoMayoristaPorcentaje,

            Integer pesoGramos,
            Integer largoEnvioCm,
            Integer anchoEnvioCm,
            Integer altoEnvioCm,

            Boolean usaTalles,
            Boolean incluyeTallesInfantiles,
            Boolean incluyeTallesEspeciales,

            Boolean incluyeTallesEspecialesGrandes,
            BigDecimal precioAdicionalTalleEspecial,
            Boolean usaColores,

            Boolean permiteFrente,
            Boolean permiteEspalda,
            Boolean permiteManga,

            Boolean requiereImagen,

            Boolean permiteEstampaChica,
            Boolean permiteEstampaMedia,
            Boolean permiteEstampaGrande
    ) {

        indumentaria.setNombre(nombre);

        indumentaria.setDescripcion(
                descripcion
        );

        indumentaria.setPrecioBase(
                precioBase != null
                        ? precioBase
                        : BigDecimal.ZERO
        );

        indumentaria.setPrecioEstampaChica(
                precioEstampaChica != null
                        ? precioEstampaChica
                        : BigDecimal.ZERO
        );

        indumentaria.setPrecioEstampaMedia(
                precioEstampaMedia != null
                        ? precioEstampaMedia
                        : BigDecimal.ZERO
        );

        indumentaria.setPrecioEstampaGrande(
                precioEstampaGrande != null
                        ? precioEstampaGrande
                        : BigDecimal.ZERO
        );

        BigDecimal descuento = descuentoMayoristaPorcentaje != null
                ? descuentoMayoristaPorcentaje
                : BigDecimal.ZERO;

        if (descuento.compareTo(BigDecimal.ZERO) < 0
                || descuento.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new BadRequestException(
                    "El descuento por mayor debe estar entre 0% y 100%.");
        }

        indumentaria.setDescuentoMayoristaPorcentaje(descuento);

        indumentaria.setPesoGramos(pesoGramos);
        indumentaria.setLargoEnvioCm(largoEnvioCm);
        indumentaria.setAnchoEnvioCm(anchoEnvioCm);
        indumentaria.setAltoEnvioCm(altoEnvioCm);

        indumentaria.setUsaTalles(
                Boolean.TRUE.equals(
                        usaTalles
                )
        );

        indumentaria.setIncluyeTallesInfantiles(
                !Boolean.FALSE.equals(
                        incluyeTallesInfantiles
                )
        );

        indumentaria.setIncluyeTallesEspeciales(
                Boolean.TRUE.equals(
                        incluyeTallesEspeciales
                )
        );

        /*
         * Si no viene el dato (cliente viejo) dejamos T14 y T16
         * incluidos, que es como venían funcionando.
         */
        indumentaria.setIncluyeTallesEspecialesGrandes(
                !Boolean.FALSE.equals(
                        incluyeTallesEspecialesGrandes
                )
        );

        BigDecimal adicionalTalle = precioAdicionalTalleEspecial != null
                ? precioAdicionalTalleEspecial
                : BigDecimal.ZERO;

        if (adicionalTalle.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException(
                    "El adicional por talle especial no puede ser negativo.");
        }

        indumentaria.setPrecioAdicionalTalleEspecial(adicionalTalle);

        indumentaria.setUsaColores(
                Boolean.TRUE.equals(
                        usaColores
                )
        );

        indumentaria.setPermiteFrente(
                Boolean.TRUE.equals(
                        permiteFrente
                )
        );

        indumentaria.setPermiteEspalda(
                Boolean.TRUE.equals(
                        permiteEspalda
                )
        );

        indumentaria.setPermiteManga(
                Boolean.TRUE.equals(
                        permiteManga
                )
        );

        indumentaria.setRequiereImagen(
                Boolean.TRUE.equals(
                        requiereImagen
                )
        );

        indumentaria.setPermiteEstampaChica(
                Boolean.TRUE.equals(
                        permiteEstampaChica
                )
        );

        indumentaria.setPermiteEstampaMedia(
                Boolean.TRUE.equals(
                        permiteEstampaMedia
                )
        );

        indumentaria.setPermiteEstampaGrande(
                Boolean.TRUE.equals(
                        permiteEstampaGrande
                )
        );
    }
}