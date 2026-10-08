package com.grenlus.backend.Service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.grenlus.backend.DTO.CalibracionEstampaDTO;
import com.grenlus.backend.Entity.CalibracionEstampa;
import com.grenlus.backend.Entity.Indumentaria;
import com.grenlus.backend.Entity.PosicionDiseno;
import com.grenlus.backend.Exception.BadRequestException;
import com.grenlus.backend.Repository.CalibracionEstampaRepository;
import com.grenlus.backend.Repository.IndumentariaRepository;

class CalibracionEstampaServiceTest {

    private CalibracionEstampaRepository calibracionRepository;
    private IndumentariaRepository indumentariaRepository;
    private CalibracionEstampaService service;

    @BeforeEach
    void setUp() {
        calibracionRepository = mock(CalibracionEstampaRepository.class);
        indumentariaRepository = mock(IndumentariaRepository.class);
        service = new CalibracionEstampaService(
                calibracionRepository,
                indumentariaRepository
        );

        when(indumentariaRepository.findById(1L))
                .thenReturn(Optional.of(new Indumentaria()));
        when(calibracionRepository.findByIndumentariaIdAndPosicion(
                1L,
                PosicionDiseno.FRENTE
        )).thenReturn(Optional.empty());
        when(calibracionRepository.save(any(CalibracionEstampa.class)))
                .thenAnswer(invocacion -> invocacion.getArgument(0));
    }

    @Test
    void guardaUnaCalibracionCompartidaConMedidasPorTalle() {
        CalibracionEstampaDTO dto = new CalibracionEstampaDTO();
        dto.setPunto1X(20.0);
        dto.setPunto1Y(35.0);
        dto.setPunto2X(80.0);
        dto.setPunto2Y(35.0);
        dto.setMedidasCmPorTalle(Map.of(
                "m", BigDecimal.valueOf(52)
        ));

        CalibracionEstampa guardada = service.guardar(
                1L,
                PosicionDiseno.FRENTE,
                dto
        );

        assertThat(guardada.getMedidasCmPorTalle())
                .containsEntry("M", BigDecimal.valueOf(52));
        assertThat(guardada.getPunto1X()).isEqualTo(20.0);
        assertThat(guardada.getPosicion()).isEqualTo(PosicionDiseno.FRENTE);
    }

    @Test
    void rechazaPuntosCoincidentes() {
        CalibracionEstampaDTO dto = new CalibracionEstampaDTO();
        dto.setPunto1X(20.0);
        dto.setPunto1Y(35.0);
        dto.setPunto2X(20.0);
        dto.setPunto2Y(35.0);
        dto.setMedidasCmPorTalle(Map.of("M", BigDecimal.valueOf(52)));

        assertThatThrownBy(() -> service.guardar(
                1L,
                PosicionDiseno.FRENTE,
                dto
        )).isInstanceOf(BadRequestException.class)
                .hasMessage("Marcá dos puntos distintos en la foto.");
    }
}
