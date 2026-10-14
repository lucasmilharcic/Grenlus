import "./MedidasEstampaEditor.css";

const CATEGORIAS = [
    {
        id: "CHICA",
        nombre: "Chica",
        ancho: "anchoChicaCm",
        alto: "altoChicaCm"
    },
    {
        id: "MEDIA",
        nombre: "Mediana",
        ancho: "anchoMediaCm",
        alto: "altoMediaCm"
    },
];

/*
 * Medidas de estampa y ancho de sisa del producto.
 *
 * Se cargan una sola vez y valen para todos los colores y
 * vistas: lo que define si una estampa es chica, mediana o
 * grande es cuánto mide, no cuánto ocupa de la prenda.
 */
export default function MedidasEstampaEditor({
    medidas = {},
    onCambiarMedida,
    talles = [],
    sisaPorTalle = {},
    onCambiarSisa
}) {

    return (
        <div className="medidas-estampa">

            <div className="medidas-estampa-bloque">

                <label className="medidas-estampa-titulo">
                    Hasta cuánto mide cada estampa
                </label>

                <small>
                    Son los límites de precio, no del editor: el
                    cliente puede agrandar el diseño hasta donde dé
                    el área de estampado. Todo lo que pase de la
                    mediana se cobra como grande.
                </small>

                <div className="medidas-estampa-grid">

                    {CATEGORIAS.map(categoria => (
                        <div
                            key={categoria.id}
                            className="medida-categoria"
                        >
                            <span>{categoria.nombre}</span>

                            <div className="medida-par">

                                <label>
                                    Ancho
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        placeholder="cm"
                                        value={
                                            medidas[categoria.ancho] ?? ""
                                        }
                                        onChange={e =>
                                            onCambiarMedida(
                                                categoria.ancho,
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>

                                <label>
                                    Alto
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        placeholder="cm"
                                        value={
                                            medidas[categoria.alto] ?? ""
                                        }
                                        onChange={e =>
                                            onCambiarMedida(
                                                categoria.alto,
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>

                            </div>

                        </div>
                    ))}

                </div>

                <small>
                    Una estampa entra en la primera categoría donde
                    quepa. Si no cargás medidas, se usan 20 × 20 y
                    30 × 30 cm.
                    {medidas.anchoMediaCm && medidas.altoMediaCm
                        ? ` Grande: más de ${medidas.anchoMediaCm} × ${medidas.altoMediaCm} cm.`
                        : ""}
                </small>

            </div>

            {talles.length > 0 && (

                <div className="medidas-estampa-bloque">

                    <label className="medidas-estampa-titulo">
                        Ancho de sisa a sisa, por talle
                    </label>

                    <div className="medidas-sisa-grid">

                        {talles.map(talle => (
                            <label
                                key={talle}
                                className="medida-sisa"
                            >
                                <span>{talle}</span>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    placeholder="cm"
                                    value={sisaPorTalle[talle] ?? ""}
                                    onChange={e =>
                                        onCambiarSisa(
                                            talle,
                                            e.target.value
                                        )
                                    }
                                />
                            </label>
                        ))}

                    </div>

                    <small>
                        Es la medida de la prenda, así que la misma
                        vale para el frente y para la espalda. En cada
                        vista marcás los dos puntos sobre su foto.
                    </small>

                </div>
            )}

        </div>
    );
}
