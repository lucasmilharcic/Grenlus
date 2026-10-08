package com.grenlus.backend.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.grenlus.backend.Entity.CalibracionEstampa;
import com.grenlus.backend.Entity.PosicionDiseno;

@Repository
public interface CalibracionEstampaRepository
        extends JpaRepository<CalibracionEstampa, Long> {

    List<CalibracionEstampa> findByIndumentariaIdOrderByPosicionAsc(Long indumentariaId);

    Optional<CalibracionEstampa> findByIndumentariaIdAndPosicion(
            Long indumentariaId,
            PosicionDiseno posicion
    );
}
