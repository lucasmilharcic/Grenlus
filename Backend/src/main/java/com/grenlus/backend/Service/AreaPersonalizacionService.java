package com.grenlus.backend.Service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.grenlus.backend.Entity.AreaPersonalizacion;
import com.grenlus.backend.Entity.Indumentaria;
import com.grenlus.backend.Entity.PosicionDiseno;
import com.grenlus.backend.Exception.BadRequestException;
import com.grenlus.backend.Exception.ResourceNotFoundException;
import com.grenlus.backend.Repository.AreaPersonalizacionRepository;
import com.grenlus.backend.Repository.ColorProductoRepository;
import com.grenlus.backend.Repository.IndumentariaRepository;

@Service
public class AreaPersonalizacionService {

    private final AreaPersonalizacionRepository areaRepository;

    private final IndumentariaRepository indumentariaRepository;

    private final FileStorageService fileStorageService;

    private final ColorProductoRepository colorRepository;

    public AreaPersonalizacionService(

            AreaPersonalizacionRepository areaRepository,

            IndumentariaRepository indumentariaRepository,

            FileStorageService fileStorageService,

            ColorProductoRepository colorRepository
    ) {

        this.areaRepository =
                areaRepository;

        this.indumentariaRepository =
                indumentariaRepository;

        this.fileStorageService =
                fileStorageService;

        this.colorRepository =
                colorRepository;
    }

    // =========================================================
    // LISTAR TODAS
    // =========================================================

    @Transactional(readOnly = true)
    public List<AreaPersonalizacion> listar(
            Long indumentariaId) {

        validarIndumentariaExiste(
                indumentariaId
        );

        return areaRepository
                .findByIndumentariaIdOrderByIdAsc(
                        indumentariaId
                );
    }

    // =========================================================
    // LISTAR POR COLOR
    // =========================================================

    @Transactional(readOnly = true)
    public List<AreaPersonalizacion> listarPorColor(

            Long indumentariaId,

            String color
    ) {

        validarIndumentariaExiste(
                indumentariaId
        );

        String colorNormalizado =
                normalizarColor(
                        color
                );

        /*
         * Sin color:
         * devolvemos mockups genéricos.
         */

        if (
                colorNormalizado == null
        ) {

            return areaRepository
                    .findByIndumentariaIdAndColorIsNullOrderByIdAsc(
                            indumentariaId
                    );
        }

        return areaRepository
                .findByIndumentariaIdAndColorIgnoreCaseOrderByIdAsc(
                        indumentariaId,
                        colorNormalizado
                );
    }

    // =========================================================
    // BUSCAR
    // =========================================================

    @Transactional(readOnly = true)
    public AreaPersonalizacion buscar(

            Long indumentariaId,

            Long areaId
    ) {

        AreaPersonalizacion area =
                areaRepository
                        .findById(
                                areaId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Área de personalización no encontrada"
                                )
                        );

        validarPerteneceAProducto(
                area,
                indumentariaId
        );

        return area;
    }

    // =========================================================
    // CREAR
    // =========================================================

    @Transactional
    public AreaPersonalizacion crear(

            Long indumentariaId,

            PosicionDiseno posicion,

            String color,

            MultipartFile imagen,

            Double x,

            Double y,

            Double width,

            Double height,

            BigDecimal anchoChicaCm,

            BigDecimal altoChicaCm,

            BigDecimal anchoMediaCm,

            BigDecimal altoMediaCm,

            BigDecimal anchoGrandeCm,

            BigDecimal altoGrandeCm
    ) {

        Indumentaria indumentaria =
                indumentariaRepository
                        .findById(
                                indumentariaId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Indumentaria no encontrada"
                                )
                        );

        if (
                posicion == null
        ) {

            throw new BadRequestException(
                    "La posición es obligatoria."
            );
        }

        String colorNormalizado =
                normalizarColor(
                        color
                );

        validarDuplicado(

                indumentariaId,

                posicion,

                colorNormalizado,

                null
        );

        validarArea(
                x,
                y,
                width,
                height
        );

        validarMedidas(
                anchoChicaCm,
                altoChicaCm,
                anchoMediaCm,
                altoMediaCm,
                anchoGrandeCm,
                altoGrandeCm
        );

        AreaPersonalizacion area =
                new AreaPersonalizacion();

        area.setIndumentaria(
                indumentaria
        );

        area.setPosicion(
                posicion
        );

        area.setColor(
                colorNormalizado
        );

        cargarDatos(
                area,
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

        if (
                imagen != null &&
                !imagen.isEmpty()
        ) {

            area.setImagenMockup(
                    fileStorageService
                            .guardar(
                                    imagen
                            )
            );
        }

        return areaRepository
                .save(
                        area
                );
    }

    // =========================================================
    // EDITAR
    // =========================================================

    @Transactional
    public AreaPersonalizacion editar(

            Long indumentariaId,

            Long areaId,

            PosicionDiseno posicion,

            String color,

            MultipartFile imagen,

            Double x,

            Double y,

            Double width,

            Double height,

            BigDecimal anchoChicaCm,

            BigDecimal altoChicaCm,

            BigDecimal anchoMediaCm,

            BigDecimal altoMediaCm,

            BigDecimal anchoGrandeCm,

            BigDecimal altoGrandeCm
    ) {

        AreaPersonalizacion area =
                areaRepository
                        .findById(
                                areaId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Área de personalización no encontrada"
                                )
                        );

        validarPerteneceAProducto(
                area,
                indumentariaId
        );

        if (
                posicion == null
        ) {

            throw new BadRequestException(
                    "La posición es obligatoria."
            );
        }

        String colorNormalizado =
                normalizarColor(
                        color
                );

        validarDuplicado(

                indumentariaId,

                posicion,

                colorNormalizado,

                areaId
        );

        validarArea(
                x,
                y,
                width,
                height
        );

        validarMedidas(
                anchoChicaCm,
                altoChicaCm,
                anchoMediaCm,
                altoMediaCm,
                anchoGrandeCm,
                altoGrandeCm
        );

        area.setPosicion(
                posicion
        );

        area.setColor(
                colorNormalizado
        );

        cargarDatos(
                area,
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

        if (
                imagen != null &&
                !imagen.isEmpty()
        ) {

            area.setImagenMockup(
                    fileStorageService
                            .guardar(
                                    imagen
                            )
            );
        }

        return areaRepository
                .save(
                        area
                );
    }

    // =========================================================
    // ELIMINAR
    // =========================================================

    @Transactional
    public void eliminar(

            Long indumentariaId,

            Long areaId
    ) {

        AreaPersonalizacion area =
                buscar(
                        indumentariaId,
                        areaId
                );

        areaRepository.delete(
                area
        );
    }

    // =========================================================
    // RENOMBRAR UN COLOR
    //
    // Toca todas las vistas de ese color de una vez.
    // =========================================================

    @Transactional
    public void renombrarColor(
            Long indumentariaId,
            String desde,
            String hacia) {

        String nombreViejo = limpiar(desde);
        String nombreNuevo = limpiar(hacia);

        if (nombreViejo == null || nombreNuevo == null) {

            throw new BadRequestException(
                    "Indicá el color que querés renombrar y el nombre nuevo.");
        }

        List<AreaPersonalizacion> delColor =
                areasDelColor(indumentariaId, nombreViejo);

        if (delColor.isEmpty()) {

            throw new ResourceNotFoundException(
                    "El color " + nombreViejo
                            + " no tiene vistas cargadas.");
        }

        if (!nombreViejo.equalsIgnoreCase(nombreNuevo)) {

            boolean yaExiste = areaRepository
                    .findByIndumentariaIdOrderByIdAsc(indumentariaId)
                    .stream()
                    .anyMatch(area ->
                            nombreNuevo.equalsIgnoreCase(
                                    limpiar(area.getColor())));

            if (yaExiste) {

                throw new BadRequestException(
                        "Ya hay un color llamado " + nombreNuevo + ".");
            }
        }

        delColor.forEach(area -> area.setColor(nombreNuevo));

        areaRepository.saveAll(delColor);

        /*
         * La ficha de precio del color acompaña el cambio.
         */
        colorRepository
                .findByIndumentariaIdAndNombreIgnoreCase(
                        indumentariaId,
                        nombreViejo)
                .ifPresent(ficha -> {
                    ficha.setNombre(nombreNuevo);
                    colorRepository.save(ficha);
                });
    }

    // =========================================================
    // ELIMINAR UN COLOR
    // =========================================================

    @Transactional
    public void eliminarColor(
            Long indumentariaId,
            String nombre) {

        String color = limpiar(nombre);

        if (color == null) {

            throw new BadRequestException(
                    "Indicá el color que querés eliminar.");
        }

        List<AreaPersonalizacion> delColor =
                areasDelColor(indumentariaId, color);

        if (delColor.isEmpty()) {

            throw new ResourceNotFoundException(
                    "El color " + color
                            + " no tiene vistas cargadas.");
        }

        areaRepository.deleteAll(delColor);

        colorRepository
                .findByIndumentariaIdAndNombreIgnoreCase(
                        indumentariaId,
                        color)
                .ifPresent(colorRepository::delete);
    }

    private List<AreaPersonalizacion> areasDelColor(
            Long indumentariaId,
            String color) {

        return areaRepository
                .findByIndumentariaIdOrderByIdAsc(indumentariaId)
                .stream()
                .filter(area ->
                        color.equalsIgnoreCase(
                                limpiar(area.getColor())))
                .toList();
    }

    private String limpiar(String valor) {

        if (valor == null) {
            return null;
        }

        String limpio = valor.trim();

        return limpio.isEmpty()
                ? null
                : limpio;
    }

    // =========================================================
    // VALIDAR DUPLICADO
    //
    // Se permite:
    //
    // Negro + Frente
    // Negro + Espalda
    // Blanco + Frente
    // Blanco + Espalda
    //
    // NO:
    //
    // Negro + Frente
    // Negro + Frente
    // =========================================================

    private void validarDuplicado(

            Long indumentariaId,

            PosicionDiseno posicion,

            String color,

            Long areaIdActual
    ) {

        AreaPersonalizacion existente;

        if (
                color == null
        ) {

            existente =
                    areaRepository
                            .findByIndumentariaIdAndPosicionAndColorIsNull(

                                    indumentariaId,

                                    posicion
                            )
                            .orElse(
                                    null
                            );

        } else {

            existente =
                    areaRepository
                            .findByIndumentariaIdAndPosicionAndColorIgnoreCase(

                                    indumentariaId,

                                    posicion,

                                    color
                            )
                            .orElse(
                                    null
                            );
        }

        if (
                existente == null
        ) {

            return;
        }

        /*
         * Si estamos editando el mismo registro,
         * no es duplicado.
         */

        if (
                areaIdActual != null &&
                existente
                        .getId()
                        .equals(
                                areaIdActual
                        )
        ) {

            return;
        }

        String mensajeColor =
                color != null
                        ? " para el color "
                                + color
                        : "";

        throw new BadRequestException(
                "Ya existe un área "
                        + posicion.name()
                        + mensajeColor
                        + ". Editala en lugar de crear otra."
        );
    }

    // =========================================================
    // CARGAR DATOS
    // =========================================================

    private void cargarDatos(

            AreaPersonalizacion area,

            Double x,

            Double y,

            Double width,

            Double height,

            BigDecimal anchoChicaCm,

            BigDecimal altoChicaCm,

            BigDecimal anchoMediaCm,

            BigDecimal altoMediaCm,

            BigDecimal anchoGrandeCm,

            BigDecimal altoGrandeCm
    ) {

        area.setX(
                x
        );

        area.setY(
                y
        );

        area.setWidth(
                width
        );

        area.setHeight(
                height
        );

        area.setAnchoChicaCm(
                normalizarMedida(
                        anchoChicaCm
                )
        );

        area.setAltoChicaCm(
                normalizarMedida(
                        altoChicaCm
                )
        );

        area.setAnchoMediaCm(
                normalizarMedida(
                        anchoMediaCm
                )
        );

        area.setAltoMediaCm(
                normalizarMedida(
                        altoMediaCm
                )
        );

        area.setAnchoGrandeCm(
                normalizarMedida(
                        anchoGrandeCm
                )
        );

        area.setAltoGrandeCm(
                normalizarMedida(
                        altoGrandeCm
                )
        );
    }

    // =========================================================
    // VALIDAR PRODUCTO
    // =========================================================

    private void validarIndumentariaExiste(
            Long id) {

        if (
                !indumentariaRepository
                        .existsById(
                                id
                        )
        ) {

            throw new ResourceNotFoundException(
                    "Indumentaria no encontrada"
            );
        }
    }

    // =========================================================
    // VALIDAR RELACIÓN
    // =========================================================

    private void validarPerteneceAProducto(

            AreaPersonalizacion area,

            Long indumentariaId
    ) {

        if (
                area.getIndumentaria()
                        == null ||

                !area.getIndumentaria()
                        .getId()
                        .equals(
                                indumentariaId
                        )
        ) {

            throw new BadRequestException(
                    "El área no pertenece a esta indumentaria."
            );
        }
    }

    // =========================================================
    // VALIDAR ÁREA
    // =========================================================

    private void validarArea(

            Double x,

            Double y,

            Double width,

            Double height
    ) {

        if (
                x == null ||
                y == null ||
                width == null ||
                height == null
        ) {

            throw new BadRequestException(
                    "El área debe tener posición y tamaño."
            );
        }

        if (
                x < 0 ||
                y < 0 ||
                width <= 0 ||
                height <= 0
        ) {

            throw new BadRequestException(
                    "El área contiene valores inválidos."
            );
        }

        if (
                x > 100 ||
                y > 100 ||
                width > 100 ||
                height > 100
        ) {

            throw new BadRequestException(
                    "Los porcentajes del área no pueden superar 100."
            );
        }

        if (
                x + width > 100.0001 ||
                y + height > 100.0001
        ) {

            throw new BadRequestException(
                    "El área debe quedar completamente dentro del mockup."
            );
        }
    }

    // =========================================================
    // VALIDAR MEDIDAS
    // =========================================================

    private void validarMedidas(

            BigDecimal anchoChica,

            BigDecimal altoChica,

            BigDecimal anchoMedia,

            BigDecimal altoMedia,

            BigDecimal anchoGrande,

            BigDecimal altoGrande
    ) {

        validarPar(
                anchoChica,
                altoChica,
                "chica"
        );

        validarPar(
                anchoMedia,
                altoMedia,
                "media"
        );

        validarPar(
                anchoGrande,
                altoGrande,
                "grande"
        );
    }

    private void validarPar(

            BigDecimal ancho,

            BigDecimal alto,

            String nombre
    ) {

        if (
                ancho == null &&
                alto == null
        ) {

            return;
        }

        if (
                ancho == null ||
                alto == null
        ) {

            throw new BadRequestException(
                    "Debés informar ancho y alto para la estampa "
                            + nombre
                            + "."
            );
        }

        if (
                ancho.compareTo(
                        BigDecimal.ZERO
                ) <= 0 ||

                alto.compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {

            throw new BadRequestException(
                    "Las medidas de la estampa "
                            + nombre
                            + " deben ser mayores a cero."
            );
        }
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private BigDecimal normalizarMedida(
            BigDecimal medida) {

        return medida;
    }

    private String normalizarColor(
            String color) {

        if (
                color == null ||
                color.isBlank()
        ) {

            return null;
        }

        return color.trim();
    }
}