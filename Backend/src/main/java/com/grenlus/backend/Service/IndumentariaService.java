package com.grenlus.backend.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.grenlus.backend.Entity.Indumentaria;
import com.grenlus.backend.Repository.IndumentariaRepository;

@Service
public class IndumentariaService {

    private final IndumentariaRepository indumentariaRepository;
    private final FileStorageService fileStorageService;

    @Autowired
    public IndumentariaService(
            IndumentariaRepository indumentariaRepository,
            FileStorageService fileStorageService) {

        this.indumentariaRepository = indumentariaRepository;
        this.fileStorageService = fileStorageService;
    }

    public List<Indumentaria> findAll() {
        return indumentariaRepository.findAll();
    }

    public Optional<Indumentaria> findById(Long id) {
        return indumentariaRepository.findById(id);
    }

    public Indumentaria save(
            Indumentaria indumentaria,
            MultipartFile imagen) {

        if (imagen != null && !imagen.isEmpty()) {
            String ruta = fileStorageService.guardar(imagen);
            indumentaria.setImagenPrincipal(ruta);
        }

        return indumentariaRepository.save(indumentaria);
    }

    public Indumentaria editarIndumentaria(
            Indumentaria indumentaria,
            MultipartFile imagen) {

        if (imagen != null && !imagen.isEmpty()) {
            String ruta = fileStorageService.guardar(imagen);
            indumentaria.setImagenPrincipal(ruta);
        }

        return indumentariaRepository.save(indumentaria);
    }

    public void deleteById(Long id) {
        indumentariaRepository.deleteById(id);
    }
}