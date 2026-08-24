package com.grenlus.backend.Controller;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.grenlus.backend.Exception.BadRequestException;
import com.grenlus.backend.Service.FileStorageService;

@RestController
@RequestMapping("/archivos")
public class ArchivoController {

    private final FileStorageService fileStorageService;

    public ArchivoController(
            FileStorageService fileStorageService) {

        this.fileStorageService =
                fileStorageService;
    }

    @PostMapping(
            value = "/imagen",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Map<String, String> subirImagen(
            @RequestParam("archivo")
            MultipartFile archivo) {

        if (
                archivo == null ||
                archivo.isEmpty()
        ) {

            throw new BadRequestException(
                    "Debés seleccionar una imagen."
            );
        }

        String contentType =
                archivo.getContentType();

        if (
                contentType == null ||
                !contentType.startsWith("image/")
        ) {

            throw new BadRequestException(
                    "El archivo debe ser una imagen."
            );
        }

        /*
         * 15 MB máximo.
         */
        long maxBytes =
                15L * 1024L * 1024L;

        if (
                archivo.getSize() >
                maxBytes
        ) {

            throw new BadRequestException(
                    "La imagen no puede superar los 15 MB."
            );
        }

        String ruta =
                fileStorageService.guardar(
                        archivo
                );

        return Map.of(
                "ruta",
                ruta
        );
    }
}