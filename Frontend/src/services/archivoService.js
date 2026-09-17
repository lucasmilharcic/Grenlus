const API_URL =
    "http://127.0.0.1:8081";

export async function subirImagen(
    archivo
) {

    if (!archivo) {

        throw new Error(
            "No seleccionaste ninguna imagen."
        );
    }

    const formData =
        new FormData();

    formData.append(
        "archivo",
        archivo
    );

    const response =
        await fetch(
            `${API_URL}/archivos/imagen`,
            {
                method: "POST",
                body: formData
            }
        );

    if (!response.ok) {

        let mensaje =
            "No se pudo subir la imagen.";

        try {

            const data =
                await response.json();

            mensaje =
                data.message ||
                mensaje;

        } catch {
            // dejamos mensaje default
        }

        throw new Error(
            mensaje
        );
    }

    return response.json();
}
