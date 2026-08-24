package com.grenlus.backend.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.grenlus.backend.Entity.Indumentaria;

@Repository
public interface IndumentariaRepository
        extends JpaRepository<Indumentaria, Long> {

    @Override
    @EntityGraph(attributePaths = "areasPersonalizacion")
    List<Indumentaria> findAll();

    @Override
    @EntityGraph(attributePaths = "areasPersonalizacion")
    Optional<Indumentaria> findById(Long id);
}