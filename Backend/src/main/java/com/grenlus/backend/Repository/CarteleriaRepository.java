package com.grenlus.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.grenlus.backend.Entity.Carteleria;

@Repository
public interface CarteleriaRepository extends JpaRepository<Carteleria, Long> {
}
