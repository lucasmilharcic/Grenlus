import { useCallback, useEffect, useState } from "react";

import {
    actualizarColor,
    crearColor,
    eliminarColor,
    getColores
} from "../services/colorService";

import {
    tallesDelProducto
} from "../constants/talles";

import "./ColoresEditor.css";

function moneda(valor) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    }).format(Number(valor || 0));
}

/*
 * Colores que ya tienen mockup cargado en alguna área.
 *
 * Son los únicos que el personalizador puede mostrar,
 * así que los sugerimos para que el admin no tenga que
 * escribirlos de nuevo.
 */
function coloresDeLasAreas(areas) {
    const nombres = (areas || [])
        .map(area => String(area?.color || "").trim())
        .filter(Boolean);

    return [...new Set(nombres)];
}

export default function ColoresEditor({
    producto,
    areas = []
}) {

    const [colores, setColores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [guardandoId, setGuardandoId] = useState(null);
    const [nuevoNombre, setNuevoNombre] = useState("");

    const tallesOfrecidos = tallesDelProducto(producto);

    const cargar = useCallback(async () => {

        try {

            setLoading(true);
            setError("");

            const data = await getColores(producto.id);

            setColores(
                Array.isArray(data) ? data : []
            );

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "No se pudieron cargar los colores."
            );

        } finally {

            setLoading(false);
        }

    }, [producto.id]);

    useEffect(() => {

        cargar();

    }, [cargar]);

    // =====================================================
    // EDICIÓN EN MEMORIA
    // =====================================================

    function actualizarCampo(id, campo, valor) {

        setColores(actuales =>
            actuales.map(color =>
                color.id === id
                    ? { ...color, [campo]: valor }
                    : color
            )
        );
    }

    function alternarTalle(id, talle) {

        setColores(actuales =>
            actuales.map(color => {

                if (color.id !== id) {
                    return color;
                }

                const excluidos = new Set(
                    color.tallesExcluidos || []
                );

                if (excluidos.has(talle)) {
                    excluidos.delete(talle);
                } else {
                    excluidos.add(talle);
                }

                return {
                    ...color,
                    tallesExcluidos: [...excluidos]
                };
            })
        );
    }

    // =====================================================
    // ACCIONES
    // =====================================================

    async function guardar(color) {

        try {

            setGuardandoId(color.id);
            setError("");
            setMensaje("");

            const guardado = await actualizarColor(
                producto.id,
                color.id,
                {
                    nombre: color.nombre,
                    precioAdicional: Number(color.precioAdicional || 0),
                    activo: color.activo !== false,
                    tallesExcluidos: color.tallesExcluidos || []
                }
            );

            setColores(actuales =>
                actuales.map(item =>
                    item.id === guardado.id ? guardado : item
                )
            );

            setMensaje(`Color ${guardado.nombre} guardado.`);

        } catch (err) {

            console.error(err);

            setError(
                err.message || "No se pudo guardar el color."
            );

        } finally {

            setGuardandoId(null);
        }
    }

    async function agregar(nombre) {

        const limpio = String(nombre || "").trim();

        if (!limpio) {
            setError("Escribí el nombre del color.");
            return;
        }

        try {

            setGuardandoId("nuevo");
            setError("");
            setMensaje("");

            const creado = await crearColor(producto.id, {
                nombre: limpio,
                precioAdicional: 0,
                activo: true,
                tallesExcluidos: []
            });

            setColores(actuales => [...actuales, creado]);
            setNuevoNombre("");
            setMensaje(`Color ${creado.nombre} agregado.`);

        } catch (err) {

            console.error(err);

            setError(
                err.message || "No se pudo agregar el color."
            );

        } finally {

            setGuardandoId(null);
        }
    }

    async function borrar(color) {

        try {

            setGuardandoId(color.id);
            setError("");
            setMensaje("");

            await eliminarColor(producto.id, color.id);

            setColores(actuales =>
                actuales.filter(item => item.id !== color.id)
            );

            setMensaje(`Color ${color.nombre} eliminado.`);

        } catch (err) {

            console.error(err);

            setError(
                err.message || "No se pudo eliminar el color."
            );

        } finally {

            setGuardandoId(null);
        }
    }

    // =====================================================
    // SUGERENCIAS
    // =====================================================

    const sugeridos = coloresDeLasAreas(areas).filter(
        nombre =>
            !colores.some(
                color =>
                    color.nombre.trim().toLowerCase() ===
                    nombre.toLowerCase()
            )
    );

    return (
        <div className="colores-editor">

            <header className="colores-editor-header">

                <div>
                    <h3>Colores y precios</h3>

                    <p>
                        El adicional se suma al precio base.
                        Por defecto cada color está en todos
                        los talles; marcá abajo los talles
                        donde no lo tenés.
                    </p>
                </div>

            </header>

            {mensaje && (
                <div className="colores-mensaje">{mensaje}</div>
            )}

            {error && (
                <div className="colores-error">{error}</div>
            )}

            {loading && (
                <div className="colores-state">
                    Cargando colores...
                </div>
            )}

            {!loading && (
                <>
                    <div className="colores-alta">

                        <input
                            type="text"
                            placeholder="Nombre del color"
                            value={nuevoNombre}
                            onChange={e =>
                                setNuevoNombre(e.target.value)
                            }
                        />

                        <button
                            type="button"
                            disabled={guardandoId === "nuevo"}
                            onClick={() => agregar(nuevoNombre)}
                        >
                            {guardandoId === "nuevo"
                                ? "Agregando..."
                                : "Agregar color"}
                        </button>

                    </div>

                    {sugeridos.length > 0 && (

                        <div className="colores-sugeridos">

                            <span>
                                Con mockup cargado y sin ficha:
                            </span>

                            {sugeridos.map(nombre => (
                                <button
                                    key={nombre}
                                    type="button"
                                    onClick={() => agregar(nombre)}
                                >
                                    + {nombre}
                                </button>
                            ))}

                        </div>
                    )}

                    {colores.length === 0 && (

                        <div className="colores-state">
                            Todavía no cargaste colores. Sin ficha,
                            un color se muestra igual pero sin
                            adicional ni restricciones.
                        </div>
                    )}

                    <div className="colores-lista">

                        {colores.map(color => {

                            const excluidos =
                                color.tallesExcluidos || [];

                            const procesando =
                                guardandoId === color.id;

                            return (
                                <article
                                    key={color.id}
                                    className={
                                        color.activo === false
                                            ? "color-card inactivo"
                                            : "color-card"
                                    }
                                >

                                    <div className="color-card-top">

                                        <input
                                            type="text"
                                            className="color-nombre"
                                            value={color.nombre}
                                            disabled={procesando}
                                            onChange={e =>
                                                actualizarCampo(
                                                    color.id,
                                                    "nombre",
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <label className="color-activo">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    color.activo !== false
                                                }
                                                disabled={procesando}
                                                onChange={e =>
                                                    actualizarCampo(
                                                        color.id,
                                                        "activo",
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                            Activo
                                        </label>

                                    </div>

                                    <div className="color-campo">

                                        <label>
                                            Adicional sobre el precio base
                                        </label>

                                        <div className="color-precio">

                                            <span>$</span>

                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={
                                                    color.precioAdicional ?? 0
                                                }
                                                disabled={procesando}
                                                onChange={e =>
                                                    actualizarCampo(
                                                        color.id,
                                                        "precioAdicional",
                                                        e.target.value
                                                    )
                                                }
                                            />

                                        </div>

                                        <small>
                                            Se cobra{" "}
                                            {moneda(color.precioAdicional)}{" "}
                                            extra por unidad.
                                        </small>

                                    </div>

                                    {tallesOfrecidos.length > 0 && (

                                        <div className="color-campo">

                                            <label>
                                                No disponible en estos talles
                                            </label>

                                            <div className="color-talles">

                                                {tallesOfrecidos.map(talle => (
                                                    <label
                                                        key={talle}
                                                        className={
                                                            excluidos.includes(talle)
                                                                ? "color-talle excluido"
                                                                : "color-talle"
                                                        }
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={excluidos.includes(
                                                                talle
                                                            )}
                                                            disabled={procesando}
                                                            onChange={() =>
                                                                alternarTalle(
                                                                    color.id,
                                                                    talle
                                                                )
                                                            }
                                                        />
                                                        {talle}
                                                    </label>
                                                ))}

                                            </div>

                                            <small>
                                                {excluidos.length === 0
                                                    ? "Disponible en todos los talles."
                                                    : `Sin stock en: ${excluidos.join(", ")}.`}
                                            </small>

                                        </div>
                                    )}

                                    <div className="color-acciones">

                                        <button
                                            type="button"
                                            className="color-guardar"
                                            disabled={procesando}
                                            onClick={() => guardar(color)}
                                        >
                                            {procesando
                                                ? "Guardando..."
                                                : "Guardar"}
                                        </button>

                                        <button
                                            type="button"
                                            className="color-borrar"
                                            disabled={procesando}
                                            onClick={() => borrar(color)}
                                        >
                                            Eliminar
                                        </button>

                                    </div>

                                </article>
                            );
                        })}

                    </div>
                </>
            )}

        </div>
    );
}
