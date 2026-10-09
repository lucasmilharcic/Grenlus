import {
    GRUPOS_DE_TALLES,
    ordenarTalles
} from "../constants/talles";

import "./SelectorTalles.css";

/*
 * Elegir uno por uno los talles que ofrece el producto.
 *
 * valor    = array de talles elegidos
 * onChange = recibe el array nuevo, ya ordenado
 */
export default function SelectorTalles({
    valor = [],
    onChange,
    deshabilitado = false
}) {

    const elegidos = new Set(
        ordenarTalles(valor)
    );

    function alternar(talle) {

        const nuevos = new Set(elegidos);

        if (nuevos.has(talle)) {
            nuevos.delete(talle);
        } else {
            nuevos.add(talle);
        }

        onChange(
            ordenarTalles([...nuevos])
        );
    }

    function alternarGrupo(grupo) {

        const todosPuestos = grupo.talles.every(
            talle => elegidos.has(talle)
        );

        const nuevos = new Set(elegidos);

        grupo.talles.forEach(talle => {
            if (todosPuestos) {
                nuevos.delete(talle);
            } else {
                nuevos.add(talle);
            }
        });

        onChange(
            ordenarTalles([...nuevos])
        );
    }

    return (
        <div
            className={
                deshabilitado
                    ? "selector-talles deshabilitado"
                    : "selector-talles"
            }
        >
            {GRUPOS_DE_TALLES.map(grupo => {

                const todosPuestos = grupo.talles.every(
                    talle => elegidos.has(talle)
                );

                return (
                    <div
                        key={grupo.nombre}
                        className="selector-talles-grupo"
                    >
                        <div className="selector-talles-encabezado">

                            <span>{grupo.nombre}</span>

                            <button
                                type="button"
                                disabled={deshabilitado}
                                onClick={() => alternarGrupo(grupo)}
                            >
                                {todosPuestos
                                    ? "Quitar todos"
                                    : "Marcar todos"}
                            </button>

                        </div>

                        <div className="selector-talles-opciones">

                            {grupo.talles.map(talle => (
                                <label
                                    key={talle}
                                    className={
                                        elegidos.has(talle)
                                            ? "talle-chip activo"
                                            : "talle-chip"
                                    }
                                >
                                    <input
                                        type="checkbox"
                                        checked={elegidos.has(talle)}
                                        disabled={deshabilitado}
                                        onChange={() => alternar(talle)}
                                    />
                                    {talle}
                                </label>
                            ))}

                        </div>

                    </div>
                );
            })}

            <p className="selector-talles-resumen">
                {elegidos.size === 0
                    ? "Todavía no elegiste ningún talle."
                    : `${elegidos.size} ${
                        elegidos.size === 1 ? "talle" : "talles"
                    }: ${[...elegidos].join(", ")}`}
            </p>

        </div>
    );
}
