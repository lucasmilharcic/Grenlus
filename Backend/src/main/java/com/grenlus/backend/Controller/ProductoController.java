package com.grenlus.backend.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.grenlus.backend.Entity.Producto;
import com.grenlus.backend.Exception.ResourceNotFoundException;
import com.grenlus.backend.Service.ProductoService;

@RestController
@RequestMapping("/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(
            ProductoService productoService) {

        this.productoService = productoService;
    }

    /**
     * Productos activos visibles para clientes.
     */
    @GetMapping
    public List<Producto> getProductos() {

        return productoService.findAll();
    }

    /**
     * Obtener producto por ID.
     */
    @GetMapping("/{id}")
    public Producto getProductoById(
            @PathVariable Long id) {

        return productoService.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Producto no encontrado"
                        )
                );
    }

    /**
     * Borrado lógico.
     */
    @DeleteMapping("/{id}")
    public void eliminarProducto(
            @PathVariable Long id) {

        productoService.deleteById(id);
    }
}