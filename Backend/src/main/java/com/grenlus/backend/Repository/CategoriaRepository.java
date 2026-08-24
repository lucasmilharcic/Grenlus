package com.grenlus.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.grenlus.backend.Entity.Categoria;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
}
