package com.grenlus.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.grenlus.backend.Entity.DetallePedido;

@Repository
public interface DetallePedidoRepository
        extends JpaRepository<DetallePedido, Long> {
}