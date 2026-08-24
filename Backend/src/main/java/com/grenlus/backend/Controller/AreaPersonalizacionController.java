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

import com.grenlus.backend.Entity.AreaPersonalizacion;
import com.grenlus.backend.Entity.PosicionDiseno;
import com.grenlus.backend.Service.AreaPersonalizacionService;

@RestController
@RequestMapping(
        "/indumentarias/{indumentariaId}/areas"
)
public class AreaPersonalizacionController {

    private final AreaPersonalizacionService service;

    public AreaPersonalizacionController(
            AreaPersonalizacionService service) {

        this.service =
                service;
    }

    // =========================================================
    // LISTAR
    //
    // Sin color:
    // GET /indumentarias/1/areas
    //
    // devuelve todas.
    //
    // Con color:
    // GET /indumentarias/1/areas?color=Negro
    //
    // devuelve las vistas del negro.
    // =========================================================

    @GetMapping
    public List<AreaPersonalizacion> listar(

            @PathVariable
            Long indumentariaId,

            @RequestParam(
                    value = "color",
                    required = false
            )
            String color
    ) {

        if (
                color == null ||
                color.isBlank()
        ) {

            return service.listar(
                    indumentariaId
            );
        }

        return service.listarPorColor(
                indumentariaId,
                color
        );
    }

    // =========================================================
    // OBTENER
    // =========================================================

    @GetMapping("/{areaId}")
    public AreaPersonalizacion obtener(

            @PathVariable
            Long indumentariaId,

            @PathVariable
            Long areaId
    ) {

        return service.buscar(
                indumentariaId,
                areaId
        );
    }

    // =========================================================
    // CREAR
    // =========================================================

    @PostMapping(
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public AreaPersonalizacion crear(

            @PathVariable
            Long indumentariaId,

            @RequestParam
            PosicionDiseno posicion,

            @RequestParam(
                    value = "color",
                    required = false
            )
            String color,

            @RequestParam(
                    value = "imagen",
                    required = false
            )
            MultipartFile imagen,

            @RequestParam
            Double x,

            @RequestParam
            Double y,

            @RequestParam
            Double width,

            @RequestParam
            Double height,

            @RequestParam(
                    value = "anchoChicaCm",
                    required = false
            )
            BigDecimal anchoChicaCm,

            @RequestParam(
                    value = "altoChicaCm",
                    required = false
            )
            BigDecimal altoChicaCm,

            @RequestParam(
                    value = "anchoMediaCm",
                    required = false
            )
            BigDecimal anchoMediaCm,

            @RequestParam(
                    value = "altoMediaCm",
                    required = false
            )
            BigDecimal altoMediaCm,

            @RequestParam(
                    value = "anchoGrandeCm",
                    required = false
            )
            BigDecimal anchoGrandeCm,

            @RequestParam(
                    value = "altoGrandeCm",
                    required = false
            )
            BigDecimal altoGrandeCm
    ) {

        return service.crear(

                indumentariaId,

                posicion,

                color,

                imagen,

                x,
                y,
                width,
                height,

                anchoChicaCm,
                altoChicaCm,

                anchoMediaCm,
                altoMediaCm,

                anchoGrandeCm,
                altoGrandeCm
        );
    }

    // =========================================================
    // EDITAR
    // =========================================================

    @PutMapping(
            value = "/{areaId}",
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public AreaPersonalizacion editar(

            @PathVariable
            Long indumentariaId,

            @PathVariable
            Long areaId,

            @RequestParam
            PosicionDiseno posicion,

            @RequestParam(
                    value = "color",
                    required = false
            )
            String color,

            @RequestParam(
                    value = "imagen",
                    required = false
            )
            MultipartFile imagen,

            @RequestParam
            Double x,

            @RequestParam
            Double y,

            @RequestParam
            Double width,

            @RequestParam
            Double height,

            @RequestParam(
                    value = "anchoChicaCm",
                    required = false
            )
            BigDecimal anchoChicaCm,

            @RequestParam(
                    value = "altoChicaCm",
                    required = false
            )
            BigDecimal altoChicaCm,

            @RequestParam(
                    value = "anchoMediaCm",
                    required = false
            )
            BigDecimal anchoMediaCm,

            @RequestParam(
                    value = "altoMediaCm",
                    required = false
            )
            BigDecimal altoMediaCm,

            @RequestParam(
                    value = "anchoGrandeCm",
                    required = false
            )
            BigDecimal anchoGrandeCm,

            @RequestParam(
                    value = "altoGrandeCm",
                    required = false
            )
            BigDecimal altoGrandeCm
    ) {

        return service.editar(

                indumentariaId,

                areaId,

                posicion,

                color,

                imagen,

                x,
                y,
                width,
                height,

                anchoChicaCm,
                altoChicaCm,

                anchoMediaCm,
                altoMediaCm,

                anchoGrandeCm,
                altoGrandeCm
        );
    }

    // =========================================================
    // ELIMINAR
    // =========================================================

    @DeleteMapping("/{areaId}")
    public void eliminar(

            @PathVariable
            Long indumentariaId,

            @PathVariable
            Long areaId
    ) {

        service.eliminar(
                indumentariaId,
                areaId
        );
    }
}