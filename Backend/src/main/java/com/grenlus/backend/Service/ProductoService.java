package com.grenlus.backend.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.grenlus.backend.Entity.Carteleria;
import com.grenlus.backend.Entity.Indumentaria;
import com.grenlus.backend.Entity.Producto;
import com.grenlus.backend.Exception.ResourceNotFoundException;
import com.grenlus.backend.Repository.CarteleriaRepository;
import com.grenlus.backend.Repository.IndumentariaRepository;
import com.grenlus.backend.Repository.ProductoRepository;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    private final IndumentariaRepository indumentariaRepository;

    private final CarteleriaRepository carteleriaRepository;

    public ProductoService(
            ProductoRepository productoRepository,
            IndumentariaRepository indumentariaRepository,
            CarteleriaRepository carteleriaRepository) {

        this.productoRepository =
                productoRepository;

        this.indumentariaRepository =
                indumentariaRepository;

        this.carteleriaRepository =
                carteleriaRepository;
    }

    // =========================================================
    // PRODUCTOS PÚBLICOS
    // =========================================================

    public List<Producto> findAll() {

        List<Producto> productos =
                new ArrayList<>();

        /*
         * IMPORTANTE:
         *
         * IndumentariaRepository tiene EntityGraph
         * para cargar areasPersonalizacion.
         *
         * Por eso NO usamos:
         *
         * productoRepository.findAll()
         *
         * porque al devolver una Indumentaria
         * desde ProductoRepository las áreas pueden
         * quedar lazy y fallar al serializar a JSON.
         */

        List<Indumentaria> indumentarias =
                indumentariaRepository.findAll();

        List<Carteleria> cartelerias =
                carteleriaRepository.findAll();

        indumentarias.stream()
                .filter(Indumentaria::isActivo)
                .forEach(productos::add);

        cartelerias.stream()
                .filter(Carteleria::isActivo)
                .forEach(productos::add);

        productos.sort(
                Comparator.comparing(
                        Producto::getId
                )
        );

        return productos;
    }

    // =========================================================
    // TODOS PARA ADMIN
    // =========================================================

    public List<Producto> findAllAdmin() {

        List<Producto> productos =
                new ArrayList<>();

        productos.addAll(
                indumentariaRepository.findAll()
        );

        productos.addAll(
                carteleriaRepository.findAll()
        );

        productos.sort(
                Comparator.comparing(
                        Producto::getId
                )
        );

        return productos;
    }

    // =========================================================
    // BUSCAR POR ID
    // =========================================================

    public Optional<Producto> findById(
            Long id) {

        /*
         * Primero buscamos como indumentaria.
         *
         * Esto hace que se use el EntityGraph
         * y se carguen las áreas.
         */

        Optional<Indumentaria> indumentaria =
                indumentariaRepository.findById(id);

        if (indumentaria.isPresent()) {

            return Optional.of(
                    indumentaria.get()
            );
        }

        /*
         * Si no es indumentaria,
         * buscamos como cartelería.
         */

        Optional<Carteleria> carteleria =
                carteleriaRepository.findById(id);

        if (carteleria.isPresent()) {

            return Optional.of(
                    carteleria.get()
            );
        }

        return Optional.empty();
    }

    // =========================================================
    // GUARDAR
    // =========================================================

    public Producto save(
            Producto producto) {

        return productoRepository.save(
                producto
        );
    }

    // =========================================================
    // BORRADO LÓGICO
    // =========================================================

    public void deleteById(
            Long id) {

        Producto producto =
                findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Producto no encontrado"
                                )
                        );

        producto.setActivo(false);

        productoRepository.save(
                producto
        );
    }
}