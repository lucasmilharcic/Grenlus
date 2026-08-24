package com.grenlus.backend.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.grenlus.backend.Entity.AreaPersonalizacion;
import com.grenlus.backend.Entity.PosicionDiseno;

@Repository
public interface AreaPersonalizacionRepository
        extends JpaRepository<
                AreaPersonalizacion,
                Long
        > {

    List<AreaPersonalizacion>
            findByIndumentariaIdOrderByIdAsc(
                    Long indumentariaId
            );

    List<AreaPersonalizacion>
            findByIndumentariaIdAndColorIgnoreCaseOrderByIdAsc(
                    Long indumentariaId,
                    String color
            );

    List<AreaPersonalizacion>
            findByIndumentariaIdAndColorIsNullOrderByIdAsc(
                    Long indumentariaId
            );

    Optional<AreaPersonalizacion>
            findByIndumentariaIdAndPosicionAndColorIgnoreCase(
                    Long indumentariaId,
                    PosicionDiseno posicion,
                    String color
            );

    Optional<AreaPersonalizacion>
            findByIndumentariaIdAndPosicionAndColorIsNull(
                    Long indumentariaId,
                    PosicionDiseno posicion
            );
}