package com.grenlus.backend.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.grenlus.backend.Entity.ColorProducto;

@Repository
public interface ColorProductoRepository
        extends JpaRepository<ColorProducto, Long> {

    List<ColorProducto>
            findByIndumentariaIdOrderByIdAsc(
                    Long indumentariaId);

    Optional<ColorProducto>
            findByIndumentariaIdAndNombreIgnoreCase(
                    Long indumentariaId,
                    String nombre);
}
