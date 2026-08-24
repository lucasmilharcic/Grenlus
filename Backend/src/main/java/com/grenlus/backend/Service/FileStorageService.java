package com.grenlus.backend.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private final Path uploadDirectory =
            Paths.get("uploads");

    public FileStorageService() {

        try {
            Files.createDirectories(uploadDirectory);
        } catch (IOException e) {
            throw new RuntimeException(
                    "No se pudo crear la carpeta de uploads",
                    e
            );
        }
    }

    public String guardar(MultipartFile archivo) {

        if (archivo == null || archivo.isEmpty()) {
            throw new RuntimeException(
                    "El archivo está vacío"
            );
        }

        try {

            String nombreOriginal =
                    archivo.getOriginalFilename();

            String extension = "";

            if (nombreOriginal != null &&
                    nombreOriginal.contains(".")) {

                extension =
                        nombreOriginal.substring(
                                nombreOriginal.lastIndexOf(".")
                        );
            }

            String nombreArchivo =
                    UUID.randomUUID() + extension;

            Path destino =
                    uploadDirectory.resolve(nombreArchivo);

            Files.copy(
                    archivo.getInputStream(),
                    destino,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return "/uploads/" + nombreArchivo;

        } catch (IOException e) {

            throw new RuntimeException(
                    "No se pudo guardar la imagen",
                    e
            );
        }
    }
}