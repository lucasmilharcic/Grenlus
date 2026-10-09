package com.grenlus.backend.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.grenlus.backend.Entity.Indumentaria;

@Repository
/*
 * Ojo con el grafo: lo que no esta listado queda perezoso
 * aunque el mapeo diga EAGER, y al serializar el JSON ya no
 * hay sesion abierta (open-in-view=false).
 */
public interface IndumentariaRepository
        extends JpaRepository<Indumentaria, Long> {

    @Override
    @EntityGraph(attributePaths = { "areasPersonalizacion", "tallesDisponibles" })
    List<Indumentaria> findAll();

    @Override
    @EntityGraph(attributePaths = { "areasPersonalizacion", "tallesDisponibles" })
    Optional<Indumentaria> findById(Long id);
}