package com.grenlus.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.grenlus.backend.Entity.Producto;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
}
