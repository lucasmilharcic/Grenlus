package com.grenlus.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.grenlus.backend.Entity.EstadoEnvio;
import com.grenlus.backend.Entity.MetodoEntrega;
import com.grenlus.backend.Entity.Pedido;

@Repository
public interface PedidoRepository
        extends JpaRepository<Pedido, Long> {

    List<Pedido>
            findByUsuarioUsernameOrderByFechaPedidoDesc(
                    String username
            );

    // =========================================================
    // ENVÍOS
    // =========================================================

    List<Pedido>
            findByMetodoEntregaOrderByFechaPedidoDesc(
                    MetodoEntrega metodoEntrega
            );

    List<Pedido>
            findByMetodoEntregaAndEstadoEnvioOrderByFechaPedidoDesc(
                    MetodoEntrega metodoEntrega,
                    EstadoEnvio estadoEnvio
            );

    List<Pedido>
            findByUsuarioUsernameAndMetodoEntregaOrderByFechaPedidoDesc(
                    String username,
                    MetodoEntrega metodoEntrega
            );
}
