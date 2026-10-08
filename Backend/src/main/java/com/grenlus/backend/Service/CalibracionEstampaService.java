package com.grenlus.backend.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.grenlus.backend.DTO.CalibracionEstampaDTO;
import com.grenlus.backend.Entity.CalibracionEstampa;
import com.grenlus.backend.Entity.Indumentaria;
import com.grenlus.backend.Entity.PosicionDiseno;
import com.grenlus.backend.Exception.BadRequestException;
import com.grenlus.backend.Exception.ResourceNotFoundException;
import com.grenlus.backend.Repository.CalibracionEstampaRepository;
import com.grenlus.backend.Repository.IndumentariaRepository;

@Service
public class CalibracionEstampaService {

    private final CalibracionEstampaRepository calibracionRepository;
    private final IndumentariaRepository indumentariaRepository;

    public CalibracionEstampaService(
            CalibracionEstampaRepository calibracionRepository,
            IndumentariaRepository indumentariaRepository
    ) {
        this.calibracionRepository = calibracionRepository;
        this.indumentariaRepository = indumentariaRepository;
    }

    @Transactional(readOnly = true)
    public List<CalibracionEstampa> listar(Long indumentariaId) {
        validarIndumentaria(indumentariaId);
        return calibracionRepository.findByIndumentariaIdOrderByPosicionAsc(indumentariaId);
    }

    @Transactional
    public CalibracionEstampa guardar(
            Long indumentariaId,
            PosicionDiseno posicion,
            CalibracionEstampaDTO dto
    ) {
        if (posicion == null || dto == null) {
            throw new BadRequestException("La posición y la calibración son obligatorias.");
        }

        validarPunto(dto.getPunto1X(), dto.getPunto1Y());
        validarPunto(dto.getPunto2X(), dto.getPunto2Y());

        double distanciaEntrePuntos = Math.hypot(
                dto.getPunto2X() - dto.getPunto1X(),
                dto.getPunto2Y() - dto.getPunto1Y()
        );
        if (distanciaEntrePuntos < 0.1) {
            throw new BadRequestException("Marcá dos puntos distintos en la foto.");
        }

        Map<String, BigDecimal> medidasNormalizadas = new HashMap<>();
        if (dto.getMedidasCmPorTalle() != null) {
            dto.getMedidasCmPorTalle().forEach((talle, medida) -> {
                String talleNormalizado = talle == null
                        ? ""
                        : talle.trim().toUpperCase(Locale.ROOT);
                if (talleNormalizado.isEmpty()
                        || medida == null
                        || medida.signum() <= 0
                        || medida.compareTo(BigDecimal.valueOf(300)) > 0) {
                    throw new BadRequestException(
                            "Cada talle debe tener una distancia mayor a cero y menor o igual a 300 cm."
                    );
                }
                medidasNormalizadas.put(talleNormalizado, medida);
            });
        }
        if (medidasNormalizadas.isEmpty()) {
            throw new BadRequestException("Ingresá al menos una medida real por talle.");
        }

        Indumentaria indumentaria = indumentariaRepository.findById(indumentariaId)
                .orElseThrow(() -> new ResourceNotFoundException("Indumentaria no encontrada"));

        CalibracionEstampa calibracion = calibracionRepository
                .findByIndumentariaIdAndPosicion(indumentariaId, posicion)
                .orElseGet(CalibracionEstampa::new);

        calibracion.setIndumentaria(indumentaria);
        calibracion.setPosicion(posicion);
        calibracion.setPunto1X(dto.getPunto1X());
        calibracion.setPunto1Y(dto.getPunto1Y());
        calibracion.setPunto2X(dto.getPunto2X());
        calibracion.setPunto2Y(dto.getPunto2Y());
        calibracion.setMedidasCmPorTalle(medidasNormalizadas);

        return calibracionRepository.save(calibracion);
    }

    private void validarIndumentaria(Long indumentariaId) {
        if (!indumentariaRepository.existsById(indumentariaId)) {
            throw new ResourceNotFoundException("Indumentaria no encontrada");
        }
    }

    private void validarPunto(Double x, Double y) {
        if (x == null || y == null
                || !Double.isFinite(x) || !Double.isFinite(y)
                || x < 0 || x > 100 || y < 0 || y > 100) {
            throw new BadRequestException("Los puntos de calibración deben quedar dentro de la foto.");
        }
    }
}
