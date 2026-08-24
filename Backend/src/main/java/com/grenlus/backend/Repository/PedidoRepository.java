package com.grenlus.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.grenlus.backend.Entity.Pedido;

@Repository
public interface PedidoRepository
        extends JpaRepository<Pedido, Long> {

    List<Pedido>
            findByUsuarioUsernameOrderByFechaPedidoDesc(
                    String username
            );
}