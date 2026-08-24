package com.grenlus.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.grenlus.backend.Entity.DisenoPedido;

@Repository
public interface DisenoPedidoRepository
        extends JpaRepository<DisenoPedido, Long> {
}