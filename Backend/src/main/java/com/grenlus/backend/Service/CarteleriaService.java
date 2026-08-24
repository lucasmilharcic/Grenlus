package com.grenlus.backend.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.grenlus.backend.Entity.Carteleria;
import com.grenlus.backend.Repository.CarteleriaRepository;

@Service
public class CarteleriaService {

    private final CarteleriaRepository carteleriaRepository;
    private final FileStorageService fileStorageService;

    @Autowired
    public CarteleriaService(
            CarteleriaRepository carteleriaRepository,
            FileStorageService fileStorageService) {

        this.carteleriaRepository = carteleriaRepository;
        this.fileStorageService = fileStorageService;
    }

    public List<Carteleria> findAll() {
        return carteleriaRepository.findAll();
    }

    public Carteleria findById(Long id) {

        return carteleriaRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Cartelería no encontrada"
                        )
                );
    }

    public Carteleria save(
            Carteleria carteleria,
            MultipartFile imagen) {

        if (imagen != null && !imagen.isEmpty()) {
            String ruta = fileStorageService.guardar(imagen);
            carteleria.setImagenPrincipal(ruta);
        }

        return carteleriaRepository.save(carteleria);
    }

    public Carteleria update(
            Carteleria carteleria,
            MultipartFile imagen) {

        if (imagen != null && !imagen.isEmpty()) {
            String ruta = fileStorageService.guardar(imagen);
            carteleria.setImagenPrincipal(ruta);
        }

        return carteleriaRepository.save(carteleria);
    }

    public void deleteById(Long id) {
        carteleriaRepository.deleteById(id);
    }
}