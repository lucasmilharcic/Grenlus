package com.grenlus.backend.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.grenlus.backend.Entity.TarifaEnvio;

@Repository
public interface TarifaEnvioRepository
        extends JpaRepository<TarifaEnvio, Long> {

    Optional<TarifaEnvio>
            findByCodigoZonaIgnoreCaseAndActivoTrue(
                    String codigoZona
            );

    List<TarifaEnvio>
            findByActivoTrueOrderByPrecioAsc();

    List<TarifaEnvio>
            findAllByOrderByIdAsc();
}