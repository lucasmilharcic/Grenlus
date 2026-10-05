package com.grenlus.backend;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.grenlus.backend.Entity.Pedido;
import com.grenlus.backend.Repository.PedidoRepository;

@SpringBootTest
class BackendApplicationTests {

	@Autowired
	private PedidoRepository pedidoRepository;

	@Autowired
	private EntityManager entityManager;

	@Test
	void contextLoads() {
	}

	@Test
	@Transactional
	void actualizaLaMarcaDeArchivoDelPedido() {
		Pedido pedido = pedidoRepository.saveAndFlush(new Pedido());

		assertThat(pedidoRepository.actualizarArchivado(
				pedido.getId(),
				true
		)).isEqualTo(1);

		entityManager.clear();

		assertThat(pedidoRepository.findById(pedido.getId()))
				.isPresent()
				.get()
				.extracting(Pedido::isArchivado)
				.isEqualTo(true);
	}

}
