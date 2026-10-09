package com.grenlus.backend.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grenlus.backend.DTO.ColorProductoDTO;
import com.grenlus.backend.Entity.CatalogoTalles;
import com.grenlus.backend.Entity.ColorProducto;
import com.grenlus.backend.Entity.Indumentaria;
import com.grenlus.backend.Exception.BadRequestException;
import com.grenlus.backend.Exception.ResourceNotFoundException;
import com.grenlus.backend.Repository.ColorProductoRepository;
import com.grenlus.backend.Repository.IndumentariaRepository;

@Service
public class ColorProductoService {

    private final ColorProductoRepository colorRepository;

    private final IndumentariaRepository indumentariaRepository;

    public ColorProductoService(
            ColorProductoRepository colorRepository,
            IndumentariaRepository indumentariaRepository
    ) {

        this.colorRepository =
                colorRepository;

        this.indumentariaRepository =
                indumentariaRepository;
    }

    // =========================================================
    // LISTAR
    // =========================================================

    @Transactional(readOnly = true)
    public List<ColorProducto> listar(
            Long indumentariaId) {

        buscarIndumentaria(indumentariaId);

        return colorRepository
                .findByIndumentariaIdOrderByIdAsc(
                        indumentariaId);
    }

    // =========================================================
    // CREAR
    // =========================================================

    @Transactional
    public ColorProducto crear(
            Long indumentariaId,
            ColorProductoDTO dto) {

        Indumentaria indumentaria =
                buscarIndumentaria(indumentariaId);

        String nombre = validarNombre(dto);

        colorRepository
                .findByIndumentariaIdAndNombreIgnoreCase(
                        indumentariaId,
                        nombre)
                .ifPresent(existente -> {

                    throw new BadRequestException(
                            "El color " + nombre
                                    + " ya está cargado en este producto.");
                });

        ColorProducto color = new ColorProducto();

        color.setNombre(nombre);

        aplicar(color, dto, indumentaria);

        indumentaria.agregarColor(color);

        return colorRepository.save(color);
    }

    // =========================================================
    // EDITAR
    // =========================================================

    @Transactional
    public ColorProducto editar(
            Long indumentariaId,
            Long colorId,
            ColorProductoDTO dto) {

        Indumentaria indumentaria =
                buscarIndumentaria(indumentariaId);

        ColorProducto color =
                buscarColor(indumentariaId, colorId);

        String nombre = validarNombre(dto);

        colorRepository
                .findByIndumentariaIdAndNombreIgnoreCase(
                        indumentariaId,
                        nombre)
                .filter(otro -> !otro.getId().equals(colorId))
                .ifPresent(otro -> {

                    throw new BadRequestException(
                            "El color " + nombre
                                    + " ya está cargado en este producto.");
                });

        color.setNombre(nombre);

        aplicar(color, dto, indumentaria);

        return colorRepository.save(color);
    }

    // =========================================================
    // ELIMINAR
    // =========================================================

    @Transactional
    public void eliminar(
            Long indumentariaId,
            Long colorId) {

        ColorProducto color =
                buscarColor(indumentariaId, colorId);

        colorRepository.delete(color);
    }

    // =========================================================
    // APLICAR DATOS
    // =========================================================

    private void aplicar(
            ColorProducto color,
            ColorProductoDTO dto,
            Indumentaria indumentaria) {

        BigDecimal adicional =
                dto.getPrecioAdicional() != null
                        ? dto.getPrecioAdicional()
                        : BigDecimal.ZERO;

        if (adicional.compareTo(BigDecimal.ZERO) < 0) {

            throw new BadRequestException(
                    "El adicional del color no puede ser negativo.");
        }

        color.setPrecioAdicional(adicional);

        color.setActivo(
                !Boolean.FALSE.equals(dto.getActivo()));

        /*
         * Solo tiene sentido excluir talles que el producto
         * realmente ofrece.
         */
        Set<String> excluidos =
                CatalogoTalles.ordenar(
                        dto.getTallesExcluidos());

        Set<String> ofrecidos =
                indumentaria.obtenerTallesOfrecidos();

        for (String talle : excluidos) {

            if (!ofrecidos.contains(talle)) {

                throw new BadRequestException(
                        "El producto no ofrece el talle " + talle + ".");
            }
        }

        if (!ofrecidos.isEmpty()
                && excluidos.containsAll(ofrecidos)) {

            throw new BadRequestException(
                    "El color quedaría sin talles disponibles.");
        }

        color.getTallesExcluidos().clear();
        color.getTallesExcluidos().addAll(excluidos);
    }

    private String validarNombre(
            ColorProductoDTO dto) {

        String nombre =
                dto.getNombre() != null
                        ? dto.getNombre().trim()
                        : "";

        if (nombre.isEmpty()) {

            throw new BadRequestException(
                    "El color necesita un nombre.");
        }

        return nombre;
    }

    private Indumentaria buscarIndumentaria(
            Long indumentariaId) {

        return indumentariaRepository
                .findById(indumentariaId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Producto no encontrado"));
    }

    private ColorProducto buscarColor(
            Long indumentariaId,
            Long colorId) {

        ColorProducto color =
                colorRepository
                        .findById(colorId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Color no encontrado"));

        if (color.getIndumentaria() == null
                || !color.getIndumentaria()
                        .getId()
                        .equals(indumentariaId)) {

            throw new BadRequestException(
                    "El color no pertenece a este producto.");
        }

        return color;
    }
}
