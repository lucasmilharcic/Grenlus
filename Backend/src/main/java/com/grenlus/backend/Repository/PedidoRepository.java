package com.grenlus.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.grenlus.backend.Entity.EstadoEnvio;
import com.grenlus.backend.Entity.MetodoEntrega;
import com.grenlus.backend.Entity.Pedido;

@Repository
public interface PedidoRepository
        extends JpaRepository<Pedido, Long> {

    @Modifying
    @Query("update Pedido p set p.archivado = :archivado where p.id = :id")
    int actualizarArchivado(
            @Param("id") Long id,
            @Param("archivado") boolean archivado
    );

    List<Pedido>
            findByUsuarioUsernameOrderByFechaPedidoDesc(
                    String username
            );

    List<Pedido>
            findByArchivadoOrderByFechaPedidoDesc(
                    boolean archivado
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
            findByMetodoEntregaAndArchivadoOrderByFechaPedidoDesc(
                    MetodoEntrega metodoEntrega,
                    boolean archivado
            );

    List<Pedido>
            findByMetodoEntregaAndEstadoEnvioAndArchivadoOrderByFechaPedidoDesc(
                    MetodoEntrega metodoEntrega,
                    EstadoEnvio estadoEnvio,
                    boolean archivado
            );

    List<Pedido>
            findByUsuarioUsernameAndMetodoEntregaOrderByFechaPedidoDesc(
                    String username,
                    MetodoEntrega metodoEntrega
            );
}
