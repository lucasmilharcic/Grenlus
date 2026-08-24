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

import com.grenlus.backend.Entity.Carteleria;
import com.grenlus.backend.Service.CarteleriaService;

@RestController
@RequestMapping("/carteleria")
public class CarteleriaController {

    private final CarteleriaService carteleriaService;

    public CarteleriaController(
            CarteleriaService carteleriaService) {

        this.carteleriaService =
                carteleriaService;
    }

    @GetMapping
    public List<Carteleria> getCartelerias() {

        return carteleriaService.findAll();
    }

    @GetMapping("/{id}")
    public Carteleria getCarteleriaById(
            @PathVariable Long id) {

        return carteleriaService.findById(id);
    }

    // =========================================================
    // CREAR
    // =========================================================

    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Carteleria crearCarteleria(

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
             * true:
             * solicitar cotización.
             *
             * false:
             * venta directa.
             */
            @RequestParam(
                    value = "esCotizable",
                    required = false
            )
            Boolean esCotizable,

            /*
             * Precio para cartelería
             * que se vende directamente.
             */
            @RequestParam(
                    value = "precioFijo",
                    required = false
            )
            BigDecimal precioFijo,

            @RequestParam(
                    value = "requiereMedidas",
                    required = false
            )
            Boolean requiereMedidas,

            @RequestParam(
                    value = "requiereImagen",
                    required = false
            )
            Boolean requiereImagen,

            @RequestParam(
                    value = "requiereCantidad",
                    required = false
            )
            Boolean requiereCantidad,

            @RequestParam(
                    value = "requiereInstalacion",
                    required = false
            )
            Boolean requiereInstalacion
    ) {

        Carteleria carteleria =
                new Carteleria();

        cargarDatos(
                carteleria,
                nombre,
                descripcion,
                esCotizable,
                precioFijo,
                requiereMedidas,
                requiereImagen,
                requiereCantidad,
                requiereInstalacion
        );

        carteleria.setActivo(true);

        return carteleriaService.save(
                carteleria,
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
    public Carteleria editarCarteleria(

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
                    value = "esCotizable",
                    required = false
            )
            Boolean esCotizable,

            @RequestParam(
                    value = "precioFijo",
                    required = false
            )
            BigDecimal precioFijo,

            @RequestParam(
                    value = "requiereMedidas",
                    required = false
            )
            Boolean requiereMedidas,

            @RequestParam(
                    value = "requiereImagen",
                    required = false
            )
            Boolean requiereImagen,

            @RequestParam(
                    value = "requiereCantidad",
                    required = false
            )
            Boolean requiereCantidad,

            @RequestParam(
                    value = "requiereInstalacion",
                    required = false
            )
            Boolean requiereInstalacion
    ) {

        Carteleria carteleria =
                carteleriaService.findById(id);

        cargarDatos(
                carteleria,
                nombre,
                descripcion,
                esCotizable,
                precioFijo,
                requiereMedidas,
                requiereImagen,
                requiereCantidad,
                requiereInstalacion
        );

        return carteleriaService.update(
                carteleria,
                imagen
        );
    }

    // =========================================================
    // ELIMINAR
    // =========================================================

    @DeleteMapping("/{id}")
    public void eliminarCarteleria(
            @PathVariable Long id) {

        carteleriaService.deleteById(id);
    }

    // =========================================================
    // CARGAR DATOS
    // =========================================================

    private void cargarDatos(

            Carteleria carteleria,

            String nombre,
            String descripcion,

            Boolean esCotizable,
            BigDecimal precioFijo,

            Boolean requiereMedidas,
            Boolean requiereImagen,
            Boolean requiereCantidad,
            Boolean requiereInstalacion
    ) {

        carteleria.setNombre(nombre);

        carteleria.setDescripcion(
                descripcion
        );

        boolean cotizable =
                Boolean.TRUE.equals(
                        esCotizable
                );

        carteleria.setEsCotizable(
                cotizable
        );

        /*
         * Si es cotizable, no necesitamos
         * un precio fijo.
         *
         * Si es venta directa, guardamos
         * el precio configurado por admin.
         */
        if (cotizable) {

            carteleria.setPrecioFijo(null);

            carteleria.setPrecioBase(null);

        } else {

            BigDecimal precio =
                    precioFijo != null
                            ? precioFijo
                            : BigDecimal.ZERO;

            carteleria.setPrecioFijo(
                    precio
            );

            /*
             * También reflejamos el valor
             * como precioBase para que las
             * cards públicas puedan trabajar
             * de manera homogénea.
             */
            carteleria.setPrecioBase(
                    precio
            );
        }

        carteleria.setRequiereMedidas(
                Boolean.TRUE.equals(
                        requiereMedidas
                )
        );

        carteleria.setRequiereImagen(
                Boolean.TRUE.equals(
                        requiereImagen
                )
        );

        carteleria.setRequiereCantidad(
                Boolean.TRUE.equals(
                        requiereCantidad
                )
        );

        carteleria.setRequiereInstalacion(
                Boolean.TRUE.equals(
                        requiereInstalacion
                )
        );
    }
}